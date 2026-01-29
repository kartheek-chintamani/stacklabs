import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Rocket, Search, Calculator } from 'lucide-react';

const actions = [
  {
    title: 'Add Link',
    description: 'Create a new affiliate link',
    icon: PlusCircle,
    href: '/links?action=new',
    variant: 'default' as const,
  },
  {
    title: 'Discover Deals',
    description: 'Find trending offers',
    icon: Search,
    href: '/studio',
    variant: 'secondary' as const,
  },
  {
    title: 'Quick Share',
    description: 'Post to platforms',
    icon: Rocket,
    href: '/sharing',
    variant: 'secondary' as const,
  },
  {
    title: 'Calculator',
    description: 'Estimate earnings',
    icon: Calculator,
    href: '/earnings?tab=calculator',
    variant: 'secondary' as const,
  },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Button
            key={action.title}
            variant={action.variant}
            className="h-auto flex-col items-start p-4 text-left"
            asChild
          >
            <Link to={action.href}>
              <action.icon className="h-5 w-5 mb-2" />
              <span className="font-medium">{action.title}</span>
              <span className="text-xs text-muted-foreground mt-1">
                {action.description}
              </span>
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
