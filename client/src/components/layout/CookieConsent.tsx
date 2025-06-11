import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Check, X as XIcon } from 'lucide-react';

export default function CookieConsent() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { preferences, updatePreferences, savePreferences, loadPreferences } = useCookieConsent();

  useEffect(() => {
    const savedPreferences = loadPreferences();
    if (!savedPreferences) {
      setIsOpen(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true
    };
    savePreferences(allAccepted);
    setIsOpen(false);
  };

  const handleDecline = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false
    };
    savePreferences(onlyNecessary);
    setIsOpen(false);
  };

  const handleSaveSettings = () => {
    savePreferences(preferences);
    setShowSettings(false);
    setIsOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg"
          >
            <div className="container mx-auto max-w-4xl">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Истифодаи кукиҳо
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Мо кукиҳоро барои беҳтар кардани таҷрибаи шумо истифода мебарем. Шумо метавонед инро дар ҳар вақт иваз кунед.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto justify-center md:justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSettings(true)}
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Танзим кардан
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDecline}
                    className="flex items-center gap-2"
                  >
                    <XIcon className="h-4 w-4" />
                    Рад кардан
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAcceptAll}
                    className="flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Қабул кардан
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Танзимоти кукиҳо</DialogTitle>
            <DialogDescription>
              Интихоб кунед, ки кадом кукиҳоро қабул мекунед
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Зарурӣ</Label>
                <p className="text-sm text-gray-500">
                  Барои амалиёти асосии вебсайт
                </p>
              </div>
              <Switch
                checked={preferences.necessary}
                disabled
                className="opacity-50"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Таҳлилӣ</Label>
                <p className="text-sm text-gray-500">
                  Барои таҳлили истифодаи вебсайт
                </p>
              </div>
              <Switch
                checked={preferences.analytics}
                onCheckedChange={(checked) => 
                  updatePreferences({ ...preferences, analytics: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Маркетингӣ</Label>
                <p className="text-sm text-gray-500">
                  Барои пайгирии фaъолияти шумо
                </p>
              </div>
              <Switch
                checked={preferences.marketing}
                onCheckedChange={(checked) => 
                  updatePreferences({ ...preferences, marketing: checked })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Бекор кардан
            </Button>
            <Button onClick={handleSaveSettings}>
              Захира кардан
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 
