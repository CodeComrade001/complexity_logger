import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Mock Data
const MOCK_METRICS = {
  totalScore: "A-",
  functionsAnalyzed: "12,450",
  issuesFound: "34",
  ciCdStatus: "Healthy",
  trend: "improving"
};

const MOCK_COMPLEXITY_DIST = [
  { label: "O(1)", value: 45, color: "bg-success" },
  { label: "O(log n)", value: 25, color: "bg-success" },
  { label: "O(n)", value: 15, color: "bg-warning" },
  { label: "O(n log n)", value: 10, color: "bg-warning" },
  { label: "O(n²)", value: 4, color: "bg-destructive" },
  { label: "O(2^n)", value: 1, color: "bg-destructive" },
];

const MOCK_PROJECTS = [
  { id: 1, name: "core-api-service", language: "TypeScript", score: "A", lastScan: "2 hours ago", status: "Clean" },
  { id: 2, name: "payment-gateway", language: "Go", score: "A-", lastScan: "5 hours ago", status: "Clean" },
  { id: 3, name: "data-pipeline", language: "Python", score: "C+", lastScan: "1 day ago", status: "3 Issues" },
  { id: 4, name: "frontend-web", language: "React", score: "B", lastScan: "2 days ago", status: "Warning" },
  { id: 5, name: "rust-worker", language: "Rust", score: "A+", lastScan: "1 week ago", status: "Clean" },
];

const MOCK_TREND_DATA = Array.from({ length: 30 }).map((_, i) => ({
  day: `Day ${i + 1}`,
  complexity: Math.max(10, 100 - (i * 2.5) + (Math.random() * 10 - 5)), 
}));

export function useMetrics() {
  return useQuery({
    queryKey: ['/api/dashboard/metrics'],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 600)); // Simulate latency
      return MOCK_METRICS;
    }
  });
}

export function useComplexityDist() {
  return useQuery({
    queryKey: ['/api/dashboard/distribution'],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 500));
      return MOCK_COMPLEXITY_DIST;
    }
  });
}

export function useProjects() {
  return useQuery({
    queryKey: ['/api/projects'],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 800));
      return MOCK_PROJECTS;
    }
  });
}

export function useTrendData() {
  return useQuery({
    queryKey: ['/api/dashboard/trends'],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 700));
      return MOCK_TREND_DATA;
    }
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      await new Promise(r => setTimeout(r, 1000));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    }
  })
}
