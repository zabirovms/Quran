import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import SeoHead from '@/components/shared/SeoHead';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background/95 to-muted/20 p-4">
      <SeoHead
        title="Саҳифа ёфт нашуд - 404"
        description="Саҳифаи дархост кардаатон ёфт нашуд. Лутфан ба саҳифаи асосӣ баргардед."
      />
      
      {/* 404 GIF */}
      <div className="mb-4">
        <img src="/bg.gif" alt="404 Error" className="w-80 h-80 object-contain" />
      </div>
      
      {/* Error Message - No spacing between elements */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-2">404</h1>
        <h2 className="text-xl font-semibold text-foreground mb-1">
          Ба фикрам шумо роҳгум задед
        </h2>
        <p className="text-lg text-muted-foreground mb-6">
          чунин саҳифа вуҷуд надорад!
        </p>

        <div>
          <Link href="/">
            <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-base px-6 py-2">
              <Home className="h-4 w-4" />
              <span>Бозгашт</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
