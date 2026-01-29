import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  TrendingUp,
  Heart,
  ExternalLink,
  Sparkles,
  Loader2,
  ShoppingBag,
  Tag,
  Star,
  Copy,
  Check,
  Send,
  MessageCircle,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import { useDeals } from '@/hooks/useDeals';
import { useAffiliatePrograms } from '@/hooks/useAffiliatePrograms';
import { useAI } from '@/hooks/useAI';
import { useTelegram } from '@/hooks/useTelegram';
import { Textarea } from '@/components/ui/textarea';
import { Link as RouterLink } from 'react-router-dom';

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'home', label: 'Home' },
  { value: 'beauty', label: 'Beauty' },
  { value: 'gaming', label: 'Gaming' },
];

const merchants = [
  { value: 'all', label: 'All Merchants' },
  { value: 'Amazon', label: 'Amazon' },
  { value: 'Flipkart', label: 'Flipkart' },
  { value: 'Myntra', label: 'Myntra' },
  { value: 'Ajio', label: 'Ajio' },
  { value: 'Nykaa', label: 'Nykaa' },
];

export default function Products() {
  const { deals, loading: dealsLoading, toggleFavorite, refetch: refetchDeals, deleteDeal } = useDeals();
  const { programs } = useAffiliatePrograms();
  const { generatePost, loading: aiLoading } = useAI();
  const { channels, sendMessage, broadcastToAllChannels, loading: telegramLoading } = useTelegram();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMerchant, setSelectedMerchant] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [copied, setCopied] = useState<string | null>(null);

  const [processingDealId, setProcessingDealId] = useState<string | null>(null);

  const filteredDeals = deals
    .filter(deal => {
      const matchesSearch = deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (deal.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || deal.category === selectedCategory;
      const matchesMerchant = selectedMerchant === 'all' || deal.merchant_name === selectedMerchant;
      return matchesSearch && matchesCategory && matchesMerchant;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'discount':
          return (b.discount_percent || 0) - (a.discount_percent || 0);
        case 'price-low':
          return (a.discounted_price || 0) - (b.discounted_price || 0);
        case 'price-high':
          return (b.discounted_price || 0) - (a.discounted_price || 0);
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success('Link copied!');
    setTimeout(() => setCopied(null), 2000);
  };

  const handleAutoShare = async (deal: any) => {
    if (channels.length === 0) {
      toast.error('No Telegram channels configured. Please add them in Settings.');
      return;
    }

    setProcessingDealId(deal.id);

    try {
      // Create template post directly (No AI)
      const discount = deal.discount_percent || 0;
      const finalPrice = deal.discounted_price || 0;
      const originalPrice = deal.original_price || 0;
      const link = deal.affiliate_url || deal.original_url;
      const title = deal.title;

      // HTML Template
      const post = `<b>${title}</b>\n\n` +
        `🔥 <b>Deal Alert!</b>\n` +
        (discount > 0 ? `💰 Only <b>₹${finalPrice.toLocaleString()}</b> <s>₹${originalPrice.toLocaleString()}</s> (${discount}% OFF)\n\n` : `💰 Price: <b>₹${finalPrice.toLocaleString()}</b>\n\n`) +
        `👇 Grab it now:\n` +
        `<a href="${link}">👉 CLICK HERE TO BUY</a>`;

      // Broadcast
      toast.info('Sending to Telegram channels...');
      await broadcastToAllChannels(post, 'HTML');

    } catch (error) {
      console.error('Auto share failed:', error);
      toast.error('Failed to share deal');
    } finally {
      setProcessingDealId(null);
    }
  };

  // New: Quick Post via n8n webhook (Hybrid Automation)
  const handleQuickPost = async (deal: any) => {
    setProcessingDealId(deal.id);

    try {
      toast.info('Posting via automation...');

      const response = await fetch('http://localhost:5678/webhook/deal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: deal.affiliate_url || deal.original_url
        }),
      });

      if (!response.ok) {
        throw new Error('Automation failed');
      }

      const result = await response.json();

      // Check if it was rejected as duplicate
      if (result.success === false && result.reason === 'duplicate') {
        toast.warning('⚠️ Already posted recently', {
          description: result.message
        });
        return;
      }

      toast.success('Posted to Telegram via automation! ✨');
    } catch (error) {
      console.error('Quick post failed:', error);
      toast.error('Automation unavailable. Using direct method...');
      // Fallback to direct method
      await handleAutoShare(deal);
    } finally {
      setProcessingDealId(null);
    }
  };

  return (
    <AppLayout title="My Products" description="Manage your saved deals and affiliate links">
      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search your products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Newest First</SelectItem>
                <SelectItem value="discount">Highest Discount</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => refetchDeals()} disabled={dealsLoading}>
              <RefreshCw className={`h-4 w-4 ${dealsLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button asChild className="gradient-primary">
              <RouterLink to="/studio">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </RouterLink>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{filteredDeals.length}</p>
                <p className="text-xs text-muted-foreground">Saved Products</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-success" />
              <div>
                <p className="text-2xl font-bold">
                  {Math.max(...filteredDeals.map(p => p.discount_percent || 0), 0)}%
                </p>
                <p className="text-xs text-muted-foreground">Max Discount</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-warning" />
              <div>
                <p className="text-2xl font-bold">{programs.filter(p => p.is_active).length}</p>
                <p className="text-xs text-muted-foreground">Active Programs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{channels.length}</p>
                <p className="text-xs text-muted-foreground">Telegram Channels</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Grid */}
      {dealsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredDeals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No products found</h3>
            <p className="text-muted-foreground mb-4">You haven't added any products yet.</p>
            <Button asChild>
              <RouterLink to="/studio">Go to Content Studio</RouterLink>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDeals.map((deal) => (
            <Card key={deal.id} className="group hover:shadow-lg transition-shadow overflow-hidden">
              <div
                className="relative cursor-pointer"
                onClick={() => window.open(deal.original_url, '_blank')}
                title="Click to view product"
              >
                <img
                  src={deal.image_url || 'https://placehold.co/400x300?text=No+Image'}
                  alt={deal.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {(deal.discount_percent || 0) > 0 && (
                  <Badge className="absolute top-2 left-2 bg-destructive">
                    {deal.discount_percent}% OFF
                  </Badge>
                )}
                {deal.merchant_name && (
                  <Badge variant="secondary" className="absolute top-2 right-2">
                    {deal.merchant_name}
                  </Badge>
                )}
              </div>
              <CardContent className="p-4">
                <h3
                  className="font-semibold text-sm line-clamp-2 mb-2 h-10 cursor-pointer hover:text-primary transition-colors"
                  onClick={() => window.open(deal.original_url, '_blank')}
                  title="Click to view product"
                >
                  {deal.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3 h-8">
                  {deal.description}
                </p>

                {/* Pricing */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg font-bold text-primary">
                    ₹{(deal.discounted_price || 0).toLocaleString()}
                  </span>
                  {(deal.original_price || 0) > (deal.discounted_price || 0) && (
                    <span className="text-sm text-muted-foreground line-through">
                      ₹{(deal.original_price || 0).toLocaleString()}
                    </span>
                  )}
                </div>


                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleQuickPost(deal)}
                    disabled={channels.length === 0 || processingDealId === deal.id}
                    title={channels.length === 0 ? "No Telegram channels configured" : "Quick Post (Automated)"}
                  >
                    {processingDealId === deal.id ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <Send className="h-3 w-3 mr-1" />
                    )}
                    {processingDealId === deal.id ? 'Posting...' : 'Quick Post'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleFavorite(deal.id)}
                    title={deal.is_favorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Heart className={`h-3 w-3 ${deal.is_favorite ? 'fill-destructive text-destructive' : ''}`} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(deal.affiliate_url || deal.original_url, deal.id)}
                    title="Copy affiliate link"
                  >
                    {copied === deal.id ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(deal.original_url, '_blank')}
                    title="View product page"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
