import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AlertTriangle, Search, Users, Bell, BarChart3 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { t } from '@/lib/translations';

export default function Home() {
  const { lang } = useOutletContext() || { lang: 'en' };

  const { data: issues = [] } = useQuery({
    queryKey: ['issues-home'],
    queryFn: () => base44.entities.Issue.list('-created_date', 100),
  });

  const { data: events = [] } = useQuery({
    queryKey: ['events-home'],
    queryFn: () => base44.entities.CityEvent.filter({ is_active: true }, '-date', 3),
  });

  const totalIssues = issues.length;
  const resolvedIssues = issues.filter(i => i.status === 'resolved').length;
  const inProgressIssues = issues.filter(i => i.status === 'in_progress').length;
  const resolutionRate = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0;

  const quickActions = [
    { path: '/report', icon: AlertTriangle, label: t('reportIssue', lang), color: 'bg-red-50 text-red-600 border-red-100' },
    { path: '/track', icon: Search, label: t('trackIssues', lang), color: 'bg-blue-50 text-blue-600 border-blue-100' },
    { path: '/community', icon: Users, label: t('community', lang), color: 'bg-green-50 text-green-600 border-green-100' },
    { path: '/events', icon: Bell, label: t('events', lang), color: 'bg-purple-50 text-purple-600 border-purple-100' },
  ];

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-6"
      >
        <div className="w-16 h-16 rounded-2xl bg-primary mx-auto flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
          <span className="text-primary-foreground font-extrabold text-xl">YC</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">{t('appFull', lang)}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t('tagline', lang)}</p>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map(({ path, icon: Icon, label, color }, i) => (
          <motion.div
            key={path}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link to={path}>
              <Card className={`p-4 border ${color} hover:shadow-md transition-all active:scale-[0.98]`}>
                <Icon className="w-7 h-7 mb-2" />
                <span className="text-sm font-semibold">{label}</span>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Stats Strip */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <Card className="p-4 bg-card border">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">{t('cityDashboard', lang)}</h2>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <p className="text-xl font-bold text-foreground">{totalIssues}</p>
              <p className="text-[10px] text-muted-foreground">{t('total', lang)}</p>
            </div>
            <div>
              <p className="text-xl font-bold text-blue-600">{inProgressIssues}</p>
              <p className="text-[10px] text-muted-foreground">{t('inProgress', lang)}</p>
            </div>
            <div>
              <p className="text-xl font-bold text-green-600">{resolvedIssues}</p>
              <p className="text-[10px] text-muted-foreground">{t('resolved', lang)}</p>
            </div>
            <div>
              <p className="text-xl font-bold text-primary">{resolutionRate}%</p>
              <p className="text-[10px] text-muted-foreground">{t('rate', lang)}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Recent Issues */}
      {issues.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">{t('recentIssues', lang)}</h2>
            <Link to="/track" className="text-xs text-primary font-medium">{t('viewAll', lang)}</Link>
          </div>
          <div className="space-y-2">
            {issues.slice(0, 3).map((issue) => (
              <Card key={issue.id} className="p-3 border flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  issue.status === 'resolved' ? 'bg-green-500' :
                  issue.status === 'in_progress' ? 'bg-blue-500' :
                  issue.status === 'rejected' ? 'bg-red-500' : 'bg-amber-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{issue.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">{issue.category} · {issue.location}</p>
                </div>
                <span className="text-[10px] text-muted-foreground capitalize whitespace-nowrap">
                  {issue.status?.replace('_', ' ')}
                </span>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Events */}
      {events.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">{t('upcomingEvents', lang)}</h2>
            <Link to="/events" className="text-xs text-primary font-medium">{t('viewAll', lang)}</Link>
          </div>
          <div className="space-y-2">
            {events.map((event) => (
              <Card key={event.id} className="p-3 border">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] font-semibold text-primary">
                      {new Date(event.date).toLocaleDateString('en', { month: 'short' })}
                    </span>
                    <span className="text-sm font-bold text-primary leading-none">
                      {new Date(event.date).getDate()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{event.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{event.location}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
