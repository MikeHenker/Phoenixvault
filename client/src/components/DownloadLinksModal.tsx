import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, HardDrive, Link2, ExternalLink, CheckCircle, Copy, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface DownloadLinksModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gameTitle: string;
  fileSize: string;
  downloadLinks: string[];
  onDownloadClick: () => void;
}

export default function DownloadLinksModal({
  open,
  onOpenChange,
  gameTitle,
  fileSize,
  downloadLinks,
  onDownloadClick,
}: DownloadLinksModalProps) {
  const [selectedLink, setSelectedLink] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const getHostName = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return "Unknown Host";
    }
  };

  const handleDownload = (link: string) => {
    setSelectedLink(link);
    onDownloadClick();
    window.open(link, '_blank');
  };

  const handleCopyLink = (link: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(link);
    setCopiedIndex(index);
    toast({
      title: "Link copied!",
      description: "Download link copied to clipboard",
    });
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">{gameTitle}</DialogTitle>
          <DialogDescription>
            Choose your preferred download mirror
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <HardDrive className="h-4 w-4" />
                <span className="text-xs font-medium">Size</span>
              </div>
              <p className="text-lg font-bold">{fileSize}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Link2 className="h-4 w-4" />
                <span className="text-xs font-medium">Total Links</span>
              </div>
              <p className="text-lg font-bold">{downloadLinks.length}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Download className="h-4 w-4" />
                <span className="text-xs font-medium">File Hosters</span>
              </div>
              <p className="text-lg font-bold">{downloadLinks.length}</p>
            </Card>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download Mirrors
            </h3>
            <div className="space-y-2">
              {downloadLinks.map((link, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="p-4 hover-elevate cursor-pointer" onClick={() => handleDownload(link)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                          <ExternalLink className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">Mirror {index + 1}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-md">
                            {getHostName(link)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                          Online
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => handleCopyLink(link, index, e)}
                          data-testid={`button-copy-link-${index}`}
                        >
                          {copiedIndex === index ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                        <Button variant="default" size="sm">
                          Download
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-muted/30 p-4 rounded-lg border">
            <p className="text-xs text-muted-foreground text-center">
              Please don't be "dumb" and use common sense—if a file is 2MB, it's probably not the full game!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
