'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import type { Education } from '@/types/profile';

interface EducationFormProps {
  education: Education[];
  onChange: (education: Education[]) => void;
  errors?: Record<number, Record<string, string[]>>;
  onBlurValidate?: () => void;
}

export default function EducationForm({ education, onChange, errors = {}, onBlurValidate }: EducationFormProps) {
  const handleAddEducation = () => {
    const newEducation: Education = {
      schoolName: '',
      major: '',
      degreeType: '',
      gpa: '',
      startDate: '',
      endDate: '',
      currentlyAttending: false,
      coursework: [],
    };
    onChange([...education, newEducation]);
    onBlurValidate?.(); // Trigger validation after adding new entry
  };

  const handleRemoveEducation = (index: number) => {
    if (window.confirm('Are you sure you want to remove this education entry?')) {
      const updatedEducation = education.filter((_, i) => i !== index);
      onChange(updatedEducation);
      onBlurValidate?.(); // Trigger validation after removing entry
    }
  };

  const handleChangeEducation = (index: number, field: keyof Education, value: string | number | boolean | string[]) => {
    const updatedEducation = education.map((edu, i) => {
      if (i === index) {
        const updatedEdu = { ...edu, [field]: value };
        // Special handling for currentlyAttending
        if (field === 'currentlyAttending' && value === true) {
          updatedEdu.endDate = '';
        }
        // Special handling for coursework string input
        if (field === 'coursework' && typeof value === 'string') {
          updatedEdu.coursework = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
        }
        return updatedEdu;
      }
      return edu;
    });
    onChange(updatedEducation);
  };

  return (
    <div className="space-y-4">
      {education.map((edu, index) => (
        <Card key={index} className="border border-amethyst-500/20 hover:border-amethyst-500/40 transition-colors p-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`schoolName-${index}`} className="bg-gradient-to-r from-amethyst-400 to-purple-500 bg-clip-text text-transparent font-medium">
                  School Name
                </Label>
                <Input
                  id={`schoolName-${index}`}
                  type="text"
                  value={edu.schoolName}
                  onChange={(e) => handleChangeEducation(index, 'schoolName', e.target.value)}
                  onBlur={onBlurValidate}
                  placeholder="e.g., University of California, Berkeley"
                  className={`mt-1 ${errors?.[index]?.['schoolName'] ? 'border-red-500' : ''}`}
                  aria-invalid={!!errors?.[index]?.['schoolName']}
                  aria-describedby={`schoolName-${index}-error`}
                />
                {errors?.[index]?.['schoolName'] && (
                  <p id={`schoolName-${index}-error`} className="text-red-500 text-sm mt-1">
                    {errors[index]['schoolName']?.[0]}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor={`major-${index}`} className="bg-gradient-to-r from-amethyst-400 to-purple-500 bg-clip-text text-transparent font-medium">
                  Major/Field of Study
                </Label>
                <Input
                  id={`major-${index}`}
                  type="text"
                  value={edu.major}
                  onChange={(e) => handleChangeEducation(index, 'major', e.target.value)}
                  onBlur={onBlurValidate}
                  placeholder="e.g., Computer Science"
                  className={`mt-1 ${errors?.[index]?.['major'] ? 'border-red-500' : ''}`}
                  aria-invalid={!!errors?.[index]?.['major']}
                  aria-describedby={`major-${index}-error`}
                />
                {errors?.[index]?.['major'] && (
                  <p id={`major-${index}-error`} className="text-red-500 text-sm mt-1">
                    {errors[index]['major']?.[0]}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor={`degreeType-${index}`} className="bg-gradient-to-r from-amethyst-400 to-purple-500 bg-clip-text text-transparent font-medium">
                  Degree Type
                </Label>
                <Input
                  id={`degreeType-${index}`}
                  type="text"
                  value={edu.degreeType}
                  onChange={(e) => handleChangeEducation(index, 'degreeType', e.target.value)}
                  onBlur={onBlurValidate}
                  placeholder="e.g., Bachelor's"
                  className={`mt-1 ${errors?.[index]?.['degreeType'] ? 'border-red-500' : ''}`}
                  aria-invalid={!!errors?.[index]?.['degreeType']}
                  aria-describedby={`degreeType-${index}-error`}
                />
                {errors?.[index]?.['degreeType'] && (
                  <p id={`degreeType-${index}-error`} className="text-red-500 text-sm mt-1">
                    {errors[index]['degreeType']?.[0]}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor={`gpa-${index}`} className="bg-gradient-to-r from-amethyst-400 to-purple-500 bg-clip-text text-transparent font-medium">
                  GPA (0.0 - 4.0)
                </Label>
                <Input
                  id={`gpa-${index}`}
                  type="number"
                  min="0"
                  max="4"
                  step="0.1"
                  value={edu.gpa}
                  onChange={(e) => handleChangeEducation(index, 'gpa', parseFloat(e.target.value) || 0)}
                  onBlur={onBlurValidate}
                  placeholder="e.g., 3.5"
                  className={`mt-1 ${errors?.[index]?.['gpa'] ? 'border-red-500' : ''}`}
                  aria-invalid={!!errors?.[index]?.['gpa']}
                  aria-describedby={`gpa-${index}-error`}
                />
                {errors?.[index]?.['gpa'] && (
                  <p id={`gpa-${index}-error`} className="text-red-500 text-sm mt-1">
                    {errors[index]['gpa']?.[0]}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor={`startDate-${index}`} className="bg-gradient-to-r from-amethyst-400 to-purple-500 bg-clip-text text-transparent font-medium">
                  Start Date
                </Label>
                <Input
                  id={`startDate-${index}`}
                  type="date"
                  value={edu.startDate}
                  onChange={(e) => handleChangeEducation(index, 'startDate', e.target.value)}
                  onBlur={onBlurValidate}
                  className={`mt-1 ${errors?.[index]?.['startDate'] ? 'border-red-500' : ''}`}
                  aria-invalid={!!errors?.[index]?.['startDate']}
                  aria-describedby={`startDate-${index}-error`}
                />
                {errors?.[index]?.['startDate'] && (
                  <p id={`startDate-${index}-error`} className="text-red-500 text-sm mt-1">
                    {errors[index]['startDate']?.[0]}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`endDate-${index}`} className="bg-gradient-to-r from-amethyst-400 to-purple-500 bg-clip-text text-transparent font-medium">
                  End Date
                </Label>
                <Input
                  id={`endDate-${index}`}
                  type="date"
                  value={edu.endDate}
                  onChange={(e) => handleChangeEducation(index, 'endDate', e.target.value)}
                  onBlur={onBlurValidate}
                  disabled={edu.currentlyAttending}
                  className={`mt-1 ${errors?.[index]?.['endDate'] ? 'border-red-500' : ''}`}
                  aria-invalid={!!errors?.[index]?.['endDate']}
                  aria-describedby={`endDate-${index}-error`}
                />
                {errors?.[index]?.['endDate'] && (
                  <p id={`endDate-${index}-error`} className="text-red-500 text-sm mt-1">
                    {errors[index]['endDate']?.[0]}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`currentlyAttending-${index}`}
                  checked={edu.currentlyAttending}
                  onCheckedChange={(checked) => handleChangeEducation(index, 'currentlyAttending', checked as boolean)}
                />
                <Label htmlFor={`currentlyAttending-${index}`} className="bg-gradient-to-r from-amethyst-400 to-purple-500 bg-clip-text text-transparent font-medium">
                  Currently Attending
                </Label>
              </div>
            </div>

            <div>
              <Label htmlFor={`coursework-${index}`} className="bg-gradient-to-r from-amethyst-400 to-purple-500 bg-clip-text text-transparent font-medium">
                Relevant Coursework
              </Label>
              <Input
                id={`coursework-${index}`}
                type="text"
                value={edu.coursework.join(', ')}
                onChange={(e) => handleChangeEducation(index, 'coursework', e.target.value)}
                onBlur={onBlurValidate}
                placeholder="e.g., Data Structures, Algorithms, Database Systems"
                className={`mt-1 ${errors?.[index]?.['coursework'] ? 'border-red-500' : ''}`}
                aria-invalid={!!errors?.[index]?.['coursework']}
                aria-describedby={`coursework-${index}-error`}
              />
              {errors?.[index]?.['coursework'] && (
                <p id={`coursework-${index}-error`} className="text-red-500 text-sm mt-1">
                  {errors[index]['coursework']?.[0]}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => handleRemoveEducation(index)}
                className="hover:bg-amethyst-500/10 text-red-400 hover:text-red-300"
              >
                Remove Education
              </Button>
            </div>
          </div>
        </Card>
      ))}

      <div className="flex justify-center">
        <Button
          onClick={handleAddEducation}
          className="bg-gradient-to-r from-amethyst-500 to-purple-600 hover:from-amethyst-600 hover:to-purple-700 text-white"
        >
          Add Education
        </Button>
      </div>
    </div>
  );
}