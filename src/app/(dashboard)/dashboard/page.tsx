import type { Metadata } from 'next';
import { Users, CreditCard, Building2, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { FeatureGate } from '@/components/shared/FeatureGate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = { title: 'Dashboard' };

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's what's happening with your organization."
      />

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value="24"
          description="from last month"
          trend={12}
          icon={Users}
        />
        <StatCard
          title="Active Projects"
          value="6"
          description="2 completed this week"
          trend={-5}
          icon={TrendingUp}
        />
        <StatCard
          title="Organizations"
          value="3"
          description="across all workspaces"
          icon={Building2}
        />
        <StatCard
          title="Monthly Spend"
          value="$79"
          description="Pro plan · renews in 12 days"
          icon={CreditCard}
        />
      </div>

      {/* Feature-gated analytics section */}
      <FeatureGate feature="analytics" message="Analytics are available on the Starter plan and above.">
        <Card>
          <CardHeader>
            <CardTitle>Analytics Overview</CardTitle>
            <CardDescription>Activity over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-center justify-center rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Chart placeholder — connect your analytics provider</p>
            </div>
          </CardContent>
        </Card>
      </FeatureGate>

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest actions in your organization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { text: 'Jane Doe joined the organization', time: '2 minutes ago' },
              { text: 'Project "Alpha" was updated', time: '1 hour ago' },
              { text: 'Invoice #1042 was paid', time: '3 hours ago' },
              { text: 'New API key generated', time: 'Yesterday' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                <p className="text-sm">{item.text}</p>
                <span className="text-xs text-muted-foreground shrink-0 ml-4">{item.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
