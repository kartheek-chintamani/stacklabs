import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  Trash2,
  Edit,
  MessageCircle,
  Twitter,
  Mail,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useScheduledPosts } from '@/hooks/useScheduledPosts';
import { useLinks } from '@/hooks/useLinks';
import { useAI } from '@/hooks/useAI';
import { Skeleton } from '@/components/ui/skeleton';
import { Database } from '@/integrations/supabase/types';

type PlatformType = Database['public']['Enums']['platform_type'];

const platformIcons: Record<string, any> = {
  telegram: MessageCircle,
  whatsapp: MessageCircle,
  twitter: Twitter,
  discord: MessageCircle,
  email: Mail,
};

const platformColors: Record<string, string> = {
  telegram: 'bg-blue-500',
  whatsapp: 'bg-green-500',
  twitter: 'bg-foreground',
  discord: 'bg-indigo-500',
  email: 'bg-primary',
};

export default function Scheduler() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { posts, loading, scheduledDates, getPostsForDate, createPost, deletePost } = useScheduledPosts();
  const { links } = useLinks();
  const { suggestBestTimes, loading: aiLoading } = useAI();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [bestTimes, setBestTimes] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    content: '',
    scheduled_date: '',
    scheduled_time: '',
    platforms: [] as PlatformType[],
    link_id: '',
  });

  const resetForm = () => {
    setFormData({
      content: '',
      scheduled_date: '',
      scheduled_time: '',
      platforms: [],
      link_id: '',
    });
  };

  const handlePlatformToggle = (platform: PlatformType) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform],
    }));
  };

  const handleSubmit = async () => {
    if (!formData.content || !formData.scheduled_date || !formData.scheduled_time || formData.platforms.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    const scheduledAt = new Date(`${formData.scheduled_date}T${formData.scheduled_time}`);
    
    await createPost({
      content: formData.content,
      scheduled_at: scheduledAt.toISOString(),
      platforms: formData.platforms,
      link_id: formData.link_id || null,
    });
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDeletePost = async (id: string) => {
    if (confirm('Are you sure you want to delete this scheduled post?')) {
      await deletePost(id);
    }
  };

  const fetchBestTimes = async () => {
    const times = await suggestBestTimes({
      platform: formData.platforms[0] || 'telegram',
      category: 'electronics',
    });
    
    if (times && Array.isArray(times)) {
      setBestTimes(times);
    } else {
      // Default times if AI fails
      setBestTimes([
        { time: '09:00 AM', engagement: 'High', reason: 'Morning commute peak' },
        { time: '12:30 PM', engagement: 'Medium', reason: 'Lunch break browsing' },
        { time: '06:00 PM', engagement: 'High', reason: 'Evening relaxation' },
        { time: '09:00 PM', engagement: 'Very High', reason: 'Prime engagement time' },
      ]);
    }
  };

  const postsForSelectedDate = selectedDate ? getPostsForDate(selectedDate) : [];

  if (loading) {
    return (
      <AppLayout title="Scheduler" description="Plan and schedule your posts">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-[400px] w-full" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Scheduler" description="Plan and schedule your posts">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              modifiers={{
                scheduled: (date) => scheduledDates.includes(date.toDateString()),
              }}
              modifiersStyles={{
                scheduled: {
                  backgroundColor: 'hsl(var(--primary) / 0.2)',
                  color: 'hsl(var(--primary))',
                  fontWeight: 'bold',
                },
              }}
            />
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-3 h-3 rounded bg-primary/20" />
              <span>Has scheduled posts</span>
            </div>
          </CardContent>
        </Card>

        {/* Scheduled Posts for Selected Date */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>
                  {selectedDate?.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {postsForSelectedDate.length} posts scheduled
                </p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button className="gradient-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Post
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Schedule New Post</DialogTitle>
                    <DialogDescription>
                      Create a new scheduled post
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Content *</Label>
                      <Textarea
                        placeholder="Post content..."
                        className="min-h-[100px]"
                        value={formData.content}
                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Date *</Label>
                        <Input
                          type="date"
                          value={formData.scheduled_date}
                          onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Time *</Label>
                        <Input
                          type="time"
                          value={formData.scheduled_time}
                          onChange={(e) => setFormData(prev => ({ ...prev, scheduled_time: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Platforms *</Label>
                      <div className="flex flex-wrap gap-2">
                        {(['telegram', 'twitter', 'discord', 'whatsapp', 'email'] as PlatformType[]).map((platform) => (
                          <Button
                            key={platform}
                            type="button"
                            variant={formData.platforms.includes(platform) ? 'default' : 'outline'}
                            size="sm"
                            className={formData.platforms.includes(platform) ? platformColors[platform] : ''}
                            onClick={() => handlePlatformToggle(platform)}
                          >
                            {platform.charAt(0).toUpperCase() + platform.slice(1)}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Link to Share (Optional)</Label>
                      <Select
                        value={formData.link_id}
                        onValueChange={(v) => setFormData(prev => ({ ...prev, link_id: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a link" />
                        </SelectTrigger>
                        <SelectContent>
                          {links.map((link) => (
                            <SelectItem key={link.id} value={link.id}>
                              {link.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}>
                      Cancel
                    </Button>
                    <Button className="gradient-primary" onClick={handleSubmit}>
                      Schedule
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {postsForSelectedDate.length > 0 ? (
                <div className="space-y-4">
                  {postsForSelectedDate.map((post) => (
                    <div
                      key={post.id}
                      className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-col items-center text-center">
                        <Clock className="h-4 w-4 text-muted-foreground mb-1" />
                        <span className="text-sm font-medium">
                          {new Date(post.scheduled_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {post.content}
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          {post.platforms.map((platform) => {
                            const Icon = platformIcons[platform];
                            return (
                              <div
                                key={platform}
                                className={`p-1.5 rounded ${platformColors[platform]}`}
                              >
                                <Icon className="h-3 w-3 text-white" />
                              </div>
                            );
                          })}
                          <Badge variant="secondary" className="ml-2">
                            {post.status}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDeletePost(post.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold">No posts scheduled</h3>
                  <p className="text-sm text-muted-foreground">
                    Schedule a post for this date
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Best Times */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-warning" />
                AI-Suggested Best Times
              </CardTitle>
              <Button variant="outline" size="sm" onClick={fetchBestTimes} disabled={aiLoading}>
                {aiLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-1" />
                )}
                Get Suggestions
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(bestTimes.length > 0 ? bestTimes : [
                  { time: '09:00 AM', engagement: 'High', reason: 'Morning commute peak' },
                  { time: '12:30 PM', engagement: 'Medium', reason: 'Lunch break browsing' },
                  { time: '06:00 PM', engagement: 'High', reason: 'Evening relaxation' },
                  { time: '09:00 PM', engagement: 'Very High', reason: 'Prime engagement time' },
                ]).map((slot: any, i: number) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <p className="font-bold text-lg">{slot.time}</p>
                    <Badge
                      variant="secondary"
                      className={
                        slot.engagement === 'Very High'
                          ? 'bg-success/10 text-success'
                          : slot.engagement === 'High'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }
                    >
                      {slot.engagement}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-2">{slot.reason}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Queue */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Queue</CardTitle>
            </CardHeader>
            <CardContent>
              {posts.length > 0 ? (
                <div className="space-y-3">
                  {posts.filter(p => p.status === 'scheduled').slice(0, 5).map((post) => (
                    <div
                      key={post.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          {post.platforms.slice(0, 2).map((platform) => {
                            const Icon = platformIcons[platform];
                            return (
                              <div
                                key={platform}
                                className={`p-1.5 rounded ${platformColors[platform]}`}
                              >
                                <Icon className="h-3 w-3 text-white" />
                              </div>
                            );
                          })}
                          {post.platforms.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{post.platforms.length - 2}
                            </Badge>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium line-clamp-1">{post.content.substring(0, 30)}...</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(post.scheduled_at).toLocaleDateString()} at{' '}
                            {new Date(post.scheduled_at).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">{post.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No scheduled posts yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
