import { Link } from 'wouter';
import { Instagram, Send, Facebook } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Пайвандҳои зуд</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/surah/1" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-accent text-sm">
                  Сураи Фотиҳа
                </Link>
              </li>
              <li>
                <Link href="/surah/36" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-accent text-sm">
                  Сураи Ёсин
                </Link>
              </li>
              <li>
                <Link href="/surah/67" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-accent text-sm">
                  Сураи Мулк
                </Link>
              </li>
              <li>
                <Link href="/surah/2/verse/255" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-accent text-sm">
                  Оят-ал-курсӣ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Тамос</h3>
            <ul className="space-y-2">
              <li className="text-gray-600 dark:text-gray-400 text-sm">
                <a href="mailto:info@quran.tj" className="hover:text-primary dark:hover:text-accent">
                  info@quran.tj
                </a>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Саҳифаҳои Иҷтимоӣ</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://www.instagram.com/balkhiverse"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-accent text-sm"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              </li>
              <li>
                <a
                  href="https://t.me/balkhiverses"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-accent text-sm"
                >
                  <Send className="h-5 w-5" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/aloliddinibalhi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-accent text-sm"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
          <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
            © {currentYear} Quran.tj - Ҳамаи ҳуқуқҳо ҳифз шудаанд
          </p>
        </div>
      </div>
    </footer>
  );
} 
