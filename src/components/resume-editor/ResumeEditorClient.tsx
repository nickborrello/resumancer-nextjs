'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resumeDataSchema, type ResumeFormData } from '@/lib/validation/resumeSchemas';
import { PersonalInfoSection } from './PersonalInfoSection';
import { EducationSection } from './EducationSection';
import { ExperienceSection } from './ExperienceSection';
import { ProjectsSection } from './ProjectsSection';
import { SkillsSection } from './SkillsSection';
import { ProfessionalSummarySection } from './ProfessionalSummarySection';
import { CertificationsSection } from './CertificationsSection';
import { AwardsSection } from './AwardsSection';
import { VolunteerExperienceSection } from './VolunteerExperienceSection';
import { LanguagesSection } from './LanguagesSection';
import { Button } from '@/components/ui/button';
import { Save, Download, FileText } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import ResumePreview to avoid SSR issues with PDFViewer
const ResumePreview = dynamic(
  () => import('@/components/resume-preview/ResumePreview').then(mod => mod.ResumePreview),
  { 
    ssr: false,
    loading: () => (
      <div className="bg-slate-900/30 p-4 rounded-lg border border-purple-500/30 max-h-[calc(100vh-12rem)] overflow-y-auto overflow-x-hidden">
        <div className="w-full h-full min-h-[600px] flex items-center justify-center">
          <div className="text-slate-400">Loading PDF preview...</div>
        </div>
      </div>
    )
  }
);
import { useEffect, useState, useCallback, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import type { ResumeData, Resume } from '@/types/resume';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { ResumePDFDocument } from './ResumePDFDocument';

interface ResumeEditorClientProps {
  resumeId: string;
  initialData?: Resume;
  mode: 'edit' | 'create';
}

export function ResumeEditorClient({ resumeId, initialData }: ResumeEditorClientProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Track the last saved data to prevent unnecessary saves
  const lastSavedDataRef = useRef<string | null>(null);

  const getDefaultValues = useCallback(() => {
    if (initialData) {
      return {
        personalInfo: initialData.resumeData.personalInfo,
        professionalSummary: initialData.resumeData.professionalSummary,
        education: initialData.resumeData.education,
        experiences: initialData.resumeData.experiences,
        projects: initialData.resumeData.projects,
        skills: initialData.resumeData.skills,
        certifications: initialData.resumeData.certifications,
        awards: initialData.resumeData.awards,
        volunteerExperience: initialData.resumeData.volunteerExperience,
        languages: initialData.resumeData.languages,
      };
    }

    return {
      personalInfo: { fullName: '', email: '', phone: '', location: '', linkedin: '', github: '', portfolio: '' },
      professionalSummary: '',
      education: [],
      experiences: [],
      projects: [],
      skills: [],
      certifications: [],
      awards: [],
      volunteerExperience: [],
      languages: [],
    };
  }, [initialData]);

  const methods = useForm<ResumeFormData>({
    resolver: zodResolver(resumeDataSchema),
    defaultValues: getDefaultValues(),
    mode: 'onChange',
  });

  const watchedData = methods.watch();
  const debouncedData = useDebounce(watchedData, 1500);

  const saveResume = useCallback(async (data: ResumeFormData) => {
    if (resumeId === 'test-resume-demo') {
      console.log('ℹ️ Demo resume - changes not saved');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        console.log('✅ Resume saved to backend');
      } else {
        console.warn('⚠️ Backend save failed, using localStorage fallback');
      }

      localStorage.setItem(`resume-draft-${resumeId}`, JSON.stringify({
        data,
        savedAt: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Failed to save resume:', error);
    } finally {
      setIsSaving(false);
    }
  }, [resumeId]);

  // Load resume data on mount
  useEffect(() => {
    const loadResume = async () => {

      if (initialData) {
        methods.reset({
          personalInfo: initialData.resumeData.personalInfo,
          professionalSummary: initialData.resumeData.professionalSummary,
          education: initialData.resumeData.education,
          experiences: initialData.resumeData.experiences,
          projects: initialData.resumeData.projects,
          skills: initialData.resumeData.skills,
          certifications: initialData.resumeData.certifications,
          awards: initialData.resumeData.awards,
          volunteerExperience: initialData.resumeData.volunteerExperience,
          languages: initialData.resumeData.languages,
        });
        console.log('✅ Resume loaded from initialData');
        return;
      }

      try {
        const response = await fetch(`/api/resumes/${resumeId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const resumeData = await response.json();
          methods.reset({
            personalInfo: resumeData.resumeData?.personalInfo || resumeData.personalInfo,
            professionalSummary: resumeData.resumeData?.professionalSummary || resumeData.professionalSummary,
            education: resumeData.resumeData?.education || resumeData.education,
            experiences: resumeData.resumeData?.experiences || resumeData.experiences,
            projects: resumeData.resumeData?.projects || resumeData.projects,
            skills: resumeData.resumeData?.skills || resumeData.skills,
            certifications: resumeData.resumeData?.certifications || resumeData.certifications,
            awards: resumeData.resumeData?.awards || resumeData.awards,
            volunteerExperience: resumeData.resumeData?.volunteerExperience || resumeData.volunteerExperience,
            languages: resumeData.resumeData?.languages || resumeData.languages,
          });
          console.log('✅ Resume loaded from backend');
          return;
        }
      } catch (error) {
        console.warn('⚠️ Failed to load from backend:', error);
      }

      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(`resume-draft-${resumeId}`);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            methods.reset(parsed.data);
            console.log('✅ Resume loaded from localStorage fallback');
          } catch (e) {
            console.error('Failed to parse saved resume:', e);
          }
        }
      }
    };

    loadResume();
  }, [resumeId, initialData, methods]);

  useEffect(() => {
    if (debouncedData && resumeId !== 'test-resume-demo') {
      const currentDataString = JSON.stringify(debouncedData);
      if (lastSavedDataRef.current !== currentDataString) {
        lastSavedDataRef.current = currentDataString;
        saveResume(debouncedData);
      }
    }
  }, [debouncedData, saveResume, resumeId]);

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const currentData = methods.getValues();
      
      const resumeData: ResumeData = {
        personalInfo: currentData.personalInfo,
        professionalSummary: currentData.professionalSummary || '',
        experiences: (currentData.experiences || []).map(exp => ({
          ...exp,
          isCurrent: exp.isCurrent || false,
          bulletPoints: exp.bulletPoints || [],
        })),
        education: (currentData.education || []).map(edu => ({
          ...edu,
          endDate: edu.endDate || '',
        })),
        projects: (currentData.projects || []).map(project => ({
          ...project,
          technologies: project.technologies || [],
          bulletPoints: project.bulletPoints || [],
        })),
        skills: currentData.skills || [],
        certifications: currentData.certifications || [],
        awards: currentData.awards || [],
        volunteerExperience: (currentData.volunteerExperience || []).map(vol => ({
          ...vol,
          isCurrent: vol.isCurrent || false,
          bulletPoints: vol.bulletPoints || [],
        })),
        languages: currentData.languages || [],
      };
      
      const pdfDocument = <ResumePDFDocument data={resumeData} />;
      const blob = await pdf(pdfDocument).toBlob();
      
      const fileName = currentData.personalInfo.fullName
        ? `${currentData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`
        : 'Resume.pdf';
      
      saveAs(blob, fileName);
      console.log('✅ PDF generated and downloaded successfully');
    } catch (error) {
      console.error('❌ Failed to generate PDF:', error);
      // alert('Failed to generate PDF. Please try again.'); // Avoid alert
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const onSubmit = async (data: ResumeFormData) => {
    if (resumeId !== 'test-resume-demo') {
      await saveResume(data);
    }
  };

  return (
    // Root container: Full screen, flex column, no overflow
    <div className="h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex flex-col overflow-hidden text-slate-200">
      
      <FormProvider {...methods}>
        {/* 2. Main content area: Flex row, takes remaining space, no overflow */}
        <form id="resume-form" onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-1 overflow-hidden">
          
          {/* 3. Sidebar Navigation: 10% width */}
          <div className="basis-[10%] border-r border-slate-700 bg-slate-900/50 flex-shrink-0 flex flex-col min-w-0">
            <h3 className="text-lg font-semibold text-purple-300 mb-4 p-4 pb-0">Resume Sections</h3>
            <nav className="flex-1 overflow-y-auto space-y-2 p-4">
              <button
                type="button"
                onClick={() => setActiveTab('personal')}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  activeTab === 'personal'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <FileText className="h-4 w-4 inline mr-2" />
                Personal Info
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('summary')}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  activeTab === 'summary'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                Summary
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('experience')}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  activeTab === 'experience'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                Experience
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('education')}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  activeTab === 'education'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                Education
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('projects')}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  activeTab === 'projects'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                Projects
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('skills')}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  activeTab === 'skills'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                Skills
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('certifications')}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  activeTab === 'certifications'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                Certifications
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('awards')}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  activeTab === 'awards'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                Awards
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('volunteer')}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  activeTab === 'volunteer'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                Volunteer
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('languages')}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  activeTab === 'languages'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                Languages
              </button>
            </nav>
            <div className="p-4 border-t border-slate-700 flex gap-2 flex-shrink-0">
              <Button 
                type="button" 
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs px-2 py-1 rounded flex items-center gap-1 disabled:opacity-50 flex-1"
              >
                <Download className="h-3 w-3" />
                {isGeneratingPDF ? '...' : 'PDF'}
              </Button>
              <Button 
                type="submit" 
                form="resume-form"
                disabled={isSaving} 
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white disabled:opacity-50 disabled:cursor-not-allowed text-xs px-2 py-1 rounded flex items-center gap-1 flex-1"
              >
                <Save className="h-3 w-3" />
                {isSaving ? '...' : 'Save'}
              </Button>
            </div>
          </div>

          {/* 4. Form Content: 30% width */}
          <div className="basis-[30%] p-2 h-full min-w-0">
            <div className="max-w-3xl mx-auto h-full flex flex-col">
              {activeTab === 'personal' && <PersonalInfoSection />}
              {activeTab === 'summary' && <ProfessionalSummarySection />}
              {activeTab === 'experience' && <ExperienceSection />}
              {activeTab === 'education' && <EducationSection />}
              {activeTab === 'projects' && <ProjectsSection />}
              {activeTab === 'skills' && <SkillsSection />}
              {activeTab === 'certifications' && <CertificationsSection />}
              {activeTab === 'awards' && <AwardsSection />}
              {activeTab === 'volunteer' && <VolunteerExperienceSection />}
              {activeTab === 'languages' && <LanguagesSection />}
            </div>
          </div>

          {/* 5. Right Panel: 60% width (Resume 40% + AI 20%) */}  
          <div className="basis-[60%] border-l border-slate-700 bg-slate-900/30 flex-shrink-0 flex overflow-hidden min-w-0">
            {/* Live Preview: 40% of total width (66.67% of right panel) */}
            <div className="basis-[66.67%] border-r border-slate-700 flex flex-col overflow-hidden min-w-0">
              <div className="flex-1 overflow-y-auto">
                <ResumePreview />
              </div>
            </div>
            
            {/* AI Agent Chat: 20% of total width (33.33% of right panel) */}
            <div className="basis-[33.33%] bg-slate-900/50 flex flex-col overflow-hidden min-w-0">
              <div className="p-4 border-b border-slate-700 flex-shrink-0">
                <h3 className="text-lg font-semibold text-purple-300">AI Assistant</h3>
                <p className="text-sm text-slate-400 mt-1">Coming soon...</p>
              </div>
              <div className="flex-1 flex items-center justify-center text-slate-500">
                <div className="text-center">
                  <div className="text-4xl mb-4">🤖</div>
                  <p>AI Agent Chat</p>
                  <p className="text-xs mt-2">Space reserved for future implementation</p>
                </div>
              </div>
            </div>
          </div>

        </form>
      </FormProvider>
    </div>
  );
}