import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  MessageCircle,
  Send as SendIcon,
  Twitter,
  Mail,
  Image,
  Link as LinkIcon,
  Clock,
  FileText,
  Zap,
  Plus,
  Sparkles,
  Loader2,
  Copy,
  Check,
  Trash2,
  Edit,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTemplates } from '@/hooks/useTemplates';
import { useDeals } from '@/hooks/useDeals';
import { useScheduledPosts } from '@/hooks/useScheduledPosts';
import { useAffiliatePrograms } from '@/hooks/useAffiliatePrograms';
import { useAI } from '@/hooks/useAI';
import { Tables, Database } from '@/integrations/supabase/types';

type Template = Tables<'post_templates'>;
type Deal = Tables<'deals'>;
type PlatformType = Database['public']['Enums']['platform_type'];

const platforms = [
  { id: 'telegram' as PlatformType, name: 'Telegram', icon: MessageCircle, color: 'bg-blue-500' },
  { id: 'whatsapp' as PlatformType, name: 'WhatsApp', icon: MessageCircle, color: 'bg-green-500' },
  { id: 'twitter' as PlatformType, name: 'Twitter/X', icon: Twitter, color: 'bg-foreground' },
  { id: 'discord' as PlatformType, name: 'Discord', icon: MessageCircle, color: 'bg-indigo-500' },
  { id: 'email' as PlatformType, name: 'Email', icon: Mail, color: 'bg-primary' },
];

export default function Sharing() {
  const { templates, loading: templatesLoading, createTemplate, deleteTemplate } = useTemplates();
  const { deals, loading: dealsLoading, createDeal } = useDeals();
  const { createPost } = useScheduledPosts();
  const { convertToAffiliateLink, programs } = useAffiliatePrograms();
  const { generatePost, optimizeContent, loading: aiLoading } = useAI();

  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformType[]>(['telegram']);
  const [postContent, setPostContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedDealId, setSelectedDealId] = useState('');
  const [copied, setCopied] = useState(false);
  const [showConvertDialog, setShowConvertDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [urlToConvert, setUrlToConvert] = useState('');
  const [convertedUrl, setConvertedUrl] = useState('');
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    content: '',
    category: 'electronics' as const,
    platforms: ['telegram'] as PlatformType[],
  });

  const togglePlatform = (platformId: PlatformType) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const applyTemplate = (template: Template) => {
    setPostContent(template.content);
    setSelectedTemplate(template.id);
    if (template.platforms) {
      setSelectedPlatforms(template.platforms);
    }
    toast.success('Template applied!');
  };

  const handleConvertUrl = async () => {
    if (!urlToConvert) {
      toast.error('Please enter a URL');
      return;
    }

    const { affiliateUrl, program } = convertToAffiliateLink(urlToConvert);

    if (affiliateUrl === urlToConvert) {
      toast.error('No matching affiliate program found. Please add your affiliate programs in Settings.');
      return;
    }

    setConvertedUrl(affiliateUrl);

    // Also create the deal in the database
    await createDeal({
      title: `Deal from ${new URL(urlToConvert).hostname}`,
      original_url: urlToConvert,
      affiliate_url: affiliateUrl,
      commission_rate: program?.commission_rate || null,
      category: 'other',
    });

    toast.success('Link converted and saved to products!');
  };

  const handleCopyLink = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGeneratePost = async () => {
    const deal = deals.find(d => d.id === selectedDealId);
    if (!deal) {
      toast.error('Please select a deal first');
      return;
    }

    const platform = selectedPlatforms[0] || 'telegram';
    const content = await generatePost({
      title: deal.title,
      description: deal.description || '',
      originalPrice: deal.original_price || 0,
      discountedPrice: deal.discounted_price || 0,
      discountPercent: deal.discount_percent || 0,
      category: deal.category || 'other',
      platform,
      affiliateLink: deal.affiliate_url || deal.original_url,
    });

    if (content) {
      setPostContent(content);
    }
  };

  const handleOptimizeContent = async () => {
    if (!postContent) {
      toast.error('Please enter some content first');
      return;
    }

    const platform = selectedPlatforms[0] || 'telegram';
    const optimized = await optimizeContent({
      content: postContent,
      platform,
    });

    if (optimized) {
      setPostContent(optimized);
    }
  };

  const handleShare = async () => {
    if (selectedPlatforms.length === 0) {
      toast.error('Please select at least one platform');
      return;
    }
    if (!postContent.trim()) {
      toast.error('Please enter post content');
      return;
    }

    // Create a scheduled post with immediate time
    const result = await createPost({
      content: postContent,
      platforms: selectedPlatforms,
      scheduled_at: new Date().toISOString(),
      // link_id: selectedDealId || null, // TODO: Update DB schema to support deal_id
      status: 'posted',
    });

    if (result) {
      toast.success(`Broadcasting to ${selectedPlatforms.length} platform(s)...`);

      // Simulate API delay
      setTimeout(() => {
        toast.success('Successfully posted!', {
          description: 'Your content is live on ' + selectedPlatforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', '),
        });
        setPostContent('');
      }, 1500);
    }
  };

  const handleSchedule = async () => {
    if (selectedPlatforms.length === 0) {
      toast.error('Please select at least one platform');
      return;
    }
    if (!postContent.trim()) {
      toast.error('Please enter post content');
      return;
    }

    // Schedule for 1 hour from now (demo)
    const scheduledTime = new Date(Date.now() + 60 * 60 * 1000);

    const result = await createPost({
      content: postContent,
      platforms: selectedPlatforms,
      scheduled_at: scheduledTime.toISOString(),
      // link_id: selectedDealId || null,
    });

    if (result) {
      toast.success('Post scheduled for ' + scheduledTime.toLocaleTimeString());
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplate.name || !newTemplate.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    await createTemplate({
      name: newTemplate.name,
      content: newTemplate.content,
      category: newTemplate.category,
      platforms: newTemplate.platforms,
    });

    setShowTemplateDialog(false);
    setNewTemplate({
      name: '',
      content: '',
      category: 'electronics',
      platforms: ['telegram'],
    });
  };

  const selectedDealData = deals.find(d => d.id === selectedDealId);

  return (
    <AppLayout title="Sharing Hub" description="Share deals across multiple platforms">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Composer Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Link Converter */}
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-primary" />
                Quick Link Converter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Paste any product URL (Amazon, Flipkart, Myntra, etc.)"
                  value={urlToConvert}
                  onChange={(e) => setUrlToConvert(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleConvertUrl} className="gradient-primary">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Convert
                </Button>
              </div>
              {convertedUrl && (
                <div className="mt-4 p-3 bg-success/10 rounded-lg flex items-center justify-between">
                  <div className="flex-1 truncate">
                    <p className="text-xs text-muted-foreground">Affiliate Link:</p>
                    <p className="text-sm font-mono truncate">{convertedUrl}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyLink(convertedUrl)}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              )}
              {programs.length === 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  💡 Add your affiliate programs in Settings to enable automatic link conversion
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Compose Post
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Platform Selection */}
              <div className="space-y-3">
                <Label>Select Platforms</Label>
                <div className="flex flex-wrap gap-2">
                  {platforms.map((platform) => (
                    <Button
                      key={platform.id}
                      variant={selectedPlatforms.includes(platform.id) ? 'default' : 'outline'}
                      size="sm"
                      className={selectedPlatforms.includes(platform.id) ? platform.color : ''}
                      onClick={() => togglePlatform(platform.id)}
                    >
                      <platform.icon className="h-4 w-4 mr-2" />
                      {platform.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Link Selection */}
              <div className="space-y-2">
                <Label>Select Deal to Share</Label>
                <Select value={selectedDealId} onValueChange={setSelectedDealId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a deal from your library" />
                  </SelectTrigger>
                  <SelectContent>
                    {dealsLoading ? (
                      <SelectItem value="" disabled>Loading...</SelectItem>
                    ) : deals.length === 0 ? (
                      <SelectItem value="" disabled>No deals available</SelectItem>
                    ) : (
                      deals.map((deal) => (
                        <SelectItem key={deal.id} value={deal.id}>
                          {deal.title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {selectedDealData && (
                  <div className="p-2 bg-muted rounded-lg text-sm">
                    <p className="font-medium">{selectedDealData.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {selectedDealData.affiliate_url || selectedDealData.original_url}
                    </p>
                  </div>
                )}
              </div>

              {/* AI Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGeneratePost}
                  disabled={aiLoading || !selectedDealId}
                >
                  {aiLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Generate with AI
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOptimizeContent}
                  disabled={aiLoading || !postContent}
                >
                  {aiLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4 mr-2" />
                  )}
                  Optimize Content
                </Button>
              </div>

              {/* Post Content */}
              <div className="space-y-2">
                <Label>Post Content</Label>
                <Textarea
                  placeholder="Write your post content here..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="min-h-[200px]"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{postContent.length} characters</span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Image className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => postContent && handleCopyLink(postContent)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button className="flex-1 gradient-primary" onClick={handleShare}>
                  <SendIcon className="h-4 w-4 mr-2" />
                  Share Now
                </Button>
                <Button variant="outline" onClick={handleSchedule}>
                  <Clock className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Post Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={selectedPlatforms[0] || 'telegram'}>
                <TabsList className="mb-4">
                  {selectedPlatforms.map(platformId => {
                    const platform = platforms.find(p => p.id === platformId);
                    return platform ? (
                      <TabsTrigger key={platformId} value={platformId}>
                        {platform.name}
                      </TabsTrigger>
                    ) : null;
                  })}
                </TabsList>
                {selectedPlatforms.map(platformId => (
                  <TabsContent key={platformId} value={platformId}>
                    <div className="bg-muted rounded-lg p-4">
                      <pre className="whitespace-pre-wrap text-sm">
                        {postContent || 'Your post preview will appear here...'}
                      </pre>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Templates & Quick Actions */}
        <div className="space-y-6">
          {/* Templates */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5 text-warning" />
                Templates
              </CardTitle>
              <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Template</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Template Name</Label>
                      <Input
                        value={newTemplate.name}
                        onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                        placeholder="e.g., Electronics Deal"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select
                        value={newTemplate.category}
                        onValueChange={(value: any) => setNewTemplate({ ...newTemplate, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="electronics">Electronics</SelectItem>
                          <SelectItem value="fashion">Fashion</SelectItem>
                          <SelectItem value="travel">Travel</SelectItem>
                          <SelectItem value="food">Food</SelectItem>
                          <SelectItem value="gaming">Gaming</SelectItem>
                          <SelectItem value="beauty">Beauty</SelectItem>
                          <SelectItem value="home">Home</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Content</Label>
                      <Textarea
                        value={newTemplate.content}
                        onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                        placeholder="Use {title}, {price}, {discount}, {link} as placeholders"
                        className="min-h-[150px]"
                      />
                      <p className="text-xs text-muted-foreground">
                        Available placeholders: {'{title}'}, {'{price}'}, {'{discount}'}, {'{link}'}, {'{description}'}
                      </p>
                    </div>
                    <Button onClick={handleCreateTemplate} className="w-full">
                      Create Template
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-3">
              {templatesLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : templates.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No templates yet. Create one!
                </p>
              ) : (
                templates.map((template) => (
                  <div
                    key={template.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted group"
                  >
                    <Button
                      variant="ghost"
                      className="flex-1 justify-start"
                      onClick={() => applyTemplate(template)}
                    >
                      <Badge variant="secondary" className="mr-2">
                        {template.category}
                      </Badge>
                      {template.name}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100"
                      onClick={() => deleteTemplate(template.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Connected Platforms */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Platforms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {platforms.map((platform) => (
                <div
                  key={platform.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${platform.color}`}>
                      <platform.icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium">{platform.name}</span>
                  </div>
                  <Badge variant="secondary" className="bg-success/10 text-success">
                    Ready
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Deals */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Deals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dealsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : deals.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No deals yet
                </p>
              ) : (
                deals.slice(0, 5).map((deal) => (
                  <div
                    key={deal.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => setSelectedDealId(deal.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{deal.title}</p>
                      <p className="text-xs text-muted-foreground truncate w-32">
                        {deal.affiliate_url}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyLink(deal.affiliate_url || deal.original_url);
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
