'use client';

import { useFieldArray, useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, X } from 'lucide-react';
import type { ResumeFormData } from '@/lib/validation/resumeSchemas';
import { useState } from 'react';

export function SkillsSection() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { control, formState: { errors: _errors } } = useFormContext<ResumeFormData>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'skills',
  });

  const addSkillCategory = () => {
    append({ id: crypto.randomUUID(), category: "", list: [] });
  };

  return (
    <Card className="bg-slate-900/50 border-purple-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-purple-300">Skills</CardTitle>
            <CardDescription className="text-slate-400">
              Your technical and professional skills by category
            </CardDescription>
          </div>
          <Button
            type="button"
            onClick={addSkillCategory}
            variant="outline"
            size="sm"
            className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Category
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {fields.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <p>No skill categories yet. Click "Add Category" to organize your skills.</p>
          </div>
        )}

        {fields.map((field, index) => (
          <SkillCategoryEntry key={field.id} index={index} remove={remove} />
        ))}
      </CardContent>
    </Card>
  );
}

function SkillCategoryEntry({
  index,
  remove,
}: {
  index: number;
  remove: (index: number) => void;
}) {
  const { register, watch, setValue, formState: { errors: _errors } } = useFormContext<ResumeFormData>();

  const skills = watch(`skills.${index}.list`) || [];
  const [skillInput, setSkillInput] = useState('');

  const addSkill = () => {
    if (skillInput.trim()) {
      setValue(`skills.${index}.list`, [...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillIndex: number) => {
    setValue(
      `skills.${index}.list`,
      skills.filter((_, i) => i !== skillIndex)
    );
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div className="p-4 border border-slate-700 rounded-lg bg-slate-800/50 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-purple-300">
          Skill Category {index + 1}
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

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`skills.${index}.category`} className="text-slate-200">
            Category Name <span className="text-red-400">*</span>
          </Label>
          <Input
            {...register(`skills.${index}.category`)}
            placeholder="Programming Languages, Frameworks, Tools..."
            className="bg-slate-800 border-slate-700 text-slate-100"
          />
          {_errors.skills?.[index]?.category && (
            <p className="text-sm text-red-400">
              {_errors.skills[index]?.category?.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-slate-200">
            Skills <span className="text-red-400">*</span>
          </Label>
          <div className="flex gap-2">
            <Input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleSkillKeyDown}
              placeholder="JavaScript, React, Git..."
              className="bg-slate-800 border-slate-700 text-slate-100 flex-1"
            />
            <Button
              type="button"
              onClick={addSkill}
              variant="outline"
              size="sm"
              className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {skills.map((skill, skillIndex) => (
                <Badge
                  key={skillIndex}
                  variant="secondary"
                  className="bg-purple-500/20 text-purple-300 border-purple-500/30"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skillIndex)}
                    className="ml-1 hover:text-purple-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          {_errors.skills?.[index]?.list && (
            <p className="text-sm text-red-400">
              {_errors.skills[index]?.list?.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}













