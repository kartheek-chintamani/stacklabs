'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, XCircle, TrendingUp, TrendingDown, Minus, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ContentTopic {
  id: string;
  topic_title: string;
  topic_description: string;
  niche_category: string;
  discovered_via: string;
  source_url: string;
  ai_analysis: {
    quality_score: number;
    reasoning: string;
    estimated_searches: number;
    competition_level: 'low' | 'medium' | 'high';
    content_angle: string;
    potential_keywords: string[];
    monetization_potential: number;
    affiliate_products: string[];
  };
  quality_score: number;
  estimated_monthly_searches: number;
  competition_level: string;
  status: string;
  created_at: string;
}

export default function TopicsApprovalPage() {
  const [topics, setTopics] = useState<ContentTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const supabase = createClient();

  useEffect(() => {
    fetchPendingTopics();
  }, []);

  async function fetchPendingTopics() {
    try {
      const { data, error } = await supabase
        .from('content_topics')
        .select('*')
        .eq('status', 'pending_approval')
        .order('quality_score', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTopics(data || []);
    } catch (error) {
      console.error('Error fetching topics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load topics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(topicId: string) {
    setProcessingIds(prev => new Set(prev).add(topicId));

    try {
      // Update status in Supabase
      const { error: updateError } = await supabase
        .from('content_topics')
        .update({ 
          status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', topicId);

      if (updateError) throw updateError;

      // Trigger n8n webhook for WF3 (Content Generator)
      const webhookResponse = await fetch('/api/topics/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId }),
      });

      if (!webhookResponse.ok) {
        throw new Error('Failed to trigger content generation');
      }

      // Remove from list
      setTopics(prev => prev.filter(t => t.id !== topicId));

      toast({
        title: '✅ Topic Approved',
        description: 'Content generation started. You\'ll receive an email when the article is ready for review (~8-12 minutes).',
      });
    } catch (error) {
      console.error('Error approving topic:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve topic',
        variant: 'destructive',
      });
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(topicId);
        return next;
      });
    }
  }

  async function handleReject(topicId: string, reason: string = 'Not aligned with content strategy') {
    setProcessingIds(prev => new Set(prev).add(topicId));

    try {
      const { error } = await supabase
        .from('content_topics')
        .update({ 
          status: 'rejected',
          rejected_reason: reason
        })
        .eq('id', topicId);

      if (error) throw error;

      setTopics(prev => prev.filter(t => t.id !== topicId));

      toast({
        title: 'Topic Rejected',
        description: 'Topic moved to rejected list',
      });
    } catch (error) {
      console.error('Error rejecting topic:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject topic',
        variant: 'destructive',
      });
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(topicId);
        return next;
      });
    }
  }

  function getCompetitionColor(level: string) {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  function getQualityColor(score: number) {
    if (score >= 80) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }

  function getSourceIcon(source: string) {
    switch (source) {
      case 'google_trends': return '🔍';
      case 'product_hunt': return '🚀';
      case 'reddit': return '👽';
      default: return '📊';
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading topics...</p>
        </div>
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">All Caught Up!</h2>
          <p className="text-gray-600 mb-4">No topics pending approval</p>
          <p className="text-sm text-gray-500">
            WF1 runs daily at 6am. Check back tomorrow morning.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Topic Approval</h1>
        <p className="text-gray-600">
          {topics.length} topic{topics.length !== 1 ? 's' : ''} discovered by AI • Review and approve the best ones
        </p>
      </div>

      <div className="space-y-6">
        {topics.map((topic) => (
          <Card key={topic.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{getSourceIcon(topic.discovered_via)}</span>
                  <Badge variant="outline" className="text-xs">
                    {topic.discovered_via.replace('_', ' ')}
                  </Badge>
                  <Badge className={getCompetitionColor(topic.competition_level)}>
                    {topic.competition_level} competition
                  </Badge>
                </div>
                <h2 className="text-2xl font-bold mb-2">{topic.topic_title}</h2>
                <p className="text-gray-700 mb-3">{topic.topic_description}</p>
                {topic.source_url && (
                  <a 
                    href={topic.source_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    View source <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              
              <div className="text-right ml-4">
                <div className={`text-4xl font-bold ${getQualityColor(topic.quality_score)}`}>
                  {topic.quality_score}
                </div>
                <div className="text-xs text-gray-500">Quality Score</div>
              </div>
            </div>

            {/* AI Analysis */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold mb-2 text-sm text-gray-700">📊 AI Analysis</h3>
              <p className="text-sm text-gray-700 mb-3">{topic.ai_analysis.reasoning}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-xs text-gray-500">Est. Monthly Searches</div>
                  <div className="text-lg font-semibold">
                    {topic.estimated_monthly_searches?.toLocaleString() || 'Unknown'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Monetization Potential</div>
                  <div className="text-lg font-semibold">
                    {topic.ai_analysis.monetization_potential}/100
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <div className="text-xs text-gray-500 mb-1">Content Angle</div>
                <div className="text-sm font-medium text-gray-800">
                  {topic.ai_analysis.content_angle}
                </div>
              </div>

              <div className="mb-3">
                <div className="text-xs text-gray-500 mb-1">Target Keywords</div>
                <div className="flex flex-wrap gap-1">
                  {topic.ai_analysis.potential_keywords?.map((keyword, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              {topic.ai_analysis.affiliate_products?.length > 0 && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Recommended Products</div>
                  <div className="flex flex-wrap gap-1">
                    {topic.ai_analysis.affiliate_products.map((product, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        💰 {product}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                onClick={() => handleApprove(topic.id)}
                disabled={processingIds.has(topic.id)}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {processingIds.has(topic.id) ? 'Processing...' : 'Approve & Generate Article'}
              </Button>
              
              <Button
                onClick={() => handleReject(topic.id)}
                disabled={processingIds.has(topic.id)}
                variant="outline"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>

              <div className="text-xs text-gray-500 ml-auto">
                Discovered {new Date(topic.created_at).toLocaleDateString()}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
