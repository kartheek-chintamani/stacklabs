import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link as LinkIcon, MousePointer, DollarSign, Share2 } from 'lucide-react';

interface Activity {
  id: string;
  type: 'link' | 'click' | 'earning' | 'share';
  title: string;
  description: string;
  time: string;
}

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'share',
    title: 'Posted to Telegram',
    description: 'iPhone 15 deal shared to Tech Deals',
    time: '2 min ago',
  },
  {
    id: '2',
    type: 'click',
    title: '15 new clicks',
    description: 'Amazon Electronics Sale link',
    time: '5 min ago',
  },
  {
    id: '3',
    type: 'earning',
    title: 'Commission earned',
    description: '₹245 from Flipkart Big Sale',
    time: '1 hour ago',
  },
  {
    id: '4',
    type: 'link',
    title: 'New link created',
    description: 'Samsung Galaxy S24 offer',
    time: '2 hours ago',
  },
];

const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'link':
      return <LinkIcon className="h-4 w-4 text-primary" />;
    case 'click':
      return <MousePointer className="h-4 w-4 text-info" />;
    case 'earning':
      return <DollarSign className="h-4 w-4 text-success" />;
    case 'share':
      return <Share2 className="h-4 w-4 text-warning" />;
  }
};

const getActivityBadge = (type: Activity['type']) => {
  switch (type) {
    case 'link':
      return <Badge variant="secondary">Link</Badge>;
    case 'click':
      return <Badge className="bg-info/10 text-info hover:bg-info/20">Click</Badge>;
    case 'earning':
      return <Badge className="bg-success/10 text-success hover:bg-success/20">Earning</Badge>;
    case 'share':
      return <Badge className="bg-warning/10 text-warning hover:bg-warning/20">Share</Badge>;
  }
};

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockActivities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{activity.title}</p>
                {getActivityBadge(activity.type)}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {activity.description}
              </p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {activity.time}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
