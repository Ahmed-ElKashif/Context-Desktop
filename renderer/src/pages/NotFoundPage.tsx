import { SemanticVoid } from "../components/ui/display/SemanticVoid";

export const NotFoundPage = () => {
  return (
    <SemanticVoid
      errorCode="404"
      title="Semantic Void"
      description="The node you are trying to access has been disconnected, archived, or never existed in the engine network."
      logs={[
        "ping target_node_route...",
        "resolving semantic path...",
        "[ERR_404] TIMEOUT: Path undefined."
      ]}
      actionLabel="Return Home"
      actionLink="/"
    />
  );
};
