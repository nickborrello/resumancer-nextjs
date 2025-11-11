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
import { AISuggestionsPanel } from './AISuggestionsPanel';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Download, Eye, FileText, Sparkles } from 'lucide-react';
import { ResumePreview } from '@/components/resume-preview/ResumePreview';
import { useEffect, useState, useCallback } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import type { ResumeData } from '@/types/resume';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { ResumePDFDocument } from './ResumePDFDocument';

interface ResumeEditorClientProps {
  resumeId: string;
  initialData?: ResumeData;
  mode: 'edit' | 'create';
}

export function ResumeEditorClient({ resumeId, initialData, mode }: ResumeEditorClientProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [showPreview, setShowPreview] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);

  // Load resume data from backend or localStorage
  const getDefaultValues = useCallback(() => {
    if (initialData) {
      return {
        personalInfo: initialData.personalInfo,
        professionalSummary: initialData.professionalSummary,
        education: initialData.education,
        experiences: initialData.experiences,
        projects: initialData.projects,
        skills: initialData.skills,
      };
    }

    // Try to load from localStorage as fallback
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`resume-draft-${resumeId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setLastSaved(new Date(parsed.savedAt));
          return parsed.data;
        } catch (e) {
          console.error('Failed to parse saved resume:', e);
        }
      }
    }

    return {
      personalInfo: { fullName: '', email: '', phone: '', location: '', linkedin: '', github: '', portfolio: '' },
      professionalSummary: '',
      education: [],
      experiences: [],
      projects: [],
      skills: [],
    };
  }, [initialData, resumeId]);

  const methods = useForm<ResumeFormData>({
    resolver: zodResolver(resumeDataSchema),
    defaultValues: getDefaultValues(),
    mode: 'onChange',
  });

  const watchedData = methods.watch();
  const debouncedData = useDebounce(watchedData, 1500);

  // Function to get current resume data for AI suggestions
  const getCurrentResumeData = useCallback(() => methods.getValues(), [methods]);

  const saveResume = useCallback(async (data: ResumeFormData) => {
    setIsSaving(true);
    try {
      // Save to backend first (primary storage)
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

      // Always save to localStorage as backup/offline support
      localStorage.setItem(`resume-draft-${resumeId}`, JSON.stringify({
        data,
        savedAt: new Date().toISOString(),
      }));

      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save resume:', error);
    } finally {
      setIsSaving(false);
    }
  }, [resumeId]);

  // Load resume from backend on mount
  useEffect(() => {
    const loadResumeFromBackend = async () => {
      // Skip if we already have initialData
      if (initialData) return;

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
            personalInfo: resumeData.personalInfo,
            professionalSummary: resumeData.professionalSummary,
            education: resumeData.education,
            experiences: resumeData.experiences,
            projects: resumeData.projects,
            skills: resumeData.skills,
          });
          setLastSaved(new Date(resumeData.updatedAt || resumeData.createdAt));
          console.log('✅ Resume loaded from backend');
        }
      } catch (error) {
        console.warn('⚠️ Failed to load from backend, using localStorage:', error);
      }
    };

    loadResumeFromBackend();
  }, [resumeId, initialData]);

  useEffect(() => {
    if (debouncedData) {
      saveResume(debouncedData);
    }
  }, [debouncedData, saveResume]);

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      // Get current form data
      const currentData = methods.getValues();
      
      // Generate PDF blob
      const pdfDocument = <ResumePDFDocument data={currentData as ResumeData} />;
      const blob = await pdf(pdfDocument).toBlob();
      
      // Create filename from personal info or use default
      const fileName = currentData.personalInfo.fullName
        ? `${currentData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`
        : 'Resume.pdf';
      
      // Download the file
      saveAs(blob, fileName);
      
      console.log('✅ PDF generated and downloaded successfully');
    } catch (error) {
      console.error('❌ Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleApplySuggestion = (suggestion: any) => {
    // This is a simplified implementation
    // In a full implementation, you would parse the suggestion and update the specific field
    console.log('✅ Applying suggestion:', suggestion);
    
    // For now, just show an alert - you would implement the actual field update logic here
    alert(`Suggestion applied! You may need to manually update the ${suggestion.section} section with: ${suggestion.suggested}`);
  };

  const onSubmit = async (data: ResumeFormData) => {
    await saveResume(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              {mode === 'create' ? 'Create Resume' : 'Edit Resume'}
            </h1>
            <p className="text-slate-400 mt-2">
              {isSaving ? (<span className="flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />Saving...</span>) : lastSaved ? (<span className="flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full bg-green-400" />Last saved {lastSaved.toLocaleTimeString()}</span>) : 'All changes are automatically saved'}
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowAISuggestions(!showAISuggestions)}
              className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {showAISuggestions ? 'Hide' : 'Show'} AI Suggestions
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowPreview(!showPreview)}
              className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? 'Hide' : 'Show'} Preview
            </Button>
            <Button 
              type="button" 
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Download className="h-4 w-4 mr-2" />
              {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
            </Button>
          </div>
        </div>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className={`grid gap-6 ${
            showPreview && showAISuggestions ? 'grid-cols-1 lg:grid-cols-3' : 
            (showPreview || showAISuggestions) ? 'grid-cols-1 lg:grid-cols-2' : 
            'grid-cols-1'
          }`}>
            <div className="space-y-6">
              <Card className="bg-slate-900/50 border-purple-500/30">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <div className="border-b border-slate-700 px-6">
                    <TabsList className="bg-transparent">
                      <TabsTrigger value="personal" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"><FileText className="h-4 w-4 mr-2" />Personal</TabsTrigger>
                      <TabsTrigger value="summary" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">Summary</TabsTrigger>
                      <TabsTrigger value="experience" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">Experience</TabsTrigger>
                      <TabsTrigger value="education" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">Education</TabsTrigger>
                      <TabsTrigger value="projects" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">Projects</TabsTrigger>
                      <TabsTrigger value="skills" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">Skills</TabsTrigger>
                    </TabsList>
                  </div>
                  <div className="p-6">
                    <TabsContent value="personal" className="mt-0"><PersonalInfoSection /></TabsContent>
                    <TabsContent value="summary" className="mt-0"><ProfessionalSummarySection /></TabsContent>
                    <TabsContent value="experience" className="mt-0"><ExperienceSection /></TabsContent>
                    <TabsContent value="education" className="mt-0"><EducationSection /></TabsContent>
                    <TabsContent value="projects" className="mt-0"><ProjectsSection /></TabsContent>
                    <TabsContent value="skills" className="mt-0"><SkillsSection /></TabsContent>
                  </div>
                </Tabs>
              </Card>
              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"><Save className="h-4 w-4 mr-2" />{isSaving ? 'Saving...' : 'Save Changes'}</Button>
              </div>
            </div>
            {showPreview && (
              <div>
                <div className="sticky top-8">
                  <h3 className="text-lg font-semibold text-purple-300 mb-4">Live Preview</h3>
                  <div className="bg-slate-900/30 p-4 rounded-lg border border-purple-500/30 max-h-[calc(100vh-12rem)] overflow-y-auto">
                    <div className="scale-[0.65] origin-top-left w-[154%]">
                      <ResumePreview />
                    </div>
                  </div>
                </div>
              </div>
            )}
            {showAISuggestions && (
              <div>
                <div className="sticky top-8">
                  <AISuggestionsPanel
                    getResumeData={getCurrentResumeData}
                    onApplySuggestion={handleApplySuggestion}
                    className="max-h-[calc(100vh-8rem)] overflow-y-auto"
                  />
                </div>
              </div>
            )}
          </form>
        </FormProvider>
      </div>
    </div>
  );
}




