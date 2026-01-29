import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const chartData = [
  { day: 'Mon', clicks: 120, earnings: 450 },
  { day: 'Tue', clicks: 180, earnings: 620 },
  { day: 'Wed', clicks: 150, earnings: 380 },
  { day: 'Thu', clicks: 280, earnings: 890 },
  { day: 'Fri', clicks: 220, earnings: 720 },
  { day: 'Sat', clicks: 340, earnings: 1100 },
  { day: 'Sun', clicks: 290, earnings: 950 },
];

const chartConfig = {
  clicks: {
    label: 'Clicks',
    color: 'hsl(var(--chart-1))',
  },
  earnings: {
    label: 'Earnings (₹)',
    color: 'hsl(var(--chart-2))',
  },
};

export function PerformanceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Weekly Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="clicks"
                stroke="hsl(var(--chart-1))"
                fillOpacity={1}
                fill="url(#colorClicks)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="earnings"
                stroke="hsl(var(--chart-2))"
                fillOpacity={1}
                fill="url(#colorEarnings)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
