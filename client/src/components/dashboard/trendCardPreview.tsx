import { useState } from "react";
import { Button } from "@/components/ui/button";
import TrendCardFullOverlay from "./trendCardFullOverlay";
import { FileComplexityData } from "@/types/apiDataInterface";
import { Link } from "wouter";

interface TrendCardPreviewProps {
  apiComplexitydetails: FileComplexityData | null; // ✅ FIXED
}

export default function TrendCardPreview({ apiComplexitydetails }: TrendCardPreviewProps) {
  console.log("Turbo Log  ~ TrendCardPreview ~ apiComplexitydetails:", apiComplexitydetails);
  const [isExpanded, setIsExpanded] = useState(false);

  // ✅ SAFE DERIVATION (no mutation)
  const files = apiComplexitydetails?.data ?? [];

  // const UpdatedFileFormat: FileComplexityData[] = files.map((testingFiles) =>
  //   console.log("testing data in files ", testingFiles))


  return (
    <>
      <div className="relative border-border/50 bg-card/50 rounded-xl shadow-sm p-4">
        <h3 className="text-sm font-semibold mb-3">Analyzed Files</h3>

        {files === null ? (
          <p className="text-xs text-muted-foreground italic">No results yet</p>
        ) : (
          <ul className="divide-y divide-border/20 gap-3 p-y-3 max-h-60 overflow-y-scroll">
            {files.slice(0, 10).map((file, idx) => {
              const report = file; // ✅ TYPE ASSERTION

              return (
                <li
                  key={idx}
                  className="flex flex-col sm:flex-row sm:justify-between glass-panel m-2 px-2 rounded-xl shadow-sm border-card-border sm:items-center gap-4 overflow-x-hidden overflow-y-hidden"
                >
                  {/* LEFT */}
                  <div className="flex-1">
                    <p className="text-sm font-mono font-bold truncate">
                      {report.nameOfFile}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {report.summary.itemsAnalyzed} items analyzed
                    </p>
                  </div>

                  {/* MIDDLE */}
                  <div className="flex gap-4 text-xs font-mono">
                    <div>
                      <span className="text-muted-foreground">Score</span>
                      <div className="font-semibold">
                        {report.summary.totalScore}
                      </div>
                    </div>

                    <div>
                      <span className="text-muted-foreground">Avg Time</span>
                      <div>{report.summary.avgTimeComplexity}</div>
                    </div>

                    <div>
                      <span className="text-muted-foreground">Avg Space</span>
                      <div>{report.summary.avgSpaceComplexity}</div>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="text-xs font-mono">
                    <span className="text-muted-foreground">Risk</span>
                    <div className="font-semibold">
                      H:{report.summary.highRiskCount} • C:{report.summary.criticalRiskCount}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-3 flex gap-2">
          <Button
            onClick={() => setIsExpanded(true)}
            className="flex-1 shadow-primary/20"
          >
            View Details
          </Button>

          <Link
            className="flex-1 shadow-primary/20"
            href="/dashboard/complexity-full-result"
          >
            Full Code View
          </Link>
        </div>
      </div>

      {/* ✅ FIXED CONDITION */}
      {files.length > 0 && isExpanded && (
        <TrendCardFullOverlay
          onClose={() => setIsExpanded(false)}
          data={files} // ✅ pass ONLY reports
        />
      )}
    </>
  );
}