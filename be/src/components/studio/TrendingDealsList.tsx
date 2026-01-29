import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDeals } from '@/hooks/useDeals';
import { useContentStudio } from '@/store/useContentStudio';
import { ExternalLink, Zap, TrendingUp, Clock, Percent, Loader2, Search } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Deal = Tables<'deals'>;

const categoryColors: Record<string, string> = {
    electronics: 'bg-primary/10 text-primary',
    fashion: 'bg-pink-500/10 text-pink-500',
    travel: 'bg-info/10 text-info',
    food: 'bg-warning/10 text-warning',
    gaming: 'bg-success/10 text-success',
    beauty: 'bg-purple-500/10 text-purple-500',
    home: 'bg-orange-500/10 text-orange-500',
    other: 'bg-muted text-muted-foreground',
};

export default function TrendingDealsList() {
    const { deals, loading } = useDeals();
    const { setUrl } = useContentStudio();

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (deals.length === 0) {
        return (
            <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed">
                <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-sm font-medium">No trending deals found</h3>
                <p className="text-xs text-muted-foreground mt-1">Check back later for new offers</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Trending Deals</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {deals.map((deal) => (
                    <DealCard key={deal.id} deal={deal} onUse={() => setUrl(deal.original_url)} />
                ))}
            </div>
        </div>
    );
}

function DealCard({ deal, onUse }: { deal: Deal; onUse: () => void }) {
    const categoryColor = categoryColors[deal.category || 'other'] || categoryColors.other;

    return (
        <Card className="group overflow-hidden hover:shadow-md transition-all border-border/50">
            <div className="relative aspect-video overflow-hidden bg-muted">
                {deal.image_url ? (
                    <img
                        src={deal.image_url}
                        alt={deal.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary/30">
                        <TrendingUp className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                )}
                <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="backdrop-blur-md bg-background/80">
                        {deal.merchant_name || 'Unknown'}
                    </Badge>
                </div>
                {deal.discount_percent && (
                    <div className="absolute bottom-2 left-2">
                        <Badge className="bg-green-500 hover:bg-green-600 text-white border-0">
                            {deal.discount_percent}% OFF
                        </Badge>
                    </div>
                )}
            </div>

            <CardContent className="p-4 space-y-3">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <Badge variant="outline" className={`text-[10px] h-5 px-1.5 border-0 ${categoryColor}`}>
                            {deal.category}
                        </Badge>
                    </div>
                    <h3 className="font-semibold text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                        {deal.title}
                    </h3>
                </div>

                <div className="flex items-baseline gap-2">
                    {deal.discounted_price && (
                        <span className="text-lg font-bold">₹{deal.discounted_price.toLocaleString()}</span>
                    )}
                    {deal.original_price && deal.original_price !== deal.discounted_price && (
                        <span className="text-xs text-muted-foreground line-through decoration-muted-foreground/50">
                            ₹{deal.original_price.toLocaleString()}
                        </span>
                    )}
                </div>

                <div className="pt-2 flex gap-2">
                    <Button onClick={onUse} size="sm" className="flex-1 gradient-primary h-8 text-xs">
                        <Zap className="h-3 w-3 mr-1.5" />
                        Create Content
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                        <a href={deal.original_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
