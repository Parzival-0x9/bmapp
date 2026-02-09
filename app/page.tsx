import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/login-form';
import { requireUser } from '@/lib/server/auth';

export default async function HomePage() {
  const user = await requireUser();
  if (user) redirect('/dashboard');

  return (
    <main className="centered">
      <LoginForm />
    </main>
  );
}
