import { Moon, Sun } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useDisplaySettings, TranslationType } from '@/hooks/useDisplaySettings';

export function HeaderSettings() {
  const { theme, setTheme } = useTheme();
  const { 
    showTransliteration,
    toggleTransliteration,
    translationType,
    setTranslationType,
  } = useDisplaySettings();

  return (
    <div className="space-y-6">
      {/* Light/Dark Mode */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Намуди оина</h3>
        <div className="flex justify-around">
          <Button 
            variant={theme === 'light' ? 'default' : 'outline'}
            className="flex flex-col items-center py-6 h-auto w-[45%]"
            onClick={() => setTheme('light')}
          >
            <Sun className="h-8 w-8 mb-2" />
            <span>Равшан</span>
          </Button>
          
          <Button 
            variant={theme === 'dark' ? 'default' : 'outline'}
            className="flex flex-col items-center py-6 h-auto w-[45%]"
            onClick={() => setTheme('dark')}
          >
            <Moon className="h-8 w-8 mb-2" />
            <span>Торик</span>
          </Button>
        </div>
      </div>
      
      {/* Transliteration Toggle */}
      <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <Label htmlFor="show-transliteration" className="text-base">
            Талаффуз
          </Label>
          <Switch 
            id="show-transliteration" 
            checked={showTransliteration} 
            onCheckedChange={toggleTransliteration} 
          />
        </div>
      </div>
      
      {/* Translation Selection */}
      <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-800">
        <Label htmlFor="translation-type" className="text-base">
          Интихоби тарҷума
        </Label>
        <Select 
          value={translationType} 
          onValueChange={(value) => setTranslationType(value as TranslationType)}
        >
          <SelectTrigger id="translation-type">
            <SelectValue placeholder="Интихоб кунед" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tajik">Тарҷумаи тоҷикӣ (асосӣ)</SelectItem>
            <SelectItem value="tj_2">Тарҷумаи тоҷикӣ 2</SelectItem>
            <SelectItem value="tj_3">Тарҷумаи тоҷикӣ 3</SelectItem>
            <SelectItem value="farsi">Тарҷумаи форсӣ</SelectItem>
            <SelectItem value="russian">Тарҷумаи русӣ</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}