// AI Generated Code by Deloitte + Cursor (BEGIN)
'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, XCircle, ExternalLink, Loader2, RefreshCw } from 'lucide-react';

interface Topic {
  id: string;
  topic_title: string;
  topic_description: string;
  niche_category: string;
  ai_analysis: any;
  quality_score: number;
  estimated_monthly_searches: number;
  competition_level: string;
  discovered_via: string;
  source_url: string | null;
  status: string;
  created_at: string;
}

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTopics();
  }, []);

  async function fetchTopics() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/topics');
      
      if (!response.ok) {
        throw new Error('Failed to fetch topics');
      }
      
      const data = await response.json();
      setTopics(data.topics || []);
    } catch (err: any) {
      console.error('Error fetching topics:', err);
      setError(err.message || 'Failed to load topics');
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(topicId: string) {
    setProcessingIds(prev => new Set(prev).add(topicId));

    try {
      const response = await fetch(`/api/topics/${topicId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      });

      if (!response.ok) {
        throw new Error('Failed to approve topic');
      }

      // Remove from list
      setTopics(prev => prev.filter(t => t.id !== topicId));
      
      alert('✅ Topic Approved! Content generation will start (n8n workflow triggered)');
    } catch (err: any) {
      alert('❌ Error: ' + err.message);
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(topicId);
        return next;
      });
    }
  }

  async function handleReject(topicId: string) {
    setProcessingIds(prev => new Set(prev).add(topicId));

    try {
      const response = await fetch(`/api/topics/${topicId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'rejected',
          rejected_reason: 'Quality threshold not met'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to reject topic');
      }

      setTopics(prev => prev.filter(t => t.id !== topicId));
      alert('Topic rejected');
    } catch (err: any) {
      alert('❌ Error: ' + err.message);
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
      case 'manual': return '✍️';
      default: return '📊';
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading topics from database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading Topics</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <div className="space-y-2 text-sm text-red-600 mb-4">
            <p><strong>Possible reasons:</strong></p>
            <ul className="list-disc list-inside">
              <li>Supabase database tables not created yet</li>
              <li>API keys incorrect in .env.local</li>
              <li>Network connection issue</li>
            </ul>
          </div>
          <div className="flex gap-4">
            <Button onClick={fetchTopics} className="bg-blue-600 hover:bg-blue-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <a 
              href="https://supabase.com/dashboard/project/akqlghyrsglqaxgadvlo/editor"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Open Supabase SQL Editor
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-lg">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">All Caught Up!</h2>
          <p className="text-gray-600 mb-4">No topics pending approval</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left">
            <p className="text-sm text-gray-700 mb-4">
              <strong>✅ Connected to Supabase database!</strong>
            </p>
            <p className="text-sm text-gray-600 mb-3">
              n8n workflows will automatically discover topics daily. To test manually:
            </p>
            <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
              <li>Open Supabase SQL Editor</li>
              <li>Run the test INSERT query from AUTOMATION_SETUP_GUIDE.md</li>
              <li>Refresh this page to see the test topic</li>
            </ol>
            <div className="mt-4">
              <a 
                href="https://supabase.com/dashboard/project/akqlghyrsglqaxgadvlo/editor"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Go to Supabase
              </a>
            </div>
          </div>
          <Button onClick={fetchTopics} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Topic Approval Dashboard</h1>
            <p className="text-gray-600">
              {topics.length} topic{topics.length !== 1 ? 's' : ''} discovered by AI • Review and approve the best ones
            </p>
          </div>
          <Button onClick={fetchTopics} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            ✅ <strong>Live Mode:</strong> Connected to Supabase database. Real-time data from n8n workflows.
          </p>
        </div>
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
            {topic.ai_analysis && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold mb-2 text-sm text-gray-700">📊 AI Analysis</h3>
                {topic.ai_analysis.reasoning && (
                  <p className="text-sm text-gray-700 mb-3">{topic.ai_analysis.reasoning}</p>
                )}
                
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <div className="text-xs text-gray-500">Est. Monthly Searches</div>
                    <div className="text-lg font-semibold">
                      {topic.estimated_monthly_searches?.toLocaleString()}
                    </div>
                  </div>
                  {topic.ai_analysis.monetization_potential && (
                    <div>
                      <div className="text-xs text-gray-500">Monetization Potential</div>
                      <div className="text-lg font-semibold">
                        {topic.ai_analysis.monetization_potential}/100
                      </div>
                    </div>
                  )}
                </div>

                {topic.ai_analysis.potential_keywords && topic.ai_analysis.potential_keywords.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 mb-1">Target Keywords</div>
                    <div className="flex flex-wrap gap-1">
                      {topic.ai_analysis.potential_keywords.map((keyword: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {topic.ai_analysis.affiliate_products && topic.ai_analysis.affiliate_products.length > 0 && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Recommended Products</div>
                    <div className="flex flex-wrap gap-1">
                      {topic.ai_analysis.affiliate_products.map((product: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          💰 {product}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                onClick={() => handleApprove(topic.id)}
                disabled={processingIds.has(topic.id)}
                className="bg-green-600 hover:bg-green-700"
              >
                {processingIds.has(topic.id) ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Approve & Generate Article
                  </>
                )}
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
                Discovered {new Date(topic.created_at).toLocaleString()}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
// AI Generated Code by Deloitte + Cursor (END)
