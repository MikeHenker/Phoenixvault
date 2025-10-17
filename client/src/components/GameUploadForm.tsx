import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Plus, Trash2, Link2, X } from "lucide-react";
import RichTextEditor from "./RichTextEditor";

interface GameUploadFormProps {
  onSubmit?: (gameData: any) => void;
}

export default function GameUploadForm({ onSubmit }: GameUploadFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [platform, setPlatform] = useState("");
  const [downloadLinks, setDownloadLinks] = useState<string[]>([""]);
  const [imageUrl, setImageUrl] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [trailerUrl, setTrailerUrl] = useState("");
  const [ageRating, setAgeRating] = useState("");
  const [screenshots, setScreenshots] = useState<string[]>([""]);
  const [contentTags, setContentTags] = useState<string[]>([]);

  const convertToEmbedUrl = (url: string): string => {
    if (!url) return "";
    
    // Convert youtube.com/watch?v=ID to embed format
    const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (watchMatch) {
      return `https://www.youtube.com/embed/${watchMatch[1]}`;
    }
    
    return url;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const gameData = {
      title,
      description,
      category,
      platform,
      downloadLinks: downloadLinks.filter(link => link.trim() !== ""),
      imageUrl,
      fileSize,
      releaseDate,
      trailerUrl: convertToEmbedUrl(trailerUrl),
      ageRating,
      screenshots: screenshots.filter(screenshot => screenshot.trim() !== ""),
      contentTags,
    };
    onSubmit?.(gameData);
  };

  const addDownloadLink = () => {
    setDownloadLinks([...downloadLinks, ""]);
  };

  const removeDownloadLink = (index: number) => {
    const newLinks = downloadLinks.filter((_, i) => i !== index);
    setDownloadLinks(newLinks.length > 0 ? newLinks : [""]);
  };

  const updateDownloadLink = (index: number, value: string) => {
    const newLinks = [...downloadLinks];
    newLinks[index] = value;
    setDownloadLinks(newLinks);
  };

  const addScreenshot = () => {
    setScreenshots([...screenshots, ""]);
  };

  const removeScreenshot = (index: number) => {
    const newScreenshots = screenshots.filter((_, i) => i !== index);
    setScreenshots(newScreenshots.length > 0 ? newScreenshots : [""]);
  };

  const updateScreenshot = (index: number, value: string) => {
    const newScreenshots = [...screenshots];
    newScreenshots[index] = value;
    setScreenshots(newScreenshots);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-display">Upload New Game</CardTitle>
        <CardDescription>Add a new game to the Phoenix Games library</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Game Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter game title"
                data-testid="input-title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger data-testid="select-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="steamtools">Steamtools</SelectItem>
                  <SelectItem value="denuvo">Denuvo</SelectItem>
                  <SelectItem value="preinstalled">Preinstalled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Enter game description with formatting..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select value={platform} onValueChange={setPlatform} required>
                <SelectTrigger data-testid="select-platform">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pc">PC / Windows</SelectItem>
                  <SelectItem value="mac">Mac</SelectItem>
                  <SelectItem value="linux">Linux</SelectItem>
                  <SelectItem value="multi">Multi-Platform</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fileSize">File Size</Label>
              <Input
                id="fileSize"
                value={fileSize}
                onChange={(e) => setFileSize(e.target.value)}
                placeholder="e.g., 45 GB"
                data-testid="input-file-size"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="releaseDate">Release Date</Label>
              <Input
                id="releaseDate"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                placeholder="e.g., Dec 2024"
                data-testid="input-release-date"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                data-testid="input-image-url"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                Download Links (Mirror System)
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addDownloadLink}
                data-testid="button-add-link"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Mirror
              </Button>
            </div>
            <div className="space-y-2">
              {downloadLinks.map((link, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={link}
                    onChange={(e) => updateDownloadLink(index, e.target.value)}
                    placeholder={`Mirror ${index + 1} - Enter download URL (e.g., FileQ, MegaUp, Google Drive)`}
                    data-testid={`input-download-link-${index}`}
                    required={index === 0}
                  />
                  {downloadLinks.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeDownloadLink(index)}
                      data-testid={`button-remove-link-${index}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Add multiple mirror links for better availability. Users can choose their preferred download source.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="trailerUrl">Trailer URL (Optional)</Label>
              <Input
                id="trailerUrl"
                value={trailerUrl}
                onChange={(e) => setTrailerUrl(e.target.value)}
                placeholder="YouTube or video URL"
                data-testid="input-trailer-url"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ageRating">Age Rating</Label>
              <Select value={ageRating} onValueChange={setAgeRating}>
                <SelectTrigger data-testid="select-age-rating">
                  <SelectValue placeholder="Select age rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">Everyone</SelectItem>
                  <SelectItem value="teen">Teen (13+)</SelectItem>
                  <SelectItem value="mature">Mature (17+)</SelectItem>
                  <SelectItem value="adult">Adult (18+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Screenshots</Label>
              <Button type="button" size="sm" onClick={addScreenshot} data-testid="button-add-screenshot">
                <Plus className="h-4 w-4 mr-1" />
                Add Screenshot
              </Button>
            </div>
            <div className="space-y-2">
              {screenshots.map((screenshot, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={screenshot}
                    onChange={(e) => updateScreenshot(index, e.target.value)}
                    placeholder={`Screenshot ${index + 1} URL`}
                    data-testid={`input-screenshot-${index}`}
                  />
                  {screenshots.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeScreenshot(index)}
                      data-testid={`button-remove-screenshot-${index}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contentTags">Content Tags (For Adult Games)</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {["Romance", "Nudity", "Sexual Content", "Visual Novel", "Dating Sim", "Story Rich"].map((tag) => (
                <Button
                  key={tag}
                  type="button"
                  variant={contentTags.includes(tag) ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (contentTags.includes(tag)) {
                      setContentTags(contentTags.filter(t => t !== tag));
                    } else {
                      setContentTags([...contentTags, tag]);
                    }
                  }}
                  data-testid={`button-tag-${tag.toLowerCase().replace(/\s/g, '-')}`}
                >
                  {tag}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Select relevant tags to help users find appropriate content
            </p>
          </div>

          <Button type="submit" className="w-full" data-testid="button-submit">
            <Upload className="h-4 w-4 mr-2" />
            Upload Game
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}