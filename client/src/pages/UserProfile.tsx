import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, Download, Clock, User } from "lucide-react";
import GameCard from "@/components/GameCard";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Game } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface FavoriteWithGame {
  id: number;
  game: Game;
}

interface DownloadHistoryWithGame {
  id: number;
  game: Game;
  downloadedAt: string;
}

export default function UserProfile() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: favorites = [], isLoading: favoritesLoading } = useQuery<FavoriteWithGame[]>({
    queryKey: ["/api/favorites"],
    enabled: !!user,
  });

  const { data: downloadHistory = [], isLoading: historyLoading } = useQuery<DownloadHistoryWithGame[]>({
    queryKey: ["/api/download-history"],
    enabled: !!user,
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (gameId: string) => {
      await apiRequest("DELETE", `/api/favorites/${gameId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Removed from favorites",
        description: "Game has been removed from your favorites",
      });
    },
  });

  const trackDownloadMutation = useMutation({
    mutationFn: async (gameId: string) => {
      await apiRequest("POST", "/api/download-history", { gameId });
    },
  });

  const handleDownload = (gameId: string) => {
    trackDownloadMutation.mutate(gameId);
  };

  const handleFavoriteToggle = (gameId: string) => {
    removeFavoriteMutation.mutate(gameId);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md w-full text-center">
          <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Please Log In</h2>
          <p className="text-muted-foreground mb-4">
            You need to be logged in to view your profile
          </p>
          <Button asChild>
            <a href="/login">Go to Login</a>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="p-8 mb-8">
        <div className="flex items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarFallback className="text-3xl">
              {user.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-3xl font-bold font-display mb-2">{user.username}</h1>
            <Badge variant={user.role === "admin" ? "default" : "secondary"}>
              {user.role}
            </Badge>
            <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                <span>{favorites.length} Favorites</span>
              </div>
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                <span>{downloadHistory.length} Downloads</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="favorites" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="favorites" data-testid="tab-favorites">
            <Heart className="h-4 w-4 mr-2" />
            Favorites
          </TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">
            <Clock className="h-4 w-4 mr-2" />
            Download History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="favorites" className="mt-6">
          {favoritesLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading favorites...</p>
            </div>
          ) : favorites.length === 0 ? (
            <Card className="p-12 text-center">
              <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
              <p className="text-muted-foreground mb-4">
                Start adding games to your favorites to see them here
              </p>
              <Button asChild>
                <a href="/">Browse Games</a>
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map(({ game }) => (
                <GameCard
                  key={game.id}
                  id={game.id.toString()}
                  title={game.title}
                  description={game.description}
                  imageUrl={game.imageUrl}
                  category={game.category}
                  platform={game.platform}
                  fileSize={game.fileSize}
                  releaseDate={new Date(game.releaseDate).toLocaleDateString()}
                  downloadLinks={game.downloadLinks}
                  averageRating={game.averageRating || 0}
                  totalRatings={game.totalRatings || 0}
                  onDownload={() => handleDownload(game.id)}
                  onFavoriteToggle={() => handleFavoriteToggle(game.id)}
                  isFavorite={true}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          {historyLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading download history...</p>
            </div>
          ) : downloadHistory.length === 0 ? (
            <Card className="p-12 text-center">
              <Download className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No downloads yet</h3>
              <p className="text-muted-foreground mb-4">
                Games you download will appear here
              </p>
              <Button asChild>
                <a href="/">Browse Games</a>
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {downloadHistory.map(({ game, downloadedAt }) => (
                <Card key={`${game.id}-${downloadedAt}`} className="p-4 hover-elevate">
                  <div className="flex items-center gap-4">
                    <img
                      src={game.imageUrl}
                      alt={game.title}
                      className="w-20 h-28 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{game.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {game.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <Badge variant="outline">{game.platform}</Badge>
                        <span>{game.fileSize}</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(downloadedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="default"
                      onClick={() => handleDownload(game.id)}
                      data-testid="button-redownload"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Again
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
