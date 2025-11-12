'use client';

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";

// Import form component types
import type { Education, Experience, Project, SkillCategory, Language, Certification, Award, Volunteer } from '@/types/profile';

// Import form components
import EducationForm from "@/components/profile/EducationForm";
import ExperienceForm from "@/components/profile/ExperienceForm";
import ProjectsForm from "@/components/profile/ProjectsForm";
import SkillsForm from "@/components/profile/SkillsForm";
import ProfessionalSummaryForm from "@/components/profile/ProfessionalSummaryForm";
import LanguagesForm from "@/components/profile/LanguagesForm";
import CertificationsForm from "@/components/profile/CertificationsForm";
import AwardsForm from "@/components/profile/AwardsForm";
import VolunteerForm from "@/components/profile/VolunteerForm";

// Import CollapsibleSection
import { CollapsibleSection } from "@/components/profile/CollapsibleSection";

// Import Skeleton
import ProfilePageSkeleton from "@/components/profile/ProfilePageSkeleton";

// Import toast
import { useToast } from "@/hooks/use-toast";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Import Zod schema for validation
import { ProfileDataSchema } from "@/types/profile";
import * as Sentry from "@sentry/nextjs";

// Import useDebounce hook
import { useDebounce } from "@/hooks/useDebounce";

// Define a type for the form errors
type FormErrors = {
  [key: string]: string[] | FormErrors[] | undefined;
};

// Helper function for deep equality check (moved before usage)
const deepEqual = (a: any, b: any): boolean => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
      if (!keysB.includes(key) || !deepEqual(a[key], b[key])) return false;
    }
    return true;
  }
  return false;
};

export default function ProfilePage() {
  // --- 1. HOOKS (Must be at the top) ---
  const { data: session, status: sessionStatus } = useSession();
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    address: '',
    address2: '',
    postalCode: '',
    linkedin: '',
    portfolio: '',
    github: '',
    otherUrl: '',
  });

  // Profile section states
  const [professionalSummary, setProfessionalSummary] = useState('');
  const [education, setEducation] = useState<Education[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<SkillCategory[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [volunteer, setVolunteer] = useState<Volunteer[]>([]);

  // UI and Error states
  const [uiStatus, setUIStatus] = useState<'idle' | 'loading' | 'saving' | 'error'>('loading');
  const [errors, setErrors] = useState<FormErrors>({});
  const [preSaveErrors, setPreSaveErrors] = useState<string[]>([]);

  // Refs for request management and auto-save logic
  const abortControllerRef = useRef<AbortController | null>(null);
  const autoSaveAbortControllerRef = useRef<AbortController | null>(null);
  const isInitialMount = useRef(true);
  const lastSavedData = useRef<{ formData: typeof formData, professionalSummary: string, education: Education[], experiences: Experience[], projects: Project[], skills: SkillCategory[], languages: Language[], certifications: Certification[], awards: Award[], volunteer: Volunteer[] } | null>(null);
  const uiStatusRef = useRef(uiStatus);

  // Update uiStatusRef when uiStatus changes
  useEffect(() => {
    uiStatusRef.current = uiStatus;
  }, [uiStatus]);

  // Debounced states for auto-save
  const debouncedFormData = useDebounce(formData, 2000);
  const debouncedProfessionalSummary = useDebounce(professionalSummary, 2000);
  const debouncedEducation = useDebounce(education, 2000);
  const debouncedExperiences = useDebounce(experiences, 2000);
  const debouncedProjects = useDebounce(projects, 2000);
  const debouncedSkills = useDebounce(skills, 2000);
  const debouncedLanguages = useDebounce(languages, 2000);
  const debouncedCertifications = useDebounce(certifications, 2000);
  const debouncedAwards = useDebounce(awards, 2000);
  const debouncedVolunteer = useDebounce(volunteer, 2000);

  // --- 2. EVENT HANDLERS ---

  // Input change handler for form fields
  const handleInputChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };



  // Handler for adding education
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
    setEducation([...education, newEducation]);
  };

  // Handler for adding experience
  const handleAddExperience = () => {
    const newExperience: Experience = {
      companyName: '',
      positionTitle: '',
      location: '',
      startDate: '',
      endDate: '',
      description: [],
      currentlyWorkHere: false,
    };
    setExperiences([...experiences, newExperience]);
  };

  // Handler for adding project
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
    setProjects([...projects, newProject]);
  };

  // Handler for adding skill category
  const handleAddSkillCategory = () => {
    const newSkillCategory: SkillCategory = {
      category: '',
      skills: [],
    };
    setSkills([...skills, newSkillCategory]);
  };

  // Save handler for profile
  const handleSaveProfile = async (options?: { signal?: AbortSignal; onSuccess?: () => void; onError?: (error: Error) => void; isAutoSave?: boolean }) => {
    // Cancel any previous request if not auto-save
    let signal: AbortSignal | undefined = undefined;
    if (!options?.isAutoSave && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    // Create new AbortController if not provided
    if (options && options.signal) {
      signal = options.signal;
    } else {
      const controller = new AbortController();
      abortControllerRef.current = controller;
      signal = controller.signal;
    }

    setUIStatus('saving');

    try {
      if (!session || !session.user) throw new Error('No user session');

      // Construct ProfileData from form state
      const [firstName, ...lastNameParts] = formData.name.trim().split(' ');
      const lastName = lastNameParts.join(' ');

      const profileData = {
        firstName,
        lastName,
        email: session.user.email || '',
        phoneNumber: formData.phone,
        location: formData.location,
        address: formData.address,
        address2: formData.address2,
        postalCode: formData.postalCode,
        professionalSummary,
        linkedin: formData.linkedin,
        portfolio: formData.portfolio,
        github: formData.github,
        otherUrl: formData.otherUrl,
        education,
        experiences,
        projects,
        skills,
        languages,
        certifications,
        awards,
        volunteer,
      };

      // Pre-save validation
      const validationResult = ProfileDataSchema.safeParse(profileData);
      if (!validationResult.success) {
        // Flatten errors for error state
        const flat = validationResult.error.flatten();
        setErrors(flat.fieldErrors || {});
setPreSaveErrors(validationResult.error.issues.map((i: { message: string }) => i.message));
        setUIStatus('idle');
        if (options?.onError) options.onError(new Error('Validation failed'));
        return;
      }

      // Clear any previous errors
      setPreSaveErrors([]);
      setErrors({});

      // Timeout handling
      const timeoutId = setTimeout(() => {
        abortControllerRef.current?.abort();
      }, 30000); // 30 seconds

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
        signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = 'Failed to save profile';
        if (response.status === 400) {
          const errorData = await response.json();
          errorMessage = errorData.error || 'Validation error';
        } else if (response.status === 401) {
          errorMessage = 'Unauthorized. Please sign in again.';
        } else if (response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        throw new Error(errorMessage);
      }

      const updatedProfile = await response.json();

      // Update local state with server response
      setFormData({
        name: `${updatedProfile.firstName || ''} ${updatedProfile.lastName || ''}`.trim() || session.user.name || '',
        phone: updatedProfile.phoneNumber || '',
        location: updatedProfile.location || '',
        address: updatedProfile.address || '',
        address2: updatedProfile.address2 || '',
        postalCode: updatedProfile.postalCode || '',
        linkedin: updatedProfile.linkedin || '',
        portfolio: updatedProfile.portfolio || '',
        github: updatedProfile.github || '',
        otherUrl: updatedProfile.otherUrl || '',
      });
      setProfessionalSummary(updatedProfile.professionalSummary || '');
      setEducation(updatedProfile.education || []);
      setExperiences(updatedProfile.experiences || []);
      setProjects(updatedProfile.projects || []);
      setSkills(updatedProfile.skills || []);
      setLanguages(updatedProfile.languages || []);
      setCertifications(updatedProfile.certifications || []);
      setAwards(updatedProfile.awards || []);
      setVolunteer(updatedProfile.volunteer || []);

      setUIStatus('idle');
      options?.onSuccess?.();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          // Request was cancelled, don't show error
          return;
        }

        if (!options || !options.isAutoSave) {
          setUIStatus('error');
        }
        if (options?.onError) options.onError(error);

        // Classify and show appropriate error message for manual saves only
        if (!options || !options.isAutoSave) {
          let title = 'Save Failed';
          let description = error.message;

          if (error.message.includes('network') || error.message.includes('fetch')) {
            title = 'Network Error';
            description = 'Unable to save profile. Check your connection and try again.';
          } else if (error.message.includes('Validation failed')) {
            title = 'Validation Error';
            description = 'Some fields are invalid. Please review and try again.';
          } else if (error.message.includes('Unauthorized')) {
            title = 'Authentication Error';
            description = 'Please sign in again.';
          }

          toast({
            title,
            description,
            variant: "destructive",
          });
        }

        // Log to Sentry for both manual and auto-save
        Sentry.captureException(error, {
          tags: {
            userId: session?.user?.id,
            endpoint: '/api/profile',
            method: 'PUT',
            isAutoSave: options?.isAutoSave ?? false,
          },
          extra: {
            formData: JSON.stringify({
              name: formData.name,
              phone: formData.phone,
              location: formData.location,
              educationCount: education.length,
              experiencesCount: experiences.length,
              projectsCount: projects.length,
              skillsCount: skills.length,
            }),
          },
        });
      }
    }
  };

  // Manual save button handler
  const handleSave = () => {
    handleSaveProfile({
      onSuccess: () => {
        toast({
          title: "Profile saved",
          description: "Your profile has been saved successfully.",
          variant: "success",
        });
      },
    });
  };

  // Function to run validation and update error states
  const runValidation = () => {
    if (!session || !session.user) return false;

    const [firstName, ...lastNameParts] = formData.name.trim().split(' ');
    const lastName = lastNameParts.join(' ');

    const profileData = {
      firstName,
      lastName,
      email: session.user.email || '',
      phoneNumber: formData.phone,
      location: formData.location,
      address: formData.address,
      address2: formData.address2,
      postalCode: formData.postalCode,
      professionalSummary,
      linkedin: formData.linkedin,
      portfolio: formData.portfolio,
      github: formData.github,
      otherUrl: formData.otherUrl,
      education,
      experiences,
      projects,
      skills,
      languages,
      certifications,
      awards,
      volunteer,
    };

    const validationResult = ProfileDataSchema.safeParse(profileData);
    if (!validationResult.success) {
      const flat = validationResult.error.flatten();
      setErrors(flat.fieldErrors || {});
      setPreSaveErrors(validationResult.error.issues.map((i: { message: string }) => i.message));
      return false;
    }
    setErrors({});
    setPreSaveErrors([]);
    return true;
  };

  // --- 3. EFFECTS ---

  // Redirect if not authenticated
  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      redirect('/login');
    }
  }, [sessionStatus]);

  // Load profile data on mount (when session is available)
  useEffect(() => {
    const loadProfileData = async () => {
      if (!session?.user) return; // Ensure session user exists

      setUIStatus('loading');
      try {
        const response = await fetch('/api/profile');
        if (!response.ok) {
          throw new Error('Failed to load profile data');
        }
        const profileData = await response.json();

        // Populate form data
        const loadedFormData = {
          name: `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() || session.user.name || '',
          phone: profileData.phoneNumber || '',
          location: profileData.location || '',
          address: profileData.address || '',
          address2: profileData.address2 || '',
          postalCode: profileData.postalCode || '',
          linkedin: profileData.linkedin || '',
          portfolio: profileData.portfolio || '',
          github: profileData.github || '',
          otherUrl: profileData.otherUrl || '',
        };
        const loadedProfessionalSummary = profileData.professionalSummary || '';
        const loadedEducation = profileData.education || [];
        const loadedExperiences = profileData.experiences || [];
        const loadedProjects = profileData.projects || [];
        const loadedSkills = profileData.skills || [];
        const loadedLanguages = profileData.languages || [];
        const loadedCertifications = profileData.certifications || [];
        const loadedAwards = profileData.awards || [];
        const loadedVolunteer = profileData.volunteer || [];

        setFormData(loadedFormData);
        setProfessionalSummary(loadedProfessionalSummary);
        setEducation(loadedEducation);
        setExperiences(loadedExperiences);
        setProjects(loadedProjects);
        setSkills(loadedSkills);
        setLanguages(loadedLanguages);
        setCertifications(loadedCertifications);
        setAwards(loadedAwards);
        setVolunteer(loadedVolunteer);

        // Set initial data for auto-save comparison
        lastSavedData.current = {
          formData: loadedFormData,
          professionalSummary: loadedProfessionalSummary,
          education: loadedEducation,
          experiences: loadedExperiences,
          projects: loadedProjects,
          skills: loadedSkills,
          languages: loadedLanguages,
          certifications: loadedCertifications,
          awards: loadedAwards,
          volunteer: loadedVolunteer,
        };

        setUIStatus('idle');
      } catch (error) {
        console.error('Error loading profile data:', error);
        setUIStatus('error');
        toast({
          title: "Error loading profile",
          description: "Unable to load your profile data. Please try refreshing the page.",
          variant: "destructive",
        });
        if (session?.user?.id) {
          Sentry.captureException(error, {
            tags: {
              userId: session.user.id,
              endpoint: '/api/profile',
              method: 'GET',
            },
          });
        }
      }
    };

    if (sessionStatus === 'authenticated' && session?.user) {
      loadProfileData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionStatus, session?.user]); // Only run when session status changes to authenticated

  // Effect to watch for form state changes with debouncing (Auto-save)
  useEffect(() => {
    // Skip initial mount to avoid saving empty data on page load
    if (isInitialMount.current) {
      isInitialMount.current = false;
      // lastSavedData is set in the loadProfileData effect
      return;
    }

    // Define currentData for comparison
    const currentData = {
      formData: debouncedFormData,
      professionalSummary: debouncedProfessionalSummary,
      education: debouncedEducation,
      experiences: debouncedExperiences,
      projects: debouncedProjects,
      skills: debouncedSkills,
      languages: debouncedLanguages,
      certifications: debouncedCertifications,
      awards: debouncedAwards,
      volunteer: debouncedVolunteer,
    };

    if (lastSavedData.current && deepEqual(currentData, lastSavedData.current)) {
      return; // No actual changes
    }

    // Skip auto-save if manual save is in progress or data is loading
    if (uiStatus === 'saving' || uiStatus === 'loading') {
      return;
    }

    // Cancel any previous auto-save
    if (autoSaveAbortControllerRef.current) {
      autoSaveAbortControllerRef.current.abort();
    }

    // Create new AbortController for auto-save
    const controller = new AbortController();
    autoSaveAbortControllerRef.current = controller;

    // Call handleSaveProfile for auto-save
    handleSaveProfile({
      signal: controller.signal,
      isAutoSave: true,
      onSuccess: () => {
        // Update last saved data on success
        lastSavedData.current = currentData;
        autoSaveAbortControllerRef.current = null;
        toast({
          title: "Profile saved",
          description: "Your changes have been saved automatically.",
          variant: "success",
        });
      },
      onError: (error: Error) => {
        if (error.name === 'AbortError') return; // Aborted, do nothing

        autoSaveAbortControllerRef.current = null;
        
        // Retry logic for network errors
        if (error.message.includes('network') || error.message.includes('fetch')) {
          setTimeout(() => {
            // Check if another save has started
            if (autoSaveAbortControllerRef.current || uiStatusRef.current === 'saving') return;
            // Retry once
            const retryController = new AbortController();
            autoSaveAbortControllerRef.current = retryController;
            
            handleSaveProfile({
              signal: retryController.signal,
              isAutoSave: true,
              onSuccess: () => {
                lastSavedData.current = currentData;
                autoSaveAbortControllerRef.current = null;
                toast({
                  title: "Profile saved",
                  description: "Your changes have been saved automatically.",
                  variant: "success",
                });
              },
              onError: () => {
                autoSaveAbortControllerRef.current = null;
              },
            });
          }, 5000); // Retry after 5 seconds
        }
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFormData, debouncedProfessionalSummary, debouncedEducation, debouncedExperiences, debouncedProjects, debouncedSkills, debouncedLanguages, debouncedCertifications, debouncedAwards, debouncedVolunteer, uiStatus]); // Rerun when debounced data or uiStatus changes

  // Effect to abort auto-save when manual save starts
  useEffect(() => {
    if (uiStatus === 'saving' && autoSaveAbortControllerRef.current) {
      autoSaveAbortControllerRef.current.abort();
      autoSaveAbortControllerRef.current = null;
    }
  }, [uiStatus]);


  // --- 4. EARLY RETURNS (After all hooks) ---

  // Show loading state while session or profile data is loading
  if (sessionStatus === 'loading' || (uiStatus === 'loading' && !session?.user)) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto p-6 pt-24">
          <div className="text-center">Loading...</div>
        </div>
      </>
    );
  }

  // User is not authenticated, redirect effect will handle it
  if (!session || !session.user) {
    return null;
  }

  // --- 5. JSX RENDER ---

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6 pt-24 space-y-6 max-w-4xl">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Manage your personal information and resume details</p>
        </div>

        {uiStatus === 'loading' && session?.user ? (
          <ProfilePageSkeleton />
        ) : (
          <div className="animate-fade-in">
            {/* Personal Information */}
            <CollapsibleSection
              title="Personal Information"
              defaultOpen={false}
            >
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Update your personal details</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    value={session.user.email || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">Email cannot be changed (OAuth account)</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input
                    value={formData.name}
                    onChange={handleInputChange('name')}
                    onBlur={runValidation}
                    placeholder="Your full name"
                    disabled={uiStatus === 'saving'}
                    className={errors?.['firstName'] || errors?.['lastName'] ? 'border-red-500' : ''}
                    aria-invalid={!!(errors?.['firstName'] || errors?.['lastName'])}
                    aria-describedby="name-error"
                  />
                  {(errors?.['firstName'] || errors?.['lastName']) && (
                    <p id="name-error" className="text-red-500 text-sm mt-1">
                      {(errors['firstName'] as string[])?.[0] || (errors['lastName'] as string[])?.[0]}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange('phone')}
                    onBlur={runValidation}
                    placeholder="+1 (555) 123-4567"
                    disabled={uiStatus === 'saving'}
                    className={errors?.['phoneNumber'] ? 'border-red-500' : ''}
                    aria-invalid={!!errors?.['phoneNumber']}
                    aria-describedby="phone-error"
                  />
                  {errors?.['phoneNumber'] && (
                    <p id="phone-error" className="text-red-500 text-sm mt-1">
                      {(errors['phoneNumber'] as string[])?.[0]}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    value={formData.location}
                    onChange={handleInputChange('location')}
                    onBlur={runValidation}
                    placeholder="City, State/Country"
                    disabled={uiStatus === 'saving'}
                    className={errors?.['location'] ? 'border-red-500' : ''}
                    aria-invalid={!!errors?.['location']}
                    aria-describedby="location-error"
                  />
                  {errors?.['location'] && (
                    <p id="location-error" className="text-red-500 text-sm mt-1">
                      {(errors['location'] as string[])?.[0]}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Address</label>
                  <Input
                    value={formData.address}
                    onChange={handleInputChange('address')}
                    onBlur={runValidation}
                    placeholder="Street address"
                    disabled={uiStatus === 'saving'}
                    className={errors?.['address'] ? 'border-red-500' : ''}
                    aria-invalid={!!errors?.['address']}
                    aria-describedby="address-error"
                  />
                  {errors?.['address'] && (
                    <p id="address-error" className="text-red-500 text-sm mt-1">
                      {(errors['address'] as string[])?.[0]}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Address Line 2</label>
                  <Input
                    value={formData.address2}
                    onChange={handleInputChange('address2')}
                    onBlur={runValidation}
                    placeholder="Apartment, suite, etc. (optional)"
                    disabled={uiStatus === 'saving'}
                    className={errors?.['address2'] ? 'border-red-500' : ''}
                    aria-invalid={!!errors?.['address2']}
                    aria-describedby="address2-error"
                  />
                  {errors?.['address2'] && (
                    <p id="address2-error" className="text-red-500 text-sm mt-1">
                      {(errors['address2'] as string[])?.[0]}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Postal Code</label>
                  <Input
                    value={formData.postalCode}
                    onChange={handleInputChange('postalCode')}
                    onBlur={runValidation}
                    placeholder="ZIP or postal code"
                    disabled={uiStatus === 'saving'}
                    className={errors?.['postalCode'] ? 'border-red-500' : ''}
                    aria-invalid={!!errors?.['postalCode']}
                    aria-describedby="postalCode-error"
                  />
                  {errors?.['postalCode'] && (
                    <p id="postalCode-error" className="text-red-500 text-sm mt-1">
                      {(errors['postalCode'] as string[])?.[0]}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">LinkedIn URL</label>
                <Input
                  type="url"
                  value={formData.linkedin}
                  onChange={handleInputChange('linkedin')}
                  onBlur={runValidation}
                  placeholder="https://linkedin.com/in/yourprofile"
                  disabled={uiStatus === 'saving'}
                  className={errors?.['linkedin'] ? 'border-red-500' : ''}
                  aria-invalid={!!errors?.['linkedin']}
                  aria-describedby="linkedin-error"
                />
                {errors?.['linkedin'] && (
                  <p id="linkedin-error" className="text-red-500 text-sm mt-1">
                    {(errors['linkedin'] as string[])?.[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Portfolio URL</label>
                <Input
                  type="url"
                  value={formData.portfolio}
                  onChange={handleInputChange('portfolio')}
                  onBlur={runValidation}
                  placeholder="https://yourportfolio.com"
                  disabled={uiStatus === 'saving'}
                  className={errors?.['portfolio'] ? 'border-red-500' : ''}
                  aria-invalid={!!errors?.['portfolio']}
                  aria-describedby="portfolio-error"
                />
                {errors?.['portfolio'] && (
                  <p id="portfolio-error" className="text-red-500 text-sm mt-1">
                    {(errors['portfolio'] as string[])?.[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">GitHub URL</label>
                <Input
                  type="url"
                  value={formData.github}
                  onChange={handleInputChange('github')}
                  onBlur={runValidation}
                  placeholder="https://github.com/yourusername"
                  disabled={uiStatus === 'saving'}
                  className={errors?.['github'] ? 'border-red-500' : ''}
                  aria-invalid={!!errors?.['github']}
                  aria-describedby="github-error"
                />
                {errors?.['github'] && (
                  <p id="github-error" className="text-red-500 text-sm mt-1">
                    {(errors['github'] as string[])?.[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Other URL</label>
                <Input
                  type="url"
                  value={formData.otherUrl}
                  onChange={handleInputChange('otherUrl')}
                  onBlur={runValidation}
                  placeholder="https://yourwebsite.com"
                  disabled={uiStatus === 'saving'}
                  className={errors?.['otherUrl'] ? 'border-red-500' : ''}
                  aria-invalid={!!errors?.['otherUrl']}
                  aria-describedby="otherUrl-error"
                />
                {errors?.['otherUrl'] && (
                  <p id="otherUrl-error" className="text-red-500 text-sm mt-1">
                    {(errors['otherUrl'] as string[])?.[0]}
                  </p>
                )}
              </div>

              {preSaveErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertTitle>Validation Errors</AlertTitle>
                  <AlertDescription>{preSaveErrors.join(', ')}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end gap-3">
                <Button variant="outline" disabled={uiStatus === 'saving'}>Cancel</Button>
                <Button
                  onClick={handleSave}
                  disabled={uiStatus === 'loading' || uiStatus === 'saving'}
                  className={`bg-gradient-to-r from-amethyst-500 to-amethyst-600 hover:from-amethyst-600 hover:to-amethyst-700 min-w-[140px] ${
                    uiStatus === 'loading' || uiStatus === 'saving' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {/* Only show spinner on manual save */}
                  {uiStatus === 'saving' ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </CollapsibleSection>

            {/* Profile Sections */}
            <CollapsibleSection
              title="Education"
              defaultOpen={false}
              actions={<Button onClick={handleAddEducation} className="btn-add" disabled={uiStatus === 'saving'}>Add New</Button>}
            >
              <EducationForm education={education} onChange={setEducation} errors={errors?.['education'] as Record<number, Record<string, string[]>> || {}} onBlurValidate={runValidation} />
            </CollapsibleSection>

            <CollapsibleSection
              title="Experience"
              defaultOpen={false}
              actions={<Button onClick={handleAddExperience} className="btn-add" disabled={uiStatus === 'saving'}>Add New</Button>}
            >
              <ExperienceForm experiences={experiences} onChange={setExperiences} errors={errors?.['experiences'] as Record<number, Record<string, string[]>> || {}} onBlurValidate={runValidation} />
            </CollapsibleSection>

            <CollapsibleSection
              title="Projects"
              defaultOpen={false}
              actions={<Button onClick={handleAddProject} className="btn-add" disabled={uiStatus === 'saving'}>Add New</Button>}
            >
              <ProjectsForm projects={projects} onChange={setProjects} errors={errors?.['projects'] as Record<number, Record<string, string[]>> || {}} onBlurValidate={runValidation} />
            </CollapsibleSection>

            <CollapsibleSection
              title="Skills"
              defaultOpen={false}
              actions={<Button onClick={handleAddSkillCategory} className="btn-add" disabled={uiStatus === 'saving'}>Add New</Button>}
            >
              <SkillsForm skills={skills} onChange={setSkills} errors={errors?.['skills'] as Record<number, Record<string, string[]>> || {}} onBlurValidate={runValidation} />
            </CollapsibleSection>

            <CollapsibleSection
              title="Professional Summary"
              defaultOpen={false}
            >
              <ProfessionalSummaryForm
                professionalSummary={professionalSummary}
                onChange={setProfessionalSummary}
                errors={errors?.['professionalSummary'] as string[] || []}
                onBlurValidate={runValidation}
              />
            </CollapsibleSection>

            <CollapsibleSection
              title="Languages"
              defaultOpen={false}
            >
              <LanguagesForm
                languages={languages}
                onChange={setLanguages}
                errors={errors?.['languages'] as Record<number, Record<string, string[]>> || {}}
                onBlurValidate={runValidation}
              />
            </CollapsibleSection>

            <CollapsibleSection
              title="Certifications"
              defaultOpen={false}
            >
              <CertificationsForm
                certifications={certifications}
                onChange={setCertifications}
                errors={errors?.['certifications'] as Record<number, Record<string, string[]>> || {}}
                onBlurValidate={runValidation}
              />
            </CollapsibleSection>

            <CollapsibleSection
              title="Awards & Honors"
              defaultOpen={false}
            >
              <AwardsForm
                awards={awards}
                onChange={setAwards}
                errors={errors?.['awards'] as Record<number, Record<string, string[]>> || {}}
                onBlurValidate={runValidation}
              />
            </CollapsibleSection>

            <CollapsibleSection
              title="Volunteer Experience"
              defaultOpen={false}
            >
              <VolunteerForm
                volunteer={volunteer}
                onChange={setVolunteer}
                errors={errors?.['volunteer'] as Record<number, Record<string, string[]>> || {}}
                onBlurValidate={runValidation}
              />
            </CollapsibleSection>

            {/* Account Information */}
            <CollapsibleSection
              title="Account Information"
              defaultOpen={true}
            >
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Your account details</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Account ID</span>
                  <span className="text-sm font-mono">{session.user.id}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Credits Available</span>
                  <span className="text-sm font-bold text-amethyst-400">{session.user.credits || 0}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Subscription Tier</span>
                  <span className="text-sm font-bold capitalize">{session.user.subscriptionTier || 'Free'}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Email Verified</span>
                  <span className="text-sm">
                    {session.user.emailVerified ? (
                      <span className="text-green-500">✓ Verified</span>
                    ) : (
                      <span className="text-yellow-500">Not Verified</span>
                    )}
                  </span>
                </div>
              </div>
            </CollapsibleSection>
          </div>
        )}
      </div>
    </>
  );
}