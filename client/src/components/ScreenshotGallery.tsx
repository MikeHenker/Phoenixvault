import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface ScreenshotGalleryProps {
  screenshots: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialIndex?: number;
}

export default function ScreenshotGallery({
  screenshots,
  open,
  onOpenChange,
  initialIndex = 0,
}: ScreenshotGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % screenshots.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length);
  };

  if (!screenshots.length) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl p-0">
        <div className="relative bg-black">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
            onClick={() => onOpenChange(false)}
            data-testid="button-close-gallery"
          >
            <X className="h-6 w-6" />
          </Button>

          <div className="relative aspect-video">
            <img
              src={screenshots[currentIndex]}
              alt={`Screenshot ${currentIndex + 1}`}
              className="w-full h-full object-contain"
              data-testid={`img-screenshot-${currentIndex}`}
            />

            {screenshots.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                  onClick={prevImage}
                  data-testid="button-prev-screenshot"
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                  onClick={nextImage}
                  data-testid="button-next-screenshot"
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}
          </div>

          <div className="p-4 bg-black/90 text-white">
            <p className="text-center text-sm" data-testid="text-screenshot-counter">
              {currentIndex + 1} / {screenshots.length}
            </p>
            <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
              {screenshots.map((screenshot, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`flex-shrink-0 w-24 h-16 rounded overflow-hidden border-2 transition-all ${
                    currentIndex === index ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                  data-testid={`button-thumbnail-${index}`}
                >
                  <img
                    src={screenshot}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
