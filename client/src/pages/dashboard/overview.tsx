import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useMetrics, useComplexityDist, useTrendData, useProjects } from "@/hooks/use-dashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code2, GitMerge, AlertTriangle, ShieldCheck, ArrowUpRight, FolderGit2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function DashboardOverview() {
  const { data: metrics, isLoading: loadingMetrics } = useMetrics();
  const { data: dist, isLoading: loadingDist } = useComplexityDist();
  const { data: trends, isLoading: loadingTrends } = useTrendData();
  const { data: projects, isLoading: loadingProjects } = useProjects();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Dashboard Overview</h1>
          <p className="text-muted-foreground">Real-time code complexity analysis across your linked repositories.</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Total Score", val: metrics?.totalScore, icon: ShieldCheck, color: "text-success", bg: "bg-success/10" },
            { title: "Functions Analyzed", val: metrics?.functionsAnalyzed, icon: Code2, color: "text-primary", bg: "bg-primary/10" },
            { title: "Issues Found", val: metrics?.issuesFound, icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
            { title: "CI/CD Status", val: metrics?.ciCdStatus, icon: GitMerge, color: "text-secondary", bg: "bg-secondary/10" }
          ].map((m, i) => (
            <Card key={i} className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{m.title}</p>
                  {loadingMetrics ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <h3 className="text-2xl font-bold tracking-tight font-mono">{m.val}</h3>
                  )}
                </div>
                <div className={`w-12 h-12 rounded-full ${m.bg} flex items-center justify-center`}>
                  <m.icon className={`w-6 h-6 ${m.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Complexity Distribution (Bar Visualizer) */}
          <Card className="col-span-1 border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Complexity Distribution</CardTitle>
              <CardDescription>Big O notation spread across all functions.</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingDist ? (
                <div className="space-y-4">
                  {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-4 w-full" />)}
                </div>
              ) : (
                <div className="space-y-5">
                  {dist?.map((d, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="font-semibold text-foreground">{d.label}</span>
                        <span className="text-muted-foreground">{d.value}%</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${d.value}%` }}
                          transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                          className={`h-full ${d.color} rounded-full`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trend Line Chart */}
          <Card className="col-span-1 lg:col-span-2 border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">30-Day Complexity Trend</CardTitle>
                <CardDescription>Aggregate complexity score over time (lower is better).</CardDescription>
              </div>
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                <ArrowUpRight className="w-3 h-3 mr-1" /> Improving
              </Badge>
            </CardHeader>
            <CardContent>
              {loadingTrends ? (
                <div className="h-[250px] flex items-center justify-center">
                  <Skeleton className="h-[200px] w-full" />
                </div>
              ) : (
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trends} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="complexity" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 6, fill: "hsl(var(--primary))", stroke: "hsl(var(--background))", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Projects Table */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg">Recent Projects</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold border-y border-border">
                <tr>
                  <th className="px-6 py-4">Project Name</th>
                  <th className="px-6 py-4">Language</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4">Last Scan</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {loadingProjects ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-8 rounded-md" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                    </tr>
                  ))
                ) : projects?.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4 font-medium text-foreground flex items-center gap-3">
                      <FolderGit2 className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      {p.name}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{p.language}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold font-mono border 
                        ${p.score.includes('A') ? 'bg-success/10 text-success border-success/20' : 
                          p.score.includes('B') ? 'bg-primary/10 text-primary border-primary/20' : 
                          'bg-warning/10 text-warning border-warning/20'}`}>
                        {p.score}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{p.lastScan}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${p.status === 'Clean' ? 'bg-success' : 'bg-warning'}`}></span>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
