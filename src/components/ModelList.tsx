import {
  Alert,
  Button,
  Group,
  Loader,
  Paper,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { IconRefresh, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import api, { Model } from "../services/api";

interface ModelListProps {
  onRefresh: () => void;
  isLoading: boolean;
}

export default function ModelList({ onRefresh, isLoading }: ModelListProps) {
  const [models, setModels] = useState<Model[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadModels = async () => {
    try {
      setError(null);
      setLoading(true);
      const modelList = await api.listModels();
      setModels(modelList);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to load models"
      );
      console.error("Failed to load models:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModels();
  }, []);

  const handleDelete = async (modelName: string) => {
    try {
      await api.deleteModel(modelName);
      await loadModels();
      onRefresh();
    } catch (error) {
      console.error("Failed to delete model:", error);
    }
  };

  const formatSize = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(2)} GB`;
  };

  return (
    <Paper p="xl" radius="md" withBorder shadow="sm">
      <Group justify="space-between" mb="lg">
        <Text size="xl" fw={600} c="indigo">
          Installed Models
        </Text>
        <Button
          onClick={loadModels}
          loading={isLoading}
          leftSection={<IconRefresh size={16} />}
          variant="light"
        >
          Refresh
        </Button>
      </Group>

      {error && (
        <Alert color="red" mb="md">
          {error}
        </Alert>
      )}

      {loading ? (
        <Stack align="center" py="xl">
          <Loader size="lg" />
          <Text c="dimmed">Loading models...</Text>
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
                Size
              </th>
              <th
                style={{
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                  color: "var(--mantine-color-dimmed)",
                }}
              >
                Family
              </th>
              <th
                style={{
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                  color: "var(--mantine-color-dimmed)",
                }}
              >
                Parameter Size
              </th>
              <th
                style={{
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                  color: "var(--mantine-color-dimmed)",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {models.map((model) => (
              <tr key={model.digest}>
                <td style={{ fontWeight: 500 }}>{model.name}</td>
                <td style={{ color: "var(--mantine-color-dimmed)" }}>
                  {formatSize(model.size)}
                </td>
                <td style={{ color: "var(--mantine-color-dimmed)" }}>
                  {model.details.family}
                </td>
                <td style={{ color: "var(--mantine-color-dimmed)" }}>
                  {model.details.parameter_size}
                </td>
                <td>
                  <Group gap="xs">
                    <Button
                      size="xs"
                      variant="light"
                      color="red.6"
                      onClick={() => handleDelete(model.name)}
                      leftSection={<IconTrash size={14} />}
                    >
                      Delete
                    </Button>
                  </Group>
                </td>
              </tr>
            ))}
            {models.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <Stack align="center" py="xl">
                    <Stack align="center" py="xl" gap="xs">
                      <Text size="lg" fw={500} c="dimmed" ta="center">
                        No models installed
                      </Text>
                      <Text size="sm" c="dimmed.6" ta="center" maw={400}>
                        Models you install will appear here. Use the download
                        form above to get started.
                      </Text>
                    </Stack>
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
