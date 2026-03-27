import { useCallback, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Code2, GitMerge, AlertTriangle, ShieldCheck, Plus, Play, Zap, FileCode, Folder, DeleteIcon } from "lucide-react";
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
import { FileComplexityData } from "@/types/apiDataInterface";
import { MetricsGrid } from "@/components/dashboard/MetricCard";

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
    if (uploadFilesForComplexity.length === 0) {
      console.log("no files for upload pleae load files")
      return notify("Please Select a File For Upload", "error")

    }
    try {
      setIsAnalyzing(true);
      notify("FIles Submitted for analyzing", "info")
      const formData = new FormData();
      uploadFilesForComplexity.forEach((item) => formData.append("files", item.file));
      console.log("formData")
      const response = await uploadAndAnalyzeFiles(formData);
      console.log("Turbo Log  ~ submitForAnalysis ~ response:", response);
      const { success, data } = response.data;
      setAnalyzedApiResult(data)
      if (success) {
        notify("Files Complexity Generated Successfully", "success")
      }
    } catch (err) {
      notify("Internal Server Error", "error")
      console.log("Error uploading files", err)
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-theme(spacing.16))] overflow-hidden gap-6">
        {/* LEFT SIDEBAR */}
        <aside className="w-72 flex flex-col border border-border/50 max-h-[95%] bg-card/50 backdrop-blur-sm rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/30">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Explorer</span>
            <Button onClick={importUserFileFolder} size="icon" className="h-8 shadow-primary/20 w-8">
              <Plus className="h-4 w-4" />
            </Button>
            {/* <Button onClick={DeleteFiles} variant="ghost" size="icon" className="h-8 w-8">
              <DeleteIcon className="h-4 w-4" />
            </Button> */}
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
            <h1 className="text-3xl font-bold tracking-tight">Code Analysis</h1>
            <Button onClick={submitForAnalysis} disabled={isAnalyzing} className="gap-2 mt-5 shadow-lg shadow-primary/20">
              {isAnalyzing ? <Zap className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {isAnalyzing ? "Analyzing..." : "Generate Complexity"}
            </Button>
          </header>

          {/* Metrics */}
          {/* {(analyzedApiResult !== null) && (
            <MetricsGrid metricValues={analyzedApiResult.data.summary} />
          )} */}
          <MetricsGrid metricValues={analyzedApiResult?.data?.summary ?? null} />

          {/* Complexity & Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-border/50 bg-card/50 overflow-hidden flex flex-col">
              <CardHeader className="py-3 px-4 border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">Source Viewer</CardTitle>
                <Badge variant="outline" className="text-[10px]">typescript</Badge>
              </CardHeader>
              <CodeEditor code={selectedFileText} resolveLanguage="typescript" />
            </Card>

            <div className="space-y-6">
              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Complexity Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {TEMP_DIST.map((d: DistItem, i: number) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span>{d.label}</span>
                        <span>{d.value}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${d.value}%` }} className={`h-full ${d.color} rounded-full`} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Complexity Result</CardTitle>
                </CardHeader>
                <CardContent className="h-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <TrendCardPreview apiComplexitydetails={analyzedApiResult?.data.details || null} />
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