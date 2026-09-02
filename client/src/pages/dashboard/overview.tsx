import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Play,
  Zap,
  FileCode,
  Folder,
  DeleteIcon,
  Save,
  Lock,
  ChevronDown,
  Check,
} from "lucide-react";
import { ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  getLanguageFromFileName,
  isSupportedFile,
  LANGUAGE_LABELS,
  type SupportedLanguage,
  uploadAndAnalyzeFiles,
} from "@/utils/axios";
import type { SingleFile } from "@/types/fileUploadInterface";
import { CodeEditor } from "@/components/dashboard/CodeEditor";
import TrendCardPreview from "@/components/dashboard/trendCardPreview";
import { useNotification } from "@/context/useNotification";
import {
  ComplexitySummary,
  FileComplexityData,
} from "@/types/apiDataInterface";
import { MetricsGrid } from "@/components/dashboard/MetricCard";
import { fetchSession, storeSession } from "@/utils/sessionStorage";
import { useCompilerSocket } from "@/hooks/useCompilerWebSocket";

interface UploadedFile {
  id: string;
  name: string;
  type: "file";
  file: File;
}

interface FrameworkOption {
  id: string;
  name: string;
  language: SupportedLanguage;
}

/*
 * Frameworks supported by each language.
 *
 * The framework buttons are locked automatically when
 * they don't belong to the selected language.
 */
const FRAMEWORKS: FrameworkOption[] = [
  // C#
  {
    id: "dotnet",
    name: ".NET",
    language: "csharp",
  },
  {
    id: "aspnet-core",
    name: "ASP.NET Core",
    language: "csharp",
  },

  // Go
  {
    id: "go-standard-library",
    name: "Go Standard Library",
    language: "go",
  },
  {
    id: "gin",
    name: "Gin",
    language: "go",
  },
  {
    id: "fiber",
    name: "Fiber",
    language: "go",
  },
  {
    id: "echo",
    name: "Echo",
    language: "go",
  },

  // Java
  {
    id: "spring-boot",
    name: "Spring Boot",
    language: "java",
  },
  {
    id: "quarkus",
    name: "Quarkus",
    language: "java",
  },
  {
    id: "micronaut",
    name: "Micronaut",
    language: "java",
  },

  // Python
  {
    id: "fastapi",
    name: "FastAPI",
    language: "python",
  },
  {
    id: "django",
    name: "Django",
    language: "python",
  },
  {
    id: "flask",
    name: "Flask",
    language: "python",
  },

  // Rust
  {
    id: "axum",
    name: "Axum",
    language: "rust",
  },
  {
    id: "actix-web",
    name: "Actix Web",
    language: "rust",
  },
  {
    id: "tokio",
    name: "Tokio",
    language: "rust",
  },

  // JavaScript / TypeScript
  {
    id: "nodejs",
    name: "Node.js",
    language: "javascript",
  },
  {
    id: "fastify",
    name: "Fastify",
    language: "javascript",
  },
  {
    id: "express",
    name: "Express",
    language: "javascript",
  },
  {
    id: "nestjs",
    name: "NestJS",
    language: "javascript",
  },
];

export default function DashboardOverview() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [selectedFileText, setSelectedFileText] = useState<string>("");

  const [analyzedApiResult, setAnalyzedApiResult] =
    useState<FileComplexityData | null>(null);

  const [uploadFilesForComplexity, setUploadFilesForComplexity] = useState<
    SingleFile[]
  >([]);

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { notify } = useNotification();

  const [selectedFileMetric, setSelectedFileMetric] = useState<{
    nameOfFile: string;
    summary: ComplexitySummary;
  } | null>(null);

  /*
   * User-selected preferred language.
   *
   * This is independent from the actual uploaded file language.
   * The uploaded file extension still determines which analyzer
   * endpoint is called.
   */
  const [preferredLanguage, setPreferredLanguage] =
    useState<SupportedLanguage>("javascript");

  /*
   * User-selected preferred framework.
   */
  const [preferredFramework, setPreferredFramework] =
    useState<string>("");

  /*
   * Dropdown visibility states.
   */
  const [languageDropdownOpen, setLanguageDropdownOpen] =
    useState(false);

  const [frameworkDropdownOpen, setFrameworkDropdownOpen] =
    useState(false);

  /*
   * Determine the language of the currently selected file.
   *
   * This replaces the previous hardcoded "typescript" value.
   */
  const selectedLanguage = useMemo<SupportedLanguage | null>(() => {
    if (!selectedFile) {
      return null;
    }

    return getLanguageFromFileName(selectedFile);
  }, [selectedFile]);

  /*
   * Get the currently selected framework.
   */
  const selectedFramework = useMemo(() => {
    return FRAMEWORKS.find(
      (framework) => framework.id === preferredFramework
    );
  }, [preferredFramework]);

  /*
   * Import a complete directory.
   *
   * Only these languages are accepted:
   *
   * C#
   * Go
   * Java
   * Python
   * Rust
   * JavaScript / TypeScript
   */
  const importUserFileFolder = async () => {
    const input = document.createElement("input");

    input.type = "file";
    input.webkitdirectory = true;

    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;

      if (!target?.files) {
        return;
      }

      const selectedFiles = Array.from(target.files);

      const supportedFiles = selectedFiles.filter((file) =>
        isSupportedFile(file.name)
      );

      const unsupportedFiles = selectedFiles.filter(
        (file) => !isSupportedFile(file.name)
      );

      /*
       * Tell the user if unsupported files were found.
       *
       * Unsupported files are ignored instead of being sent
       * to the backend.
       */
      if (unsupportedFiles.length > 0) {
        notify(
          `${unsupportedFiles.length} unsupported file(s) were ignored. Supported languages are C#, Go, Java, Python, Rust, JavaScript and TypeScript.`,
          "error"
        );
      }

      /*
       * Do not continue if the folder contains no supported
       * source files.
       */
      if (supportedFiles.length === 0) {
        notify(
          "No supported source files found. Supported languages are C#, Go, Java, Python, Rust, JavaScript and TypeScript.",
          "error"
        );

        return;
      }

      const uploadFileArray: SingleFile[] = supportedFiles.map((file) => {
        const language = getLanguageFromFileName(file.name);
        const backendLanguage =
          (language ?? "javascript") as SingleFile["language"];

        return {
          id: crypto.randomUUID(),
          name: file.name,
          type: "file",
          language: backendLanguage,
          size: file.size,
          dir: file.webkitRelativePath
            ? file.webkitRelativePath.slice(
              0,
              file.webkitRelativePath.lastIndexOf("/")
            )
            : "",
          file,
        };
      });

      const displayFileArray: UploadedFile[] = uploadFileArray.map(
        ({ id, name, type, file }) => ({
          id,
          name,
          type,
          file,
        })
      );

      setUploadFilesForComplexity(uploadFileArray);
      setFiles(displayFileArray);

      /*
       * Reset the source viewer when a new folder is loaded.
       */
      setSelectedFile("");
      setSelectedFileText("");
      setSelectedFileMetric(null);
      setAnalyzedApiResult(null);
    };

    input.click();
  };

  /*
   * Change preferred language.
   *
   * When language changes, the selected framework is cleared
   * because the previous framework may no longer be compatible.
   */
  const handleLanguageChange = (language: SupportedLanguage) => {
    setPreferredLanguage(language);
    setPreferredFramework("");
    setLanguageDropdownOpen(false);
  };

  /*
   * Select framework.
   */
  const handleFrameworkChange = (
    framework: FrameworkOption
  ) => {
    /*
     * Extra safety check.
     *
     * Even though incompatible buttons are disabled in the UI,
     * we still validate here.
     */
    if (framework.language !== preferredLanguage) {
      notify(
        `${framework.name} is not compatible with ${LANGUAGE_LABELS[preferredLanguage]}.`,
        "error"
      );

      return;
    }

    setPreferredFramework(framework.id);
    setFrameworkDropdownOpen(false);
  };


  const handleCompilerCompleted = (data: unknown) => {
    console.log("Compiler result received:", data);

    storeSession<FileComplexityData>(
      "code-analysis",
      data as FileComplexityData
    );

    setAnalyzedApiResult(data as FileComplexityData);

    notify("Code analysis completed", "success");
  };

  useCompilerSocket(handleCompilerCompleted);

  /*
   * Submit files for analysis.
   *
   * Files are grouped by language before being sent.
   *
   * Example:
   *
   * project/
   *   main.py
   *   User.java
   *   server.go
   *
   * becomes:
   *
   * POST /repos/python/analyze
   * POST /repos/java/analyze
   * POST /repos/go/analyze
   */

  const submitForAnalysis = async () => {
    if (!hasFilesToAnalyze()) {
      notify("Please select files before uploading", "error");
      return;
    }

    setIsAnalyzing(true);

    try {
      const filesByLanguage = groupFilesByLanguage(
        uploadFilesForComplexity
      );

      if (!filesByLanguage) {
        return;
      }

      const jobs = await submitLanguageAnalyses(filesByLanguage);

      if (jobs.length === 0) {
        notify("Files analysis error", "error");
        return;
      }

      notify(
        `Analysis started for ${jobs.length} job${jobs.length > 1 ? "s" : ""
        }`,
        "success"
      );


      console.log("Waiting for compiler completion:", jobs);
    } catch (error) {
      console.error("Upload error:", error);
      notify("Internal Server Error", "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const hasFilesToAnalyze = () => {
    return uploadFilesForComplexity.length > 0;
  };

  const groupFilesByLanguage = (
    files: typeof uploadFilesForComplexity
  ): Partial<Record<SupportedLanguage, File[]>> | null => {
    const filesByLanguage: Partial<
      Record<SupportedLanguage, File[]>
    > = {};

    const unsupportedFiles: string[] = [];

    files.forEach(({ file }) => {
      if (!file) return;

      const language = getLanguageFromFileName(file.name);

      if (!language) {
        unsupportedFiles.push(file.name);
        return;
      }

      filesByLanguage[language] ??= [];
      filesByLanguage[language]!.push(file);
    });

    notifyUnsupportedFiles(unsupportedFiles);

    const hasSupportedFiles = Object.values(filesByLanguage).some(
      (files) => files && files.length > 0
    );

    if (!hasSupportedFiles) {
      notify("No supported files available for analysis", "error");
      return null;
    }

    return filesByLanguage;
  };

  const notifyUnsupportedFiles = (files: string[]) => {
    if (files.length === 0) return;

    notify(
      `Unsupported files were skipped: ${files.join(", ")}`,
      "error"
    );
  };

  const submitLanguageAnalyses = async (
    filesByLanguage: Partial<Record<SupportedLanguage, File[]>>
  ) => {
    const languages = Object.entries(filesByLanguage).filter(
      ([, files]) => files && files.length > 0
    ) as [SupportedLanguage, File[]][];

    const results = await Promise.all(
      languages.map(([language, files]) =>
        submitLanguageAnalysis(language, files)
      )
    );

    return results.filter(
      (result): result is { language: SupportedLanguage; jobId: string } =>
        result !== null
    );
  };

  const submitLanguageAnalysis = async (
    language: SupportedLanguage,
    files: File[]
  ) => {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file);
    });

    const result = await uploadAndAnalyzeFiles(
      language,
      formData
    );

    const { success, jobId } = result.response.data;

    if (!success || !jobId) {
      notify(
        `Analysis failed for ${LANGUAGE_LABELS[language]}`,
        "error"
      );

      return null;
    }

    return {
      language,
      jobId,
    };
  };


  /*
   * Remove all loaded files.
   */
  const deleteFiles = () => {
    setFiles([]);
    setUploadFilesForComplexity([]);
    setSelectedFile("");
    setSelectedFileText("");
    setSelectedFileMetric(null);
    setAnalyzedApiResult(null);
  };

  /*
   * Saving functionality is not implemented yet.
   */
  const saveFiles = () => {
    notify("Saving of files feature coming soon", "info");
  };

  /*
   * Update the metric cards when a file summary is selected.
   */
  const updateSummaryMetricCard = (
    summary: ComplexitySummary,
    nameOfFile: string
  ) => {
    setSelectedFileMetric({
      nameOfFile,
      summary,
    });
  };

  /*
   * Restore the previous analysis result from session storage.
   */
  useEffect(() => {
    const storedCodeAnalysis =
      fetchSession<FileComplexityData>("code-analysis");

    if (storedCodeAnalysis == null) {
      setAnalyzedApiResult(null);
      return;
    }

    setAnalyzedApiResult(storedCodeAnalysis);
  }, []);

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-theme(spacing.16))] overflow-hidden gap-6">

        {/* LEFT SIDEBAR */}
        <aside className="w-72 flex flex-col border max-h-[95%] bg-card/50 backdrop-blur-sm glass-panel rounded-xl shadow-sm border-card-border overflow-hidden">
          <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/30">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Explorer
            </span>

            <div className="flex items-center gap-1">
              <Button
                onClick={importUserFileFolder}
                size="icon"
                className="h-8 shadow-primary/20 w-8"
                title="Import folder"
              >
                <Plus className="h-4 w-4" />
              </Button>

              <Button
                onClick={deleteFiles}
                variant="ghost"
                size="icon"
                className="h-8 shadow-primary/20 w-8"
                title="Delete files"
              >
                <DeleteIcon className="h-4 w-4" />
              </Button>

              <Button
                onClick={saveFiles}
                variant="ghost"
                size="icon"
                className="h-8 shadow-primary/20 w-8"
                title="Save files"
              >
                <Save className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1 p-2">
            <div className="space-y-1">
              {files.length === 0 ? (
                <p className="text-xs text-center text-muted-foreground mt-10">
                  No files loaded.
                </p>
              ) : (
                files.map((file) => {
                  const language = getLanguageFromFileName(file.name);

                  return (
                    <button
                      key={file.id}
                      onClick={() => {
                        setSelectedFile(file.name);

                        file.file
                          ?.text()
                          .then((text: string) =>
                            setSelectedFileText(text)
                          );
                      }}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                        selectedFile === file.name
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted text-muted-foreground"
                      )}
                    >
                      {file.type === "file" ? (
                        <FileCode className="h-4 w-4 shrink-0" />
                      ) : (
                        <Folder className="h-4 w-4 shrink-0" />
                      )}

                      <span className="truncate flex-1 text-left">
                        {file.name}
                      </span>

                      {language && (
                        <span className="text-[9px] uppercase opacity-60">
                          {language === "javascript"
                            ? "JS/TS"
                            : LANGUAGE_LABELS[language]}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </aside>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col gap-6 pr-2 overflow-y-auto">

          {/* HEADER */}
          <header className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">
              {selectedFileMetric?.nameOfFile
                ? `${selectedFileMetric.nameOfFile} Code Analysis`
                : "Code Analysis"}
            </h1>

            <Button
              onClick={submitForAnalysis}
              disabled={
                isAnalyzing ||
                uploadFilesForComplexity.length === 0
              }
              className="gap-2 mt-5 shadow-lg shadow-primary/20"
            >
              {isAnalyzing ? (
                <Zap className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}

              {isAnalyzing
                ? "Analyzing..."
                : "Generate Complexity"}
            </Button>
          </header>

          {/* LANGUAGE & FRAMEWORK SELECTION */}
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm">
                    Project Preferences
                  </CardTitle>

                  <p className="text-xs text-muted-foreground mt-1">
                    Select your preferred programming language and framework.
                  </p>
                </div>

                <Badge
                  variant="outline"
                  className="text-[10px]"
                >
                  {LANGUAGE_LABELS[preferredLanguage]}
                  {selectedFramework
                    ? ` · ${selectedFramework.name}`
                    : ""}
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* LANGUAGE BUTTON */}
                <div className="relative">
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">
                    Programming Language
                  </label>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setLanguageDropdownOpen(
                        (previous) => !previous
                      )
                    }
                    className="w-full justify-between h-11"
                  >
                    <div className="flex items-center gap-2">
                      <FileCode className="h-4 w-4" />

                      <span>
                        {LANGUAGE_LABELS[preferredLanguage]}
                      </span>
                    </div>

                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        languageDropdownOpen && "rotate-180"
                      )}
                    />
                  </Button>

                  {languageDropdownOpen && (
                    <div className="absolute z-50 mt-2 w-full rounded-lg border border-border bg-card shadow-xl p-1">

                      {(
                        Object.keys(
                          LANGUAGE_LABELS
                        ) as SupportedLanguage[]
                      ).map((language) => {
                        const isSelected =
                          preferredLanguage === language;

                        return (
                          <button
                            key={language}
                            type="button"
                            onClick={() =>
                              handleLanguageChange(language)
                            }
                            className={cn(
                              "w-full flex items-center justify-between rounded-md px-3 py-2.5 text-sm text-left transition-colors",
                              "hover:bg-muted",
                              isSelected &&
                              "bg-primary/10 text-primary"
                            )}
                          >
                            <span>
                              {LANGUAGE_LABELS[language]}
                            </span>

                            {isSelected && (
                              <Check className="h-4 w-4" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* FRAMEWORK BUTTON */}
                <div className="relative">
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">
                    Framework / Platform
                  </label>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setFrameworkDropdownOpen(
                        (previous) => !previous
                      )
                    }
                    className="w-full justify-between h-11"
                  >
                    <div className="flex items-center gap-2">
                      {selectedFramework ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Lock className="h-4 w-4 opacity-50" />
                      )}

                      <span>
                        {selectedFramework?.name ??
                          "Select framework"}
                      </span>
                    </div>

                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        frameworkDropdownOpen && "rotate-180"
                      )}
                    />
                  </Button>

                  {frameworkDropdownOpen && (
                    <div className="absolute z-50 mt-2 w-full rounded-lg border border-border bg-card shadow-xl p-1 max-h-72 overflow-y-auto">

                      {FRAMEWORKS.map((framework) => {
                        const isCompatible =
                          framework.language ===
                          preferredLanguage;

                        const isSelected =
                          preferredFramework ===
                          framework.id;

                        return (
                          <button
                            key={framework.id}
                            type="button"
                            disabled={!isCompatible}
                            onClick={() => {
                              if (isCompatible) {
                                handleFrameworkChange(
                                  framework
                                );
                              }
                            }}
                            className={cn(
                              "w-full flex items-center justify-between rounded-md px-3 py-2.5 text-sm text-left transition-colors",
                              isCompatible
                                ? "hover:bg-muted cursor-pointer"
                                : "opacity-40 cursor-not-allowed bg-muted/20",
                              isSelected &&
                              "bg-primary/10 text-primary"
                            )}
                          >
                            <div className="flex items-center gap-2">

                              {!isCompatible && (
                                <Lock className="h-3.5 w-3.5 shrink-0" />
                              )}

                              <span>
                                {framework.name}
                              </span>
                            </div>

                            {isSelected && (
                              <Check className="h-4 w-4" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* CURRENT SELECTION */}
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <span>Selected:</span>

                <Badge
                  variant="secondary"
                  className="text-[10px]"
                >
                  {LANGUAGE_LABELS[preferredLanguage]}
                </Badge>

                {selectedFramework && (
                  <>
                    <span>+</span>

                    <Badge
                      variant="secondary"
                      className="text-[10px]"
                    >
                      {selectedFramework.name}
                    </Badge>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* METRICS */}
          {selectedFileMetric !== null && (
            <MetricsGrid
              metricValues={selectedFileMetric.summary}
            />
          )}

          {/* COMPLEXITY & TRENDS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* SOURCE VIEWER */}
            <Card className="lg:col-span-2 glass-panel p-4 rounded-xl shadow-sm border-card-border bg-card/50 overflow-hidden flex flex-col">
              <CardHeader className="py-3 px-4 border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  Source Viewer
                </CardTitle>

                <Badge
                  variant="outline"
                  className="text-[10px]"
                >
                  {selectedLanguage
                    ? LANGUAGE_LABELS[selectedLanguage]
                    : "No file selected"}
                </Badge>
              </CardHeader>

              <CodeEditor
                code={selectedFileText}
                resolveLanguage={
                  selectedLanguage === "javascript"
                    ? "typescript"
                    : selectedLanguage ?? "text"
                }
              />
            </Card>

            {/* COMPLEXITY RESULT */}
            <div className="space-y-6">
              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    Complexity Result
                  </CardTitle>
                </CardHeader>

                <CardContent className="h-auto">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    {analyzedApiResult !== null &&
                      !analyzedApiResult.success ? (
                      <TrendCardPreview
                        apiComplexityDetailsProp={null}
                        sendFileSummary={(
                          summary,
                          nameOfFile
                        ) =>
                          updateSummaryMetricCard(
                            summary,
                            nameOfFile
                          )
                        }
                      />
                    ) : (
                      <TrendCardPreview
                        apiComplexityDetailsProp={
                          analyzedApiResult
                        }
                        sendFileSummary={(
                          summary,
                          nameOfFile
                        ) =>
                          updateSummaryMetricCard(
                            summary,
                            nameOfFile
                          )
                        }
                      />
                    )}
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