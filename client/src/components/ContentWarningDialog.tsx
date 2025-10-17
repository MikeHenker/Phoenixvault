import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

interface ContentWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: () => void;
  gameTitle: string;
  contentWarnings?: string[];
}

export default function ContentWarningDialog({
  open,
  onOpenChange,
  onContinue,
  gameTitle,
  contentWarnings = ["Adult Content", "Sexual Themes", "Mature Language"],
}: ContentWarningDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
            <DialogTitle>Content Warning</DialogTitle>
          </div>
          <DialogDescription>
            {gameTitle} contains mature content that may not be suitable for all audiences.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <p className="text-sm font-medium">This game contains:</p>
          <div className="flex flex-wrap gap-2">
            {contentWarnings.map((warning, index) => (
              <Badge key={index} variant="secondary" className="bg-orange-500/10 text-orange-600 border-orange-500/20">
                {warning}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            By continuing, you acknowledge that you are 18+ and understand the nature of this content.
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto" data-testid="button-go-back">
            Go Back
          </Button>
          <Button onClick={onContinue} className="w-full sm:w-auto" data-testid="button-continue-anyway">
            I Understand, Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
