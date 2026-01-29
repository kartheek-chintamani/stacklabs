import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, TrendingUp } from 'lucide-react';

interface TopLink {
  id: string;
  title: string;
  clicks: number;
  earnings: number;
  category: string;
}

const mockTopLinks: TopLink[] = [
  { id: '1', title: 'iPhone 15 Pro Max Deal', clicks: 1234, earnings: 5670, category: 'electronics' },
  { id: '2', title: 'Amazon Great Sale', clicks: 987, earnings: 3450, category: 'electronics' },
  { id: '3', title: 'Flipkart Fashion Week', clicks: 756, earnings: 2890, category: 'fashion' },
  { id: '4', title: 'Booking.com Hotels', clicks: 543, earnings: 4560, category: 'travel' },
  { id: '5', title: 'Swiggy Food Offers', clicks: 432, earnings: 1230, category: 'food' },
];

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    electronics: 'bg-primary/10 text-primary',
    fashion: 'bg-pink-500/10 text-pink-500',
    travel: 'bg-info/10 text-info',
    food: 'bg-warning/10 text-warning',
    gaming: 'bg-success/10 text-success',
  };
  return colors[category] || 'bg-muted text-muted-foreground';
};

export function TopLinks() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Top Performing Links</CardTitle>
        <TrendingUp className="h-5 w-5 text-success" />
      </CardHeader>
      <CardContent className="space-y-3">
        {mockTopLinks.map((link, index) => (
          <div
            key={link.id}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-bold">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate">{link.title}</p>
                <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className={getCategoryColor(link.category)}>
                  {link.category}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {link.clicks.toLocaleString()} clicks
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-success">₹{link.earnings.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
