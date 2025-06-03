import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DuaCardProps {
  surah: number;
  verse: number;
  arabic: string;
  transliteration: string;
  tajik: string;
}

export default function DuaCard({ surah, verse, arabic, transliteration, tajik }: DuaCardProps): React.ReactElement {
  return (
    <article className="w-full bg-card rounded-lg border p-4 space-y-3 hover:bg-accent/50 transition-colors">
      <div className="flex justify-between items-center">
        <Badge variant="secondary" className={cn("text-sm")}>
          Сураи {surah}, Ояти {verse}
        </Badge>
      </div>
      
      <div className="space-y-2">
        <div className="text-right text-xl md:text-2xl font-arabic leading-relaxed">
          {arabic}
        </div>
        <div className="text-muted-foreground text-sm md:text-base">
          {transliteration}
        </div>
        <div className="text-sm md:text-base">
          {tajik}
        </div>
      </div>
    </article>
  );
} 
