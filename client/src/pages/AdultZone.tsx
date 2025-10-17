import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import GameCard from "@/components/GameCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ShieldAlert } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Game } from "@shared/schema";
import { motion } from "framer-motion";

export default function AdultZone() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [ageVerified, setAgeVerified] = useState(false);

  useEffect(() => {
    const verified = localStorage.getItem("adultZoneVerified") === "true";
    setAgeVerified(verified);
  }, []);

  const { data: games = [], isLoading } = useQuery<Game[]>({
    queryKey: ["/api/games"],
  });

  const { data: favorites = [] } = useQuery<any[]>({
    queryKey: ["/api/favorites"],
    enabled: !!user,
  });

  const addFavoriteMutation = useMutation({
    mutationFn: async (gameId: string) => {
      await apiRequest("POST", "/api/favorites", { gameId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Added to favorites",
        description: "Game has been added to your favorites",
      });
    },
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

  const handleDownload = async (gameId: string, title: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to download games",
        variant: "destructive",
      });
      return;
    }

    try {
      trackDownloadMutation.mutate(gameId);
      toast({
        title: "Download ready",
        description: `Select a mirror to download ${title}`,
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not start download",
        variant: "destructive",
      });
    }
  };

  const handleFavoriteToggle = (gameId: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to save favorites",
        variant: "destructive",
      });
      return;
    }

    const isFavorite = favorites.some((fav: any) => fav.gameId === gameId);
    if (isFavorite) {
      removeFavoriteMutation.mutate(gameId);
    } else {
      addFavoriteMutation.mutate(gameId);
    }
  };

  const handleAgeVerification = () => {
    localStorage.setItem("adultZoneVerified", "true");
    setAgeVerified(true);
  };

  const adultGames = games
    .filter((game) => game.category?.toLowerCase() === "adult" || game.ageRating === "adult")
    .filter((game) => 
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      game.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      } else if (sortBy === "newest") {
        return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
      } else if (sortBy === "rating") {
        return (b.averageRating || 0) - (a.averageRating || 0);
      }
      return 0;
    });

  if (!ageVerified) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} onLogout={logout} />

        <div className="max-w-4xl mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-red-500/10 rounded-full">
                <ShieldAlert className="h-16 w-16 text-red-500" />
              </div>
            </div>

            <h1 className="text-4xl font-display font-bold mb-4 bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
              Adult Content Warning
            </h1>

            <div className="bg-muted rounded-lg p-8 mb-8">
              <p className="text-lg mb-4">
                This section contains adult content intended for mature audiences only.
              </p>
              <p className="text-muted-foreground mb-6">
                By clicking "I am 18 or older", you confirm that you meet the age requirement to view this content.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setLocation("/")}
                  className="w-full sm:w-auto"
                >
                  I am under 18
                </Button>
                <Button
                  size="lg"
                  onClick={handleAgeVerification}
                  className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                >
                  I am 18 or older
                </Button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              By entering, you agree that you are of legal age in your jurisdiction to view adult content.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onLogout={logout} />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-lg border border-red-500/30">
              <span className="text-3xl">🔞</span>
              <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                Adult Zone
              </h1>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search adult games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">A-Z (Title)</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mb-6">
            <p className="text-muted-foreground">
              {isLoading ? "Loading..." : `${adultGames.length} adult games available`}
            </p>
          </div>

          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading games...</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {adultGames.map((game) => (
                  <GameCard
                    key={game.id}
                    id={game.id}
                    title={game.title}
                    description={game.description}
                    imageUrl={game.imageUrl}
                    category={game.category}
                    platform={game.platform}
                    fileSize={game.fileSize}
                    releaseDate={new Date(game.releaseDate).toLocaleDateString()}
                    downloadLinks={game.downloadLinks}
                    screenshots={game.screenshots || []}
                    contentTags={game.contentTags || []}
                    ageRating={game.ageRating || undefined}
                    averageRating={game.averageRating || 0}
                    totalRatings={game.totalRatings || 0}
                    onDownload={() => handleDownload(game.id, game.title)}
                    onFavoriteToggle={() => handleFavoriteToggle(game.id)}
                    isFavorite={favorites.some((fav: any) => fav.gameId === game.id)}
                  />
                ))}
              </div>

              {adultGames.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-xl text-muted-foreground">No adult games found</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {games.filter((g) => g.category?.toLowerCase() === "adult" || g.ageRating === "adult").length === 0 
                      ? "No adult games available yet" 
                      : "Try adjusting your search"}
                  </p>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}