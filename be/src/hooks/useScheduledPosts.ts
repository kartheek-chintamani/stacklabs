import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type ScheduledPost = Tables<'scheduled_posts'>;
type ScheduledPostInsert = TablesInsert<'scheduled_posts'>;
type ScheduledPostUpdate = TablesUpdate<'scheduled_posts'>;

export function useScheduledPosts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_at', { ascending: true });
      
      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load scheduled posts');
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (post: Omit<ScheduledPostInsert, 'user_id'>) => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .insert({ ...post, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      setPosts(prev => [...prev, data].sort((a, b) => 
        new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
      ));
      toast.success('Post scheduled successfully!');
      return data;
    } catch (error) {
      console.error('Error scheduling post:', error);
      toast.error('Failed to schedule post');
      return null;
    }
  };

  const updatePost = async (id: string, updates: ScheduledPostUpdate) => {
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      setPosts(prev => prev.map(p => p.id === id ? data : p));
      toast.success('Post updated!');
      return data;
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post');
      return null;
    }
  };

  const deletePost = async (id: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_posts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setPosts(prev => prev.filter(p => p.id !== id));
      toast.success('Scheduled post deleted');
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
      return false;
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user]);

  const getPostsForDate = (date: Date) => {
    return posts.filter(post => {
      const postDate = new Date(post.scheduled_at);
      return postDate.toDateString() === date.toDateString();
    });
  };

  const scheduledDates = posts.map(p => new Date(p.scheduled_at).toDateString());

  return {
    posts,
    loading,
    scheduledDates,
    getPostsForDate,
    createPost,
    updatePost,
    deletePost,
    refetch: fetchPosts,
  };
}
