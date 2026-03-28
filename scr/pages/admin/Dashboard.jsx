import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { AlertTriangle, CheckCircle2, Clock, TrendingUp, Users, MessageSquare } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['hsl(217, 91%, 50%)', 'hsl(152, 60%, 45%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)', 'hsl(280, 65%, 60%)', 'hsl(190, 70%, 45%)', 'hsl(340, 65%, 55%)'];

export default function Dashboard() {
  const { data: issues = [] } = useQuery({
    queryKey: ['admin-issues'],
    queryFn: () => base44.entities.Issue.list('-created_date', 500),
  });
  const { data: feedback = [] } = useQuery({
    queryKey: ['admin-feedback'],
    queryFn: () => base44.entities.Feedback.list('-created_date', 100),
  });
  const { data: suggestions = [] } = useQuery({
    queryKey: ['admin-suggestions'],
    queryFn: () => base44.entities.Suggestion.list('-created_date', 100),
  });

  const total = issues.length;
  const submitted = issues.filter(i => i.status === 'submitted').length;
  const inProgress = issues.filter(i => i.status === 'in_progress').length;
  const resolved = issues.filter(i => i.status === 'resolved').length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  // Category breakdown
  const categoryData = Object.entries(
    issues.reduce((acc, i) => {
      acc[i.category || 'other'] = (acc[i.category || 'other'] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));

  // Status breakdown
  const statusData = [
    { name: 'Submitted', value: submitted },
    { name: 'In Progress', value: inProgress },
    { name: 'Resolved', value: resolved },
    { name: 'Rejected', value: issues.filter(i => i.status === 'rejected').length },
  ].filter(d => d.value > 0);

  const avgRating = feedback.length > 0
    ? (feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / feedback.length).toFixed(1)
    : 'N/A';

  const stats = [
    { label: 'Total Issues', value: total, icon: AlertTriangle, color: 'text-primary' },
    { label: 'Pending', value: submitted, icon: Clock, color: 'text-amber-600' },
    { label: 'In Progress', value: inProgress, icon: TrendingUp, color: 'text-blue-600' },
    { label: 'Resolved', value: resolved, icon: CheckCircle2, color: 'text-green-600' },
    { label: 'Avg. Rating', value: avgRating, icon: MessageSquare, color: 'text-purple-600' },
    { label: 'Suggestions', value: suggestions.length, icon: Users, color: 'text-cyan-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of Yavatmal Smart City operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map(({ label, value, icon: Icon, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-4 border">
              <Icon className={`w-5 h-5 ${color} mb-2`} />
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Resolution Rate */}
      <Card className="p-5 border">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold">Resolution Rate</h2>
          <span className="text-2xl font-bold text-primary">{resolutionRate}%</span>
        </div>
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${resolutionRate}%` }} />
        </div>
      </Card>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-5 border">
          <h2 className="text-sm font-semibold mb-4">Issues by Category</h2>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {categoryData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-10">No data yet</p>
          )}
        </Card>

        <Card className="p-5 border">
          <h2 className="text-sm font-semibold mb-4">Issues by Status</h2>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statusData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {statusData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-10">No data yet</p>
          )}
        </Card>
      </div>
    </div>
  );
}
