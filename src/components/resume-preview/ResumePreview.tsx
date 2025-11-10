'use client';

import { useFormContext, useWatch } from 'react-hook-form';
import type { ResumeFormData } from '@/lib/validation/resumeSchemas';
import { Card } from '@/components/ui/card';
import { Mail, Phone, MapPin, Linkedin, Github, Link as LinkIcon } from 'lucide-react';

export function ResumePreview() {
  const { control } = useFormContext<ResumeFormData>();
  const formData = useWatch({ control });

  const personalInfo = formData?.personalInfo || {};
  const professionalSummary = formData?.professionalSummary || '';
  const education = formData?.education || [];
  const experiences = formData?.experiences || [];
  const projects = formData?.projects || [];
  const skills = formData?.skills || [];

  return (
    <Card className="bg-white text-slate-900 p-8 shadow-lg min-h-[1056px] w-full max-w-[816px]">
      {/* Header */}
      <div className="border-b-2 border-slate-300 pb-4 mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          {personalInfo.fullName || 'Your Name'}
        </h1>
        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
          {personalInfo.email && (
            <div className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              <span>{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center gap-1">
              <Phone className="h-4 w-4" />
              <span>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{personalInfo.location}</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-blue-600 mt-2">
          {personalInfo.linkedin && (
            <a href={personalInfo.linkedin} className="flex items-center gap-1 hover:underline">
              <Linkedin className="h-4 w-4" />
              <span>LinkedIn</span>
            </a>
          )}
          {personalInfo.github && (
            <a href={personalInfo.github} className="flex items-center gap-1 hover:underline">
              <Github className="h-4 w-4" />
              <span>GitHub</span>
            </a>
          )}
          {personalInfo.portfolio && (
            <a href={personalInfo.portfolio} className="flex items-center gap-1 hover:underline">
              <LinkIcon className="h-4 w-4" />
              <span>Portfolio</span>
            </a>
          )}
        </div>
      </div>

      {/* Professional Summary */}
      {professionalSummary && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-300 pb-1 mb-3">
            Professional Summary
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">{professionalSummary}</p>
        </div>
      )}

      {/* Experience */}
      {experiences.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-300 pb-1 mb-3">
            Experience
          </h2>
          <div className="space-y-4">
            {experiences.map((exp, idx) => (
              <div key={exp.id || idx}>
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="font-semibold text-slate-900">{exp.position || 'Position'}</h3>
                    <p className="text-sm text-slate-700">{exp.company || 'Company'}</p>
                  </div>
                  <div className="text-sm text-slate-600 text-right">
                    <p>{exp.location}</p>
                    <p>
                      {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                    </p>
                  </div>
                </div>
                {exp.description && exp.description.length > 0 && (
                  <ul className="list-disc list-inside text-sm text-slate-700 space-y-1 mt-2">
                    {exp.description.map((bullet, bulletIdx) => (
                      <li key={bulletIdx}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-300 pb-1 mb-3">
            Projects
          </h2>
          <div className="space-y-3">
            {projects.map((project, idx) => (
              <div key={project.id || idx}>
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-slate-900">{project.name || 'Project Name'}</h3>
                  {(project.startDate || project.endDate) && (
                    <p className="text-sm text-slate-600">
                      {project.startDate} - {project.endDate}
                    </p>
                  )}
                </div>
                <p className="text-sm text-slate-700 mb-2">{project.description}</p>
                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-1">
                    {project.technologies.map((tech, techIdx) => (
                      <span
                        key={techIdx}
                        className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                {(project.link || project.github) && (
                  <div className="flex gap-3 text-xs text-blue-600 mt-1">
                    {project.link && <a href={project.link} className="hover:underline">Live Demo</a>}
                    {project.github && <a href={project.github} className="hover:underline">GitHub</a>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-300 pb-1 mb-3">
            Education
          </h2>
          <div className="space-y-3">
            {education.map((edu, idx) => (
              <div key={edu.id || idx}>
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="font-semibold text-slate-900">{edu.institution || 'Institution'}</h3>
                    <p className="text-sm text-slate-700">
                      {edu.degree} in {edu.field}
                      {edu.gpa && ` - GPA: ${edu.gpa}`}
                    </p>
                  </div>
                  <p className="text-sm text-slate-600">
                    {edu.startDate} - {edu.endDate}
                  </p>
                </div>
                {edu.description && (
                  <p className="text-sm text-slate-700 mt-1">{edu.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-300 pb-1 mb-3">
            Skills
          </h2>
          <div className="space-y-2">
            {skills.map((skillCat, idx) => (
              <div key={skillCat.id || idx}>
                <span className="font-semibold text-slate-900">{skillCat.category}: </span>
                <span className="text-sm text-slate-700">
                  {skillCat.skills?.join(', ') || ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}