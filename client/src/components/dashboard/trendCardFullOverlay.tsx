// TrendCardFullOverlay.tsx
import { useState } from "react";
import { X } from "lucide-react";
import type { ComplexityUnit } from "@/types/apiDataInterface";

interface TrendCardFullOverlayProps {
  onClose: () => void;
  data: (ComplexityUnit & { id: string })[]; // receive functions as prop
}

export default function TrendCardFullOverlay({ onClose, data }: TrendCardFullOverlayProps) {
  const [activeFunctionId, setActiveFunctionId] = useState<string | null>(null);

  if (!data || data.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-start pt-20 overflow-auto">
      <div className="bg-background w-full max-w-4xl rounded-xl shadow-xl p-6 relative">
        <button
          title="close overview"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold mb-4">Complexity Analysis (Inline)</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.map((fn) => (
            <div key={fn.id} className="glass-panel p-4 rounded-xl border-t-4 border-primary">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold truncate">{fn.name}()</h3>
                <span className="text-xs font-semibold uppercase">{fn.riskLevel}</span>
              </div>

              <pre className="text-[10px] font-mono text-muted-foreground overflow-x-auto">
                {fn.text.slice(0, 100)}...
              </pre>

              <button
                onClick={() => setActiveFunctionId(activeFunctionId === fn.id ? null : fn.id)}
                className="mt-2 w-full py-1 bg-accent hover:bg-accent/80 text-accent-foreground rounded-lg text-xs font-semibold"
              >
                {activeFunctionId === fn.id ? "Hide Details" : "View Details"}
              </button>

              {activeFunctionId === fn.id && (
                <div className="mt-2 space-y-2 text-[11px] text-muted-foreground">
                  {fn.reasons?.map((r, idx) => (
                    <div key={idx} className="p-2 bg-muted/30 rounded border border-border">
                      <div className="font-bold">{r.pattern} (Line {r.lineNumber})</div>
                      <p>{r.detail}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}