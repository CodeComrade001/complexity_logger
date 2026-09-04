import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotification } from "@/context/useNotification";
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Clock,
  FileCode2,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";
import { FileComplexityData } from "@/types/apiDataInterface";
import { getAllJobs, getJobsById } from "@/utils/axios";



/*
 * This represents the shape expected by this page.
 *
 * If your backend currently returns a different shape,
 * normalize it in the API layer rather than spreading
 * backend-specific checks throughout the UI.
 */
interface CompilerJob {
  jobId: string;
  result?: FileComplexityData;
  payload?: FileComplexityData;
  createdAt?: string;
  updatedAt?: string;
}

/* =========================
   RUNTIME VALIDATION
   ========================= */

function isFileComplexityData(
  value: unknown,
): value is FileComplexityData {
  if (!value || typeof value !== "object") {
    return false;
  }

  const data = value as Record<string, unknown>;

  return (
    typeof data.success === "boolean" &&
    typeof data.message === "string" &&
    Array.isArray(data.data)
  );
}

function isCompilerJob(value: unknown): value is CompilerJob {
  if (!value || typeof value !== "object") {
    return false;
  }

  const job = value as Record<string, unknown>;

  return typeof job.jobId === "string";
}

function extractComplexityData(
  job: CompilerJob,
): FileComplexityData | null {
  if (isFileComplexityData(job.result)) {
    return job.result;
  }

  if (isFileComplexityData(job.payload)) {
    return job.payload;
  }

  return null;
}

/* =========================
   TEMPORARY SESSION CACHE
   ========================= */

const JOB_CACHE_KEY = "compiler-jobs";

function getCachedJobs(): CompilerJob[] | null {
  try {
    const cached = sessionStorage.getItem(JOB_CACHE_KEY);

    if (!cached) {
      return null;
    }

    const parsed: unknown = JSON.parse(cached);

    if (!Array.isArray(parsed)) {
      return null;
    }

    return parsed.filter(isCompilerJob);
  } catch (error) {
    console.error(
      "Failed to read compiler jobs from cache:",
      error,
    );

    return null;
  }
}

function cacheJobs(jobs: CompilerJob[]): void {
  try {
    sessionStorage.setItem(
      JOB_CACHE_KEY,
      JSON.stringify(jobs),
    );
  } catch (error) {
    console.error(
      "Failed to cache compiler jobs:",
      error,
    );
  }
}

/* =========================
   PAGE
   ========================= */

export default function Reports() {
  const { notify } = useNotification();

  const [jobs, setJobs] = useState<CompilerJob[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /*
   * Connect your actual getAllJobs() here.
   */
  const loadJobsFromDatabase = useCallback(
    async (): Promise<CompilerJob[]> => {

      // Example:

      const response = await getAllJobs();

      if (!Array.isArray(response.data)) {
        throw new Error("Invalid jobs response");
      }

      return response.data.filter(isCompilerJob);


      return [];
    },
    [],
  );

  /*
   * Cache-first loading strategy:
   *
   * 1. Check session cache.
   * 2. If cache exists, render it.
   * 3. If cache doesn't exist, query backend.
   * 4. Save backend result to cache.
   */
  const loadJobs = useCallback(
    async (forceRefresh = false) => {
      setError(null);

      if (!forceRefresh) {
        const cachedJobs = getCachedJobs();

        if (cachedJobs && cachedJobs.length > 0) {
          setJobs(cachedJobs);
          setIsLoading(false);

          return;
        }
      }

      try {
        if (forceRefresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        const databaseJobs =
          await loadJobsFromDatabase();

        setJobs(databaseJobs);
        cacheJobs(databaseJobs);
      } catch (error) {
        console.error(
          "Failed to load compiler jobs:",
          error,
        );

        const message =
          error instanceof Error
            ? error.message
            : "Failed to load compiler jobs.";

        setError(message);

        notify(
          "Unable to load analysis results.",
          "error",
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [loadJobsFromDatabase, notify],
  );

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  /* =========================
     FILTERED JOBS
     ========================= */

  const filteredJobs = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return jobs;
    }

    return jobs.filter((job) =>
      job.jobId.toLowerCase().includes(search),
    );
  }, [jobs, searchTerm]);

  /* =========================
     SUMMARY
     ========================= */

  const totalFiles = useMemo(() => {
    return jobs.reduce((total, job) => {
      const result = extractComplexityData(job);

      if (!result) {
        return total;
      }

      return total + result.data.length;
    }, 0);
  }, [jobs]);

  const successfulJobs = useMemo(() => {
    return jobs.filter((job) => {
      const result = extractComplexityData(job);

      return result?.success === true;
    }).length;
  }, [jobs]);

  const failedJobs = jobs.length - successfulJobs;

  /* =========================
     HANDLERS
     ========================= */

  const handleRefresh = async () => {
    await loadJobs(true);
  };

  const handleOpenJob = (jobId: string) => {

    //  Later:

    //  navigate(`/projects/${jobId}`);

    getJobsById(jobId);


    console.log("Opening job:", jobId);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  /* =========================
     RENDER
     ========================= */

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="mb-1 text-3xl font-bold tracking-tight">
              Reports
            </h1>

            <p className="text-muted-foreground">
              View and inspect your completed code complexity
              analyses.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-card"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""
                }`}
            />

            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        {/* Error */}
        {error && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />

              <div className="flex-1">
                <p className="font-medium">
                  Unable to load projects
                </p>

                <p className="text-sm text-muted-foreground">
                  {error}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => void loadJobs(true)}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Jobs"
            value={jobs.length}
            icon={<BarChart3 className="h-4 w-4" />}
            isLoading={isLoading}
          />

          <StatCard
            title="Files Analyzed"
            value={totalFiles}
            icon={<FileCode2 className="h-4 w-4" />}
            isLoading={isLoading}
          />

          <StatCard
            title="Successful"
            value={successfulJobs}
            icon={<CheckCircle2 className="h-4 w-4" />}
            isLoading={isLoading}
          />

          <StatCard
            title="Failed"
            value={failedJobs}
            icon={<XCircle className="h-4 w-4" />}
            isLoading={isLoading}
          />
        </div>

        {/* Search */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search by Job ID..."
                className="pl-10 pr-10"
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Jobs */}
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold">
              Analysis Jobs
            </h2>

            <p className="text-sm text-muted-foreground">
              {searchTerm
                ? `${filteredJobs.length} matching jobs`
                : `${jobs.length} total jobs`}
            </p>
          </div>

          {isLoading ? (
            <JobsSkeleton />
          ) : filteredJobs.length === 0 ? (
            <EmptyState
              hasSearch={Boolean(searchTerm)}
              onClearSearch={handleClearSearch}
            />
          ) : (
            <div className="space-y-3">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.jobId}
                  job={job}
                  onOpen={handleOpenJob}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

/* =========================
   STAT CARD
   ========================= */

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  isLoading: boolean;
}

function StatCard({
  title,
  value,
  icon,
  isLoading,
}: StatCardProps) {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {title}
          </p>

          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            {icon}
          </div>
        </div>

        {isLoading ? (
          <Skeleton className="mt-3 h-8 w-16" />
        ) : (
          <p className="mt-3 text-2xl font-bold">
            {value}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/* =========================
   JOB CARD
   ========================= */

interface JobCardProps {
  job: CompilerJob;
  onOpen: (jobId: string) => void;
}

function JobCard({
  job,
  onOpen,
}: JobCardProps) {
  const result = extractComplexityData(job);

  const reports = result?.data ?? [];

  const filesAnalyzed = reports.length;

  const averageScore =
    filesAnalyzed > 0
      ? reports.reduce(
        (sum, report) =>
          sum + report.summary.avgScore,
        0,
      ) / filesAnalyzed
      : null;

  const highRiskCount = reports.reduce(
    (sum, report) =>
      sum +
      report.summary.criticalRiskCount +
      report.summary.highRiskCount,
    0,
  );

  const successful = result?.success === true;

  return (
    <Card className="group border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-200 hover:border-primary/30 hover:bg-card">
      <CardContent className="p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
          {/* Job information */}
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileCode2 className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-2">
                {successful ? (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive" />
                )}

                <span className="text-sm font-medium">
                  {successful ? "Completed" : "Failed"}
                </span>
              </div>

              <h3 className="truncate font-mono text-sm font-semibold">
                {job.jobId}
              </h3>

              {job.createdAt && (
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />

                  {formatDate(job.createdAt)}
                </p>
              )}
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-6 lg:w-[360px]">
            <Metric
              label="Files"
              value={filesAnalyzed}
            />

            <Metric
              label="Avg Score"
              value={
                averageScore === null
                  ? "—"
                  : averageScore.toFixed(1)
              }
            />

            <Metric
              label="High Risk"
              value={highRiskCount}
              danger={highRiskCount > 0}
            />
          </div>

          {/* Action */}
          <Button
            variant="secondary"
            onClick={() => onOpen(job.jobId)}
            className="shrink-0"
          >
            View Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* =========================
   METRIC
   ========================= */

interface MetricProps {
  label: string;
  value: string | number;
  danger?: boolean;
}

function Metric({
  label,
  value,
  danger = false,
}: MetricProps) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p
        className={`mt-1 text-lg font-semibold ${danger ? "text-destructive" : ""
          }`}
      >
        {value}
      </p>
    </div>
  );
}

/* =========================
   LOADING SKELETON
   ========================= */

function JobsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <Card
          key={index}
          className="border-border/50 bg-card/50"
        >
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <Skeleton className="h-11 w-11 rounded-lg" />

              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />

                <Skeleton className="h-4 w-64" />

                <Skeleton className="h-3 w-32" />
              </div>

              <Skeleton className="h-10 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* =========================
   EMPTY STATE
   ========================= */

interface EmptyStateProps {
  hasSearch: boolean;
  onClearSearch: () => void;
}

function EmptyState({
  hasSearch,
  onClearSearch,
}: EmptyStateProps) {
  return (
    <Card className="border-border/50 bg-card/50">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 rounded-full bg-muted p-4">
          {hasSearch ? (
            <Search className="h-6 w-6 text-muted-foreground" />
          ) : (
            <FileCode2 className="h-6 w-6 text-muted-foreground" />
          )}
        </div>

        <h3 className="text-lg font-semibold">
          {hasSearch
            ? "No matching jobs"
            : "No analysis jobs yet"}
        </h3>

        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          {hasSearch
            ? "No analysis job matches the Job ID you entered."
            : "Completed compiler analyses will appear here."}
        </p>

        {hasSearch && (
          <Button
            variant="outline"
            className="mt-5"
            onClick={onClearSearch}
          >
            Clear Search
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

/* =========================
   DATE
   ========================= */

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}