import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Users, Heart, TrendingUp, Clock, Smartphone, Monitor, Globe } from 'lucide-react';

const categoryEngagement = [
  { category: 'Electronics', engagement: 85, clicks: 4500 },
  { category: 'Fashion', engagement: 72, clicks: 2800 },
  { category: 'Travel', engagement: 68, clicks: 1900 },
  { category: 'Food', engagement: 65, clicks: 1500 },
  { category: 'Gaming', engagement: 58, clicks: 1200 },
];

const contentPerformance = [
  { type: 'Image Posts', ctr: 4.2, color: 'hsl(var(--chart-1))' },
  { type: 'Text Only', ctr: 2.8, color: 'hsl(var(--chart-2))' },
  { type: 'Video Links', ctr: 5.1, color: 'hsl(var(--chart-3))' },
  { type: 'Carousel', ctr: 3.9, color: 'hsl(var(--chart-4))' },
];

const engagementByTime = [
  { day: 'Mon', morning: 120, afternoon: 180, evening: 240 },
  { day: 'Tue', morning: 150, afternoon: 200, evening: 280 },
  { day: 'Wed', morning: 130, afternoon: 170, evening: 220 },
  { day: 'Thu', morning: 180, afternoon: 230, evening: 310 },
  { day: 'Fri', morning: 160, afternoon: 210, evening: 290 },
  { day: 'Sat', morning: 220, afternoon: 280, evening: 350 },
  { day: 'Sun', morning: 200, afternoon: 260, evening: 320 },
];

const chartConfig = {
  morning: {
    label: 'Morning',
    color: 'hsl(var(--chart-1))',
  },
  afternoon: {
    label: 'Afternoon',
    color: 'hsl(var(--chart-2))',
  },
  evening: {
    label: 'Evening',
    color: 'hsl(var(--chart-3))',
  },
};

const audienceStats = [
  { label: 'Total Audience', value: '24.5K', icon: Users, change: '+12%' },
  { label: 'Engagement Rate', value: '4.8%', icon: Heart, change: '+0.5%' },
  { label: 'Avg. Click Rate', value: '3.2%', icon: TrendingUp, change: '+0.8%' },
  { label: 'Best Time', value: '9 PM', icon: Clock, change: 'Peak' },
];

export default function Audience() {
  return (
    <AppLayout title="Audience Insights" description="Understand your audience better">
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {audienceStats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <Badge variant="secondary" className="bg-success/10 text-success">
                        {stat.change}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Engagement */}
          <Card>
            <CardHeader>
              <CardTitle>Engagement by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryEngagement.map((item) => (
                  <div key={item.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.category}</span>
                      <span className="text-sm text-muted-foreground">
                        {item.clicks.toLocaleString()} clicks • {item.engagement}% engaged
                      </span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${item.engagement}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Content Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Content Type Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={contentPerformance}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      dataKey="ctr"
                      label={({ type, ctr }) => `${type}: ${ctr}%`}
                    >
                      {contentPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {contentPerformance.map((item) => (
                  <div key={item.type} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.type}</span>
                    <Badge variant="secondary">{item.ctr}% CTR</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Engagement by Time */}
        <Card>
          <CardHeader>
            <CardTitle>Engagement by Day & Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={engagementByTime}>
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="morning" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="afternoon" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="evening" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-chart-1" style={{ backgroundColor: 'hsl(var(--chart-1))' }} />
                <span className="text-sm">Morning (6AM-12PM)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-2))' }} />
                <span className="text-sm">Afternoon (12PM-6PM)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-3))' }} />
                <span className="text-sm">Evening (6PM-12AM)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demographic Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Device Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { device: 'Mobile', percentage: 65, icon: Smartphone },
                  { device: 'Desktop', percentage: 28, icon: Monitor },
                  { device: 'Tablet', percentage: 7, icon: Monitor },
                ].map((item) => (
                  <div key={item.device} className="flex items-center gap-4">
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">{item.device}</span>
                        <span className="text-sm font-medium">{item.percentage}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Top Locations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { city: 'Mumbai', percentage: 22 },
                  { city: 'Delhi NCR', percentage: 18 },
                  { city: 'Bangalore', percentage: 15 },
                  { city: 'Hyderabad', percentage: 12 },
                  { city: 'Chennai', percentage: 10 },
                ].map((item, i) => (
                  <div key={item.city} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">{i + 1}</span>
                      <span className="font-medium">{item.city}</span>
                    </div>
                    <Badge variant="secondary">{item.percentage}%</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                  <p className="text-sm font-medium text-success">🚀 Best Performer</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Video links get 5.1% CTR - 82% higher than text posts
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-info/10 border border-info/20">
                  <p className="text-sm font-medium text-info">⏰ Optimal Timing</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Saturdays 6-9 PM show highest engagement
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                  <p className="text-sm font-medium text-warning">💡 Recommendation</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Focus on Electronics category - 85% engagement
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
