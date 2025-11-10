'use client';

import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ResumeFormData } from '@/lib/validation/resumeSchemas';

export function ProfessionalSummarySection() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<ResumeFormData>();

  const summary = watch('professionalSummary') || '';
  const charCount = summary.length;
  const maxChars = 1000;

  return (
    <Card className="bg-slate-900/50 border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-purple-300">Professional Summary</CardTitle>
        <CardDescription className="text-slate-400">
          A brief overview of your professional background and career objectives
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="professionalSummary" className="text-slate-200">
              Summary
            </Label>
            <span className={`text-xs ${charCount > maxChars ? 'text-red-400' : 'text-slate-400'}`}>
              {charCount} / {maxChars}
            </span>
          </div>
          <Textarea
            id="professionalSummary"
            {...register('professionalSummary')}
            placeholder="Write a compelling professional summary that highlights your key qualifications, experience, and career goals. Focus on your most relevant achievements and what makes you stand out..."
            rows={8}
            className="bg-slate-800 border-slate-700 text-slate-100"
          />
          {errors.professionalSummary && (
            <p className="text-sm text-red-400">{errors.professionalSummary.message}</p>
          )}
          <p className="text-xs text-slate-500">
            Tip: Keep it concise (50-200 words) and focus on your unique value proposition.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
