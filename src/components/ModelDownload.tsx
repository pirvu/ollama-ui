import { useState } from "react";
import {
  TextInput,
  Button,
  Progress,
  Text,
  Stack,
  Group,
  Paper,
  Box,
} from "@mantine/core";
import { IconDownload, IconPackage } from "@tabler/icons-react";
import { PullProgress } from "../services/api";
import api from "../services/api";

interface DownloadItem {
  modelName: string;
  progress: number;
  status: string;
}

export default function ModelDownload({
  onModelPulled,
}: {
  onModelPulled: () => void;
}) {
  const [modelName, setModelName] = useState("");
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);

  const handleDownload = async () => {
    if (!modelName) return;

    const downloadItem: DownloadItem = {
      modelName,
      progress: 0,
      status: "Starting download...",
    };

    setDownloads((prev) => [...prev, downloadItem]);
    setModelName("");

    try {
      await api.pullModel(modelName, (progress: PullProgress) => {
        setDownloads((prev) =>
          prev.map((item) =>
            item.modelName === modelName
              ? {
                  ...item,
                  progress:
                    progress.completed && progress.total
                      ? (progress.completed / progress.total) * 100
                      : item.progress,
                  status: progress.status,
                }
              : item
          )
        );
      });

      setDownloads((prev) =>
        prev.filter((item) => item.modelName !== modelName)
      );

      onModelPulled();
    } catch (error) {
      console.error("Failed to download model:", error);
      setDownloads((prev) =>
        prev.map((item) =>
          item.modelName === modelName
            ? { ...item, status: "Error downloading model" }
            : item
        )
      );
    }
  };

  return (
    <Paper p="xl" radius="md" withBorder shadow="sm">
      <Text size="xl" fw={600} c="indigo" mb="md">
        Download New Model
      </Text>

      <Group align="flex-end" mb="lg">
        <TextInput
          label="Model Name"
          description="Enter the name of the model you want to download"
          placeholder="e.g., llama2:latest"
          value={modelName}
          onChange={(e) => setModelName(e.target.value)}
          style={{ flex: 1 }}
          leftSection={
            <IconPackage
              size={16}
              style={{ color: "var(--mantine-color-indigo-6)" }}
            />
          }
          size="md"
          styles={(theme) => ({
            input: {
              "&:focus": {
                borderColor: "var(--mantine-color-indigo-5)",
              },
            },
          })}
        />
        <Button
          onClick={handleDownload}
          leftSection={<IconDownload size={16} />}
          disabled={!modelName}
          size="md"
          variant={modelName ? "filled" : "light"}
        >
          Download
        </Button>
      </Group>

      {downloads.length > 0 && (
        <Stack gap="md">
          <Text size="lg" fw={500} c="dimmed" mb="sm">
            Download Queue
          </Text>
          {downloads.map((download) => (
            <Paper
              key={download.modelName}
              p="md"
              withBorder
              shadow="sm"
              style={{
                background: "var(--mantine-color-gray-0)",
                border: "1px solid var(--mantine-color-gray-3)",
              }}
            >
              <Group justify="space-between" mb="xs">
                <Text fw={600}>{download.modelName}</Text>
                <Text
                  size="sm"
                  c="dimmed"
                  style={{
                    backgroundColor: "var(--mantine-color-gray-1)",
                    padding: "4px 8px",
                    borderRadius: "4px",
                  }}
                >
                  {download.status}
                </Text>
              </Group>
              <Stack gap="xs">
                <Progress
                  value={download.progress}
                  size="xl"
                  radius="xl"
                  striped
                  animated={download.progress < 100}
                  color="indigo"
                  style={{ height: "8px" }}
                  styles={{
                    root: {
                      backgroundColor: "var(--mantine-color-gray-1)",
                    },
                  }}
                />
                <Text
                  size="sm"
                  ta="right"
                  c="dimmed"
                  style={{ marginTop: "-4px" }}
                >
                  {download.progress.toFixed(1)}%
                </Text>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Paper>
  );
}
