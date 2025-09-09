import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Link } from 'wouter';
import SeoHead from '@/components/shared/SeoHead';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <SeoHead title={isRegister ? 'Сабтином' : 'Вуруд'} description="Воридшавӣ ё сабтином ба сомона" />

      {/* Decorative shapes */}
      <div className="pointer-events-none absolute -right-20 -top-10 h-[700px] w-[900px] rotate-6 skew-y-12 bg-gradient-to-br from-background to-primary/30 dark:from-background dark:to-accent/20 rounded-3xl blur-0" />
      <div className="pointer-events-none absolute left-20 top-[60%] h-[800px] w-[900px] -rotate-6 -skew-y-12 bg-background border-t-2 border-primary/40 dark:border-accent/40 rounded-3xl" />

      <Card className="relative w-[90%] max-w-3xl grid grid-cols-1 md:grid-cols-2 overflow-hidden border-primary/40 dark:border-accent/40 shadow-[0_0_25px_rgba(6,182,212,0.15)]">
        {/* Form side */}
        <div className="p-8 md:p-10 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-primary dark:text-accent text-center mb-2">
            {isRegister ? 'Сабтином' : 'Вуруд'}
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            {isRegister ? 'Ҳисоби нав эҷод кунед' : 'Ба ҳисоби худ ворид шавед'}
          </p>

          <form className="space-y-5">
            <div>
              <Input type="text" placeholder="Номи корбар" required className="bg-transparent" />
            </div>
            {isRegister && (
              <div>
                <Input type="email" placeholder="Почта" required className="bg-transparent" />
              </div>
            )}
            <div>
              <Input type="password" placeholder="Гузарвожа" required className="bg-transparent" />
            </div>
            <Button type="submit" variant="outline" className="w-full border-primary/60 dark:border-accent/60">
              {isRegister ? 'Сабтином шудан' : 'Ворид шудан'}
            </Button>
          </form>

          <div className="text-center mt-4 text-sm">
            {isRegister ? (
              <>
                <span>Аллакай ҳисоб доред? </span>
                <button className="text-primary dark:text-accent font-semibold" onClick={() => setIsRegister(false)}>Ворид шавед</button>
              </>
            ) : (
              <>
                <span>Ҳоло ҳисоб надоред? </span>
                <button className="text-primary dark:text-accent font-semibold" onClick={() => setIsRegister(true)}>Ҳисоб кушоед</button>
              </>
            )}
          </div>

          <div className="mt-6 text-center">
            <Link href="/">
              <Button variant="ghost">Ба Асосӣ</Button>
            </Link>
          </div>
        </div>

        {/* Info side */}
        <div className="hidden md:flex flex-col justify-center p-10 bg-gradient-to-tr from-primary/10 to-accent/10">
          <h2 className="text-4xl font-extrabold text-primary dark:text-accent mb-4 uppercase leading-tight">
            {isRegister ? 'Сабтином шавед!' : 'Хуш омадед!'}
          </h2>
          <p className="text-muted-foreground">
            {isRegister
              ? 'Бо сабти ном шумо метавонед аз тамоми имкониятҳои мо истифода баред ва таҷрибаи шахсии худро дошта бошед.'
              : 'Барои идома додани истифодаи хизматрасониҳо, лутфан ба ҳисоби худ ворид шавед.'}
          </p>
        </div>
      </Card>
    </div>
  );
}
