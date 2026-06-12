import { SemanticVoid } from "../components/ui/display/SemanticVoid";

export const ServerErrorPage = () => {
  return (
    <SemanticVoid
      errorCode="503"
      title="Neural Disconnect"
      description="The engine network is currently offline or unreachable. Critical systems have been halted to prevent data corruption."
      logs={[
        "ping core_engine...",
        "establishing secure connection...",
        "[ERR_503] CRITICAL: Engine offline.",
        "awaiting manual reboot sequence...",
      ]}
      actionLabel="Reboot Engine"
      actionLink="/"
    />
  );
};
