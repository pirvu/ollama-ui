import { useEffect, useState } from 'react';
import { Table, Button, Text, Group, ActionIcon, Loader } from '@mantine/core';
import { Model } from '../services/api';
import api from '../services/api';

interface ModelListProps {
  onModelPull: (modelName: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export default function ModelList({ onModelPull, onRefresh, isLoading }: ModelListProps) {
  const [models, setModels] = useState<Model[]>([]);

  const loadModels = async () => {
    try {
      const modelList = await api.listModels();
      setModels(modelList);
    } catch (error) {
      console.error('Failed to load models:', error);
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
      console.error('Failed to delete model:', error);
    }
  };

  const formatSize = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(2)} GB`;
  };

  return (
    <div>
      <Group position="apart" mb="md">
        <Text size="xl" weight={500}>Installed Models</Text>
        <Button onClick={loadModels} loading={isLoading}>Refresh</Button>
      </Group>

      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Size</th>
            <th>Family</th>
            <th>Parameter Size</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {models.map((model) => (
            <tr key={model.digest}>
              <td>{model.name}</td>
              <td>{formatSize(model.size)}</td>
              <td>{model.details.family}</td>
              <td>{model.details.parameter_size}</td>
              <td>
                <Group spacing="xs">
                  <Button 
                    size="xs" 
                    variant="light"
                    onClick={() => handleDelete(model.name)}
                  >
                    Delete
                  </Button>
                </Group>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
