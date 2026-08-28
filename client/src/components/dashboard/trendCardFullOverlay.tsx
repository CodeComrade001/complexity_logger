import { useState } from "react";
import { X } from "lucide-react";
import type { ComplexityUnit, ComplexityReport } from "@/types/apiDataInterface";
import { Button } from "../ui/button";

interface TrendCardFullOverlayProps {
  onClose: () => void;
  data: ComplexityReport[]; // ✅ FIXED
}

export default function TrendCardFullOverlay({ onClose, data }: TrendCardFullOverlayProps) {
  const [activeFileIndex, setActiveFileIndex] = useState<number | null>(null);
  const [activeFunctionId, setActiveFunctionId] = useState<string | null>(null);

  if (!data || data.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-start pt-20 overflow-auto">
      <div className="bg-background w-full max-w-6xl rounded-xl shadow-xl p-6 relative">

        {/* ✅ FIXED BUTTON */}
        <Button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 shadow-primary/20 rounded-full hover:bg-muted"
        >
          <X className="h-5 w-5" />
        </Button>

        <h2 className="text-xl font-bold mb-6">Full Complexity Breakdown</h2>

        <div className="space-y-6">
          {data.map((report, fileIndex) => {

            // ✅ SAFE MERGE
            const units: ComplexityUnit[] = [
              ...report.details.functions,
              ...report.details.arrows,
              ...report.details.methods,
              ...report.details.constructors,
              ...report.details.getters,
              ...report.details.setters,
              ...report.details.callbacks,
              ...report.details.handlers,
              ...report.details.staticBlocks,
              ...report.details.topLevelStatements,
            ];

            return (
              <div key={fileIndex} className="border rounded-xl p-4">

                {/* FILE HEADER */}
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() =>
                    setActiveFileIndex(
                      activeFileIndex === fileIndex ? null : fileIndex
                    )
                  }
                >
                  <div>
                    <h3 className="font-bold">{report.nameOfFile}</h3>
                    <p className="text-xs text-muted-foreground">
                      {report.summary.itemsAnalyzed} items • Score: {report.summary.totalScore}
                    </p>
                  </div>

                  <span className="text-xs">
                    {activeFileIndex === fileIndex ? "Hide" : "View"}
                  </span>
                </div>

                {/* FUNCTIONS */}
                {activeFileIndex === fileIndex && (
                  <div className="mt-4 space-y-3">
                    {units.map((fn) => (
                      <div key={fn.id} className="p-3 border rounded-lg">

                        <div className="flex justify-between">
                          <span className="font-mono text-sm">{fn.name}()</span>
                          <span className="text-xs">{fn.riskLevel}</span>
                        </div>

                        <div className="text-xs mt-1 flex gap-4">
                          <span>{fn.timeComplexity?.notation || "—"}</span>
                          <span>{fn.spaceComplexity?.notation || "—"}</span>
                          <span>Score: {fn.totalScore}</span>
                        </div>

                        <Button
                          onClick={() =>
                            setActiveFunctionId(
                              activeFunctionId === fn.id ? null : fn.id
                            )
                          }
                          className="text-xs mt-2 shadow-primary/20"
                        >
                          Details
                        </Button>

                        {activeFunctionId === fn.id && (
                          <div className="mt-2 text-[11px] space-y-2">
                            {fn.reasons?.map((r, i) => (
                              <div key={i} className="p-2 bg-muted/30 rounded">
                                <div className="font-bold">
                                  {r.pattern} (Line {r.lineNumber})
                                </div>
                                <p>{r.detail}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}