import { useContentStudio } from '@/store/useContentStudio';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Copy, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { STORE_COLORS } from '@/lib/urlParser';

export default function HistoryRail() {
    const { history, removeFromHistory } = useContentStudio();

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Link copied!');
    };

    if (history.length === 0) return null;

    return (
        <div className="mt-8">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Recent Generations</h3>
            <ScrollArea className="w-full whitespace-nowrap rounded-md border p-4">
                <div className="flex w-max space-x-4">
                    {history.map((item) => (
                        <div
                            key={item.id}
                            className="w-[280px] p-4 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all space-y-3"
                            style={{ borderTop: `4px solid ${STORE_COLORS[item.store]}` }}
                        >
                            <div className="flex items-start justify-between">
                                <div className="overflow-hidden">
                                    <h4 className="font-semibold truncate">{item.title || item.originalUrl}</h4>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(item.createdAt, { addSuffix: true })}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 -mr-2 -mt-2 text-muted-foreground hover:text-destructive"
                                    onClick={() => removeFromHistory(item.id)}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="flex-1 text-xs"
                                    onClick={() => handleCopy(item.affiliateUrl)}
                                >
                                    <Copy className="h-3 w-3 mr-1" /> Copy Link
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => window.open(item.affiliateUrl, '_blank')}
                                >
                                    <ExternalLink className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
}
