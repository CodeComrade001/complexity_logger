// FileUploadProgress.tsx
import { useEffect, useState } from "react";
import { Spinner } from "../components/ui/spinner";

interface FileUploadProgressProps {
  projectName: string;
  estimatedMinutes?: number;
  hide?: boolean; // optionally hide the component
}

export const FileUploadProgress = ({
  projectName,
  estimatedMinutes = 20,
  hide = false,
}: FileUploadProgressProps) => {
  const [dots, setDots] = useState("...");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "." : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  if (hide) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-48 p-3 flex flex-col items-center justify-center bg-accent/20 border border-border rounded-lg shadow-md space-y-2 animate-blink">

      {/* Spinner icon */}
      <Spinner className="h-5 w-5 text-primary animate-spin" />

      {/* Uploading text */}
      <h3 className="text-xs font-bold text-foreground text-center">
        Uploading <span className="text-primary">{projectName}</span>{dots}
      </h3>

      {/* Estimated time */}
      <p className="text-[10px] text-muted-foreground text-center">
        Est. completion: <span className="font-semibold">{estimatedMinutes} min</span>
      </p>
    </div>
  );
};
