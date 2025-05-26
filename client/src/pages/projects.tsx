import { GlobalOverlayType } from '@/App';
import Header from '@/components/layout/Header';
import SeoHead from '@/components/shared/SeoHead';

interface ProjectsProps {
  onOpenOverlay: (type: GlobalOverlayType) => void;
}

export default function Projects({ onOpenOverlay }: ProjectsProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <SeoHead
        title="Лоиҳаҳои мо - Рушди манбаъҳои исломӣ бо забони тоҷикӣ - Қуръони Карим"
        description="Лоиҳаҳои ояндаи мо оиди манбаъҳои исломӣ ба забони тоҷикӣ. Вақти намоз, пайдо кардани масҷидҳо, китобхонаи исломӣ, ҳадисҳо ва тафсирҳо бо забони тоҷикӣ."
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Лоиҳаҳои мо",
          "description": "Лоиҳаҳои ояндаи мо оиди манбаъҳои исломӣ ба забони тоҷикӣ",
          "inLanguage": "tg",
          "isPartOf": {
            "@type": "WebSite",
            "name": "Қуръони Карим",
            "url": window.location.origin
          },
          "keywords": "лоиҳаҳои исломӣ, вақти намоз, масҷидҳо, китобхонаи исломӣ, ҳадисҳо, тафсирҳо, тоҷикӣ"
        }}
      />
      <Header onOpenOverlay={onOpenOverlay} />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              Лоиҳаҳои мо
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Мо дар паи эҷоди як маҷмӯаи комили тоқикӣ ҳастем, ки барои ҳар як тоҷик манбаи осондастрас гардад. Лоиҳаҳои зерин дар марҳилаи таҳия қарор доранд:
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-primary dark:text-accent mb-2">Вақти намоз</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Намоиши вақти дақиқи намоз барои ҳар як шаҳр ва минтақа, бо имкони огоҳсозии пешакӣ.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-primary dark:text-accent mb-2">Наздиктарин масҷид</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Ҷустуҷӯ ва ёфтани масҷидҳои наздиктарин бо нишонии пурра ва роҳнамои харита. Фоидабахш барои мусофирон ва касоне, ки дар маҳалли нав қарор доранд.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-primary dark:text-accent mb-2">Китобхона</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Як китобхонаи электронӣ бо садҳо китоб ва мақолаҳои дастрас ба забони тоҷикӣ
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-primary dark:text-accent mb-2">Асарҳои бузургон</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Ганҷинае аз осори алломаҳо ва орифони бузург чун Мавлоно Ҷалолуддини Балхӣ, Саъдӣ, Ҳофиз, Шамси Табрезӣ ва дигарон.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-primary dark:text-accent mb-2">Ҳадисҳо</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Ҷамъоварии саҳеҳтарин ҳадисҳо аз китобҳои маъруф монанди Саҳеҳи Бухорӣ, Муслим ва ғайра, бо тарҷума ва тавзеҳ барои дарки беҳтар.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-primary dark:text-accent mb-2">Тафсирҳо</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Тафсири Қуръон бо забони тоҷикӣ, бо интихоби тафсирҳои маъруф монанди Тафсири Ибни Касир, Ҷалолайн ва дигарон. Барои ҳар як оят шарҳи муфассал пешниҳод мегардад.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6 mt-8">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Қуръон бо Тафсири Осонбаён</p>
        </div>
      </footer>
    </div>
  );
}