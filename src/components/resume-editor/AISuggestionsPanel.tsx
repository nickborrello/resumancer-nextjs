'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface AISuggestion {
  id: string;
  type: 'improvement' | 'addition' | 'removal';
  section: string;
  original?: string;
  suggested: string;
  reason: string;
}

interface AISuggestionsPanelProps {
  resumeData: any;
  onApplySuggestion: (suggestion: AISuggestion) => void;
  className?: string;
}

export function AISuggestionsPanel({ resumeData, onApplySuggestion, className }: AISuggestionsPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());

  const fetchAISuggestions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const backendUrl = process.env['NEXT_PUBLIC_BACKEND_API_URL'];
      if (!backendUrl) {
        throw new Error('Backend URL not configured');
      }

      const response = await fetch(`${backendUrl}/api/resumes/ai-suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ resumeData }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch AI suggestions');
      }

      const data = await response.json();
      setSuggestions(data.suggestions || []);
      console.log('✅ AI suggestions fetched successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch suggestions';
      setError(errorMessage);
      console.error('❌ Failed to fetch AI suggestions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplySuggestion = (suggestion: AISuggestion) => {
    onApplySuggestion(suggestion);
    setAppliedSuggestions(prev => new Set([...prev, suggestion.id]));
  };

  const handleDismissSuggestion = (suggestionId: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  };

  const getSuggestionTypeColor = (type: AISuggestion['type']) => {
    switch (type) {
      case 'improvement':
        return 'text-blue-400';
      case 'addition':
        return 'text-green-400';
      case 'removal':
        return 'text-orange-400';
      default:
        return 'text-purple-400';
    }
  };

  const getSuggestionTypeLabel = (type: AISuggestion['type']) => {
    switch (type) {
      case 'improvement':
        return 'Improve';
      case 'addition':
        return 'Add';
      case 'removal':
        return 'Remove';
      default:
        return 'Suggestion';
    }
  };

  return (
    <Card className={`bg-slate-900/50 border-purple-500/30 ${className}`}>
      <CardHeader>
        <CardTitle className="text-purple-300 flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI Suggestions
        </CardTitle>
        <CardDescription className="text-slate-400">
          Get intelligent recommendations to improve your resume
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!suggestions.length && !isLoading && !error && (
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-purple-400 opacity-50" />
            <p className="text-slate-400 mb-4">
              Get personalized suggestions to enhance your resume
            </p>
            <Button
              onClick={fetchAISuggestions}
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generate AI Suggestions
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 mx-auto mb-4 text-purple-400 animate-spin" />
            <p className="text-slate-400">Analyzing your resume...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400 text-sm">{error}</p>
            <Button
              onClick={fetchAISuggestions}
              variant="outline"
              size="sm"
              className="mt-3 border-red-500/50 text-red-300 hover:bg-red-500/10"
            >
              Try Again
            </Button>
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-300">
                {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''} found
              </p>
              <Button
                onClick={fetchAISuggestions}
                variant="outline"
                size="sm"
                disabled={isLoading}
                className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Refresh
              </Button>
            </div>

            {suggestions.map((suggestion) => {
              const isApplied = appliedSuggestions.has(suggestion.id);

              return (
                <div
                  key={suggestion.id}
                  className={`bg-slate-800/50 border rounded-lg p-4 space-y-3 ${
                    isApplied ? 'border-green-500/30 opacity-60' : 'border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs font-semibold uppercase ${getSuggestionTypeColor(
                            suggestion.type
                          )}`}
                        >
                          {getSuggestionTypeLabel(suggestion.type)}
                        </span>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-xs text-slate-400 capitalize">
                          {suggestion.section}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 mb-2">{suggestion.reason}</p>
                    </div>
                  </div>

                  {suggestion.original && (
                    <div className="bg-slate-900/50 border border-slate-700 rounded p-3">
                      <p className="text-xs text-slate-500 mb-1">Current:</p>
                      <p className="text-sm text-slate-400 line-through opacity-60">
                        {suggestion.original}
                      </p>
                    </div>
                  )}

                  <div className="bg-purple-500/10 border border-purple-500/30 rounded p-3">
                    <p className="text-xs text-purple-400 mb-1">Suggested:</p>
                    <p className="text-sm text-slate-200">{suggestion.suggested}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApplySuggestion(suggestion)}
                      disabled={isApplied}
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {isApplied ? 'Applied' : 'Apply'}
                    </Button>
                    <Button
                      onClick={() => handleDismissSuggestion(suggestion.id)}
                      disabled={isApplied}
                      size="sm"
                      variant="outline"
                      className="border-slate-600 text-slate-400 hover:bg-slate-800"
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Dismiss
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
