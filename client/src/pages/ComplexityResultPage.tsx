import { useCallback, useEffect, useState } from "react";
import { RefreshCcw, List, LayoutGrid, Info, Search, Filter, AlertCircle, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { useNotification } from "../context/useNotification";
import { fetchSession } from "../utils/sessionStorage";
import type { ComplexityReason, ComplexityUnit, FileComplexityReceivedPayload, RiskLevel } from "../types/apiDataInterface";
import type { ViewMode } from "../types/complexityResultInterface";

// ============================================================================
// UI-ONLY TYPE
// Purpose: Flatten nested API structure for easier rendering
// Change Strategy: If API structure changes, update only these helper functions
// ============================================================================
type UIFunction = ComplexityUnit & {
  fileName: string; // Derived from parent ComplexityReport.nameOfFile
};

export default function ComplexityResultPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRisk, setFilterRisk] = useState<string>("ALL");
  const [activeReasonId, setActiveReasonId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string>("all");
  const [fileComplexityResult, setFileComplexityResult] = useState<FileComplexityReceivedPayload[]>([]);
  const { notify } = useNotification();

  // ============================================================================
  // DATA TRANSFORMATION LAYER
  // Fix: Extract ComplexityUnits (which have riskLevel) and enrich with fileName
  // Change Strategy: If API structure changes, update only this function
  // ============================================================================
  const allFunctions: UIFunction[] = fileComplexityResult.flatMap(payload => {
    // Navigate API structure: payload.data.freeComplexityReport
    if (!payload.data?.freeComplexityReport) return [];

    const report = payload.data.freeComplexityReport;
    const fileName = report.nameOfFile;

    // Collect all ComplexityUnit arrays (each already has riskLevel from API)
    const allUnits: ComplexityUnit[] = [
      ...report.details.functions,
      ...report.details.arrows,
      ...report.details.methods,
      ...report.details.constructors,
      ...report.details.getters,
      ...report.details.setters,
      ...report.details.callbacks,
      ...report.details.handlers,
      ...report.details.staticBlocks,
      ...report.details.topLevelStatements
    ];

    // Enrich each unit with parent fileName for UI filtering/display
    return allUnits.map(unit => ({
      ...unit, // Spread preserves all API fields including unit.riskLevel
      fileName // UI-only enhancement
    }));
  });

  // ============================================================================
  // EXTRACT UNIQUE FILE NAMES FOR FILTER DROPDOWN
  // Change Strategy: If payload structure changes, update the path here
  // ============================================================================
  const fileNames: string[] = [
    "all",
    ...new Set(
      fileComplexityResult
        .map(payload => payload.data?.freeComplexityReport?.nameOfFile)
        .filter((name): name is string => Boolean(name))
    )
  ];

  // ============================================================================
  // FILTER LOGIC
  // Fix: Use unit.riskLevel (from API) and unit.fileName (UI-derived)
  // Change Strategy: Filters reference UIFunction properties - resilient to API changes
  // ============================================================================
  const filteredFunctions = allFunctions.filter(fn => {
    const matchesSearch = fn.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = filterRisk === "ALL" || fn.riskLevel === filterRisk;
    const matchesFile = selectedFile === "all" || fn.fileName === selectedFile;
    return matchesSearch && matchesRisk && matchesFile;
  });

  // ============================================================================
  // SUMMARY STATISTICS
  // Fix: Count by individual unit.riskLevel (from API), not summary aggregates
  // Change Strategy: Uses array methods on UIFunction[] - resilient to changes
  // ============================================================================
  const summary = () => {
    const total = allFunctions.length;
    if (total === 0) {
      return { total: 0, critical: 0, high: 0, medium: 0, low: 0, avgScore: 0 };
    }

    return {
      total,
      // Count units by their API-provided riskLevel
      critical: allFunctions.filter(fn => fn.riskLevel === "CRITICAL").length,
      high: allFunctions.filter(fn => fn.riskLevel === "HIGH").length,
      medium: allFunctions.filter(fn => fn.riskLevel === "MEDIUM").length,
      low: allFunctions.filter(fn => fn.riskLevel === "LOW").length,
      // Average totalScore across all units
      avgScore: Math.round(
        allFunctions.reduce((sum, fn) => sum + fn.totalScore, 0) / total
      )
    };
  };

  const refreshResults = () => {
    setSearchQuery("");
    setFilterRisk("ALL");
    setSelectedFile("all");
    setActiveReasonId(null);
  };

  const getRiskIcon = (risk: RiskLevel) => {
    switch (risk) {
      case "CRITICAL": return <XCircle className="h-4 w-4" />;
      case "HIGH": return <AlertCircle className="h-4 w-4" />;
      case "MEDIUM": return <AlertTriangle className="h-4 w-4" />;
      case "LOW": return <CheckCircle2 className="h-4 w-4" />;
    }
  };

  const getRiskClass = (risk: RiskLevel) => {
    switch (risk) {
      case "CRITICAL": return "border-red-600 animate-pulse";
      case "HIGH": return "border-orange-500 animate-pulse";
      case "MEDIUM": return "border-yellow-500";
      case "LOW": return "border-emerald-500";
    }
  };

  const getRiskBadgeClass = (risk: RiskLevel) => {
    switch (risk) {
      case "CRITICAL": return "status-error";
      case "HIGH": return "status-warning";
      case "MEDIUM": return "status-warning";
      case "LOW": return "status-success";
    }
  };

  const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

  const fetchStoredApiPayload = useCallback(async () => {
    try {
      const cached = fetchSession<FileComplexityReceivedPayload | FileComplexityReceivedPayload[]>(
        "fileComplexityResult"
      );
      if (!cached) return;

      const normalized = Array.isArray(cached) ? cached : [cached];
      setFileComplexityResult(normalized);
    } catch (error) {
      console.error("Failed to restore session data", error);
      notify("Failed to restore previous analysis", "error");
    }
  }, [notify]);

  useEffect(() => {
    async function loadData() {
      await fetchStoredApiPayload();
    }
    loadData();
  }, [fetchStoredApiPayload]);

  return (
    <div className="w-full mx-auto p-6 space-y-6" style={{ maxWidth: '1400px' }}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Complexity Analysis Results</h1>
          <button onClick={refreshResults} className="btn-interactive flex items-center gap-2">
            <RefreshCcw className="h-3 w-3" /> Reset
          </button>
        </div>

        {/* Summary Cards - uses global CSS classes: panel, text-muted, status-* */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div className="panel p-3">
            <div className="text-xs text-muted">Total</div>
            <div className="text-xl font-bold">{summary().total}</div>
          </div>
          <div className="panel p-3">
            <div className="text-xs text-muted">Critical</div>
            <div className="text-xl font-bold status-error">{summary().critical}</div>
          </div>
          <div className="panel p-3">
            <div className="text-xs text-muted">High</div>
            <div className="text-xl font-bold status-warning">{summary().high}</div>
          </div>
          <div className="panel p-3">
            <div className="text-xs text-muted">Medium</div>
            <div className="text-xl font-bold status-warning">{summary().medium}</div>
          </div>
          <div className="panel p-3">
            <div className="text-xs text-muted">Low</div>
            <div className="text-xl font-bold status-success">{summary().low}</div>
          </div>
          <div className="panel p-3">
            <div className="text-xs text-muted">Avg Score</div>
            <div className="text-xl font-bold">{summary().avgScore}</div>
          </div>
        </div>

        {/* Filters - uses global CSS: btn-interactive */}
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
          <div className="flex flex-col md:flex-row gap-3 flex-1 w-full md:w-auto">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input
                type="text"
                placeholder="Search functions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border rounded-md bg-card focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <select
              title="Filter by File"
              value={selectedFile}
              onChange={(e) => setSelectedFile(e.target.value)}
              className="px-3 py-2 text-sm border rounded-md bg-card focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {fileNames.map((file, idx) => (
                <option key={idx} value={file}>
                  {file === "all" ? "All Files" : file}
                </option>
              ))}
            </select>

            <select
              title="Filter by Risk Level"
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="px-3 py-2 text-sm border rounded-md bg-card focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              title="List View"
              onClick={() => setViewMode("list")}
              className={cn("btn-interactive", viewMode === "list" && "bg-muted")}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              title="Card View"
              onClick={() => setViewMode("card")}
              className={cn("btn-interactive", viewMode === "card" && "bg-muted")}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              title="Table View"
              onClick={() => setViewMode("table")}
              className={cn("btn-interactive", viewMode === "table" && "bg-muted")}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="text-sm text-muted">
        Showing {filteredFunctions.length} of {allFunctions.length} functions
      </div>

      {/* CARD VIEW */}
      {viewMode === "card" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFunctions.map((fn) => (
            <div key={fn.id} className={cn("panel transition-all border-2", getRiskClass(fn.riskLevel))}>
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-sm font-mono font-bold truncate">{fn.name}()</div>
                  <div className={cn("flex items-center gap-1", getRiskBadgeClass(fn.riskLevel))}>
                    {getRiskIcon(fn.riskLevel)}
                  </div>
                </div>
                <div className="text-xs text-muted">
                  {fn.fileName} · Lines {fn.startLine}–{fn.endLine}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 text-xs font-mono border rounded">
                    Time: {fn.timeComplexity.notation}
                  </span>
                  <span className="px-2 py-0.5 text-xs font-mono border rounded">
                    Space: {fn.spaceComplexity.notation}
                  </span>
                  <span className="px-2 py-0.5 text-xs border rounded">
                    Score: {fn.totalScore}
                  </span>
                </div>

                <div className="text-xs text-muted">
                  <div className="font-semibold mb-1">Confidence: {fn.confidence}%</div>
                  {fn.matchedKeywords.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {fn.matchedKeywords.map((kw: string, i: number) => (
                        <span key={i} className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative max-h-32 overflow-auto border rounded p-2 panel-muted">
                  <pre className="text-[10px] font-mono leading-relaxed whitespace-pre-wrap">
                    {fn.text}
                  </pre>
                </div>

                <button
                  className="w-full btn-interactive flex items-center justify-center gap-2 text-xs"
                  onClick={() => setActiveReasonId(activeReasonId === fn.id ? null : fn.id)}
                >
                  <Info className="h-3 w-3" />
                  {activeReasonId === fn.id ? "Hide" : "Show"} Analysis ({fn.reasons.length})
                </button>

                {activeReasonId === fn.id && fn.reasons.length > 0 && (
                  <div className="space-y-2 pt-2 border-t">
                    {fn.reasons.map((reason: ComplexityReason, i: number) => (
                      <div key={i} className="p-2 bg-muted rounded text-xs space-y-1">
                        <div className="font-semibold flex items-center justify-between">
                          <span className="capitalize">{reason.pattern.replace(/-/g, " ")}</span>
                          <span className="text-[10px] px-1.5 py-0.5 border rounded">
                            Line {reason.lineNumber}
                          </span>
                        </div>
                        <div className="text-muted leading-relaxed">{reason.detail}</div>
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className="capitalize">Impact: {reason.impact}</span>
                          <span>·</span>
                          <span>Confidence: {reason.confidence}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === "list" && (
        <div className="space-y-3">
          {filteredFunctions.map((fn) => (
            <div key={fn.id} className={cn("panel border-l-4", getRiskClass(fn.riskLevel))}>
              <div className="p-4">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-mono font-bold text-sm">{fn.name}()</div>
                        <div className="text-xs text-muted">
                          {fn.fileName} · Lines {fn.startLine}–{fn.endLine}
                        </div>
                      </div>
                      <div className={cn("flex items-center gap-1 shrink-0", getRiskBadgeClass(fn.riskLevel))}>
                        {getRiskIcon(fn.riskLevel)}
                        <span className="text-xs font-semibold">{fn.riskLevel}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono px-2 py-0.5 border rounded">
                        Time : {fn.timeComplexity.notation}
                      </span>
                      <span className="text-xs font-mono px-2 py-0.5 border rounded">
                        Space: {fn.spaceComplexity.notation}
                      </span>
                      <span className="text-xs px-2 py-0.5 border rounded">
                        Score: {fn.totalScore}
                      </span>
                      <span className="text-xs px-2 py-0.5 border rounded">
                        {fn.confidence}% confident
                      </span>
                    </div>

                    {activeReasonId === fn.id && (
                      <div className="space-y-2 pt-2">
                        {fn.reasons.map((reason: ComplexityReason, i: number) => (
                          <div key={i} className="p-2 bg-muted rounded text-xs">
                            <div className="font-semibold capitalize mb-1">
                              {reason.pattern.replace(/-/g, " ")} (Line {reason.lineNumber})
                            </div>
                            <div className="text-muted">{reason.detail}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    title="View Analysis Details"
                    onClick={() => setActiveReasonId(activeReasonId === fn.id ? null : fn.id)}
                    className="shrink-0 btn-interactive"
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === "table" && (
        <div className="overflow-auto border rounded-md">
          <table className="w-full text-sm">
            <thead className="panel-muted">
              <tr className="text-left">
                <th className="p-3 font-semibold min-w-[140px]">Function</th>
                <th className="p-3 font-semibold min-w-[120px]">File</th>
                <th className="p-3 font-semibold min-w-20">Lines</th>
                <th className="p-3 font-semibold min-w-[100px]">Time</th>
                <th className="p-3 font-semibold min-w-[100px]">Space</th>
                <th className="p-3 font-semibold min-w-20 text-center">Score</th>
                <th className="p-3 font-semibold min-w-[90px]">Risk</th>
                <th className="p-3 font-semibold min-w-20 text-center">Info</th>
              </tr>
            </thead>
            <tbody>
              {filteredFunctions.map((fn) => (
                <>
                  <tr
                    key={fn.id}
                    className={cn("border-t border-l-4 hover:bg-muted", getRiskClass(fn.riskLevel))}
                  >
                    <td className="p-3 font-mono text-xs">{fn.name}()</td>
                    <td className="p-3 text-xs text-muted">{fn.fileName}</td>
                    <td className="p-3 text-xs">{fn.startLine}–{fn.endLine}</td>
                    <td className="p-3 font-mono text-xs">{fn.timeComplexity.notation}</td>
                    <td className="p-3 font-mono text-xs">{fn.spaceComplexity.notation}</td>
                    <td className="p-3 font-bold text-center">{fn.totalScore}</td>
                    <td className="p-3">
                      <div className={cn("flex items-center gap-1 text-xs", getRiskBadgeClass(fn.riskLevel))}>
                        {getRiskIcon(fn.riskLevel)}
                        <span>{fn.riskLevel}</span>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        title="View Analysis Details"
                        onClick={() => setActiveReasonId(activeReasonId === fn.id ? null : fn.id)}
                        className="btn-interactive inline-flex"
                      >
                        <Info className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                  {activeReasonId === fn.id && (
                    <tr className="border-t panel-muted">
                      <td colSpan={8} className="p-4">
                        <div className="space-y-2">
                          <div className="font-semibold text-sm">Analysis Details:</div>
                          {fn.reasons.map((reason: ComplexityReason, i: number) => (
                            <div key={i} className="p-3 panel rounded text-xs space-y-1">
                              <div className="font-semibold capitalize">
                                {reason.pattern.replace(/-/g, " ")} · Line {reason.lineNumber}
                              </div>
                              <div className="text-muted leading-relaxed">{reason.detail}</div>
                              <div className="flex items-center gap-3 text-[10px] text-muted">
                                <span>Impact: <span className="capitalize font-semibold">{reason.impact}</span></span>
                                <span>Confidence: <span className="font-semibold">{reason.confidence}%</span></span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredFunctions.length === 0 && (
        <div className="panel p-8 text-center">
          <Filter className="h-12 w-12 mx-auto mb-3 text-muted" />
          <div className="text-sm font-semibold mb-1">No results found</div>
          <div className="text-xs text-muted">
            Try adjusting your search or filter criteria
          </div>
        </div>
      )}
    </div>
  );
}