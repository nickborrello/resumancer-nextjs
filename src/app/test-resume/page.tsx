import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export default async function TestResumePage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/login');
  }

  // Redirect to the resume editor with the test resume ID
  redirect('/resume/editor/test-resume-demo');
}