'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ResumeBuilderClientProps {
  credits: number;
}

export default function ResumeBuilderClient({ credits }: ResumeBuilderClientProps) {
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'ai' | 'demo' | 'credit-error' | ''>('');
  const [message, setMessage] = useState('');

  // Character count and limits
  const maxChars = 10000;
  const warningThreshold = 8000;
  const charCount = jobDescription.length;
  const isNearLimit = charCount > warningThreshold;
  const isOverLimit = charCount > maxChars;

  // Generate resume using AI
  const generateResume = async () => {
    if (!jobDescription.trim()) {
      setError('Please paste a job description first.');
      return;
    }

    if (isOverLimit) {
      setError(`Job description is too long (${charCount} characters). Please shorten it to ${maxChars} characters or less.`);
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/resumes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobDescription }),
      });

      if (!response.ok) {
        if (response.status === 402) {
          const data = await response.json();
          setError(data.message || 'Insufficient credits');
          setMode('credit-error');
          return;
        }
        throw new Error('Failed to generate resume');
      }

      const data = await response.json();
      
      setMode('ai');
      setMessage(data.message || 'Resume generated successfully!');

      // Navigate to editor page after brief delay
      setTimeout(() => {
        router.push(`/resume/editor/${data.resumeId}`);
      }, 1500);
    } catch (err) {
      setError('Failed to generate resume. Please try again.');
      console.error('Resume generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate demo resume (free)
  const generateDemoResume = async () => {
    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/resumes/generate-demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobDescription: jobDescription || 'Demo job description - software engineering position'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate demo resume');
      }

      const data = await response.json();
      
      setMode('demo');
      setMessage(data.message || 'Demo resume generated successfully!');

      // Navigate to editor page after brief delay
      setTimeout(() => {
        router.push(`/resume/editor/${data.resumeId}`);
      }, 1500);
    } catch (err) {
      setError('Failed to generate demo resume. Please try again.');
      console.error('Demo resume generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-amethyst-400 to-purple-500 bg-clip-text text-transparent mb-3">
          AI Resume Builder
        </h1>
        <p className="text-gray-400 text-lg">
          Paste a job description and generate a tailored resume using AI
        </p>
      </div>

      {/* Credits Info Card */}
      <Card className="mb-6 p-6 bg-gradient-to-br from-card/50 to-card/30 border-amethyst-500/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-amethyst-500/20 to-purple-500/20 p-4 rounded-xl">
              <svg className="w-8 h-8 text-amethyst-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-amethyst-300 text-sm font-medium">Available Credits</p>
              <p className="text-3xl font-bold text-amethyst-100">{credits}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400 mb-3">1 credit per AI resume</p>
            <Link href="/credits">
              <Button variant="outline" size="sm" className="border-amethyst-500/30 hover:bg-amethyst-500/10">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Buy More Credits
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Loading Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-amethyst-600/30 border-t-amethyst-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-amethyst-300 text-xl animate-pulse">
              Generating {mode === 'demo' ? 'Demo' : 'AI'} Resume...
            </p>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {(error || (message && mode)) && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md">
          {error && (
            <div className={`${mode === 'credit-error'
              ? 'bg-gradient-to-r from-orange-600 to-amber-600'
              : 'bg-gradient-to-r from-red-600 to-rose-600'
              } text-white px-6 py-4 rounded-lg shadow-2xl flex items-start gap-3 mb-3`}>
              <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="flex-1">
                <p className="font-semibold">{error}</p>
                {mode === 'credit-error' && (
                  <Link
                    href="/credits"
                    className="inline-flex items-center gap-1 mt-2 text-sm underline hover:no-underline"
                  >
                    Purchase credits here
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}
              </div>
            </div>
          )}
          {message && mode && (
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-start gap-3">
              <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="font-semibold">{message}</p>
                <p className="text-sm mt-1 opacity-90">Redirecting to editor...</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Job Description Card */}
      <Card className="p-0 bg-gradient-to-br from-card/50 to-card/30 border-amethyst-500/20 overflow-hidden">
        {/* Card Header */}
        <div className="px-6 py-4 border-b border-amethyst-500/20 bg-gradient-to-r from-amethyst-500/5 to-purple-500/5">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-amethyst-400 to-purple-500 bg-clip-text text-transparent">
            Job Description
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Paste the job posting you want to apply for
          </p>
        </div>

        {/* Textarea */}
        <div className="p-6">
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here...

Example:
Software Engineer at TechCorp
Requirements:
- 3+ years of experience
- React, Node.js
- etc..."
            className="w-full min-h-[400px] bg-[#0a0a0a]/50 border border-amethyst-500/20 rounded-lg p-4 text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amethyst-500/50 focus:border-transparent resize-none font-mono text-sm"
            maxLength={maxChars}
          />
        </div>

        {/* Character Counter */}
        <div className="px-6 py-3 border-t border-amethyst-500/10">
          <div className="flex items-center justify-between text-sm">
            <div className={`flex items-center gap-2 ${
              isOverLimit ? 'text-red-400' :
              isNearLimit ? 'text-orange-400' :
              'text-gray-400'
            }`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>
                {charCount.toLocaleString()} / {maxChars.toLocaleString()} characters
              </span>
            </div>
            {isNearLimit && !isOverLimit && (
              <span className="text-orange-400 text-xs">
                ⚠️ Getting close to limit
              </span>
            )}
            {isOverLimit && (
              <span className="text-red-400 text-xs font-medium">
                ❌ Too long - please shorten
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-5 border-t border-amethyst-500/20 bg-[#0f0f0f]/50">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={generateResume}
              disabled={isGenerating || credits === 0 || isOverLimit}
              className="flex-1 bg-gradient-to-r from-amethyst-600 to-purple-600 hover:from-amethyst-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Generating Resume...
                </>
              ) : credits === 0 ? (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  No Credits Available
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate AI Resume
                </>
              )}
            </Button>
            <Button
              onClick={generateDemoResume}
              disabled={isGenerating}
              variant="secondary"
              className="flex-1 border-amethyst-500/30 hover:bg-amethyst-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Generating Resume...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Try Demo (Free)
                </>
              )}
            </Button>
          </div>
          {credits === 0 && (
            <p className="text-sm text-orange-400 mt-3 text-center flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              You need credits to generate AI resumes.{' '}
              <Link href="/credits" className="underline font-medium text-amethyst-400 hover:text-amethyst-300">
                Purchase credits here
              </Link>
            </p>
          )}
        </div>
      </Card>

      {/* Info Card */}
      <Card className="mt-6 p-6 bg-gradient-to-br from-blue-500/5 to-purple-500/5 border-blue-500/20">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-blue-300 mb-2">How it works</h3>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Paste the job description from the posting you&apos;re applying to</li>
              <li>• Our AI analyzes the requirements and generates a tailored resume</li>
              <li>• Edit and customize your resume in the interactive editor</li>
              <li>• Download as a professional PDF when ready</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
