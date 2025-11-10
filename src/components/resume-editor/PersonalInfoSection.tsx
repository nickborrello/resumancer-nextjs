'use client';

import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ResumeFormData } from '@/lib/validation/resumeSchemas';

export function PersonalInfoSection() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ResumeFormData>();

  return (
    <Card className="bg-slate-900/50 border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-purple-300">Personal Information</CardTitle>
        <CardDescription className="text-slate-400">
          Your contact details and professional links
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-slate-200">
              Full Name <span className="text-red-400">*</span>
            </Label>
            <Input
              id="fullName"
              {...register('personalInfo.fullName')}
              placeholder="John Doe"
              className="bg-slate-800 border-slate-700 text-slate-100"
            />
            {errors.personalInfo?.fullName && (
              <p className="text-sm text-red-400">{errors.personalInfo.fullName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-200">
              Email <span className="text-red-400">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              {...register('personalInfo.email')}
              placeholder="john@example.com"
              className="bg-slate-800 border-slate-700 text-slate-100"
            />
            {errors.personalInfo?.email && (
              <p className="text-sm text-red-400">{errors.personalInfo.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-slate-200">
              Phone
            </Label>
            <Input
              id="phone"
              type="tel"
              {...register('personalInfo.phone')}
              placeholder="+1 (555) 123-4567"
              className="bg-slate-800 border-slate-700 text-slate-100"
            />
            {errors.personalInfo?.phone && (
              <p className="text-sm text-red-400">{errors.personalInfo.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-slate-200">
              Location
            </Label>
            <Input
              id="location"
              {...register('personalInfo.location')}
              placeholder="San Francisco, CA"
              className="bg-slate-800 border-slate-700 text-slate-100"
            />
            {errors.personalInfo?.location && (
              <p className="text-sm text-red-400">{errors.personalInfo.location.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin" className="text-slate-200">
              LinkedIn
            </Label>
            <Input
              id="linkedin"
              type="url"
              {...register('personalInfo.linkedin')}
              placeholder="https://linkedin.com/in/johndoe"
              className="bg-slate-800 border-slate-700 text-slate-100"
            />
            {errors.personalInfo?.linkedin && (
              <p className="text-sm text-red-400">{errors.personalInfo.linkedin.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="github" className="text-slate-200">
              GitHub
            </Label>
            <Input
              id="github"
              type="url"
              {...register('personalInfo.github')}
              placeholder="https://github.com/johndoe"
              className="bg-slate-800 border-slate-700 text-slate-100"
            />
            {errors.personalInfo?.github && (
              <p className="text-sm text-red-400">{errors.personalInfo.github.message}</p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="portfolio" className="text-slate-200">
              Portfolio Website
            </Label>
            <Input
              id="portfolio"
              type="url"
              {...register('personalInfo.portfolio')}
              placeholder="https://johndoe.com"
              className="bg-slate-800 border-slate-700 text-slate-100"
            />
            {errors.personalInfo?.portfolio && (
              <p className="text-sm text-red-400">{errors.personalInfo.portfolio.message}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
