import { useFieldArray, useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2 } from 'lucide-react';
import { ResumeFormData } from '@/lib/validation/resumeSchemas';

export function VolunteerExperienceSection() {
  const { control, register, setValue, formState: { errors } } = useFormContext<ResumeFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'volunteerExperience',
  });

  const addVolunteerExperience = () => {
    append({
      id: `volunteer-${Date.now()}`,
      organization: '',
      role: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      bulletPoints: [],
    });
  };

  const addBulletPoint = (experienceIndex: number) => {
    const currentExperience = fields[experienceIndex];
    const currentBulletPoints = currentExperience?.bulletPoints || [];
    const newBulletPoints = [...currentBulletPoints, { id: `bullet-${Date.now()}`, content: '' }];
    
    setValue(`volunteerExperience.${experienceIndex}.bulletPoints`, newBulletPoints);
  };

  const removeBulletPoint = (experienceIndex: number, bulletIndex: number) => {
    const currentExperience = fields[experienceIndex];
    const currentBulletPoints = currentExperience?.bulletPoints || [];
    const newBulletPoints = currentBulletPoints.filter((_, i) => i !== bulletIndex);
    
    setValue(`volunteerExperience.${experienceIndex}.bulletPoints`, newBulletPoints);
  };

  return (
    <Card className="bg-slate-900/50 border-purple-500/30 h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <CardTitle className="text-purple-300">Volunteer Experience</CardTitle>
            <CardDescription className="text-slate-400">
              Your community service and volunteer work
            </CardDescription>
          </div>
          <Button
            type="button"
            onClick={addVolunteerExperience}
            variant="outline"
            size="sm"
            className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Volunteer Experience
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="space-y-4">
            {fields.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p>No volunteer experience added yet.</p>
                <p className="text-sm">Click &quot;Add Volunteer Experience&quot; to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <Card key={field.id} className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm text-slate-300">Volunteer Experience {index + 1}</CardTitle>
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
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`volunteerExperience.${index}.organization`} className="text-slate-300">
                            Organization *
                          </Label>
                          <Input
                            {...register(`volunteerExperience.${index}.organization`)}
                            placeholder="e.g., Local Food Bank"
                            className="bg-slate-800 border-slate-600 text-slate-200"
                          />
                          {errors.volunteerExperience?.[index]?.organization && (
                            <p className="text-red-400 text-sm">{errors.volunteerExperience[index]?.organization?.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`volunteerExperience.${index}.role`} className="text-slate-300">
                            Role/Position *
                          </Label>
                          <Input
                            {...register(`volunteerExperience.${index}.role`)}
                            placeholder="e.g., Volunteer Coordinator"
                            className="bg-slate-800 border-slate-600 text-slate-200"
                          />
                          {errors.volunteerExperience?.[index]?.role && (
                            <p className="text-red-400 text-sm">{errors.volunteerExperience[index]?.role?.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`volunteerExperience.${index}.location`} className="text-slate-300">
                            Location
                          </Label>
                          <Input
                            {...register(`volunteerExperience.${index}.location`)}
                            placeholder="e.g., New York, NY"
                            className="bg-slate-800 border-slate-600 text-slate-200"
                          />
                          {errors.volunteerExperience?.[index]?.location && (
                            <p className="text-red-400 text-sm">{errors.volunteerExperience[index]?.location?.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`volunteerExperience.${index}.startDate`} className="text-slate-300">
                            Start Date *
                          </Label>
                          <Input
                            {...register(`volunteerExperience.${index}.startDate`)}
                            type="date"
                            className="bg-slate-800 border-slate-600 text-slate-200"
                          />
                          {errors.volunteerExperience?.[index]?.startDate && (
                            <p className="text-red-400 text-sm">{errors.volunteerExperience[index]?.startDate?.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`volunteerExperience.${index}.endDate`} className="text-slate-300">
                            End Date
                          </Label>
                          <Input
                            {...register(`volunteerExperience.${index}.endDate`)}
                            type="date"
                            className="bg-slate-800 border-slate-600 text-slate-200"
                          />
                          {errors.volunteerExperience?.[index]?.endDate && (
                            <p className="text-red-400 text-sm">{errors.volunteerExperience[index]?.endDate?.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-slate-300">Key Responsibilities & Achievements</Label>
                          <Button
                            type="button"
                            onClick={() => addBulletPoint(index)}
                            variant="outline"
                            size="sm"
                            className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Bullet Point
                          </Button>
                        </div>

                        {(field.bulletPoints || []).length === 0 ? (
                          <div className="text-center py-4 text-slate-400 text-sm">
                            No bullet points added yet.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {(field.bulletPoints || []).map((bullet, bulletIndex) => (
                              <div key={bullet.id} className="flex items-start gap-2">
                                <Textarea
                                  {...register(`volunteerExperience.${index}.bulletPoints.${bulletIndex}.content`)}
                                  placeholder="Describe your volunteer work and impact..."
                                  className="bg-slate-800 border-slate-600 text-slate-200 flex-1"
                                  rows={2}
                                />
                                <Button
                                  type="button"
                                  onClick={() => removeBulletPoint(index, bulletIndex)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 mt-1"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}