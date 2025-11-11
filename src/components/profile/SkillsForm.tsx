import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import type { SkillCategory } from '@/types/profile';

/**
 * Props for the SkillsForm component.
 * Supports category-based organization of skills with change handling.
 */
interface SkillsFormProps {
  /** Array of skill categories, each containing a category name and associated skills */
  skills: SkillCategory[];
  /** Callback function called when skills data changes, receives updated SkillCategory array */
  onChange: (skills: SkillCategory[]) => void;
    /** Optional error records for the skills form */
    errors?: Record<number, Record<string, string[]>>;
    onBlurValidate?: () => void;
}

/**
 * SkillsForm component for managing skills organized by categories.
 * Features category-based organization with comma-separated skill input per category.
 * Provides visual feedback through badges and supports dynamic category management.
 */
const SkillsForm: React.FC<SkillsFormProps> = ({ skills, onChange, errors = {}, onBlurValidate }) => {
  const handleAddCategory = () => {
    const newSkills = [...skills, { category: '', skills: [] }];
    onChange(newSkills);
    onBlurValidate?.(); // Trigger validation after adding new entry
  };

  const handleRemoveCategory = (index: number) => {
    if (window.confirm('Are you sure you want to remove this skill category?')) {
      const newSkills = skills.filter((_, i) => i !== index);
      onChange(newSkills);
      onBlurValidate?.(); // Trigger validation after removing entry
    }
  };

  const handleChangeCategoryName = (index: number, value: string) => {
    const newSkills = skills.map((category, i) =>
      i === index ? { ...category, category: value } : category
    );
    onChange(newSkills);
  };

  const handleChangeSkills = (index: number, value: string) => {
    const parsedSkills = value
      .split(',')
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0);
    const newSkills = skills.map((category, i) =>
      i === index ? { ...category, skills: parsedSkills } : category
    );
    onChange(newSkills);
  };

  return (
    <div className="space-y-4">
      {skills.map((skillCategory, index) => (
        <Card key={index} className="p-4 border border-amethyst-500/20 hover:border-amethyst-500/40 transition-all duration-300 mb-4">
          <div className="space-y-4">
            {/* Category Name Input */}
            <div>
              <Label htmlFor={`category-${index}`} className="bg-gradient-to-r from-amethyst-400 to-purple-500 bg-clip-text text-transparent font-semibold">
                Category Name
              </Label>
              <Input
                id={`category-${index}`}
                placeholder="e.g., Programming Languages"
                value={skillCategory.category}
                onChange={(e) => handleChangeCategoryName(index, e.target.value)}
                onBlur={onBlurValidate}
                className={errors?.[index]?.['category'] ? 'border-red-500' : ''}
                aria-invalid={!!errors?.[index]?.['category']}
                aria-describedby={`category-${index}-error`}
              />
              {errors?.[index]?.['category'] && (
                <p id={`category-${index}-error`} className="text-red-500 text-sm mt-1">
                  {errors[index]['category']?.[0]}
                </p>
              )}
            </div>

            {/* Skills Input */}
            <div>
              <Label htmlFor={`skills-${index}`}>Skills</Label>
              <Input
                id={`skills-${index}`}
                placeholder="JavaScript, Python, React"
                value={skillCategory.skills.join(', ')}
                onChange={(e) => handleChangeSkills(index, e.target.value)}
                onBlur={onBlurValidate}
                className={errors?.[index]?.['skills'] ? 'border-red-500' : ''}
                aria-invalid={!!errors?.[index]?.['skills']}
                aria-describedby={`skills-${index}-error`}
              />
              {errors?.[index]?.['skills'] && (
                <p id={`skills-${index}-error`} className="text-red-500 text-sm mt-1">
                  {errors[index]['skills']?.[0]}
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                Enter skills separated by commas
              </p>
            </div>

            {/* Skills Badges */}
            <div className="flex flex-wrap gap-2">
              {skillCategory.skills.map((skill, skillIndex) => (
                <Badge key={skillIndex} variant="secondary" className="bg-amethyst-500/10 text-amethyst-700 hover:bg-amethyst-500/20">
                  {skill}
                </Badge>
              ))}
            </div>

            {/* Remove Category Button */}
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleRemoveCategory(index)}
              className="w-full"
            >
              Remove Category
            </Button>
          </div>
        </Card>
      ))}

      {/* Add Category Button */}
      <Button
        onClick={handleAddCategory}
        className="w-full bg-amethyst-500 hover:bg-amethyst-600 text-white transition-colors"
      >
        Add Category
      </Button>
    </div>
  );
};

export default SkillsForm;