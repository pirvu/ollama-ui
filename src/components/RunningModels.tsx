import { useEffect, useState } from "react";
import {
  Table,
  Text,
  Group,
  Box,
  Paper,
  Alert,
  Stack,
  Loader,
} from "@mantine/core";
import { RunningModel } from "../services/api";
import api from "../services/api";

export default function RunningModels() {
  const [models, setModels] = useState<RunningModel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadRunningModels = async () => {
    try {
      setError(null);
      setLoading(true);
      const modelList = await api.listRunningModels();
      setModels(modelList);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to load running models"
      );
      console.error("Failed to load running models:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRunningModels();
    const interval = setInterval(loadRunningModels, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const formatSize = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(2)} GB`;
  };

  const formatExpiry = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  return (
    <Paper p="xl" radius="md" withBorder shadow="sm">
      <Text size="xl" fw={600} c="indigo" mb="lg">
        Running Models
      </Text>
      {error && (
        <Alert color="red" mb="md">
          {error}
        </Alert>
      )}

      {loading ? (
        <Stack align="center" py="xl">
          <Loader size="lg" />
          <Text c="dimmed">Loading running models...</Text>
        </Stack>
      ) : (
        <Table
          highlightOnHover
          withTableBorder
          striped
          verticalSpacing="md"
          horizontalSpacing="lg"
        >
          <thead>
            <tr>
              <th
                style={{
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                  color: "var(--mantine-color-dimmed)",
                }}
              >
                Name
              </th>
              <th
                style={{
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                  color: "var(--mantine-color-dimmed)",
                }}
              >
                VRAM Usage
              </th>
              <th
                style={{
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                  color: "var(--mantine-color-dimmed)",
                }}
              >
                Expires At
              </th>
            </tr>
          </thead>
          <tbody>
            {models.map((model) => (
              <tr key={model.digest}>
                <td style={{ fontWeight: 500 }}>{model.name}</td>
                <td style={{ color: "var(--mantine-color-dimmed)" }}>
                  {formatSize(model.size_vram)}
                </td>
                <td style={{ color: "var(--mantine-color-dimmed)" }}>
                  {formatExpiry(model.expires_at)}
                </td>
              </tr>
            ))}
            {models.length === 0 && (
              <tr>
                <td colSpan={3}>
                  <Stack align="center" py="xl" gap="xs">
                    <Text size="lg" fw={500} c="dimmed" ta="center">
                      No models currently running
                    </Text>
                    <Text size="sm" c="dimmed.6" ta="center" maw={400}>
                      Models will appear here when they are actively being used
                      by applications
                    </Text>
                  </Stack>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
    </Paper>
  );
}
