
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

interface AgeVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified: () => void;
}

export default function AgeVerificationDialog({
  open,
  onOpenChange,
  onVerified,
}: AgeVerificationDialogProps) {
  const handleConfirm = () => {
    localStorage.setItem("ageVerified", "true");
    onVerified();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="h-6 w-6 text-orange-500" />
            <DialogTitle>Age Verification Required</DialogTitle>
          </div>
          <DialogDescription>
            This content is intended for mature audiences only. You must be 18 years or older to
            view this content.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            By clicking "I am 18 or older", you confirm that you meet the age requirement to view
            adult content.
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            I am under 18
          </Button>
          <Button onClick={handleConfirm} className="w-full sm:w-auto">
            I am 18 or older
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
