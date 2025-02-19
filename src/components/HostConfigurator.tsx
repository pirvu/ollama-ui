import { Button, Group, TextInput } from "@mantine/core";
import React, { useState } from "react";

const HostConfigurator: React.FC = () => {
  const [host, setHost] = useState(
    localStorage.getItem("OLLAMA_HOST") || "http://localhost:11434"
  );
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      // Validate the host (simple validation for now)
      if (!host) {
        throw new Error("Host cannot be empty");
      }

      // Save to localStorage
      localStorage.setItem("OLLAMA_HOST", host);
      window.location.reload();
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Group>
      <TextInput
        value={host}
        onChange={(e) => setHost(e.target.value)}
        placeholder="Enter OLLAMA Host (e.g., http://localhost:11434)"
        error={error}
      />
      <Button onClick={handleSave}>Save</Button>
    </Group>
  );
};

export default HostConfigurator;
