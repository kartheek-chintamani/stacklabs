import { useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLinkAnalytics } from '@/hooks/useLinkAnalytics';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Loader2, ArrowLeft, Globe, Smartphone, MousePointer, Users, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function LinkAnalyticsPage() {
    const { id } = useParams<{ id: string }>();
    const { data, loading } = useLinkAnalytics(id || null);

    if (!id) return <div>Invalid Link ID</div>;

    return (
        <AppLayout title="Link Analytics" description="Detailed performance metrics for your short link">
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link to="/links">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h2 className="text-xl font-semibold">Analytics Report</h2>
                </div>

                {loading ? (
                    <div className="flex h-[400px] items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : !data ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No data available for this link.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Key Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MousePointer className="h-4 w-4 text-primary" />
                                        <span className="text-sm font-medium text-muted-foreground">Total Clicks</span>
                                    </div>
                                    <p className="text-2xl font-bold">{data.total_clicks}</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Users className="h-4 w-4 text-green-500" />
                                        <span className="text-sm font-medium text-muted-foreground">Unique Visitors</span>
                                    </div>
                                    <p className="text-2xl font-bold">{data.unique_clicks}</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Globe className="h-4 w-4 text-blue-500" />
                                        <span className="text-sm font-medium text-muted-foreground">Top Country</span>
                                    </div>
                                    <p className="text-2xl font-bold">{data.top_countries[0]?.country || 'N/A'}</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Smartphone className="h-4 w-4 text-purple-500" />
                                        <span className="text-sm font-medium text-muted-foreground">Top Device</span>
                                    </div>
                                    <p className="text-2xl font-bold capitalize">{data.top_devices[0]?.device_type || 'N/A'}</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Charts Row 1 */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="col-span-1 lg:col-span-2">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Clicks Over Time
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="h-[300px]">
                                    {data.clicks_over_time.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={data.clicks_over_time}>
                                                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                                                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                                                />
                                                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-muted-foreground">
                                            No click history yet
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Charts Row 2 */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Referrers */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Top Referrers</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {data.top_referrers.length > 0 ? data.top_referrers.map((item, i) => (
                                            <div key={i} className="flex items-center justify-between">
                                                <span className="text-sm truncate max-w-[180px]" title={item.referrer}>
                                                    {item.referrer}
                                                </span>
                                                <span className="font-mono text-sm">{item.count}</span>
                                            </div>
                                        )) : (
                                            <p className="text-sm text-muted-foreground">No referrer data</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Countries */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Locations</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {data.top_countries.length > 0 ? data.top_countries.map((item, i) => (
                                            <div key={i} className="flex items-center justify-between">
                                                <span className="text-sm">{item.country}</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-blue-500"
                                                            style={{ width: `${(item.count / data.total_clicks) * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="font-mono text-sm">{item.count}</span>
                                                </div>
                                            </div>
                                        )) : (
                                            <p className="text-sm text-muted-foreground">No location data</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Devices Map */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Devices</CardTitle>
                                </CardHeader>
                                <CardContent className="h-[250px] relative">
                                    {data.top_devices.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={data.top_devices}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="count"
                                                >
                                                    {data.top_devices.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-muted-foreground">
                                            No device data
                                        </div>
                                    )}

                                    {/* Legend Overlay */}
                                    <div className="absolute bottom-0 w-full flex justify-center gap-4 text-xs text-muted-foreground">
                                        {data.top_devices.slice(0, 3).map((d, i) => (
                                            <div key={i} className="flex items-center gap-1">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                                <span className="capitalize">{d.device_type}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
