import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import SeoHead from '@/components/shared/SeoHead';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <SeoHead
        title="Саҳифа ёфт нашуд - 404"
        description="Саҳифаи дархост кардаатон ёфт нашуд. Лутфан ба саҳифаи асосӣ баргардед."
      />

      {/* Error Message - 404 (No bottom margin) */}
      <div className="text-center">
        <h1 className="text-5xl font-bold text-primary">404</h1> {/* Smaller text */}
      </div>
      
      {/* 404 GIF (No top/bottom margin) */}
      <div>
        <img src="/bg.gif" alt="404 Error" className="w-[30rem] h-[30rem] object-contain" /> {/* Even larger GIF using arbitrary value */}
      </div>

      {/* Other Error Messages and Button (No top margin, reduced space-y) */}
      <div className="text-center space-y-2"> {/* Reduced space between elements */}
        <h2 className="text-2xl font-semibold text-foreground"> {/* Smaller text */}
          Ба фикрам шумо роҳгум задед
        </h2>
        <p className="text-lg text-muted-foreground"> {/* Smaller text */}
          чунин саҳифа вуҷуд надорад!
        </p>

        <div className="pt-4 flex justify-center">
          <Link href="/">
            <Button className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-md px-6 py-2">
              <Home className="h-4 w-4" />
              <span>Асосӣ</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}