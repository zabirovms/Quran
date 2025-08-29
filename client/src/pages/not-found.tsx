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
      
      <div className="w-full max-w-lg p-8 bg-card/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-border/40 text-center">
        {/* 404 GIF Placeholder */}
        <div className="w-32 h-32 mx-auto mb-6 bg-muted/50 rounded-full flex items-center justify-center">
          <span className="text-4xl font-bold text-muted-foreground">404</span>
        </div>
        
        <h1 className="text-4xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4 text-foreground">
          Ба фикрам шумо роҳгум задед
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          чунин саҳифа вуҷуд надорад!
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90">
              <Home className="h-4 w-4" />
              <span>Бозгашт</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
