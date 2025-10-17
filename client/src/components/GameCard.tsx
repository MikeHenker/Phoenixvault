
import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar, HardDrive, Star, Heart, ImageIcon } from "lucide-react";
import DownloadLinksModal from "./DownloadLinksModal";
import ScreenshotGallery from "./ScreenshotGallery";

interface GameCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  platform: string;
  fileSize: string;
  releaseDate: string;
  downloadLinks: string[];
  screenshots?: string[];
  contentTags?: string[];
  ageRating?: string;
  averageRating?: number;
  totalRatings?: number;
  onDownload?: () => void;
  onFavoriteToggle?: () => void;
  isFavorite?: boolean;
}

export default function GameCard({
  id,
  title,
  description,
  imageUrl,
  category,
  platform,
  fileSize,
  releaseDate,
  downloadLinks,
  screenshots = [],
  contentTags = [],
  ageRating = "everyone",
  averageRating = 0,
  totalRatings = 0,
  onDownload,
  onFavoriteToggle,
  isFavorite = false,
}: GameCardProps) {
  const isAdultContent = ageRating === "adult" || (category?.toLowerCase?.() === "adult");
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showScreenshots, setShowScreenshots] = useState(false);
  const [, setLocation] = useLocation();

  const handleCardClick = () => {
    setLocation(`/game/${id}`);
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDownloadModal(true);
  };

  const handleDownload = () => {
    onDownload?.();
    setShowDownloadModal(false);
  };

  return (
    <>
      <Card 
        className="group overflow-hidden hover-elevate transition-all duration-300 cursor-pointer active-elevate-2 flex flex-col h-full" 
        data-testid={`card-game-${title.toLowerCase().replace(/\s/g, '-')}`}
        onClick={handleCardClick}
      >
        <div className="relative aspect-video overflow-hidden" data-adult-content={isAdultContent}>
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {onFavoriteToggle && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-black/40 hover:bg-black/60 backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
                onFavoriteToggle();
              }}
              data-testid="button-favorite"
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
            </Button>
          )}
          
          {screenshots.length > 0 && (
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="bg-black/60 text-white backdrop-blur-sm" data-testid="badge-screenshots">
                <ImageIcon className="h-3 w-3 mr-1" />
                {screenshots.length}
              </Badge>
            </div>
          )}

          {isAdultContent && (
            <div className="absolute bottom-2 left-2">
              <Badge variant="destructive" className="text-xs">
                18+
              </Badge>
            </div>
          )}
        </div>

        <div className="p-3 flex flex-col flex-1">
          <h3 className="font-display font-bold text-base line-clamp-1 mb-1" data-testid="text-game-title">
            {title}
          </h3>
          
          <div 
            className="text-xs text-muted-foreground line-clamp-3 mb-2 prose prose-sm dark:prose-invert max-w-none [&>p]:m-0 [&>p]:leading-relaxed" 
            data-testid="text-game-description"
            dangerouslySetInnerHTML={{ __html: description }}
          />

          <div className="flex items-center gap-1 flex-wrap mb-2">
            <Badge variant="secondary" className="text-xs" data-testid="badge-category">
              {category}
            </Badge>
            {totalRatings > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                <span className="font-medium">{(averageRating / 20).toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <HardDrive className="h-3 w-3" />
              <span data-testid="text-file-size">{fileSize}</span>
            </div>
            <span>•</span>
            <span>{downloadLinks.length} mirrors</span>
          </div>

          <Button 
            variant="default"
            size="sm"
            onClick={handleDownloadClick}
            data-testid="button-download"
            className="w-full mt-auto"
          >
            <Download className="h-3 w-3 mr-2" />
            Download
          </Button>
        </div>
      </Card>

      <DownloadLinksModal
        open={showDownloadModal}
        onOpenChange={setShowDownloadModal}
        gameTitle={title}
        fileSize={fileSize}
        downloadLinks={downloadLinks}
        onDownloadClick={handleDownload}
      />

      <ScreenshotGallery
        screenshots={screenshots}
        open={showScreenshots}
        onOpenChange={setShowScreenshots}
      />
    </>
  );
}
