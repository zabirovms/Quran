import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DuaCardProps {
  surah: number;
  verse: number;
  arabic: string;
  transliteration: string;
  tajik: string;
}

export default function DuaCard({ surah, verse, arabic, transliteration, tajik }: DuaCardProps) {
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <Badge variant="secondary" className="text-sm">
            Сура {surah}, Оят {verse}
          </Badge>
        </div>
        
        <ScrollArea className="h-[200px] w-full rounded-md border p-4">
          <div className="space-y-4">
            <div className="text-right text-2xl font-arabic leading-loose">
              {arabic}
            </div>
            <div className="text-muted-foreground text-sm">
              {transliteration}
            </div>
            <div className="text-sm">
              {tajik}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 