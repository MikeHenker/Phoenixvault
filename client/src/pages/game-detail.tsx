import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, ArrowLeft, Calendar, Plus, Check, Play, Monitor, Apple, Award, Star, Users } from "lucide-react";
import { SiLinux } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import type { Game, UserLibrary } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

export default function GameDetail() {
  const [, params] = useRoute("/game/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const { data: game, isLoading } = useQuery<Game>({
    queryKey: ["/api/games", params?.id],
    enabled: !!params?.id,
  });

  const { data: session } = useQuery<{ user: any }>({
    queryKey: ["/api/session"],
  });

  const { data: libraryCheck } = useQuery<{ inLibrary: boolean }>({
    queryKey: ["/api/library/check", params?.id],
    enabled: !!params?.id && !!session?.user,
  });

  const { data: libraryEntry } = useQuery<UserLibrary | null>({
    queryKey: ["/api/library/entry", params?.id],
    queryFn: async () => {
      const response = await fetch(`/api/library/${params?.id}`, {
        credentials: "include",
      });
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!params?.id && !!session?.user && !!libraryCheck?.inLibrary,
  });

  const { data: screenshots } = useQuery({
    queryKey: ["/api/games", params?.id, "screenshots"],
    queryFn: async () => {
      const response = await fetch(`/api/games/${params?.id}/screenshots`, {
        credentials: "include",
      });
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!params?.id,
  });

  const { data: steamData } = useQuery<any>({
    queryKey: ["/api/steam/details", game?.steamAppId],
    queryFn: async () => {
      if (!game?.steamAppId) return null;
      const response = await fetch(`/api/steam/details/${game.steamAppId}`, {
        credentials: "include",
      });
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!game?.steamAppId,
  });

  const addToLibraryMutation = useMutation({
    mutationFn: async (gameId: string) => {
      return await apiRequest("POST", "/api/library", { gameId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/library/check", params?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/library"] });
      toast({
        title: "Added to library!",
        description: "Game has been added to your library",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add to library",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const downloadMutation = useMutation({
    mutationFn: async (gameId: string) => {
      return await apiRequest("POST", "/api/downloads", { gameId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/downloads"] });
      toast({
        title: "Download started!",
        description: "Your game is being prepared for download",
      });
      if (game?.downloadUrl) {
        window.open(game.downloadUrl, "_blank");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Download failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateLibraryMutation = useMutation({
    mutationFn: async ({ gameId, hasLocalFiles, exePath }: { gameId: string; hasLocalFiles?: boolean; exePath?: string }) => {
      const response = await apiRequest("PATCH", `/api/library/${gameId}`, { hasLocalFiles, exePath });
      return await response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/library/entry", params?.id] });
      await queryClient.invalidateQueries({ queryKey: ["/api/library"] });
      toast({
        title: "Library updated!",
        description: "Your settings have been saved",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <Card className="animate-pulse">
            <div className="aspect-[21/9] bg-muted" />
            <div className="p-8 space-y-4">
              <div className="h-8 bg-muted rounded w-1/3" />
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-12 text-center">
          <p className="text-muted-foreground text-lg" data-testid="text-game-not-found">
            Game not found
          </p>
          <Button onClick={() => setLocation("/library")} className="mt-4" data-testid="button-back-to-library">
            Back to Library
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Hero Section */}
      <div className="relative h-[500px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${steamData?.background || game.imageUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
        
        <div className="relative max-w-7xl mx-auto px-6 h-full flex items-end pb-12">
          <div className="space-y-4 w-full">
            <Button
              variant="ghost"
              onClick={() => setLocation("/library")}
              className="mb-4"
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <div className="flex gap-6 items-end">
              <img
                src={game.imageUrl}
                alt={game.title}
                className="w-64 rounded-lg shadow-2xl hidden md:block"
                data-testid="img-game-cover"
              />
              
              <div className="flex-1 space-y-4">
                <div>
                  <h1 
                    className="text-5xl font-bold text-white drop-shadow-lg mb-4"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                    data-testid="text-game-detail-title"
                  >
                    {game.title}
                  </h1>
                  
                  <div className="flex items-center gap-3 flex-wrap">
                    {steamData?.platforms && (
                      <div className="flex gap-3 items-center bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded">
                        {steamData.platforms.windows && (
                          <div className="flex items-center gap-1.5 text-white" data-testid="badge-platform-windows">
                            <Monitor className="w-5 h-5" />
                            <span className="text-sm">Windows</span>
                          </div>
                        )}
                        {steamData.platforms.mac && (
                          <div className="flex items-center gap-1.5 text-white" data-testid="badge-platform-mac">
                            <Apple className="w-5 h-5" />
                            <span className="text-sm">Mac</span>
                          </div>
                        )}
                        {steamData.platforms.linux && (
                          <div className="flex items-center gap-1.5 text-white" data-testid="badge-platform-linux">
                            <SiLinux className="w-5 h-5" />
                            <span className="text-sm">Linux</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {steamData?.metacritic && (
                      <div className="bg-green-600 px-4 py-2 rounded font-bold text-white" data-testid="badge-metacritic">
                        {steamData.metacritic}
                      </div>
                    )}
                    
                    {steamData?.achievements?.total > 0 && (
                      <div className="bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded flex items-center gap-2 text-white">
                        <Award className="w-4 h-4" />
                        <span className="text-sm" data-testid="text-achievements">{steamData.achievements.total} Achievements</span>
                      </div>
                    )}
                    
                    {steamData?.recommendations > 0 && (
                      <div className="bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded flex items-center gap-2 text-white">
                        <Users className="w-4 h-4" />
                        <span className="text-sm" data-testid="text-recommendations">
                          {steamData.recommendations.toLocaleString()} Reviews
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  {session?.user ? (
                    <>
                      {libraryCheck?.inLibrary ? (
                        <Button
                          size="lg"
                          variant="outline"
                          disabled
                          className="bg-black/40 backdrop-blur-sm border-white/20 text-white"
                          data-testid="button-in-library"
                        >
                          <Check className="w-5 h-5 mr-2" />
                          In Library
                        </Button>
                      ) : (
                        <Button
                          size="lg"
                          variant="outline"
                          onClick={() => addToLibraryMutation.mutate(game.id)}
                          disabled={addToLibraryMutation.isPending}
                          className="bg-black/40 backdrop-blur-sm border-white/20 text-white hover-elevate"
                          data-testid="button-add-to-library"
                        >
                          <Plus className="w-5 h-5 mr-2" />
                          {addToLibraryMutation.isPending ? "Adding..." : "Add to Library"}
                        </Button>
                      )}
                      <Button
                        size="lg"
                        onClick={() => downloadMutation.mutate(game.id)}
                        disabled={downloadMutation.isPending}
                        data-testid="button-download-game"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        {downloadMutation.isPending ? "Preparing..." : "Download Now"}
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="lg"
                      onClick={() => setLocation("/auth/login")}
                      data-testid="button-login-to-download"
                    >
                      Sign in to Download
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4" data-testid="text-about-title">
                About This Game
              </h2>
              <div 
                className="text-muted-foreground leading-relaxed" 
                data-testid="text-game-description"
                dangerouslySetInnerHTML={{ __html: steamData?.aboutTheGame || game.description }}
              />
            </Card>

            {/* Features & Categories */}
            {steamData?.categories && steamData.categories.length > 0 && (
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">Features</h3>
                <div className="flex gap-2 flex-wrap">
                  {steamData.categories.map((category: string) => (
                    <Badge key={category} variant="secondary" className="px-3 py-1.5" data-testid={`badge-category-${category}`}>
                      {category}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            {/* Trailers */}
            {steamData?.movies && steamData.movies.length > 0 && (
              <Card className="p-6">
                <h3 className="text-2xl font-bold mb-6" data-testid="text-trailers-title">Trailers & Videos</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {steamData.movies.slice(0, 4).map((movie: any, index: number) => (
                    <Card
                      key={movie.id}
                      className="overflow-hidden cursor-pointer hover-elevate group"
                      onClick={() => setSelectedVideo(movie.webm?.max || movie.webm?.['480'] || movie.mp4?.max || movie.mp4?.['480'])}
                      data-testid={`card-trailer-${index}`}
                    >
                      <div className="relative aspect-video bg-muted">
                        <img
                          src={movie.thumbnail}
                          alt={movie.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition-colors">
                          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Play className="w-8 h-8 text-black ml-1" fill="black" />
                          </div>
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium line-clamp-1" data-testid={`text-trailer-name-${index}`}>
                          {movie.name}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            )}

            {/* Screenshots */}
            {screenshots && screenshots.length > 0 && (
              <Card className="p-6">
                <h3 className="text-2xl font-bold mb-6" data-testid="text-screenshots-title">Screenshots</h3>
                <div className="grid grid-cols-2 gap-4">
                  {screenshots.map((screenshot: any) => (
                    <div key={screenshot.id} className="aspect-video overflow-hidden rounded-lg hover-elevate cursor-pointer">
                      <img
                        src={screenshot.imageUrl}
                        alt={screenshot.caption || "Game screenshot"}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                        onClick={() => window.open(screenshot.imageUrl, '_blank')}
                        data-testid={`img-screenshot-${screenshot.id}`}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* System Requirements */}
            {steamData?.pcRequirements && (steamData.pcRequirements.minimum || steamData.pcRequirements.recommended) && (
              <Card className="p-6">
                <h3 className="text-2xl font-bold mb-6" data-testid="text-requirements-title">System Requirements</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {steamData.pcRequirements.minimum && (
                    <div>
                      <h4 className="font-semibold mb-3 text-lg" data-testid="text-minimum-requirements">Minimum</h4>
                      <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans" data-testid="text-minimum-requirements-content">
                        {steamData.pcRequirements.minimum}
                      </pre>
                    </div>
                  )}
                  {steamData.pcRequirements.recommended && (
                    <div>
                      <h4 className="font-semibold mb-3 text-lg" data-testid="text-recommended-requirements">Recommended</h4>
                      <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans" data-testid="text-recommended-requirements-content">
                        {steamData.pcRequirements.recommended}
                      </pre>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6 sticky top-6">
              <div className="space-y-4">
                {steamData?.price && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Price</p>
                    <p className="font-bold text-2xl" data-testid="text-price">
                      {steamData.price}
                    </p>
                    {steamData.priceData?.discountPercent > 0 && (
                      <div className="flex gap-2 items-center mt-1">
                        <Badge variant="destructive" className="font-bold">
                          -{steamData.priceData.discountPercent}%
                        </Badge>
                        <span className="text-sm text-muted-foreground line-through">
                          {steamData.priceData.initialFormatted}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                <Separator />
                
                <div className="space-y-3">
                  {steamData?.developers && steamData.developers.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Developer</p>
                      <p className="font-medium" data-testid="text-developer">
                        {steamData.developers.join(", ")}
                      </p>
                    </div>
                  )}
                  {steamData?.publishers && steamData.publishers.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Publisher</p>
                      <p className="font-medium" data-testid="text-publisher">
                        {steamData.publishers.join(", ")}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Release Date</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium" data-testid="text-release-date">
                        {steamData?.releaseDate || new Date(game.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {steamData?.controllerSupport && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Controller Support</p>
                      <p className="font-medium capitalize" data-testid="text-controller">
                        {steamData.controllerSupport}
                      </p>
                    </div>
                  )}
                  {game.tags && game.tags.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Tags</p>
                      <div className="flex gap-2 flex-wrap">
                        {game.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs" data-testid={`badge-detail-tag-${tag}`}>
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {libraryCheck?.inLibrary && libraryEntry && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="font-semibold">Local Files</h4>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="hasLocalFiles"
                          checked={libraryEntry.hasLocalFiles || false}
                          onCheckedChange={(checked) => {
                            updateLibraryMutation.mutate({
                              gameId: game.id,
                              hasLocalFiles: checked as boolean,
                            });
                          }}
                          data-testid="checkbox-has-local-files"
                        />
                        <Label htmlFor="hasLocalFiles" className="text-sm cursor-pointer">
                          I have the game files
                        </Label>
                      </div>

                      {libraryEntry.hasLocalFiles && (
                        <div className="space-y-2">
                          <Label htmlFor="exePath" className="text-sm">
                            Game .exe path
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              id="exePath"
                              type="text"
                              placeholder="C:\Games\game.exe"
                              value={libraryEntry.exePath || ""}
                              readOnly
                              className="text-xs"
                              data-testid="input-exe-path"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = '.exe';
                                input.onchange = (e) => {
                                  const file = (e.target as HTMLInputElement).files?.[0];
                                  if (file) {
                                    const path = (file as any).path || file.name;
                                    updateLibraryMutation.mutate({
                                      gameId: game.id,
                                      exePath: path,
                                    });
                                  }
                                };
                                input.click();
                              }}
                              data-testid="button-browse-exe"
                            >
                              Browse
                            </Button>
                          </div>
                          {libraryEntry.exePath && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full"
                              onClick={() => {
                                navigator.clipboard.writeText(libraryEntry.exePath!);
                                toast({
                                  title: "Path copied!",
                                  description: "Game path copied to clipboard",
                                });
                              }}
                              data-testid="button-copy-path"
                            >
                              Copy Path
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
          data-testid="modal-video-player"
        >
          <div className="max-w-6xl w-full space-y-4" onClick={(e) => e.stopPropagation()}>
            <video
              src={selectedVideo}
              controls
              autoPlay
              className="w-full rounded-lg"
              data-testid="video-player"
            />
            <Button
              variant="outline"
              onClick={() => setSelectedVideo(null)}
              data-testid="button-close-video"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
