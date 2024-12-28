import { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";

export interface RequestConfigWithRetry extends AxiosRequestConfig {
  retry?: number;
}

export interface InternalRequestConfigWithRetry
  extends InternalAxiosRequestConfig {
  retry?: number;
}
