import { useState } from "react";
import { RefreshCcw, List, LayoutGrid, Info, Search, Filter, AlertCircle, CheckCircle2, AlertTriangle, XCircle, Table as TableIcon } from "lucide-react";
import type { ComplexityUnit, FileComplexityReceivedPayload, RiskLevel, ViewMode } from "@/types/apiDataInterface";
import { useNotification } from "@/context/useNotification";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

type UIFunction = ComplexityUnit & {
  fileName: string;
};

export default function ComplexityResultPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRisk, setFilterRisk] = useState<string>("ALL");
  const [activeReasonId, setActiveReasonId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string>("all");
  const [fileComplexityResult, setFileComplexityResult] = useState<FileComplexityReceivedPayload[]>([]);
  const { notify } = useNotification();

  // Helper for cleaner class merging
  const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

  const allFunctions: UIFunction[] = fileComplexityResult.flatMap(payload => {
    if (!payload.complexityAnalysis.data.details) return [];
    const report = payload.complexityAnalysis.data;
    const fileName = report.nameOfFile;
    const allUnits: ComplexityUnit[] = [
      ...report.details.functions, ...report.details.arrows, ...report.details.methods,
      ...report.details.constructors, ...report.details.getters, ...report.details.setters,
      ...report.details.callbacks, ...report.details.handlers, ...report.details.staticBlocks,
      ...report.details.topLevelStatements
    ];
    return allUnits.map(unit => ({ ...unit, fileName }));
  });

  const fileNames: string[] = ["all", ...new Set(allFunctions.map(fn => fn.fileName))];

  const filteredFunctions = allFunctions.filter(fn => {
    const matchesSearch = fn.name.toLowerCase().includes(searchQuery.toLowerCase()) || fn.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = filterRisk === "ALL" || fn.riskLevel === filterRisk;
    const matchesFile = selectedFile === "all" || fn.fileName === selectedFile;
    return matchesSearch && matchesRisk && matchesFile;
  });

  const summary = {
    total: allFunctions.length,
    critical: allFunctions.filter(fn => fn.riskLevel === "CRITICAL").length,
    high: allFunctions.filter(fn => fn.riskLevel === "HIGH").length,
    medium: allFunctions.filter(fn => fn.riskLevel === "MEDIUM").length,
    low: allFunctions.filter(fn => fn.riskLevel === "LOW").length,
    avgScore: allFunctions.length ? Math.round(allFunctions.reduce((sum, fn) => sum + fn.totalScore, 0) / allFunctions.length) : 0
  };

  const getRiskStyles = (risk: RiskLevel) => {
    switch (risk) {
      case "CRITICAL": return { icon: <XCircle className="h-4 w-4" />, color: "text-destructive", border: "border-destructive/50", bg: "bg-destructive/10" };
      case "HIGH": return { icon: <AlertCircle className="h-4 w-4" />, color: "text-orange-500", border: "border-orange-500/50", bg: "bg-orange-500/10" };
      case "MEDIUM": return { icon: <AlertTriangle className="h-4 w-4" />, color: "text-warning", border: "border-warning/50", bg: "bg-warning/10" };
      case "LOW": return { icon: <CheckCircle2 className="h-4 w-4" />, color: "text-success", border: "border-success/50", bg: "bg-success/10" };
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full mx-auto p-6 space-y-8 bg-background min-h-screen font-sans">
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gradient">Complexity Analysis</h1>
            <p className="text-sm text-muted-foreground">Deep dive into your codebase performance metrics.</p>
          </div>
          <button
            onClick={() => { setSearchQuery(""); setFilterRisk("ALL"); setSelectedFile("all"); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover-elevate active-elevate-2 text-sm font-medium transition-all"
          >
            <RefreshCcw className="h-4 w-4" /> Reset Filters
          </button>
        </div>

        {/* Summary Grid - Using your 'glass-panel' and 'elevate' logic */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Total", val: summary.total, color: "text-foreground" },
            { label: "Critical", val: summary.critical, color: "text-destructive" },
            { label: "High", val: summary.high, color: "text-orange-500" },
            { label: "Medium", val: summary.medium, color: "text-warning" },
            { label: "Low", val: summary.low, color: "text-success" },
            { label: "Avg Score", val: summary.avgScore, color: "text-primary" },
          ].map((item, i) => (
            <div key={i} className="glass-panel p-4 rounded-xl shadow-sm border-card-border">
              <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">{item.label}</div>
              <div className={cn("text-2xl font-bold mt-1", item.color)}>{item.val}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center glass-panel p-2 rounded-xl">
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search functions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all"
              />
            </div>

            <select
              title="select file"
              value={selectedFile}
              onChange={(e) => setSelectedFile(e.target.value)}
              className="bg-background border border-input rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
            >
              {fileNames.map((file, idx) => (
                <option key={idx} value={file}>{file === "all" ? "All Files" : file}</option>
              ))}
            </select>

            <select
              title="select risk"
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="bg-background border border-input rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="ALL">All Risks</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div className="flex bg-muted p-1 rounded-lg">
            {[
              { id: "card", icon: <LayoutGrid className="h-4 w-4" /> },
              { id: "list", icon: <List className="h-4 w-4" /> },
              { id: "table", icon: <TableIcon className="h-4 w-4" /> },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id as ViewMode)}
                className={cn(
                  "p-2 rounded-md transition-all",
                  viewMode === mode.id ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {mode.icon}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        {viewMode === "card" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredFunctions.map((fn) => {
              const styles = getRiskStyles(fn.riskLevel);
              return (
                <div key={fn.id} className={cn("glass-panel flex flex-col rounded-xl overflow-hidden border-t-4 transition-all hover-elevate", styles.border)}>
                  <div className="p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="min-w-0">
                        <h3 className="font-mono font-bold text-primary truncate">{fn.name}()</h3>
                        <p className="text-[10px] text-muted-foreground truncate uppercase tracking-tighter">{fn.fileName}</p>
                      </div>
                      <div className={cn("flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase", styles.bg, styles.color)}>
                        {styles.icon} {fn.riskLevel}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-muted/50 p-2 rounded text-center">
                        <div className="text-[9px] text-muted-foreground uppercase">Time</div>
                        <div className="font-mono text-xs font-bold">{fn.timeComplexity.notation}</div>
                      </div>
                      <div className="bg-muted/50 p-2 rounded text-center">
                        <div className="text-[9px] text-muted-foreground uppercase">Space</div>
                        <div className="font-mono text-xs font-bold">{fn.spaceComplexity.notation}</div>
                      </div>
                      <div className="bg-muted/50 p-2 rounded text-center">
                        <div className="text-[9px] text-muted-foreground uppercase">Score</div>
                        <div className="font-mono text-xs font-bold">{fn.totalScore}</div>
                      </div>
                    </div>

                    <div className="bg-zinc-950 rounded-lg p-3 border border-white/5 relative">
                      <pre className="text-[10px] font-mono text-zinc-400 overflow-x-auto leading-relaxed">
                        {fn.text.slice(0, 150)}...
                      </pre>
                    </div>

                    <button
                      onClick={() => setActiveReasonId(activeReasonId === fn.id ? null : fn.id)}
                      className="w-full py-2 bg-accent hover:bg-accent/80 text-accent-foreground rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      <Info className="h-3 w-3" /> {activeReasonId === fn.id ? "Hide Details" : `View ${fn.reasons.length} Analysis Reasons`}
                    </button>

                    {activeReasonId === fn.id && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        {fn.reasons.map((r, i) => (
                          <div key={i} className="p-3 bg-muted/30 rounded-lg border border-border text-[11px] leading-snug">
                            <div className="font-bold text-foreground mb-1 flex justify-between">
                              <span className="capitalize">{r.pattern.replace(/-/g, " ")}</span>
                              <span className="text-muted-foreground">Line {r.lineNumber}</span>
                            </div>
                            <p className="text-muted-foreground">{r.detail}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {filteredFunctions.length === 0 && (
          <div className="glass-panel py-20 text-center rounded-2xl">
            <Filter className="h-12 w-12 mx-auto text-muted-foreground/20 mb-4" />
            <h3 className="text-lg font-bold">No results found</h3>
            <p className="text-sm text-muted-foreground">Adjust your filters to see more analysis data.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}