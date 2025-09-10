import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const RegisterSchema = z.object({
  username: z.string().min(3, { message: 'На камтар аз 3 аломат' }).max(24, { message: 'На зиёдтар аз 24 аломат' }),
  email: z.string().email({ message: 'Почтаи нодуруст' }),
  password: z.string().min(6, { message: 'Камаш 6 аломат' }),
  confirmPassword: z.string().min(6, { message: 'Камаш 6 аломат' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Гузарвожаҳо мувофиқ нестанд',
  path: ['confirmPassword'],
});

type RegisterValues = z.infer<typeof RegisterSchema>;

export default function RegisterForm() {
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { username: '', email: '', password: '', confirmPassword: '' },
    mode: 'onBlur',
  });

  const onSubmit = async (values: RegisterValues) => {
    try {
      await signUp(values.email, values.password);
      toast({ title: 'Сабтином шуд', description: 'Лутфан почтаи электрониро тасдиқ намоед.' });
    } catch (error: any) {
      toast({ title: 'Хатогӣ', description: error?.message ?? 'Сабтином ноком шуд.', variant: 'destructive' as any });
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Номи корбар</FormLabel>
              <FormControl>
                <Input placeholder="misol: ali_rahmon" autoComplete="username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Почта</FormLabel>
              <FormControl>
                <Input placeholder="email@example.com" type="email" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Гузарвожа</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    {...field}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Пинҳон кардани гузарвожа' : 'Нишон додани гузарвожа'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Такрори гузарвожа</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    {...field}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirm((s) => !s)}
                    aria-label={showConfirm ? 'Пинҳон кардани гузарвожа' : 'Нишон додани гузарвожа'}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          <UserPlus className="h-4 w-4" />
          {isSubmitting ? 'Лутфан интизор шавед…' : 'Сабтином шудан'}
        </Button>
      </form>
    </Form>
  );
}

