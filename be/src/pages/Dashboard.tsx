import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { PerformanceChart } from '@/components/dashboard/PerformanceChart';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { TopLinks } from '@/components/dashboard/TopLinks';
import { Link as LinkIcon, MousePointer, DollarSign, Share2, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLinks } from '@/hooks/useLinks';
import { useEarnings } from '@/hooks/useEarnings';
import { useScheduledPosts } from '@/hooks/useScheduledPosts';
import { usePriceAlerts } from '@/hooks/usePriceAlerts';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const { links, stats: linkStats, loading: linksLoading } = useLinks();
  const { totalEarnings, thisMonthEarnings, loading: earningsLoading } = useEarnings();
  const { posts, loading: postsLoading } = useScheduledPosts();
  const { activeAlerts, loading: alertsLoading } = usePriceAlerts();

  const loading = linksLoading || earningsLoading || postsLoading || alertsLoading;

  // Calculate expiring links (within 7 days)
  const expiringLinks = links.filter(link => {
    if (!link.expires_at) return false;
    const expiryDate = new Date(link.expires_at);
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    return expiryDate <= sevenDaysFromNow && expiryDate > new Date();
  });

  // Recent week stats
  const lastWeekLinks = links.filter(link => {
    const createdDate = new Date(link.created_at);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return createdDate >= oneWeekAgo;
  });

  if (loading) {
    return (
      <AppLayout title="Dashboard" description="Welcome back! Here's your overview.">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-10 w-10 rounded-lg mb-4" />
                  <Skeleton className="h-8 w-24 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Skeleton className="h-16 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-[350px] w-full" />
              <Skeleton className="h-[300px] w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-[200px] w-full" />
              <Skeleton className="h-[300px] w-full" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Dashboard" description="Welcome back! Here's your overview.">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Links"
            value={linkStats.total.toString()}
            icon={<LinkIcon className="h-6 w-6 text-primary" />}
            trend={{ value: lastWeekLinks.length > 0 ? 12 : 0, isPositive: true }}
            description={`${lastWeekLinks.length} new this week`}
          />
          <StatCard
            title="Total Clicks"
            value={linkStats.totalClicks.toLocaleString()}
            icon={<MousePointer className="h-6 w-6 text-info" />}
            trend={{ value: 23, isPositive: true }}
            description={`Active: ${linkStats.active} links`}
          />
          <StatCard
            title="Earnings"
            value={`₹${thisMonthEarnings.toLocaleString()}`}
            icon={<DollarSign className="h-6 w-6 text-success" />}
            trend={{ value: 18, isPositive: true }}
            description="This month"
          />
          <StatCard
            title="Posts Shared"
            value={posts.filter(p => p.status === 'posted').length.toString()}
            icon={<Share2 className="h-6 w-6 text-warning" />}
            trend={{ value: 5, isPositive: posts.length > 0 }}
            description={`${posts.filter(p => p.status === 'scheduled').length} scheduled`}
          />
        </div>

        {/* Alerts Section */}
        {expiringLinks.length > 0 && (
          <Card className="border-warning/50 bg-warning/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
                  <Bell className="h-5 w-5 text-warning" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{expiringLinks.length} links expiring soon</p>
                  <p className="text-sm text-muted-foreground">
                    Review and update them before they expire
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/links')}>
                  View All
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <PerformanceChart />
            <TopLinks />
          </div>
          <div className="space-y-6">
            <QuickActions />
            <RecentActivity />
          </div>
        </div>

        {/* Price Drop Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Active Price Alerts</CardTitle>
            <Badge variant="secondary">{activeAlerts.length} Watching</Badge>
          </CardHeader>
          <CardContent>
            {activeAlerts.length > 0 ? (
              <div className="space-y-3">
                {activeAlerts.slice(0, 4).map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-sm">Price Alert</p>
                      <p className="text-xs text-muted-foreground">
                        Target: ₹{Number(alert.target_price).toLocaleString()} • 
                        Current: ₹{alert.current_price ? Number(alert.current_price).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                    <Badge variant="secondary">Watching</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No active price alerts</p>
                <p className="text-sm">Set alerts on deals to get notified</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
