import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Plus, Play, Zap, FileCode, Folder, DeleteIcon, Save } from "lucide-react";
import { ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { uploadAndAnalyzeFiles } from "@/utils/axios";
import type { SingleFile } from "@/types/fileUploadInterface";
import { CodeEditor } from "@/components/dashboard/CodeEditor";
import TrendCardPreview from "@/components/dashboard/trendCardPreview";
import { useNotification } from "@/context/useNotification";
import { ComplexitySummary, FileComplexityData, FileComplexityReceivedPayload } from "@/types/apiDataInterface";
import { MetricsGrid } from "@/components/dashboard/MetricCard";
import { fetchSession, storeSession } from "@/utils/sessionStorage";

// Temporary types for metrics/dist/trends
interface Metrics {
  totalScore: number;
  functionsAnalyzed: number;
  issuesFound: number;
  ciCdStatus: string;
}

interface DistItem {
  label: string;
  value: number;
  color: string;
}

interface TrendItem {
  complexity: number;
  date: string;
}

// TEMPORARY placeholders
const TEMP_METRICS: Metrics = { totalScore: 85, functionsAnalyzed: 12, issuesFound: 3, ciCdStatus: "Passing" };
const TEMP_DIST: DistItem[] = [
  { label: "Low", value: 50, color: "bg-green-500" },
  { label: "Medium", value: 30, color: "bg-yellow-500" },
  { label: "High", value: 20, color: "bg-red-500" },
];

export default function DashboardOverview() {
  const [files, setFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [selectedFileText, setSelectedFileText] = useState<string>("");
  const [analyzedApiResult, setAnalyzedApiResult] = useState<FileComplexityData | null>(null)
  const [uploadFilesForComplexity, setUploadFilesForComplexity] = useState<SingleFile[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { notify } = useNotification()
  const [selectedFileMetric, setSelectedFileMetric] = useState<{ nameOfFile: string, summary: ComplexitySummary } | null>(null)

  const importUserFileFolder = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.webkitdirectory = true;
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (!target?.files) return;
      const fileArray: any[] = Array.from(target.files).map((file) => ({ id: crypto.randomUUID(), name: file.name, type: "file", file }));
      setUploadFilesForComplexity(fileArray)
      setFiles(fileArray);
    };
    input.click();
  };



  const submitForAnalysis = async () => {
    // 1. Guard clause
    if (!uploadFilesForComplexity.length) {
      notify("Please select files before uploading", "error");
      return;
    }

    setIsAnalyzing(true);
    notify("Files submitted for analysis", "info");

    try {
      // 2. Build FormData
      const formData = new FormData();

      uploadFilesForComplexity.forEach(({ file }) => {
        if (file) {
          formData.append("files", file);
        }
      });


      // 4. API call
      const response = await uploadAndAnalyzeFiles(formData);
      console.log("Turbo Log  ~ submitForAnalysis ~ response:", response);

      const { success } = response.data;

      storeSession<FileComplexityData>("code-analysis", response.data)

      if (!success) {
        notify("Files analysis error", "error");
      }
      notify("Files analyzed successfully", "success");
      setAnalyzedApiResult(response.data);
    } catch (error) {
      console.error("Upload error:", error);
      notify("Internal Server Error", "error");
    } finally {
      setIsAnalyzing(false);
    }
  };


  const deleteFiles = () => {
    setFiles([])
  }

  const saveFiles = () => {
    notify("Saving Of files feature coming soon", "info")
  }

  const updateSummaryMetricCard = (summary: ComplexitySummary, nameOfFile: string) => {
    setSelectedFileMetric({ nameOfFile, summary })
  }

  useEffect(() => {
    const storedCodeAnalysis = fetchSession<FileComplexityData>("code-analysis")
    if (storedCodeAnalysis == null) {
      setAnalyzedApiResult(null)
    }
    setAnalyzedApiResult(storedCodeAnalysis)
  }, [])

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-theme(spacing.16))] overflow-hidden gap-6">
        {/* LEFT SIDEBAR */}
        <aside className="w-72 flex flex-col border  max-h-[95%] bg-card/50 backdrop-blur-sm glass-panel rounded-xl shadow-sm border-card-border overflow-hidden">
          <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/30">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Explorer</span>
            <Button onClick={importUserFileFolder} size="icon" className="h-8 shadow-primary/20 w-8">
              <Plus className="h-4 w-4" />
            </Button>
            <Button onClick={deleteFiles} variant="ghost" size="icon" className="h-8 shadow-primary/20 w-8">
              <DeleteIcon className="h-4 w-4" />
            </Button>
            <Button onClick={saveFiles} variant="ghost" size="icon" className="h-8 shadow-primary/20 w-8">
              <Save className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="flex-1 p-2">
            <div className="space-y-1">
              {files.length === 0 ? <p className="text-xs text-center text-muted-foreground mt-10">No files loaded.</p> : files.map((file) => (
                <button
                  key={file.id}
                  onClick={() => {
                    setSelectedFile(file.name);
                    file.file?.text().then((text: string) => setSelectedFileText(text));
                  }}
                  className={cn("w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors", selectedFile === file.name ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground")}
                >
                  {file.type === "folder" ? <Folder className="h-4 w-4" /> : <FileCode className="h-4 w-4" />}
                  <span className="truncate">{file.name}</span>
                </button>
              ))}
            </div>
          </ScrollArea>
        </aside>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col gap-6  pr-2">
          <header className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">{`${selectedFileMetric?.nameOfFile} Code Analysis`}
            </h1>
            <Button onClick={submitForAnalysis} disabled={isAnalyzing} className="gap-2 mt-5 shadow-lg shadow-primary/20">
              {isAnalyzing ? <Zap className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {isAnalyzing ? "Analyzing..." : "Generate Complexity"}
            </Button>
          </header>

          {/* Metrics */}
          {(selectedFileMetric !== null) && (
            <MetricsGrid metricValues={selectedFileMetric.summary} />
          )}

          {/* Complexity & Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 glass-panel p-4 rounded-xl shadow-sm border-card-border bg-card/50 overflow-hidden flex flex-col">
              <CardHeader className="py-3 px-4 border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">Source Viewer</CardTitle>
                <Badge variant="outline" className="text-[10px]">typescript</Badge>
              </CardHeader>
              <CodeEditor code={selectedFileText} resolveLanguage="typescript" />
            </Card>

            <div className="space-y-6">
              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Complexity Result</CardTitle>
                </CardHeader>
                <CardContent className="h-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    {(analyzedApiResult !== null && !analyzedApiResult.success) ?
                      <TrendCardPreview apiComplexityDetailsProp={null} sendFileSummary={(summary, nameOfFile) => updateSummaryMetricCard(summary, nameOfFile)} />
                      :
                      <TrendCardPreview apiComplexityDetailsProp={analyzedApiResult} sendFileSummary={(summary, nameOfFile) => updateSummaryMetricCard(summary, nameOfFile)} />
                    }
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}