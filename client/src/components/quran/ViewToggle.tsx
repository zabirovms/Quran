import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ViewToggleProps {
  isPageView: boolean;
  onToggle: (isPageView: boolean) => void;
}

export default function ViewToggle({ isPageView, onToggle }: ViewToggleProps) {
  return (
    <div className="flex items-center space-x-2 mb-4">
      <Switch
        id="view-mode"
        checked={isPageView}
        onCheckedChange={onToggle}
      />
      <Label htmlFor="view-mode" className="text-sm font-medium">
        {isPageView ? "Reading View" : "Translation View"}
      </Label>
    </div>
  );
} 