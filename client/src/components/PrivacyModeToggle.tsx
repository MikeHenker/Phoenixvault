import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { EyeOff, Eye } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function PrivacyModeToggle() {
  const [privacyMode, setPrivacyMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("privacyMode") === "true";
    setPrivacyMode(saved);
    if (saved) {
      document.body.classList.add("privacy-mode");
    }
  }, []);

  const togglePrivacyMode = () => {
    const newMode = !privacyMode;
    setPrivacyMode(newMode);
    localStorage.setItem("privacyMode", String(newMode));
    
    if (newMode) {
      document.body.classList.add("privacy-mode");
    } else {
      document.body.classList.remove("privacy-mode");
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePrivacyMode}
          data-testid="button-privacy-mode"
          className={privacyMode ? "bg-primary/10" : ""}
        >
          {privacyMode ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{privacyMode ? "Privacy Mode On" : "Privacy Mode Off"}</p>
        <p className="text-xs text-muted-foreground">
          {privacyMode ? "Adult content is blurred" : "Click to blur adult content"}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
