'use client';

import { useFieldArray, useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, X } from 'lucide-react';
import type { ResumeFormData } from '@/lib/validation/resumeSchemas';
import { useState } from 'react';

export function ProjectsSection() {
  const { control } = useFormContext<ResumeFormData>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'projects',
  });

  const addProject = () => {
    append({
      id: crypto.randomUUID(),
      name: '',
      link: '',
      technologies: [],
      bulletPoints: [{ id: crypto.randomUUID(), content: '' }],
    });
  };

  return (
    <Card className="bg-slate-900/50 border-purple-500/30 h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <CardTitle className="text-purple-300">Projects</CardTitle>
            <CardDescription className="text-slate-400">
              Notable projects and side work
            </CardDescription>
          </div>
          <Button
            type="button"
            onClick={addProject}
            variant="outline"
            size="sm"
            className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Project
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="space-y-4">
            {fields.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <p>No projects yet. Click "Add Project" to showcase your work.</p>
              </div>
            )}

            {fields.map((field, index) => (
              <ProjectEntry key={field.id} index={index} remove={remove} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function ProjectEntry({
  index,
  remove,
}: {
  index: number;
  remove: (index: number) => void;
}) {
  const { register, watch, setValue, formState: { errors } } = useFormContext<ResumeFormData>();

  const technologies = watch(`projects.${index}.technologies`) || [];
  const [techInput, setTechInput] = useState('');

  const addTechnology = () => {
    if (techInput.trim()) {
      setValue(`projects.${index}.technologies`, [...technologies, techInput.trim()]);
      setTechInput('');
    }
  };

  const removeTechnology = (techIndex: number) => {
    setValue(
      `projects.${index}.technologies`,
      technologies.filter((_, i) => i !== techIndex)
    );
  };

  const handleTechKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTechnology();
    }
  };

  return (
    <div className="p-4 border border-slate-700 rounded-lg bg-slate-800/50 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-purple-300">
          Project Entry {index + 1}
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

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`projects.${index}.name`} className="text-slate-200">
            Project Name <span className="text-red-400">*</span>
          </Label>
          <Input
            {...register(`projects.${index}.name`)}
            placeholder="E-commerce Platform"
            className="bg-slate-800 border-slate-700 text-slate-100"
          />
          {errors.projects?.[index]?.name && (
            <p className="text-sm text-red-400">
              {errors.projects[index]?.name?.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-slate-200">
            Project Details <span className="text-red-400">*</span>
          </Label>
          <div className="space-y-2">
            <Textarea
              {...register(`projects.${index}.bulletPoints.0.content`)}
              placeholder="Describe what the project does, your role, and the impact..."
              rows={4}
              className="bg-slate-800 border-slate-700 text-slate-100"
            />
          </div>
          {errors.projects?.[index]?.bulletPoints && (
            <p className="text-sm text-red-400">
              {errors.projects[index]?.bulletPoints?.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-slate-200">
            Technologies <span className="text-red-400">*</span>
          </Label>
          <div className="flex gap-2">
            <Input
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={handleTechKeyDown}
              placeholder="React, Node.js, PostgreSQL..."
              className="bg-slate-800 border-slate-700 text-slate-100 flex-1"
            />
            <Button
              type="button"
              onClick={addTechnology}
              variant="outline"
              size="sm"
              className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {technologies.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {technologies.map((tech, techIndex) => (
                <Badge
                  key={techIndex}
                  variant="secondary"
                  className="bg-purple-500/20 text-purple-300 border-purple-500/30"
                >
                  {tech}
                  <button
                    type="button"
                    onClick={() => removeTechnology(techIndex)}
                    className="ml-1 hover:text-purple-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          {errors.projects?.[index]?.technologies && (
            <p className="text-sm text-red-400">
              {errors.projects[index]?.technologies?.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`projects.${index}.link`} className="text-slate-200">
              Project Link
            </Label>
            <Input
              {...register(`projects.${index}.link`)}
              type="url"
              placeholder="https://github.com/..."
              className="bg-slate-800 border-slate-700 text-slate-100"
            />
            {errors.projects?.[index]?.link && (
              <p className="text-sm text-red-400">
                {errors.projects[index]?.link?.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}





