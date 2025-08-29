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

      {/* Error Message - 404 */}
      <div className="text-center mb-4"> {/* Added mb-4 for closer spacing */}
        <h1 className="text-6xl font-bold text-primary">404</h1>
      </div>
      
      {/* 404 GIF */}
      <div className="mb-4"> {/* Added mb-4 for closer spacing */}
        <img src="/bg.gif" alt="404 Error" className="w-96 h-96 object-contain" />
      </div>

      {/* Other Error Messages and Button */}
      <div className="text-center space-y-4"> {/* Adjusted space-y for closer content */}
        <h2 className="text-3xl font-semibold text-foreground">
          Ба фикрам шумо роҳгум задед
        </h2>
        <p className="text-xl text-muted-foreground">
          чунин саҳифа вуҷуд надорад!
        </p>

        <div className="pt-4 flex justify-center"> {/* Added flex justify-center here */}
          <Link href="/">
            <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-lg px-8 py-3">
              <Home className="h-5 w-5" />
              <span>Бозгашт</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
