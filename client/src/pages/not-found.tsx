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

      {/* Error Message */}
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-primary">404</h1>
      </div>
      
      {/* 404 GIF */}
      <div className="my-8">
        <img src="/bg.gif" alt="404 Error" className="w-96 h-96 object-contain" />
      </div>

      <div className="text-center space-y-6">
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
