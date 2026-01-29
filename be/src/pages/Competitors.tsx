import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Plus, TrendingUp, Eye, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface Competitor {
  id: string;
  name: string;
  platform: string;
  followers: number;
  avgEngagement: number;
  recentDeals: number;
  topCategory: string;
}

const mockCompetitors: Competitor[] = [
  {
    id: '1',
    name: 'TechDealsIndia',
    platform: 'Telegram',
    followers: 125000,
    avgEngagement: 8.5,
    recentDeals: 45,
    topCategory: 'Electronics',
  },
  {
    id: '2',
    name: 'BestOffers24x7',
    platform: 'Telegram',
    followers: 89000,
    avgEngagement: 6.2,
    recentDeals: 38,
    topCategory: 'Fashion',
  },
  {
    id: '3',
    name: 'DealHunterX',
    platform: 'Twitter',
    followers: 45000,
    avgEngagement: 4.8,
    recentDeals: 28,
    topCategory: 'Electronics',
  },
  {
    id: '4',
    name: 'SavingsGuru',
    platform: 'Discord',
    followers: 32000,
    avgEngagement: 7.1,
    recentDeals: 22,
    topCategory: 'Travel',
  },
];

const trendingDeals = [
  { title: 'iPhone 15 Pro Max', mentions: 45, trend: 'up' },
  { title: 'Samsung S24 Ultra', mentions: 38, trend: 'up' },
  { title: 'OnePlus 12 5G', mentions: 32, trend: 'stable' },
  { title: 'MacBook Air M3', mentions: 28, trend: 'up' },
  { title: 'Sony WH-1000XM5', mentions: 25, trend: 'down' },
];

const gapAnalysis = [
  { deal: 'Dyson V15 Vacuum', competitors: 4, yourStatus: 'missing' },
  { deal: 'Apple Watch Ultra 2', competitors: 5, yourStatus: 'missing' },
  { deal: 'LG C3 OLED TV', competitors: 3, yourStatus: 'posted' },
  { deal: 'Bose QC45', competitors: 4, yourStatus: 'missing' },
  { deal: 'GoPro Hero 12', competitors: 2, yourStatus: 'posted' },
];

export default function Competitors() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <AppLayout title="Competitor Analysis" description="Track competitor activity">
      <div className="space-y-6">
        {/* Search & Add */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search competitors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button className="gradient-primary">
            <Plus className="h-4 w-4 mr-2" />
            Track Competitor
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Tracked Competitors</p>
              <p className="text-2xl font-bold">{mockCompetitors.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Trending Deals</p>
              <p className="text-2xl font-bold">{trendingDeals.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Deals You're Missing</p>
              <p className="text-2xl font-bold text-warning">
                {gapAnalysis.filter((g) => g.yourStatus === 'missing').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Market Coverage</p>
              <p className="text-2xl font-bold text-success">68%</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Competitor List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Tracked Competitors</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Competitor</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead className="text-right">Followers</TableHead>
                    <TableHead className="text-right">Engagement</TableHead>
                    <TableHead className="text-right">Recent Deals</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockCompetitors.map((competitor) => (
                    <TableRow key={competitor.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{competitor.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Top: {competitor.topCategory}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{competitor.platform}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {(competitor.followers / 1000).toFixed(1)}K
                      </TableCell>
                      <TableCell className="text-right">
                        {competitor.avgEngagement}%
                      </TableCell>
                      <TableCell className="text-right">{competitor.recentDeals}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Trending Deals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                Trending Across Channels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trendingDeals.map((deal, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-muted-foreground">{i + 1}</span>
                      <span className="font-medium text-sm">{deal.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {deal.mentions} mentions
                      </span>
                      {deal.trend === 'up' && (
                        <Badge className="bg-success/10 text-success">↑</Badge>
                      )}
                      {deal.trend === 'down' && (
                        <Badge className="bg-destructive/10 text-destructive">↓</Badge>
                      )}
                      {deal.trend === 'stable' && (
                        <Badge variant="secondary">→</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gap Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Gap Analysis - Deals You're Missing</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Deal</TableHead>
                  <TableHead className="text-center">Competitors Sharing</TableHead>
                  <TableHead className="text-center">Your Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gapAnalysis.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{item.deal}</TableCell>
                    <TableCell className="text-center">{item.competitors}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="secondary"
                        className={
                          item.yourStatus === 'missing'
                            ? 'bg-warning/10 text-warning'
                            : 'bg-success/10 text-success'
                        }
                      >
                        {item.yourStatus === 'missing' ? 'Not Posted' : 'Posted'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.yourStatus === 'missing' && (
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Find Deal
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
