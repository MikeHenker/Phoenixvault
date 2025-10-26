import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, ArrowLeft, Calendar, Plus, Check, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Game } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function GameDetail() {
  const [, params] = useRoute("/game/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const { data: libraryEntry } = useQuery<any>({
    queryKey: ["/api/library/entry", params?.id],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/library");
      const library = await response.json();
      return library.find((entry: any) => entry.gameId === params?.id);
    },
    enabled: !!params?.id && !!session?.user && libraryCheck?.inLibrary,
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
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Button
          variant="ghost"
          onClick={() => setLocation("/library")}
          className="mb-6"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Library
        </Button>

        <Card className="overflow-hidden">
          {/* Hero Image */}
          <div className="relative aspect-[21/9] overflow-hidden bg-muted">
            <img
              src={game.imageUrl}
              alt={game.title}
              className="w-full h-full object-cover"
              data-testid="img-game-hero"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
          </div>

          {/* Content */}
          <div className="p-8 -mt-24 relative z-10">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Main Content */}
              <div className="flex-1 space-y-6">
                <div>
                  <h1
                    className="text-4xl font-bold mb-3"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                    data-testid="text-game-detail-title"
                  >
                    {game.title}
                  </h1>
                  <div className="flex items-center gap-3 mb-4">
                    <Badge variant="secondary" data-testid="badge-game-category">
                      {game.category}
                    </Badge>
                    {game.featured && (
                      <Badge className="bg-accent text-accent-foreground" data-testid="badge-featured">
                        Featured
                      </Badge>
                    )}
                  </div>
                  {game.tags && game.tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {game.tags.map((tag) => (
                        <Badge key={tag} variant="outline" data-testid={`badge-detail-tag-${tag}`}>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3" data-testid="text-about-title">
                    About This Game
                  </h2>
                  <p className="text-muted-foreground leading-relaxed" data-testid="text-game-description">
                    {game.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span data-testid="text-release-date">
                    Added {new Date(game.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:w-80">
                <Card className="p-6 sticky top-6">
                  <div className="space-y-4">
                    {session?.user ? (
                      <>
                        {libraryCheck?.inLibrary ? (
                          <Button
                            size="lg"
                            className="w-full"
                            variant="outline"
                            disabled
                            data-testid="button-in-library"
                          >
                            <Check className="w-5 h-5 mr-2" />
                            In Library
                          </Button>
                        ) : (
                          <Button
                            size="lg"
                            className="w-full"
                            variant="outline"
                            onClick={() => addToLibraryMutation.mutate(game.id)}
                            disabled={addToLibraryMutation.isPending}
                            data-testid="button-add-to-library"
                          >
                            <Plus className="w-5 h-5 mr-2" />
                            {addToLibraryMutation.isPending ? "Adding..." : "Add to Library"}
                          </Button>
                        )}
                        <Button
                          size="lg"
                          className="w-full"
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
                        className="w-full"
                        onClick={() => setLocation("/auth/login")}
                        data-testid="button-login-to-download"
                      >
                        Sign in to Download
                      </Button>
                    )}

                    <div className="pt-4 border-t space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Category</p>
                        <p className="font-medium" data-testid="text-sidebar-category">
                          {game.category}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Tags</p>
                        <div className="flex gap-2 flex-wrap">
                          {game.tags?.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          )) || <p className="text-sm text-muted-foreground">No tags</p>}
                        </div>
                      </div>
                      
                      {libraryCheck?.inLibrary && (
                        <div className="pt-4 border-t space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="hasLocalFiles"
                              checked={libraryEntry?.hasLocalFiles || false}
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
                          
                          {libraryEntry?.hasLocalFiles && (
                            <div className="space-y-2">
                              <Label htmlFor="exePath" className="text-sm">
                                Game .exe path
                              </Label>
                              <div className="flex gap-2">
                                <Input
                                  id="exePath"
                                  type="text"
                                  placeholder="C:\Games\game.exe"
                                  value={libraryEntry?.exePath || ""}
                                  readOnly
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
                              {libraryEntry?.exePath && (
                                <Button
                                  size="sm"
                                  className="w-full mt-2"
                                  onClick={() => {
                                    navigator.clipboard.writeText(libraryEntry.exePath);
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
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
