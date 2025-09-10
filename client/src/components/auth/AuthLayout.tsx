import { ReactNode } from 'react';
import { Link } from 'wouter';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 sm:px-6 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-2">
          {/* Brand / Info Panel (hidden on small screens) */}
          <div className="relative hidden overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-accent/10 to-transparent p-8 lg:block">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,theme(colors.primary/15),transparent_60%),radial-gradient(ellipse_at_bottom_right,theme(colors.accent/20),transparent_60%)]"></div>
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div className="space-y-4">
                <Link href="/">
                  <a className="inline-flex items-center gap-2 text-sm text-primary hover:underline">Ба Асосӣ</a>
                </Link>
                <h1 className="text-3xl font-semibold leading-snug text-primary">ХУШ ОМАДЕД!</h1>
                <p className="max-w-md text-muted-foreground">
                  Барои идома додани истифодаи хизматрасониҳо, лутфан ба ҳисоби худ ворид шавед ё сабтином намоед.
                </p>
              </div>
              <div className="mt-8 text-xs text-muted-foreground">
                © {new Date().getFullYear()} Қуръони Карим
              </div>
            </div>
          </div>

          {/* Auth Card Container */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

