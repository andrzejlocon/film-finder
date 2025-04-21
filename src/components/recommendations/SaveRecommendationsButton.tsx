import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Save } from "lucide-react";

interface SaveRecommendationsButtonProps {
  selectedCount: number;
  onSave: () => void;
  isSaving: boolean;
  className?: string;
}

export function SaveRecommendationsButton({
  selectedCount,
  onSave,
  isSaving,
  className,
}: SaveRecommendationsButtonProps) {
  return (
    <div className={cn("flex items-center justify-end gap-4", className)}>
      <p className="text-sm text-gray-600">
        {selectedCount} film{selectedCount !== 1 ? "s" : ""} selected
      </p>
      <Button onClick={onSave} disabled={selectedCount === 0 || isSaving} className="flex items-center gap-2">
        <Save className="h-4 w-4" />
        {isSaving ? "Saving..." : "Save Selected Films"}
      </Button>
    </div>
  );
}
