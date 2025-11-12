'use client';

import { useFieldArray, useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2 } from 'lucide-react';
import type { ResumeFormData } from '@/lib/validation/resumeSchemas';

export function EducationSection() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ResumeFormData>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'education',
  });

  const addEducation = () => {
    append({
      id: crypto.randomUUID(),
      school: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      gpa: '',
    });
  };

  return (
    <Card className="bg-slate-900/50 border-purple-500/30 h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <CardTitle className="text-purple-300">Education</CardTitle>
            <CardDescription className="text-slate-400">
              Your academic background and qualifications
            </CardDescription>
          </div>
          <Button
            type="button"
            onClick={addEducation}
            variant="outline"
            size="sm"
            className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Education
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="space-y-4">
            {fields.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <p>No education entries yet. Click "Add Education" to get started.</p>
              </div>
            )}

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="p-4 border border-slate-700 rounded-lg bg-slate-800/50 space-y-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-purple-300">
                    Education Entry {index + 1}
                  </h4>
                  <Button
                    type="button"
                    onClick={() => remove(index)}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`education.${index}.school`} className="text-slate-200">
                      School <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      {...register(`education.${index}.school`)}
                      placeholder="University of California, Berkeley"
                      className="bg-slate-800 border-slate-700 text-slate-100"
                    />
                    {errors.education?.[index]?.school && (
                      <p className="text-sm text-red-400">
                        {errors.education[index]?.school?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`education.${index}.degree`} className="text-slate-200">
                      Degree <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      {...register(`education.${index}.degree`)}
                      placeholder="Bachelor of Science"
                      className="bg-slate-800 border-slate-700 text-slate-100"
                    />
                    {errors.education?.[index]?.degree && (
                      <p className="text-sm text-red-400">
                        {errors.education[index]?.degree?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`education.${index}.fieldOfStudy`} className="text-slate-200">
                      Field of Study <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      {...register(`education.${index}.fieldOfStudy`)}
                      placeholder="Computer Science"
                      className="bg-slate-800 border-slate-700 text-slate-100"
                    />
                    {errors.education?.[index]?.fieldOfStudy && (
                      <p className="text-sm text-red-400">
                        {errors.education[index]?.fieldOfStudy?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`education.${index}.startDate`} className="text-slate-200">
                      Start Date <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      {...register(`education.${index}.startDate`)}
                      placeholder="Aug 2018"
                      className="bg-slate-800 border-slate-700 text-slate-100"
                    />
                    {errors.education?.[index]?.startDate && (
                      <p className="text-sm text-red-400">
                        {errors.education[index]?.startDate?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`education.${index}.endDate`} className="text-slate-200">
                      End Date
                    </Label>
                    <Input
                      {...register(`education.${index}.endDate`)}
                      placeholder="May 2022"
                      className="bg-slate-800 border-slate-700 text-slate-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`education.${index}.gpa`} className="text-slate-200">
                      GPA
                    </Label>
                    <Input
                      {...register(`education.${index}.gpa`)}
                      placeholder="3.8/4.0"
                      className="bg-slate-800 border-slate-700 text-slate-100"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

