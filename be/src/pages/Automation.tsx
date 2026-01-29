import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Activity,
    CheckCircle2,
    XCircle,
    Clock,
    TrendingUp,
    Zap,
    PlayCircle,
    RefreshCw,
    AlertCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function Automation() {
    const [logs, setLogs] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0,
        dealsPosted: 0,
        lastRun: null as string | null,
    });
    const [loading, setLoading] = useState(true);
    const [triggering, setTriggering] = useState(false);

    useEffect(() => {
        loadAutomationData();
    }, []);

    const loadAutomationData = async () => {
        try {
            setLoading(true);

            // Fetch automation logs
            const { data: logsData, error: logsError } = await supabase
                .from('automation_logs')
                .select('*')
                .order('run_at', { ascending: false })
                .limit(10);

            if (logsError) throw logsError;

            setLogs(logsData || []);

            // Calculate stats
            const { data: allLogs, error: statsError } = await supabase
                .from('automation_logs')
                .select('status, deals_posted, run_at');

            if (statsError) throw statsError;

            if (allLogs) {
                setStats({
                    totalRuns: allLogs.length,
                    successfulRuns: allLogs.filter(l => l.status === 'success').length,
                    failedRuns: allLogs.filter(l => l.status === 'failed').length,
                    dealsPosted: allLogs.reduce((sum, l) => sum + (l.deals_posted || 0), 0),
                    lastRun: allLogs[0]?.run_at || null,
                });
            }
        } catch (error) {
            console.error('Error loading automation data:', error);
            toast.error('Failed to load automation data');
        } finally {
            setLoading(false);
        }
    };

    const handleManualTrigger = async () => {
        setTriggering(true);
        try {
            // Trigger the n8n webhook manually
            const response = await fetch('http://localhost:5678/webhook/deal-mock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: 'https://www.amazon.in/dp/B0DFXV72S1', // Test URL
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to trigger automation');
            }

            toast.success('Automation triggered successfully!');
            setTimeout(loadAutomationData, 2000); // Refresh after 2 seconds
        } catch (error) {
            console.error('Manual trigger failed:', error);
            toast.error('Failed to trigger automation. Make sure n8n is running.');
        } finally {
            setTriggering(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success':
                return <CheckCircle2 className="h-5 w-5 text-green-500" />;
            case 'failed':
                return <XCircle className="h-5 w-5 text-red-500" />;
            case 'running':
                return <Clock className="h-5 w-5 text-blue-500 animate-pulse" />;
            default:
                return <AlertCircle className="h-5 w-5 text-yellow-500" />;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        return date.toLocaleString();
    };

    const successRate = stats.totalRuns > 0
        ? Math.round((stats.successfulRuns / stats.totalRuns) * 100)
        : 0;

    return (
        <AppLayout
            title="Automation"
            description="Monitor and control your automated deal posting system"
        >
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalRuns}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.lastRun ? `Last: ${formatDate(stats.lastRun)}` : 'No runs yet'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{successRate}%</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.successfulRuns} / {stats.totalRuns} successful
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Deals Posted</CardTitle>
                        <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.dealsPosted}</div>
                        <p className="text-xs text-muted-foreground">
                            Via automation
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Status</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Active</div>
                        <p className="text-xs text-muted-foreground">
                            n8n running locally
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Manual Controls */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Manual Controls</CardTitle>
                    <CardDescription>
                        Trigger automation workflows manually or refresh data
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex gap-3">
                    <Button
                        onClick={handleManualTrigger}
                        disabled={triggering}
                    >
                        {triggering ? (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                Triggering...
                            </>
                        ) : (
                            <>
                                <PlayCircle className="mr-2 h-4 w-4" />
                                Test Automation
                            </>
                        )}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={loadAutomationData}
                        disabled={loading}
                    >
                        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh Data
                    </Button>
                </CardContent>
            </Card>

            {/* Recent Runs */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Automation Runs</CardTitle>
                    <CardDescription>
                        Last 10 workflow executions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Activity className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p>No automation runs yet</p>
                            <p className="text-sm">Click "Test Automation" to create your first run</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {logs.map((log) => (
                                <div
                                    key={log.id}
                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        {getStatusIcon(log.status)}
                                        <div>
                                            <p className="font-medium">{log.workflow_name || 'Unknown Workflow'}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatDate(log.run_at)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right text-sm">
                                            <p className="font-medium">{log.deals_posted || 0} posted</p>
                                            <p className="text-muted-foreground">
                                                {log.deals_found || 0} found
                                            </p>
                                        </div>
                                        <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                                            {log.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </AppLayout>
    );
}
