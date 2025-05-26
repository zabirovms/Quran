import { useState } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetFooter
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Settings, 
  Moon, 
  Sun, 
  BookOpen, 
  Type, 
  AlignJustify,
  TextSelect,
  LayoutGrid,
  ArrowUpDown,
  Maximize,
  Minimize
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { useDisplaySettings, TextSizeType, ContentViewType, TranslationType } from '@/hooks/useDisplaySettings';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export function SettingsContent() {
  const { theme, setTheme } = useTheme();
  const { 
    showTransliteration,
    toggleTransliteration,
    textSize,
    setTextSize,
    translationType,
    setTranslationType,
    contentViewMode,
    setContentViewMode,
    lineSpacing,
    setLineSpacing
  } = useDisplaySettings();
  
  return (
    <div className="mt-4 space-y-5 overflow-y-auto max-h-[80vh] pr-2 custom-scrollbar">
      {/* Theme Settings - First and most visible */}
      <div className="flex items-center gap-2 mb-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setTheme('light')}
          className={cn(
            "flex-1",
            theme === 'light' && "bg-primary/10 text-primary dark:bg-accent/10 dark:text-accent"
          )}
        >
          <Sun className="h-4 w-4 mr-2" />
          Равшан
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setTheme('dark')}
          className={cn(
            "flex-1",
            theme === 'dark' && "bg-primary/10 text-primary dark:bg-accent/10 dark:text-accent"
          )}
        >
          <Moon className="h-4 w-4 mr-2" />
          Торик
        </Button>
      </div>
      
      {/* Text Size - Simplified */}
      <div className="space-y-2 border-t pt-4">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <TextSelect className="h-4 w-4" />
            <span>Андоза</span>
          </Label>
          <div className="flex items-center space-x-1">
            <Minimize className="h-3 w-3 text-muted-foreground" />
            <Slider 
              id="text-size-slider"
              defaultValue={[
                textSize === 'small' ? 25 : 
                textSize === 'medium' ? 50 : 
                textSize === 'large' ? 75 : 100
              ]}
              value={[
                textSize === 'small' ? 25 : 
                textSize === 'medium' ? 50 : 
                textSize === 'large' ? 75 : 100
              ]}
              max={100}
              step={25}
              onValueChange={(value) => {
                const size = 
                  value[0] <= 25 ? 'small' : 
                  value[0] <= 50 ? 'medium' : 
                  value[0] <= 75 ? 'large' : 'extra-large';
                setTextSize(size as TextSizeType);
              }}
              className="w-24"
            />
            <Maximize className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>
      </div>
      
      {/* Line Spacing - Simplified */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4" />
            <span>Фосила</span>
          </Label>
          <div className="flex items-center space-x-1">
            <span className="text-xs text-muted-foreground">Кам</span>
            <Slider 
              value={[lineSpacing * 50]}
              min={60}
              max={100}
              step={10}
              onValueChange={(value) => {
                const spacing = value[0] / 50;
                setLineSpacing(spacing);
              }}
              className="w-24"
            />
            <span className="text-xs text-muted-foreground">Зиёд</span>
          </div>
        </div>
      </div>
      
      {/* Content View Mode - Simplified */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" />
            <span>Намоиш</span>
          </Label>
          <Select 
            value={contentViewMode} 
            onValueChange={(value) => setContentViewMode(value as ContentViewType)}
          >
            <SelectTrigger id="content-view-mode" className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="compact">Фишурда</SelectItem>
              <SelectItem value="comfortable">Мувофиқ</SelectItem>
              <SelectItem value="expanded">Васеъ</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Translation Selection - Simplified */}
      <div className="space-y-2 border-t pt-4">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>Тарҷума</span>
          </Label>
          <Select 
            value={translationType} 
            onValueChange={(value) => setTranslationType(value as TranslationType)}
          >
            <SelectTrigger id="translation-type" className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tajik">Тоҷикӣ</SelectItem>
              <SelectItem value="tj_2">Тоҷикӣ 2</SelectItem>
              <SelectItem value="tj_3">Тоҷикӣ 3</SelectItem>
              <SelectItem value="farsi">Форсӣ</SelectItem>
              <SelectItem value="russian">Русӣ</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Transliteration - Simplified */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="transliteration" className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            <span>Талаффуз</span>
          </Label>
          <Switch 
            id="transliteration" 
            checked={showTransliteration}
            onCheckedChange={toggleTransliteration}
          />
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t">
        <p className="text-xs text-muted-foreground text-center w-full">
          Qurantaj 1.0.0
        </p>
      </div>
    </div>
  );
}

export function SettingsDrawer() {
  const [open, setOpen] = useState(false);
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          aria-label="Танзимот"
          title="Танзимот"
          className="flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          <span className="text-sm hidden md:inline">Танзимот</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="text-primary dark:text-accent">Танзимот</SheetTitle>
        </SheetHeader>
        <SettingsContent />
        <SheetFooter className="mt-8">
          <p className="text-xs text-muted-foreground text-center w-full">
            Нусхаи 1.0.0 | Барномасозӣ: Qurantaj
          </p>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}