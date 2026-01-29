'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, XCircle, ExternalLink } from 'lucide-react';

// Mock data - will be replaced with real Supabase data later
const MOCK_TOPICS = [
  {
    id: '1',
    topic_title: 'GitHub Copilot vs Cursor AI: Which AI Coding Assistant is Better in 2026?',
    topic_description: 'Compare the latest features, pricing, and performance of GitHub Copilot and Cursor AI to help developers choose the best AI coding assistant.',
    niche_category: 'AI productivity tools for developers',
    discovered_via: 'google_trends',
    source_url: 'https://trends.google.com/trends/explore?q=cursor%20ai',
    ai_analysis: {
      quality_score: 87,
      reasoning: 'High search volume with rising trend. Low competition in comparison reviews. Multiple affiliate opportunities through both tools. Clear monetization path.',
      estimated_searches: 8500,
      competition_level: 'medium',
      content_angle: 'Side-by-side comparison focusing on real-world coding scenarios with benchmark tests',
      potential_keywords: ['cursor ai vs copilot', 'best ai coding assistant', 'cursor ai review', 'github copilot alternatives'],
      monetization_potential: 92,
      affiliate_products: ['GitHub Copilot Pro', 'Cursor AI Pro', 'Codeium', 'TabNine']
    },
    quality_score: 87,
    estimated_monthly_searches: 8500,
    competition_level: 'medium',
    status: 'pending_approval',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: '2',
    topic_title: 'Best n8n Workflow Templates for Developers in 2026',
    topic_description: 'Discover the top n8n workflow automation templates that can save developers hours of manual work.',
    niche_category: 'AI productivity tools for developers',
    discovered_via: 'product_hunt',
    source_url: 'https://www.producthunt.com/posts/n8n-workflows',
    ai_analysis: {
      quality_score: 82,
      reasoning: 'Growing interest in no-code automation. Product Hunt launch shows traction. Good affiliate potential with n8n cloud.',
      estimated_searches: 3200,
      competition_level: 'low',
      content_angle: 'Curated list of 15 best templates with use cases and setup guides',
      potential_keywords: ['n8n templates', 'n8n workflow examples', 'automation for developers', 'n8n tutorial'],
      monetization_potential: 78,
      affiliate_products: ['n8n Cloud', 'Make.com', 'Zapier', 'Activepieces']
    },
    quality_score: 82,
    estimated_monthly_searches: 3200,
    competition_level: 'low',
    status: 'pending_approval',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
  },
  {
    id: '3',
    topic_title: 'Top 10 VS Code Extensions for AI-Powered Development',
    topic_description: 'Essential VS Code extensions that leverage AI to boost developer productivity and code quality.',
    niche_category: 'AI productivity tools for developers',
    discovered_via: 'reddit',
    source_url: 'https://reddit.com/r/vscode/hot',
    ai_analysis: {
      quality_score: 79,
      reasoning: 'Evergreen topic with consistent search volume. Multiple products to review. Good for ongoing updates.',
      estimated_searches: 5600,
      competition_level: 'high',
      content_angle: 'In-depth review of each extension with real coding examples and performance metrics',
      potential_keywords: ['vscode ai extensions', 'best vscode plugins 2026', 'ai coding tools', 'vscode productivity'],
      monetization_potential: 71,
      affiliate_products: ['Tabnine Pro', 'Codeium', 'AWS CodeWhisperer', 'Pieces for Developers']
    },
    quality_score: 79,
    estimated_monthly_searches: 5600,
    competition_level: 'high',
    status: 'pending_approval',
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
  },
];

export default function TopicsApprovalPage() {
  const [topics, setTopics] = useState(MOCK_TOPICS);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  async function handleApprove(topicId: string) {
    setProcessingIds(prev => new Set(prev).add(topicId));

    // Simulate API call
    setTimeout(() => {
      setTopics(prev => prev.filter(t => t.id !== topicId));
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(topicId);
        return next;
      });
      
      // Show success message
      alert('✅ Topic Approved! Content generation will start (connects to n8n webhook when APIs are configured)');
    }, 1000);
  }

  async function handleReject(topicId: string) {
    setProcessingIds(prev => new Set(prev).add(topicId));

    setTimeout(() => {
      setTopics(prev => prev.filter(t => t.id !== topicId));
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(topicId);
        return next;
      });
      
      alert('Topic rejected');
    }, 500);
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

  if (topics.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">All Caught Up!</h2>
          <p className="text-gray-600 mb-4">No topics pending approval</p>
          <p className="text-sm text-gray-500">
            Mock data cleared. In production, WF1 runs daily at 6am.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Topic Approval Dashboard</h1>
        <p className="text-gray-600">
          {topics.length} topic{topics.length !== 1 ? 's' : ''} discovered by AI • Review and approve the best ones
        </p>
        <p className="text-sm text-blue-600 mt-2">
          🧪 Mock Mode: Using sample data. Connect Supabase to see real topics from n8n workflows.
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
                    {topic.estimated_monthly_searches?.toLocaleString()}
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
                Discovered {new Date(topic.created_at).toLocaleTimeString()}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
