import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GeneratePostData {
  title: string;
  description?: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  category: string;
  platform: string;
  affiliateLink: string;
}

interface SuggestTimesData {
  platform: string;
  category: string;
  bestDays?: string[];
}

interface OptimizeContentData {
  content: string;
  platform: string;
}

interface AnalyzeDealData {
  title: string;
  category: string;
  discountPercent: number;
  commissionRate: number;
  merchant: string;
}

interface SuggestTagsData {
  title: string;
  category: string;
  description?: string;
}

export function useAI() {
  const [loading, setLoading] = useState(false);

  const callAI = async (type: string, data: Record<string, any>) => {
    setLoading(true);
    try {
      const { data: response, error } = await supabase.functions.invoke('ai-assistant', {
        body: { type, data },
      });

      if (error) throw error;
      
      if (response?.error) {
        toast.error(response.error);
        return null;
      }

      return response?.result || null;
    } catch (error) {
      console.error('AI error:', error);
      toast.error('AI service temporarily unavailable');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generatePost = async (data: GeneratePostData) => {
    const result = await callAI('generate_post', data);
    if (result) {
      toast.success('Post generated!');
    }
    return result;
  };

  const suggestBestTimes = async (data: SuggestTimesData) => {
    const result = await callAI('suggest_times', data);
    if (result) {
      try {
        // Try to parse JSON from the response
        const jsonMatch = result.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch {
        // If parsing fails, return the raw result
      }
    }
    return result;
  };

  const optimizeContent = async (data: OptimizeContentData) => {
    const result = await callAI('optimize_content', data);
    if (result) {
      toast.success('Content optimized!');
    }
    return result;
  };

  const analyzeDeal = async (data: AnalyzeDealData) => {
    const result = await callAI('analyze_deal', data);
    return result;
  };

  const suggestTags = async (data: SuggestTagsData) => {
    const result = await callAI('suggest_tags', data);
    if (result) {
      try {
        const jsonMatch = result.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch {
        // If parsing fails, try to extract tags manually
        const tags = result.match(/[\w]+/g);
        return tags?.slice(0, 8) || [];
      }
    }
    return [];
  };

  return {
    loading,
    generatePost,
    suggestBestTimes,
    optimizeContent,
    analyzeDeal,
    suggestTags,
  };
}
