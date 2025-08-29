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
      <div className="mb-8">
        <img src="/bg.gif" alt="404 Error" className="w-64 h-64 object-contain" />
      </div>
      
      {/* Error Message */}
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-3xl font-semibold text-foreground">
          Ба фикрам шумо роҳгум задед
        </h2>
        <p className="text-xl text-muted-foreground">
          чунин саҳифа вуҷуд надорад!
        </p>

        <div className="pt-4">
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
