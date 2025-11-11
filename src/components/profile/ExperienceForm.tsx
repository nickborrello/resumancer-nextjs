'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { Experience } from '@/types/profile';

interface ExperienceFormProps {
  experiences: Experience[];
  onChange: (experiences: Experience[]) => void;
  errors?: Record<number, Record<string, string[]>>;
  onBlurValidate?: () => void;
}

export default function ExperienceForm({ experiences, onChange, errors = {}, onBlurValidate }: ExperienceFormProps) {

  const handleRemoveExperience = (index: number) => {
    if (window.confirm('Are you sure you want to remove this experience?')) {
      const newExperiences = experiences.filter((_, i) => i !== index);
      onChange(newExperiences);
      onBlurValidate?.(); // Trigger validation after removing entry
    }
  };

  const handleChange = (index: number, field: keyof Experience, value: any) => {
    const newExperiences = experiences.map((exp, i) =>
      i === index ? { ...exp, [field]: value } : exp
    );
    onChange(newExperiences);
  };

  const handleDescriptionChange = (index: number, descIndex: number, value: string) => {
    const newExperiences = experiences.map((exp, i) =>
      i === index
        ? { ...exp, description: exp.description.map((desc, j) => j === descIndex ? value : desc) }
        : exp
    );
    onChange(newExperiences);
  };

  const handleAddDescription = (index: number) => {
    const newExperiences = experiences.map((exp, i) =>
      i === index ? { ...exp, description: [...exp.description, ''] } : exp
    );
    onChange(newExperiences);
    onBlurValidate?.(); // Trigger validation after adding new entry
  };

  const handleRemoveDescription = (index: number, descIndex: number) => {
    const newExperiences = experiences.map((exp, i) =>
      i === index
        ? { ...exp, description: exp.description.filter((_, j) => j !== descIndex) }
        : exp
    );
    onChange(newExperiences);
    onBlurValidate?.(); // Trigger validation after removing entry
  };

  return (
    <div className="space-y-4">
      {experiences.map((experience, index) => (
        <Card key={index} className="p-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Experience {index + 1}</h3>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleRemoveExperience(index)}
              >
                Remove
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`company-${index}`}>Company Name</Label>
                <Input
                  id={`company-${index}`}
                  value={experience.companyName}
                  onChange={(e) => handleChange(index, 'companyName', e.target.value)}
                  onBlur={onBlurValidate}
                  placeholder="Company name"
                  className={errors?.[index]?.['companyName'] ? 'border-red-500' : ''}
                  aria-invalid={!!errors?.[index]?.['companyName']}
                  aria-describedby={`company-${index}-error`}
                />
                {errors?.[index]?.['companyName'] && (
                  <p id={`company-${index}-error`} className="text-red-500 text-sm mt-1">
                    {errors[index]['companyName']?.[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`position-${index}`}>Position Title</Label>
                <Input
                  id={`position-${index}`}
                  value={experience.positionTitle}
                  onChange={(e) => handleChange(index, 'positionTitle', e.target.value)}
                  onBlur={onBlurValidate}
                  placeholder="Job title"
                  className={errors?.[index]?.['positionTitle'] ? 'border-red-500' : ''}
                  aria-invalid={!!errors?.[index]?.['positionTitle']}
                  aria-describedby={`position-${index}-error`}
                />
                {errors?.[index]?.['positionTitle'] && (
                  <p id={`position-${index}-error`} className="text-red-500 text-sm mt-1">
                    {errors[index]['positionTitle']?.[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`location-${index}`}>Location</Label>
                <Input
                  id={`location-${index}`}
                  value={experience.location || ''}
                  onChange={(e) => handleChange(index, 'location', e.target.value)}
                  onBlur={onBlurValidate}
                  placeholder="City, State"
                  className={errors?.[index]?.['location'] ? 'border-red-500' : ''}
                  aria-invalid={!!errors?.[index]?.['location']}
                  aria-describedby={`location-${index}-error`}
                />
                {errors?.[index]?.['location'] && (
                  <p id={`location-${index}-error`} className="text-red-500 text-sm mt-1">
                    {errors[index]['location']?.[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`experienceType-${index}`}>Experience Type</Label>
                <Input
                  id={`experienceType-${index}`}
                  value={experience.experienceType || ''}
                  onChange={(e) => handleChange(index, 'experienceType', e.target.value)}
                  onBlur={onBlurValidate}
                  placeholder="Full-time, Part-time, etc."
                  className={errors?.[index]?.['experienceType'] ? 'border-red-500' : ''}
                  aria-invalid={!!errors?.[index]?.['experienceType']}
                  aria-describedby={`experienceType-${index}-error`}
                />
                {errors?.[index]?.['experienceType'] && (
                  <p id={`experienceType-${index}-error`} className="text-red-500 text-sm mt-1">
                    {errors[index]['experienceType']?.[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`startDate-${index}`}>Start Date</Label>
                <Input
                  id={`startDate-${index}`}
                  type="month"
                  value={experience.startDate}
                  onChange={(e) => handleChange(index, 'startDate', e.target.value)}
                  onBlur={onBlurValidate}
                  className={errors?.[index]?.['startDate'] ? 'border-red-500' : ''}
                  aria-invalid={!!errors?.[index]?.['startDate']}
                  aria-describedby={`startDate-${index}-error`}
                />
                {errors?.[index]?.['startDate'] && (
                  <p id={`startDate-${index}-error`} className="text-red-500 text-sm mt-1">
                    {errors[index]['startDate']?.[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`endDate-${index}`}>End Date</Label>
                <Input
                  id={`endDate-${index}`}
                  type="month"
                  value={experience.endDate || ''}
                  onChange={(e) => handleChange(index, 'endDate', e.target.value)}
                  onBlur={onBlurValidate}
                  disabled={experience.currentlyWorkHere}
                  className={errors?.[index]?.['endDate'] ? 'border-red-500' : ''}
                  aria-invalid={!!errors?.[index]?.['endDate']}
                  aria-describedby={`endDate-${index}-error`}
                />
                {errors?.[index]?.['endDate'] && (
                  <p id={`endDate-${index}-error`} className="text-red-500 text-sm mt-1">
                    {errors[index]['endDate']?.[0]}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id={`current-${index}`}
                checked={experience.currentlyWorkHere}
                onCheckedChange={(checked) => handleChange(index, 'currentlyWorkHere', checked)}
              />
              <Label htmlFor={`current-${index}`}>I currently work here</Label>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              {experience.description.map((desc, descIndex) => (
                <div key={descIndex} className="flex gap-2">
                  <Textarea
                    value={desc}
                    onChange={(e) => handleDescriptionChange(index, descIndex, e.target.value)}
                    onBlur={onBlurValidate}
                    placeholder="Describe your responsibilities and achievements"
                    className={`flex-1 ${errors?.[index]?.['description']?.[descIndex] ? 'border-red-500' : ''}`}
                    aria-invalid={!!errors?.[index]?.['description']?.[descIndex]}
                    aria-describedby={`description-${index}-${descIndex}-error`}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveDescription(index, descIndex)}
                  >
                    Remove
                  </Button>
                  {errors?.[index]?.['description']?.[descIndex] && (
                    <p id={`description-${index}-${descIndex}-error`} className="text-red-500 text-sm mt-1">
                      {errors[index]['description']?.[descIndex]}
                    </p>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddDescription(index)}
              >
                Add Description Point
              </Button>
            </div>
          </div>
        </Card>
      ))}

      {experiences.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No experiences added yet. Click "Add New" to add your first experience.
        </div>
      )}
    </div>
  );
}