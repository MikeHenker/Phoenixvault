
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Ban, FolderOpen, Settings } from "lucide-react";

interface DenuvoWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: () => void;
  gameTitle: string;
}

export default function DenuvoWarningDialog({
  open,
  onOpenChange,
  onContinue,
  gameTitle,
}: DenuvoWarningDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
            <AlertDialogTitle className="text-2xl">Important Rules</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base">
            Please follow these important rules to ensure your activation remains valid.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 my-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                  <Ban className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold text-destructive mb-1">Avoid Steam</h3>
                  <p className="text-sm text-muted-foreground">
                    Do not launch the game through Steam
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                  <Settings className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold text-destructive mb-1">Do not Update</h3>
                  <p className="text-sm text-muted-foreground">
                    Do not update Windows as it'll break the activation
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                  <FolderOpen className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold text-destructive mb-1">Maintain Game Files</h3>
                  <p className="text-sm text-muted-foreground">
                    Keep game files in their original location after activation
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                  <Settings className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold text-destructive mb-1">System</h3>
                  <p className="text-sm text-muted-foreground">
                    Don't modify BIOS settings, reset HWID or overclock your system
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Getting Started</h3>
            <p className="text-sm text-muted-foreground">
              This is not a game crack, it's an Offline Activation Service that lets you play
              DRM-protected games offline without needing to open Steam.
            </p>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onContinue}>I Understand, Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
