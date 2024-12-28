import { useState, useEffect } from "react";
import {
  MantineProvider,
  AppShell,
  Container,
  Stack,
  Title,
  Group,
  Alert,
  Loader,
  Text,
  MantineTheme,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import api from "./services/api";
import ModelList from "./components/ModelList";
import RunningModels from "./components/RunningModels";
import ModelDownload from "./components/ModelDownload";

function App() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOllamaRunning, setIsOllamaRunning] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    const checkOllama = async () => {
      if (!initialCheckDone) {
        setIsCheckingConnection(true);
      }
      try {
        const running = await api.isOllamaRunning();
        setIsOllamaRunning(running);
      } catch (error) {
        console.error("Failed to check Ollama connection:", error);
        setIsOllamaRunning(false);
      } finally {
        setIsCheckingConnection(false);
        setInitialCheckDone(true);
      }
    };

    // Initial check
    checkOllama();

    // Start polling only after initial check
    let interval: number | null = null;
    if (initialCheckDone) {
      interval = setInterval(checkOllama, 10000); // Check every 10 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [initialCheckDone]);

  const handleModelPull = (modelName: string) => {
    setIsRefreshing(true);
  };

  const handleRefresh = () => {
    setIsRefreshing(false);
  };

  const renderContent = () => {
    if (!initialCheckDone) {
      return (
        <Stack align="center" py="xl">
          <Loader size="lg" />
          <Text c="dimmed">Checking Ollama connection...</Text>
        </Stack>
      );
    }

    if (!isOllamaRunning) {
      return (
        <Stack align="center" py="xl">
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Connection Error"
            color="red"
            variant="filled"
            w="100%"
          >
            Cannot connect to Ollama API. Make sure Ollama is running on your
            system and refresh the page.
          </Alert>
        </Stack>
      );
    }

    return (
      <>
        <RunningModels />
        <ModelDownload onModelPulled={handleRefresh} />
        <ModelList
          onModelPull={handleModelPull}
          onRefresh={handleRefresh}
          isLoading={isRefreshing}
        />
      </>
    );
  };

  return (
    <MantineProvider
      defaultColorScheme="light"
      theme={{
        primaryColor: "indigo",
        primaryShade: 6,
        fontFamily: "Inter, system-ui, sans-serif",
        headings: {
          fontFamily: "Inter, system-ui, sans-serif",
        },
        components: {
          AppShell: {
            styles: (theme: MantineTheme) => ({
              main: {
                background: "var(--mantine-color-gray-1)",
                padding: `calc(${theme.spacing.xl} * 2)`,
              },
              header: {
                background: `linear-gradient(135deg, var(--mantine-color-indigo-7) 0%, var(--mantine-color-blue-7) 100%)`,
                borderBottom: "none",
              },
            }),
          },
          Title: {
            styles: {
              root: {
                color: "white",
                fontSize: "1.8rem",
              },
            },
          },
          Container: {
            defaultProps: {
              p: "xl",
            },
            styles: (theme: MantineTheme) => ({
              root: {
                backgroundColor: "var(--mantine-color-white)",
                backdropFilter: "blur(8px)",
                borderRadius: theme.radius.lg,
                boxShadow: theme.shadows.sm,
                transition: "transform 200ms ease, box-shadow 200ms ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: theme.shadows.md,
                },
              },
            }),
          },
          Alert: {
            styles: (theme: MantineTheme) => ({
              root: {
                borderRadius: theme.radius.md,
              },
            }),
          },
          Stack: {
            defaultProps: {
              spacing: "xl",
            },
          },
        },
      }}
    >
      <AppShell header={{ height: 70 }} padding="0">
        <AppShell.Header>
          <Container size="xl" h="100%">
            <Group h="100%" px="xl">
              <Title order={1} style={{ letterSpacing: "-0.5px" }}>
                Ollama UI
              </Title>
            </Group>
          </Container>
        </AppShell.Header>

        <AppShell.Main>
          <Container size="xl" py="xl">
            <Stack gap="xl">{renderContent()}</Stack>
          </Container>
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}

export default App;
