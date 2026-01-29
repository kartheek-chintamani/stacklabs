import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, Calculator, Download, Plus, Wallet, CreditCard, PiggyBank } from 'lucide-react';
import { useEarnings } from '@/hooks/useEarnings';
import { Skeleton } from '@/components/ui/skeleton';

const chartConfig = {
  earnings: {
    label: 'Earnings',
    color: 'hsl(var(--chart-1))',
  },
};

const networkColors: Record<string, string> = {
  'Cuelinks': 'bg-primary',
  'Amazon Associates': 'bg-warning',
  'Flipkart Affiliate': 'bg-info',
  'vCommission': 'bg-success',
};

export default function Earnings() {
  const { 
    earnings, 
    loading, 
    totalEarnings, 
    pendingEarnings, 
    thisMonthEarnings, 
    networkBreakdown,
    addEarning 
  } = useEarnings();

  const [commissionRate, setCommissionRate] = useState('5');
  const [productPrice, setProductPrice] = useState('10000');
  const [expectedSales, setExpectedSales] = useState('10');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [newEarning, setNewEarning] = useState({
    network_name: '',
    amount: '',
    status: 'pending',
  });

  const calculateEarnings = () => {
    const price = parseFloat(productPrice) || 0;
    const rate = parseFloat(commissionRate) || 0;
    const sales = parseFloat(expectedSales) || 0;
    return ((price * rate * sales) / 100).toFixed(2);
  };

  const handleAddEarning = async () => {
    if (!newEarning.network_name || !newEarning.amount) {
      return;
    }
    
    await addEarning({
      network_name: newEarning.network_name,
      amount: parseFloat(newEarning.amount),
      status: newEarning.status,
    });
    
    setIsDialogOpen(false);
    setNewEarning({ network_name: '', amount: '', status: 'pending' });
  };

  // Create monthly chart data from earnings
  const monthlyData = (() => {
    const months: Record<string, number> = {};
    earnings.forEach(e => {
      const month = new Date(e.earned_at).toLocaleDateString('en-US', { month: 'short' });
      months[month] = (months[month] || 0) + Number(e.amount);
    });
    
    const sortedMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return sortedMonths
      .filter(m => months[m])
      .map(month => ({ month, earnings: months[month] }));
  })();

  const avgMonthlyEarning = monthlyData.length > 0 
    ? Math.round(totalEarnings / monthlyData.length) 
    : 0;

  const networkData = Object.entries(networkBreakdown).map(([network, data]) => ({
    network,
    ...data,
    color: networkColors[network] || 'bg-muted',
  }));

  if (loading) {
    return (
      <AppLayout title="Earnings" description="Track your affiliate earnings">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-12 w-12 rounded-xl mb-4" />
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Earnings" description="Track your affiliate earnings">
      <Tabs defaultValue="overview" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="networks">Networks</TabsTrigger>
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Earning
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record New Earning</DialogTitle>
                <DialogDescription>
                  Manually add an earning from your affiliate networks
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Network</Label>
                  <Select
                    value={newEarning.network_name}
                    onValueChange={(v) => setNewEarning(prev => ({ ...prev, network_name: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select network" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cuelinks">Cuelinks</SelectItem>
                      <SelectItem value="Amazon Associates">Amazon Associates</SelectItem>
                      <SelectItem value="Flipkart Affiliate">Flipkart Affiliate</SelectItem>
                      <SelectItem value="vCommission">vCommission</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Amount (₹)</Label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={newEarning.amount}
                    onChange={(e) => setNewEarning(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={newEarning.status}
                    onValueChange={(v) => setNewEarning(prev => ({ ...prev, status: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="gradient-primary" onClick={handleAddEarning}>
                  Add Earning
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="stat-glow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl gradient-primary">
                    <DollarSign className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Earnings</p>
                    <p className="text-2xl font-bold">₹{totalEarnings.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-warning/10">
                    <Wallet className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold">₹{pendingEarnings.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-success/10">
                    <TrendingUp className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">This Month</p>
                    <p className="text-2xl font-bold">₹{thisMonthEarnings.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-info/10">
                    <PiggyBank className="h-6 w-6 text-info" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg/Month</p>
                    <p className="text-2xl font-bold">₹{avgMonthlyEarning.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Earnings Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData}>
                      <defs>
                        <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="earnings"
                        stroke="hsl(var(--chart-1))"
                        fillOpacity={1}
                        fill="url(#colorEarnings)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No earnings data yet</p>
                    <p className="text-sm">Add your first earning to see charts</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Network Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Earnings by Network</CardTitle>
            </CardHeader>
            <CardContent>
              {networkData.length > 0 ? (
                <div className="space-y-4">
                  {networkData.map((network) => (
                    <div key={network.network} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${network.color}`} />
                          <span className="font-medium">{network.network}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold">₹{network.total.toLocaleString()}</span>
                          {network.pending > 0 && (
                            <span className="text-sm text-muted-foreground ml-2">
                              (₹{network.pending.toLocaleString()} pending)
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${network.color} rounded-full`}
                          style={{ width: `${(network.total / totalEarnings) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No network data yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="networks" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['Cuelinks', 'Amazon Associates', 'Flipkart Affiliate', 'vCommission'].map((network) => {
              const data = networkBreakdown[network] || { total: 0, pending: 0 };
              return (
                <Card key={network}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${networkColors[network]}`}>
                          <CreditCard className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{network}</h3>
                          <Badge variant="secondary" className={data.total > 0 ? "bg-success/10 text-success" : ""}>
                            {data.total > 0 ? 'Active' : 'Not Connected'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Earned</p>
                        <p className="text-xl font-bold">₹{data.total.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Pending</p>
                        <p className="text-xl font-bold text-warning">
                          ₹{data.pending.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="calculator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Commission Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Product Price (₹)</Label>
                  <Input
                    type="number"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    placeholder="Enter product price"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Commission Rate (%)</Label>
                  <Input
                    type="number"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    placeholder="Enter commission rate"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expected Sales</Label>
                  <Input
                    type="number"
                    value={expectedSales}
                    onChange={(e) => setExpectedSales(e.target.value)}
                    placeholder="Enter expected sales"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="stat-glow">
              <CardHeader>
                <CardTitle>Estimated Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-5xl font-bold gradient-text">
                    ₹{parseFloat(calculateEarnings()).toLocaleString()}
                  </p>
                  <p className="text-muted-foreground mt-2">
                    Based on {expectedSales} sales at {commissionRate}% commission
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold">
                      ₹{((parseFloat(calculateEarnings()) || 0) / 30).toFixed(0)}
                    </p>
                    <p className="text-xs text-muted-foreground">Per Day</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold">
                      ₹{((parseFloat(calculateEarnings()) || 0) / 4).toFixed(0)}
                    </p>
                    <p className="text-xs text-muted-foreground">Per Week</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold">
                      ₹{((parseFloat(calculateEarnings()) || 0) * 12).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Per Year</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Earning History</h2>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              {earnings.length > 0 ? (
                <div className="divide-y">
                  {earnings.map((earning) => (
                    <div
                      key={earning.id}
                      className="flex items-center justify-between p-4 hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-muted">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{earning.network_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(earning.earned_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge
                          variant="secondary"
                          className={
                            earning.status === 'paid'
                              ? 'bg-success/10 text-success'
                              : earning.status === 'confirmed'
                              ? 'bg-info/10 text-info'
                              : 'bg-warning/10 text-warning'
                          }
                        >
                          {earning.status}
                        </Badge>
                        <p className="font-bold">₹{Number(earning.amount).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No earnings recorded yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
