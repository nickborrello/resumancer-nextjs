'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import type { Project } from '@/types/profile';

interface ProjectsFormProps {
  projects: Project[];
  onChange: (projects: Project[]) => void;
  errors?: Record<number, Record<string, string[]>>;
  onBlurValidate?: () => void;
}

export default function ProjectsForm({ projects, onChange, errors = {}, onBlurValidate }: ProjectsFormProps) {
  const handleAddProject = () => {
    const newProject: Project = {
      projectName: '',
      description: [],
      technologies: [],
      startDate: '',
      endDate: '',
      currentlyWorkingOn: false,
      projectUrl: '',
    };
    onChange([...projects, newProject]);
    onBlurValidate?.(); // Trigger validation after adding new entry
  };

  const handleRemoveProject = (index: number) => {
    if (confirm('Are you sure you want to remove this project?')) {
      const updated = projects.filter((_, i) => i !== index);
      onChange(updated);
      onBlurValidate?.(); // Trigger validation after removing entry
    }
  };

  const handleChangeProject = (index: number, field: keyof Project, value: any) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value } as Project;
    onChange(updated);
  };

  const handleAddBullet = (projectIndex: number) => {
    const updated = [...projects];
    updated[projectIndex]!.description = [...updated[projectIndex]!.description, ''];
    onChange(updated);
    onBlurValidate?.(); // Trigger validation after adding new entry
  };

  const handleRemoveBullet = (projectIndex: number, bulletIndex: number) => {
    const updated = [...projects];
    updated[projectIndex]!.description = updated[projectIndex]!.description.filter((_, i) => i !== bulletIndex);
    onChange(updated);
    onBlurValidate?.(); // Trigger validation after removing entry
  };

  const handleChangeBullet = (projectIndex: number, bulletIndex: number, value: string) => {
    const updated = [...projects];
    updated[projectIndex]!.description[bulletIndex] = value;
    onChange(updated);
  };

  const handleChangeTechnologies = (projectIndex: number, value: string) => {
    const technologies = value.split(',').map(tech => tech.trim()).filter(tech => tech.length > 0);
    handleChangeProject(projectIndex, 'technologies', technologies);
  };

  return (
    <div className="space-y-4">
      {projects.map((project, index) => (
        <Card key={index} className="border border-amethyst-500/20 hover:border-amethyst-500/40 p-6">
          <div className="space-y-4">
            {/* Project Name */}
            <div>
              <Label className="bg-gradient-to-r from-amethyst-400 to-purple-500 bg-clip-text text-transparent font-semibold">
                Project Name
              </Label>
              <Input
                placeholder="e.g., E-commerce Platform"
                value={project.projectName}
                onChange={(e) => handleChangeProject(index, 'projectName', e.target.value)}
                onBlur={onBlurValidate}
                className={`mt-1 ${errors?.[index]?.['projectName'] ? 'border-red-500' : ''}`}
                aria-invalid={!!errors?.[index]?.['projectName']}
                aria-describedby={`projectName-${index}-error`}
              />
              {errors?.[index]?.['projectName'] && (
                <p id={`projectName-${index}-error`} className="text-red-500 text-sm mt-1">
                  {errors[index]['projectName']?.[0]}
                </p>
              )}
            </div>

            {/* Project URL */}
            <div>
              <Label className="bg-gradient-to-r from-amethyst-400 to-purple-500 bg-clip-text text-transparent font-semibold">
                Project URL (Optional)
              </Label>
              <Input
                type="url"
                placeholder="https://github.com/username/project"
                value={project.projectUrl}
                onChange={(e) => handleChangeProject(index, 'projectUrl', e.target.value)}
                onBlur={onBlurValidate}
                className={`mt-1 ${errors?.[index]?.['projectUrl'] ? 'border-red-500' : ''}`}
                aria-invalid={!!errors?.[index]?.['projectUrl']}
                aria-describedby={`projectUrl-${index}-error`}
              />
              {errors?.[index]?.['projectUrl'] && (
                <p id={`projectUrl-${index}-error`} className="text-red-500 text-sm mt-1">
                  {errors[index]['projectUrl']?.[0]}
                </p>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="bg-gradient-to-r from-amethyst-400 to-purple-500 bg-clip-text text-transparent font-semibold">
                  Start Date
                </Label>
                <Input
                  type="date"
                  value={project.startDate}
                  onChange={(e) => handleChangeProject(index, 'startDate', e.target.value)}
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
              <div>
                <Label className="bg-gradient-to-r from-amethyst-400 to-purple-500 bg-clip-text text-transparent font-semibold">
                  End Date
                </Label>
                <Input
                  type="date"
                  value={project.endDate}
                  onChange={(e) => handleChangeProject(index, 'endDate', e.target.value)}
                  onBlur={onBlurValidate}
                  disabled={project.currentlyWorkingOn}
                  className={`mt-1 disabled:opacity-50 ${errors?.[index]?.['endDate'] ? 'border-red-500' : ''}`}
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
                  id={`currentlyWorkingOn-${index}`}
                  checked={project.currentlyWorkingOn}
                  onCheckedChange={(checked) => {
                    handleChangeProject(index, 'currentlyWorkingOn', checked);
                    if (checked) {
                      handleChangeProject(index, 'endDate', '');
                    }
                  }}
                />
                <Label
                  htmlFor={`currentlyWorkingOn-${index}`}
                  className="bg-gradient-to-r from-amethyst-400 to-purple-500 bg-clip-text text-transparent font-semibold"
                >
                  Currently Working On
                </Label>
              </div>
            </div>

            {/* Description Bullets */}
            <div>
              <Label className="bg-gradient-to-r from-amethyst-400 to-purple-500 bg-clip-text text-transparent font-semibold">
                Project Description
              </Label>
              <div className="mt-2 space-y-2">
                {project.description.map((bullet, bulletIndex) => (
                  <div key={bulletIndex} className="flex items-center gap-2">
                    <span className="text-amethyst-400">•</span>
                    <Input
                      placeholder="Describe a key feature or responsibility..."
                      value={bullet}
                      onChange={(e) => handleChangeBullet(index, bulletIndex, e.target.value)}
                      onBlur={onBlurValidate}
                      className={`flex-1 ${errors?.[index]?.['description']?.[bulletIndex] ? 'border-red-500' : ''}`}
                      aria-invalid={!!errors?.[index]?.['description']?.[bulletIndex]}
                      aria-describedby={`description-${index}-${bulletIndex}-error`}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveBullet(index, bulletIndex)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </Button>
                    {errors?.[index]?.['description']?.[bulletIndex] && (
                      <p id={`description-${index}-${bulletIndex}-error`} className="text-red-500 text-sm mt-1">
                        {errors[index]['description']?.[bulletIndex]}
                      </p>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddBullet(index)}
                  className="border-amethyst-500/20 text-amethyst-400 hover:bg-amethyst-500/10"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Bullet Point
                </Button>
              </div>
            </div>

            {/* Technologies */}
            <div>
              <Label className="bg-gradient-to-r from-amethyst-400 to-purple-500 bg-clip-text text-transparent font-semibold">
                Technologies Used
              </Label>
              <Input
                placeholder="React, TypeScript, Node.js"
                value={project.technologies.join(', ')}
                onChange={(e) => handleChangeTechnologies(index, e.target.value)}
                onBlur={onBlurValidate}
                className={`mt-1 ${errors?.[index]?.['technologies'] ? 'border-red-500' : ''}`}
                aria-invalid={!!errors?.[index]?.['technologies']}
                aria-describedby={`technologies-${index}-error`}
              />
              {errors?.[index]?.['technologies'] && (
                <p id={`technologies-${index}-error`} className="text-red-500 text-sm mt-1">
                  {errors[index]['technologies']?.[0]}
                </p>
              )}
              <p className="text-sm text-gray-400 mt-1">
                Separate technologies with commas
              </p>
              {project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {project.technologies.map((tech, techIndex) => (
                    <Badge key={techIndex} variant="secondary" className="bg-amethyst-500/10 text-amethyst-700">
                      {tech}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Remove Project Button */}
            <div className="flex justify-end">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleRemoveProject(index)}
              >
                Remove Project
              </Button>
            </div>
          </div>
        </Card>
      ))}

      {/* Add Project Button */}
      <Button
        onClick={handleAddProject}
        className="w-full bg-gradient-to-r from-amethyst-500 to-purple-600 hover:from-amethyst-600 hover:to-purple-700"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Project
      </Button>
    </div>
  );
}