'use client';

import { useFieldArray, useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2 } from 'lucide-react';
import type { ResumeFormData } from '@/lib/validation/resumeSchemas';

export function ExperienceSection() {
  const { control } = useFormContext<ResumeFormData>();
  const { fields, append, remove } = useFieldArray({ control, name: 'experiences' });

  const addExperience = () => {
    append({
      id: crypto.randomUUID(),
      company: '',
      jobTitle: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      location: '',
      bulletPoints: [{ id: crypto.randomUUID(), content: '' }],
    });
  };

  return (
    <Card className="bg-slate-900/50 border-purple-500/30 h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <CardTitle className="text-purple-300">Work Experience</CardTitle>
            <CardDescription className="text-slate-400">Your professional work history</CardDescription>
          </div>
          <Button type="button" onClick={addExperience} variant="outline" size="sm" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10">
            <Plus className="h-4 w-4 mr-1" />
            Add Experience
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="space-y-4">
            {fields.length === 0 && (<div className="text-center py-8 text-slate-400"><p>No experience entries yet. Click "Add Experience" to get started.</p></div>)}
            {fields.map((field, index) => (<ExperienceEntry key={field.id} index={index} remove={remove} />))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function ExperienceEntry({ index, remove }: { index: number; remove: (index: number) => void }) {
  const { control, register, watch, setValue, formState: { errors } } = useFormContext<ResumeFormData>(); // eslint-disable-line @typescript-eslint/no-unused-vars
  const { fields: bulletFields, append: appendBullet, remove: removeBullet } = useFieldArray({ control, name: `experiences.${index}.bulletPoints` as 'experiences' });
  const isCurrent = watch(`experiences.${index}.isCurrent` as 'experiences');

  return (
    <div className="p-4 border border-slate-700 rounded-lg bg-slate-800/50 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-purple-300">Experience Entry {index + 1}</h4>
        <Button type="button" onClick={() => remove(index)} variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`experiences.${index}.company`} className="text-slate-200">Company <span className="text-red-400">*</span></Label>
          <Input {...register(`experiences.${index}.company` as 'experiences')} placeholder="Google Inc." className="bg-slate-800 border-slate-700 text-slate-100" />
          {errors.experiences?.[index]?.company && (<p className="text-sm text-red-400">{errors.experiences[index]?.company?.message}</p>)}
        </div>
        <div className="space-y-2">
          <Label htmlFor={`experiences.${index}.jobTitle`} className="text-slate-200">Job Title <span className="text-red-400">*</span></Label>
          <Input {...register(`experiences.${index}.jobTitle` as 'experiences')} placeholder="Software Engineer" className="bg-slate-800 border-slate-700 text-slate-100" />
          {errors.experiences?.[index]?.jobTitle && (<p className="text-sm text-red-400">{errors.experiences[index]?.jobTitle?.message}</p>)}
        </div>
        <div className="space-y-2">
          <Label htmlFor={`experiences.${index}.location`} className="text-slate-200">Location</Label>
          <Input {...register(`experiences.${index}.location` as 'experiences')} placeholder="San Francisco, CA" className="bg-slate-800 border-slate-700 text-slate-100" />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`experiences.${index}.startDate`} className="text-slate-200">Start Date <span className="text-red-400">*</span></Label>
          <Input {...register(`experiences.${index}.startDate` as 'experiences')} placeholder="Jan 2022" className="bg-slate-800 border-slate-700 text-slate-100" />
          {errors.experiences?.[index]?.startDate && (<p className="text-sm text-red-400">{errors.experiences[index]?.startDate?.message}</p>)}
        </div>
        <div className="space-y-2">
          <Label htmlFor={`experiences.${index}.endDate`} className="text-slate-200">End Date {isCurrent && '(Current Position)'}</Label>
          <Input {...register(`experiences.${index}.endDate` as 'experiences')} placeholder="Present" disabled={!!isCurrent} className="bg-slate-800 border-slate-700 text-slate-100 disabled:opacity-50" />
        </div>
        <div className="flex items-center space-x-2 pt-6">
          <Checkbox id={`experiences.${index}.isCurrent`} checked={!!isCurrent} onCheckedChange={(checked) => { setValue(`experiences.${index}.isCurrent` as any, checked as boolean); if (checked) { setValue(`experiences.${index}.endDate` as any, ''); }}} className="border-slate-700" />
          <Label htmlFor={`experiences.${index}.isCurrent`} className="text-sm text-slate-200 cursor-pointer">I currently work here</Label>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-slate-200">Responsibilities & Achievements <span className="text-red-400">*</span></Label>
          <Button type="button" onClick={() => appendBullet({ id: crypto.randomUUID(), content: '' } as any)} variant="ghost" size="sm" className="text-purple-300 hover:bg-purple-500/10"><Plus className="h-3 w-3 mr-1" />Add Bullet</Button>
        </div>
        <div className="space-y-2">
          {bulletFields.map((bulletField, bulletIndex) => (
            <div key={bulletField.id} className="flex gap-2">
              <Textarea {...register(`experiences.${index}.bulletPoints.${bulletIndex}.content` as 'experiences')} placeholder="• Describe your responsibilities..." rows={2} className="bg-slate-800 border-slate-700 text-slate-100 flex-1" />
              {bulletFields.length > 1 && (<Button type="button" onClick={() => removeBullet(bulletIndex)} variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></Button>)}
            </div>
          ))}
        </div>
        {errors.experiences?.[index]?.bulletPoints && (<p className="text-sm text-red-400">{errors.experiences[index]?.bulletPoints?.message}</p>)}
      </div>
    </div>
  );
}





