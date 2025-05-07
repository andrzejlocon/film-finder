import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  filmTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDeleteDialog({ isOpen, filmTitle, onConfirm, onCancel }: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Usuń film</DialogTitle>
          <DialogDescription>
            Czy na pewno chcesz usunąć film &quot;{filmTitle}&quot;? Tej operacji nie można cofnąć.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
          <Button variant="outline" onClick={onCancel}>
            Anuluj
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Usuń film
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
