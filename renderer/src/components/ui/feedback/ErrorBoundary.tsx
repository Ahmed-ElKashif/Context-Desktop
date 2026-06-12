import { Component, ErrorInfo, ReactNode } from "react";
import { SemanticVoid } from "../display/SemanticVoid";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught React rendering error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <SemanticVoid
          errorCode="ERR"
          title="Component Crash"
          description="A critical UI component has crashed. The engine has halted rendering to prevent corruption."
          logs={[
            "rendering virtual dom...",
            "encountering unhandled exception...",
            `[ERR_CRASH] ${this.state.error?.message || "Unknown error"}`,
            "awaiting manual interface refresh...",
          ]}
          actionLabel="Reload Interface"
          actionLink=""
        />
      );
    }

    return this.props.children;
  }
}
