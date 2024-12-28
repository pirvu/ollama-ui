import axios, { AxiosError } from "axios";
import {
  RequestConfigWithRetry,
  InternalRequestConfigWithRetry,
} from "./types";

const OLLAMA_HOST =
  localStorage.getItem("OLLAMA_HOST") || "http://localhost:11434";
const OLLAMA_API = OLLAMA_HOST + "/api";

const axiosInstance = axios.create({
  baseURL: OLLAMA_API,
  timeout: 5000, // 5 second timeout
  timeoutErrorMessage: "Connection to Ollama API timed out",
});

// Add retry interceptor
axiosInstance.interceptors.response.use(
  undefined,
  async (error: AxiosError) => {
    const config = error.config as InternalRequestConfigWithRetry;
    if (!config || !config.retry) {
      return Promise.reject(error);
    }

    config.retry -= 1;
    if (error.message.includes("timeout")) {
      return new Promise((resolve) => setTimeout(resolve, 1000)).then(() =>
        axiosInstance(config)
      );
    }

    return Promise.reject(error);
  }
);

export interface ModelDetails {
  format: string;
  family: string;
  families?: string[];
  parameter_size: string;
  quantization_level: string;
}

export interface Model {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
  details: ModelDetails;
}

export interface RunningModel extends Model {
  model: string;
  size_vram: number;
  expires_at: string;
}

export interface PullProgress {
  status: string;
  digest?: string;
  total?: number;
  completed?: number;
}

class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

const handleApiError = (error: any) => {
  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED") {
      throw new ApiError("Connection timed out. Please try again.");
    }
    if (error.response) {
      throw new ApiError(error.response.data.message || "API request failed");
    } else if (error.request) {
      throw new ApiError(
        "No response from Ollama API. Make sure Ollama is running."
      );
    }
  }
  throw new ApiError(error.message || "An unknown error occurred");
};

const api = {
  isOllamaRunning: async (): Promise<boolean> => {
    try {
      await axiosInstance.get<{ models: Model[] }>("/tags", {
        timeout: 3000, // Shorter timeout for connection check
        retry: 2, // Allow 2 retries
      } as RequestConfigWithRetry);
      return true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNREFUSED") {
          console.error("Connection refused: Ollama is not running");
        } else if (error.code === "ETIMEDOUT") {
          console.error("Connection timed out");
        } else {
          console.error("Connection error:", error.message);
        }
      }
      return false;
    }
  },

  listModels: async (): Promise<Model[]> => {
    try {
      const response = await axiosInstance.get<{ models: Model[] }>("/tags", {
        retry: 1,
      } as RequestConfigWithRetry);
      return response.data.models;
    } catch (error) {
      handleApiError(error);
      return [];
    }
  },

  listRunningModels: async (): Promise<RunningModel[]> => {
    try {
      const response = await axiosInstance.get<{ models: RunningModel[] }>(
        "/ps",
        {
          retry: 1,
        } as RequestConfigWithRetry
      );
      return response.data.models;
    } catch (error) {
      handleApiError(error);
      return [];
    }
  },

  pullModel: async (
    modelName: string,
    onProgress?: (progress: PullProgress) => void
  ): Promise<void> => {
    try {
      const response = await fetch("/api/pull", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model: modelName }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new ApiError("Failed to start model download");
      }

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (onProgress) {
              onProgress(data);
            }
            if (data.status === "success") {
              return;
            }
          } catch (error) {
            console.error("Error parsing pull progress:", error);
          }
        }
      }
    } catch (error) {
      throw new ApiError(
        error instanceof Error ? error.message : "Failed to pull model"
      );
    }
  },

  deleteModel: async (modelName: string): Promise<void> => {
    try {
      await axiosInstance.delete("/delete", {
        data: { model: modelName },
        retry: 1,
      } as RequestConfigWithRetry);
    } catch (error) {
      handleApiError(error);
    }
  },

  showModel: async (modelName: string): Promise<any> => {
    try {
      const response = await axiosInstance.post("/show", { model: modelName }, {
        retry: 1,
      } as RequestConfigWithRetry);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
};

export default api;
