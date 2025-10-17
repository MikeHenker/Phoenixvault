import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import RichTextEditor from "@/components/RichTextEditor";
import { Star, Download, Calendar, HardDrive, Heart, ImageIcon, Play, MessageSquare, Info, Share2, Flag, Copy, Check, Clock, MoreVertical, AlertTriangle, Monitor, Apple, Box } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import ScreenshotGallery from "@/components/ScreenshotGallery";
import DownloadLinksModal from "@/components/DownloadLinksModal";
import type { Game } from "@shared/schema";

export default function GameDetails() {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [showScreenshots, setShowScreenshots] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [copied, setCopied] = useState(false);

  const { data: game, isLoading } = useQuery<Game>({
    queryKey: ["/api/games", id],
    queryFn: async () => {
      const res = await fetch(`/api/games/${id}`);
      if (!res.ok) throw new Error("Game not found");
      return res.json();
    },
  });

  const { data: reviews = [] } = useQuery<any[]>({
    queryKey: ["/api/reviews", id],
    queryFn: async () => {
      const res = await fetch(`/api/reviews/${id}`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: favorites = [] } = useQuery<any[]>({
    queryKey: ["/api/favorites"],
    enabled: !!user,
  });

  const { data: allGames = [] } = useQuery<Game[]>({
    queryKey: ["/api/games"],
  });

  const relatedGames = allGames
    .filter((g) => {
      const isAdult = g.category?.toLowerCase() === "adult" || g.ageRating === "adult";
      return g.id !== id && g.category === game?.category && !isAdult;
    })
    .slice(0, 4);

  const addReviewMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/reviews", {
        gameId: id,
        rating: rating * 20,
        comment,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/games", id] });
      setRating(0);
      setComment("");
      toast({
        title: "Review submitted",
        description: "Thank you for your review!",
      });
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      const isFavorite = favorites.some((fav: any) => fav.gameId === id);
      if (isFavorite) {
        await apiRequest("DELETE", `/api/favorites/${id}`);
      } else {
        await apiRequest("POST", "/api/favorites", { gameId: id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
    },
  });

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: game?.title,
        text: `Check out ${game?.title} on Phoenix Games!`,
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Game link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReport = () => {
    toast({
      title: "Report submitted",
      description: "Thank you for reporting this game. We'll review it shortly.",
    });
  };

  const estimateDownloadTime = (fileSize: string) => {
    const match = fileSize.match(/(\d+\.?\d*)\s*(GB|MB)/i);
    if (!match) return "Unknown";
    
    const size = parseFloat(match[1]);
    const unit = match[2].toUpperCase();
    const sizeInMB = unit === "GB" ? size * 1024 : size;
    
    // Assume average download speed of 10 MB/s (good broadband)
    const timeInSeconds = sizeInMB / 10;
    const minutes = Math.floor(timeInSeconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `~${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `~${minutes}m`;
    return "< 1m";
  };

  const getPlatformIcon = (platform: string) => {
    const platformLower = platform.toLowerCase();
    if (platformLower.includes('windows') || platformLower.includes('pc')) return Monitor;
    if (platformLower.includes('mac') || platformLower.includes('apple')) return Apple;
    return Box;
  };

  const ratingDistribution = reviews.reduce((acc: any, review: any) => {
    const stars = Math.round(review.rating / 20);
    acc[stars] = (acc[stars] || 0) + 1;
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} onLogout={logout} />
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading game...</p>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} onLogout={logout} />
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Game not found</p>
        </div>
      </div>
    );
  }

  const isFavorite = favorites.some((fav: any) => fav.gameId === id);

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onLogout={logout} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            {game.trailerUrl ? (
              <div className="aspect-video relative overflow-hidden rounded-lg">
                <iframe
                  src={game.trailerUrl}
                  title={`${game.title} Trailer`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  data-testid="video-trailer"
                />
                {game.screenshots && game.screenshots.length > 0 && (
                  <div className="absolute bottom-4 right-4 z-10">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowScreenshots(true)}
                      className="bg-black/60 text-white backdrop-blur-sm hover:bg-black/80"
                      data-testid="button-view-screenshots"
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      {game.screenshots.length} Screenshots
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-video relative overflow-hidden rounded-lg cursor-pointer" onClick={() => setShowScreenshots(true)}>
                <img
                  src={game.imageUrl}
                  alt={game.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                {game.screenshots && game.screenshots.length > 0 && (
                  <div className="absolute bottom-4 right-4">
                    <Badge variant="secondary" className="bg-black/60 text-white backdrop-blur-sm">
                      <ImageIcon className="h-4 w-4 mr-2" />
                      {game.screenshots.length} Screenshots
                    </Badge>
                  </div>
                )}
              </div>
            )}

            <Tabs defaultValue="about" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="about" className="gap-2" data-testid="tab-about">
                  <Info className="h-4 w-4" />
                  About
                </TabsTrigger>
                <TabsTrigger value="reviews" className="gap-2" data-testid="tab-reviews">
                  <MessageSquare className="h-4 w-4" />
                  Reviews ({reviews.length})
                </TabsTrigger>
                {game.screenshots && game.screenshots.length > 0 && (
                  <TabsTrigger value="screenshots" className="gap-2" data-testid="tab-screenshots">
                    <ImageIcon className="h-4 w-4" />
                    Screenshots ({game.screenshots.length})
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="about" className="mt-6">
                <Card>
                  <CardContent className="pt-6">
                    <div 
                      className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: game.description }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    {user && (
                      <div className="space-y-3 p-4 border rounded-lg">
                        <p className="font-medium">Write a review</p>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setRating(star)}
                              data-testid={`button-star-${star}`}
                            >
                              <Star
                                className={`h-6 w-6 cursor-pointer ${
                                  star <= rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        <RichTextEditor
                          value={comment}
                          onChange={setComment}
                          placeholder="Share your thoughts about this game..."
                        />
                        <Button
                          onClick={() => addReviewMutation.mutate()}
                          disabled={rating === 0 || addReviewMutation.isPending}
                          data-testid="button-submit-review"
                        >
                          Submit Review
                        </Button>
                      </div>
                    )}
                    {!user && (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">You must be logged in to write a review</p>
                        <Button onClick={() => window.location.href = '/login'}>
                          Login to Review
                        </Button>
                      </div>
                    )}

                    {reviews.map((review: any) => (
                      <div key={review.id} className="p-4 border rounded-lg" data-testid={`review-${review.id}`}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">{review.username || "Anonymous"}</p>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= review.rating / 20 ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <div 
                          className="text-sm text-muted-foreground prose prose-sm dark:prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: review.comment }}
                        />
                      </div>
                    ))}

                    {reviews.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">No reviews yet. Be the first to review!</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {game.screenshots && game.screenshots.length > 0 && (
                <TabsContent value="screenshots" className="mt-6">
                  <div className="grid grid-cols-2 gap-4">
                    {game.screenshots.map((screenshot, index) => (
                      <div
                        key={index}
                        className="aspect-video relative overflow-hidden rounded-lg cursor-pointer hover-elevate"
                        onClick={() => setShowScreenshots(true)}
                        data-testid={`screenshot-${index}`}
                      >
                        <img
                          src={screenshot}
                          alt={`${game.title} screenshot ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-start justify-between gap-2">
                  <span className="line-clamp-2">{game.title}</span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFavoriteMutation.mutate()}
                      disabled={!user}
                      data-testid="button-favorite"
                    >
                      <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary">{game.category}</Badge>
                  <Badge variant="outline" className="gap-1">
                    {(() => {
                      const PlatformIcon = getPlatformIcon(game.platform);
                      return <PlatformIcon className="h-3 w-3" />;
                    })()}
                    {game.platform}
                  </Badge>
                  {game.downloads && game.downloads > 1000 && (
                    <Badge className="bg-orange-500 hover:bg-orange-600">Popular</Badge>
                  )}
                  {game.createdAt && new Date(game.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 && (
                    <Badge className="bg-green-500 hover:bg-green-600">New</Badge>
                  )}
                </div>

                {game.totalRatings && game.totalRatings > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                      <span className="text-lg font-bold">{((game.averageRating || 0) / 20).toFixed(1)}</span>
                      <span className="text-muted-foreground">({game.totalRatings} ratings)</span>
                    </div>
                    <div className="space-y-1">
                      {[5, 4, 3, 2, 1].map((stars) => (
                        <div key={stars} className="flex items-center gap-2">
                          <span className="text-xs w-8">{stars} ★</span>
                          <Progress 
                            value={((ratingDistribution[stars] || 0) / (game.totalRatings || 1)) * 100} 
                            className="h-2 flex-1"
                          />
                          <span className="text-xs text-muted-foreground w-8 text-right">
                            {ratingDistribution[stars] || 0}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Star className="h-5 w-5" />
                    <span className="text-sm">No ratings yet</span>
                  </div>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Released</span>
                    </div>
                    <span className="font-medium">{new Date(game.releaseDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-muted-foreground" />
                      <span>Size</span>
                    </div>
                    <span className="font-medium">{game.fileSize}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Download Time</span>
                    </div>
                    <span className="font-medium">{estimateDownloadTime(game.fileSize)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4 text-muted-foreground" />
                      <span>Downloads</span>
                    </div>
                    <span className="font-medium">{game.downloads || 0}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => setShowDownloadModal(true)}
                    data-testid="button-download"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleShare}
                    data-testid="button-share"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" data-testid="button-more-actions">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleShare}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share Game
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigator.clipboard.writeText(game.id)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Game ID
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleReport} className="text-red-600">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Report Issue
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {game.contentTags && game.contentTags.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium mb-2">Content Tags</p>
                    <div className="flex flex-wrap gap-1">
                      {game.contentTags.map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {relatedGames.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Box className="h-5 w-5 text-primary" />
                    Similar Games
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {relatedGames.map((relGame) => (
                    <a
                      key={relGame.id}
                      href={`/game/${relGame.id}`}
                      className="flex gap-3 p-3 rounded-lg hover-elevate cursor-pointer border transition-all"
                      data-testid={`related-game-${relGame.id}`}
                    >
                      <div className="relative">
                        <img
                          src={relGame.imageUrl}
                          alt={relGame.title}
                          className="w-20 h-16 object-cover rounded"
                        />
                        {relGame.downloads && relGame.downloads > 1000 && (
                          <div className="absolute -top-1 -right-1">
                            <Badge className="h-5 px-1 text-xs bg-orange-500">Hot</Badge>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-1 mb-1">{relGame.title}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                            <span>{((relGame.averageRating || 0) / 20).toFixed(1)}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">•</span>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Download className="h-3 w-3" />
                            <span>{relGame.downloads || 0}</span>
                          </div>
                        </div>
                      </div>
                    </a>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <ScreenshotGallery
        screenshots={game.screenshots || []}
        open={showScreenshots}
        onOpenChange={setShowScreenshots}
      />

      <DownloadLinksModal
        open={showDownloadModal}
        onOpenChange={setShowDownloadModal}
        gameTitle={game.title}
        fileSize={game.fileSize}
        downloadLinks={game.downloadLinks || []}
        onDownloadClick={() => setShowDownloadModal(false)}
      />
    </div>
  );
}
