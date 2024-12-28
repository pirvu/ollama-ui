import React, { useState } from "react";
import { TextInput, Button, Group } from "@mantine/core";

const HostConfigurator: React.FC = () => {
  const [host, setHost] = useState(
    localStorage.getItem("OLLAMA_HOST") || "localhost:11434"
  );

  const handleSave = () => {
    localStorage.setItem("OLLAMA_HOST", host);
  };

  return (
    <Group>
      <TextInput
        value={host}
        onChange={(e) => setHost(e.target.value)}
        placeholder="Enter OLLAMA Host (e.g., localhost:11434)"
      />
      <Button onClick={handleSave}>Save</Button>
    </Group>
  );
};

export default HostConfigurator;
