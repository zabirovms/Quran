import SeoHead from '@/components/shared/SeoHead';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthCard from '@/components/auth/AuthCard';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const { signInAnonymously } = useAuth();
  const { toast } = useToast();

  const handleGuest = async () => {
    try {
      await signInAnonymously();
      toast({ title: 'Меҳмон ворид шуд', description: 'Шумо ҳамчун меҳмон ворид шудед.' });
    } catch (error: any) {
      toast({ title: 'Хатогӣ', description: error?.message ?? 'Воридшавӣ ноком шуд.', variant: 'destructive' as any });
    }
  };

  return (
    <>
      <SeoHead title={'Вуруд'} description="Воридшавӣ ё сабтином ба сомона" />
      <AuthLayout>
        <div className="space-y-4">
          <AuthCard loginForm={<LoginForm />} registerForm={<RegisterForm />} />
          <Button variant="outline" className="w-full" onClick={handleGuest}>
            <LogIn className="h-4 w-4" /> Меҳмон ворид шудан
          </Button>
        </div>
      </AuthLayout>
    </>
  );
}
