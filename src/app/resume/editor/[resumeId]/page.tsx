import { ResumeEditorClient } from '@/components/resume-editor/ResumeEditorClient';

interface PageProps {
  params: Promise<{ resumeId: string }>;
}

export default async function ResumeEditorPage({ params }: PageProps) {
  const { resumeId } = await params;
  const isNew = resumeId === 'new';

  return (
    <div className="min-h-screen bg-slate-950">
      <ResumeEditorClient 
        resumeId={resumeId}
        mode={isNew ? 'create' : 'edit'}
        initialData={undefined}
      />
    </div>
  );
}