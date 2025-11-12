'use client';

import { useFormContext, useWatch } from 'react-hook-form';
import type { ResumeFormData } from '@/lib/validation/resumeSchemas';
import type { ResumeData } from '@/types/resume';
import { useMemo } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { resumeTheme } from './resume-theme';

export function ResumePreview() {
  const { control } = useFormContext<ResumeFormData>();
  const formData = useWatch({ control });
  const debouncedFormData = useDebounce(formData, 800); // 800ms debounce

  // Transform form data to match ResumeData structure for consistency with PDF
  const resumeData: ResumeData = useMemo(() => ({
    personalInfo: {
      fullName: debouncedFormData?.personalInfo?.fullName || '',
      email: debouncedFormData?.personalInfo?.email || '',
      phone: debouncedFormData?.personalInfo?.phone || '',
      location: debouncedFormData?.personalInfo?.location || '',
      linkedin: debouncedFormData?.personalInfo?.linkedin || '',
      github: debouncedFormData?.personalInfo?.github || '',
      portfolio: debouncedFormData?.personalInfo?.portfolio || '',
    },
    professionalSummary: debouncedFormData?.professionalSummary || '',
    experiences: (debouncedFormData?.experiences || []).map((exp) => ({
      id: exp.id || '',
      company: exp.company || '',
      jobTitle: exp.jobTitle || '',
      location: exp.location || '',
      startDate: exp.startDate || '',
      endDate: exp.endDate || '',
      isCurrent: exp.isCurrent || false,
      bulletPoints: (exp.bulletPoints || []).map((bullet) => ({
        id: bullet.id || '',
        content: bullet.content || '',
      })),
    })),
    education: (debouncedFormData?.education || []).map((edu) => ({
      id: edu.id || '',
      school: edu.school || '',
      degree: edu.degree || '',
      fieldOfStudy: edu.fieldOfStudy || '',
      location: edu.location || '',
      startDate: edu.startDate || '',
      endDate: edu.endDate || '',
      gpa: edu.gpa || '',
    })),
    projects: (debouncedFormData?.projects || []).map((project) => ({
      id: project.id || '',
      name: project.name || '',
      link: project.link || '',
      technologies: project.technologies || [],
      bulletPoints: (project.bulletPoints || []).map((bullet) => ({
        id: bullet.id || '',
        content: bullet.content || '',
      })),
    })),
    skills: (debouncedFormData?.skills || []).map((skill) => ({
      id: skill.id || '',
      category: skill.category || '',
      list: skill.list || [],
    })),
  }), [debouncedFormData]);

  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: 'calc(100vh - 16rem)',
    minHeight: '600px',
    backgroundColor: resumeTheme.colors.background,
    color: resumeTheme.colors.text,
    fontFamily: resumeTheme.fontFamily,
    padding: `${resumeTheme.spacing.xlarge}px`,
    overflowY: 'auto',
    boxSizing: 'border-box',
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: `${resumeTheme.spacing.xlarge}px`,
  };

  const headingStyle: React.CSSProperties = {
    fontSize: `${resumeTheme.fontSize.heading}px`,
    fontWeight: 'bold',
    color: resumeTheme.colors.primary,
    marginBottom: `${resumeTheme.spacing.medium}px`,
    lineHeight: resumeTheme.lineHeight.heading,
  };

  const subheadingStyle: React.CSSProperties = {
    fontSize: `${resumeTheme.fontSize.subheading}px`,
    fontWeight: 'bold',
    color: resumeTheme.colors.accent,
    marginBottom: `${resumeTheme.spacing.small}px`,
  };

  const bodyStyle: React.CSSProperties = {
    fontSize: `${resumeTheme.fontSize.body}px`,
    lineHeight: resumeTheme.lineHeight.body,
    marginBottom: `${resumeTheme.spacing.small}px`,
    color: resumeTheme.colors.text,
  };

  const contactItemStyle: React.CSSProperties = {
    fontSize: `${resumeTheme.fontSize.small}px`,
    color: resumeTheme.colors.subtleText,
    marginRight: `${resumeTheme.spacing.medium}px`,
    marginBottom: `${resumeTheme.spacing.small}px`,
  };

  const bulletStyle: React.CSSProperties = {
    fontSize: `${resumeTheme.fontSize.body}px`,
    lineHeight: resumeTheme.lineHeight.body,
    marginBottom: `${resumeTheme.spacing.small}px`,
    marginLeft: `${resumeTheme.spacing.medium}px`,
    color: resumeTheme.colors.text,
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .resume-preview * {
            color: ${resumeTheme.colors.text} !important;
          }
          .resume-preview h1, .resume-preview h2, .resume-preview h3 {
            color: ${resumeTheme.colors.primary} !important;
          }
          .resume-preview h2, .resume-preview h3 {
            color: ${resumeTheme.colors.accent} !important;
          }
          .resume-preview .contact-item {
            color: ${resumeTheme.colors.subtleText} !important;
          }
          .resume-preview .subtle-text {
            color: ${resumeTheme.colors.subtleText} !important;
          }
          .resume-preview a {
            color: ${resumeTheme.colors.accent} !important;
          }
        `
      }} />
      <div style={containerStyle} className="resume-preview">
        {/* Personal Info */}
        <div style={sectionStyle}>
          <h1 style={headingStyle}>{resumeData.personalInfo.fullName}</h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: `${resumeTheme.spacing.small}px` }}>
            {resumeData.personalInfo.email && <span style={contactItemStyle} className="contact-item">{resumeData.personalInfo.email}</span>}
            {resumeData.personalInfo.phone && <span style={contactItemStyle} className="contact-item">• {resumeData.personalInfo.phone}</span>}
            {resumeData.personalInfo.location && <span style={contactItemStyle} className="contact-item">• {resumeData.personalInfo.location}</span>}
            {resumeData.personalInfo.linkedin && <span style={contactItemStyle} className="contact-item">• {resumeData.personalInfo.linkedin}</span>}
            {resumeData.personalInfo.github && <span style={contactItemStyle} className="contact-item">• {resumeData.personalInfo.github}</span>}
            {resumeData.personalInfo.portfolio && <span style={contactItemStyle} className="contact-item">• {resumeData.personalInfo.portfolio}</span>}
          </div>
        </div>

      {/* Professional Summary */}
      {resumeData.professionalSummary && (
        <div style={sectionStyle}>
          <h2 style={subheadingStyle}>Professional Summary</h2>
          <p style={bodyStyle}>{resumeData.professionalSummary}</p>
        </div>
      )}

      {/* Experience */}
      {resumeData.experiences.length > 0 && (
        <div style={sectionStyle}>
          <h2 style={subheadingStyle}>Experience</h2>
          {resumeData.experiences.map((exp) => (
            <div key={exp.id} style={{ marginBottom: `${resumeTheme.spacing.large}px` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: `${resumeTheme.spacing.small}px` }}>
                <h3 style={{ ...subheadingStyle, fontSize: `${resumeTheme.fontSize.body}px`, marginBottom: 0 }}>{exp.jobTitle}</h3>
                <span style={{ ...bodyStyle, fontSize: `${resumeTheme.fontSize.small}px` }} className="subtle-text">
                  {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: `${resumeTheme.spacing.small}px` }}>
                <span style={{ ...bodyStyle, fontWeight: 'bold' }}>{exp.company}</span>
                {exp.location && <span style={bodyStyle}>{exp.location}</span>}
              </div>
              {exp.bulletPoints.map((bullet) => (
                <div key={bullet.id} style={bulletStyle}>
                  • {bullet.content}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {resumeData.education.length > 0 && (
        <div style={sectionStyle}>
          <h2 style={subheadingStyle}>Education</h2>
          {resumeData.education.map((edu) => (
            <div key={edu.id} style={{ marginBottom: `${resumeTheme.spacing.large}px` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: `${resumeTheme.spacing.small}px` }}>
                <h3 style={{ ...subheadingStyle, fontSize: `${resumeTheme.fontSize.body}px`, marginBottom: 0 }}>{edu.degree} in {edu.fieldOfStudy}</h3>
                <span style={{ ...bodyStyle, fontSize: `${resumeTheme.fontSize.small}px` }} className="subtle-text">
                  {edu.startDate} - {edu.endDate}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ ...bodyStyle, fontWeight: 'bold' }}>{edu.school}</span>
                {edu.location && <span style={bodyStyle}>{edu.location}</span>}
              </div>
              {edu.gpa && <div style={{ ...bodyStyle, fontSize: `${resumeTheme.fontSize.small}px` }} className="subtle-text">GPA: {edu.gpa}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {resumeData.projects.length > 0 && (
        <div style={sectionStyle}>
          <h2 style={subheadingStyle}>Projects</h2>
          {resumeData.projects.map((project) => (
            <div key={project.id} style={{ marginBottom: `${resumeTheme.spacing.large}px` }}>
              <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: `${resumeTheme.spacing.small}px` }}>
                <h3 style={{ ...subheadingStyle, fontSize: `${resumeTheme.fontSize.body}px`, marginBottom: 0, marginRight: `${resumeTheme.spacing.small}px` }}>{project.name}</h3>
                {project.link && <a href={project.link} style={{ ...bodyStyle, fontSize: `${resumeTheme.fontSize.small}px`, textDecoration: 'none' }}>{project.link}</a>}
              </div>
              {project.technologies.length > 0 && (
                <div style={{ ...bodyStyle, fontSize: `${resumeTheme.fontSize.small}px`, marginBottom: `${resumeTheme.spacing.small}px` }} className="subtle-text">
                  Technologies: {project.technologies.join(', ')}
                </div>
              )}
              {project.bulletPoints.map((bullet) => (
                <div key={bullet.id} style={bulletStyle}>
                  • {bullet.content}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {resumeData.skills.length > 0 && (
        <div style={sectionStyle}>
          <h2 style={subheadingStyle}>Skills</h2>
          {resumeData.skills.map((skill) => (
            <div key={skill.id} style={{ marginBottom: `${resumeTheme.spacing.medium}px` }}>
              <h3 style={{ ...subheadingStyle, fontSize: `${resumeTheme.fontSize.body}px`, marginBottom: `${resumeTheme.spacing.small}px` }}>{skill.category}</h3>
              <div style={bodyStyle}>{skill.list.join(', ')}</div>
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  );
}