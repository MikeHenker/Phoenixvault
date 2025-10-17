import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import GameCard from "@/components/GameCard";
import AgeVerificationDialog from "@/components/AgeVerificationDialog";
import DenuvoWarningDialog from "@/components/DenuvoWarningDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, TrendingUp, SlidersHorizontal, ArrowUpDown, ShieldAlert, ChevronRight } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Game } from "@shared/schema";
import { motion } from "framer-motion";

export default function Home() {
  const { user, logout, token } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"title" | "downloads" | "rating" | "date">("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [showDenuvoWarning, setShowDenuvoWarning] = useState(false);
  const [ageVerified, setAgeVerified] = useState(false);
  const [pendingDownload, setPendingDownload] = useState<{ gameId: string; title: string } | null>(null);

  useEffect(() => {
    const verified = localStorage.getItem("ageVerified") === "true";
    setAgeVerified(verified);
  }, []);

  const { data: games = [], isLoading } = useQuery<Game[]>({
    queryKey: ["/api/games"],
  });

  const { data: trendingGames = [] } = useQuery<Game[]>({
    queryKey: ["/api/games/trending/list"],
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

  const handleDownload = async (gameId: string, title: string, category?: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to download games",
        variant: "destructive",
      });
      return;
    }

    if (category?.toLowerCase() === "denuvo") {
      setPendingDownload({ gameId, title });
      setShowDenuvoWarning(true);
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

  const handleDenuvoConfirm = () => {
    if (pendingDownload) {
      trackDownloadMutation.mutate(pendingDownload.gameId);
      toast({
        title: "Download ready",
        description: `Select a mirror to download ${pendingDownload.title}`,
      });
      setPendingDownload(null);
    }
    setShowDenuvoWarning(false);
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

  const filteredGames = games.filter((game: any) => {
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          game.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || game.category?.toLowerCase() === selectedCategory;
    const isAdultContent = game.category?.toLowerCase() === "adult" || game.ageRating === "adult";

    // Exclude adult games from main listing
    return matchesSearch && matchesCategory && !isAdultContent;
  }).sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case "title":
        comparison = a.title.localeCompare(b.title);
        break;
      case "downloads":
        comparison = (a.downloads || 0) - (b.downloads || 0);
        break;
      case "rating":
        comparison = (a.averageRating || 0) - (b.averageRating || 0);
        break;
      case "date":
        comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        break;
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={user} 
        onLogout={logout}
      />

      <HeroSection />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {games.filter((game) => game.category?.toLowerCase() === "adult" || game.ageRating === "adult").length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <button
              onClick={() => window.location.href = "/adult-zone"}
              className="w-full p-8 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-lg border border-red-500/30 hover:from-red-500/30 hover:to-pink-500/30 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20">
                    <ShieldAlert className="h-8 w-8 text-red-400" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-3xl font-display font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent mb-2">
                      Adult Zone
                    </h2>
                    <p className="text-muted-foreground">
                      {games.filter((game) => game.category?.toLowerCase() === "adult" || game.ageRating === "adult").length} adult games available • Age verification required
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-8 w-8 group-hover:translate-x-2 transition-transform text-red-400" />
              </div>
            </button>
          </motion.div>
        )}

        {trendingGames.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-6 w-6 text-primary" />
              <h2 className="text-3xl font-display font-bold">Trending Games</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {trendingGames
                .filter((game) => {
                  const isAdultContent = game.category?.toLowerCase() === "adult" || game.ageRating === "adult";
                  return ageVerified || !isAdultContent;
                })
                .slice(0, 8).map((game) => (
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
                  onDownload={() => handleDownload(game.id, game.title, game.category)}
                  onFavoriteToggle={() => handleFavoriteToggle(game.id)}
                  isFavorite={favorites.some((fav: any) => fav.gameId === game.id)}
                />
              ))}
            </div>
          </motion.div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-games"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48" data-testid="select-category-filter">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="steamtools">Steamtools</SelectItem>
              <SelectItem value="denuvo">Denuvo</SelectItem>
              <SelectItem value="preinstalled">Preinstalled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-full sm:w-48" data-testid="select-sort-by">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="downloads">Downloads</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="date">Release Date</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            data-testid="button-toggle-sort-order"
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-display font-bold">
            {selectedCategory === "all" ? "All Games" : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Games`}
          </h2>
          <p className="text-muted-foreground" data-testid="text-games-count">
            {isLoading ? "Loading..." : `${filteredGames.length} games available`}
          </p>
        </div>

        {isLoading ? (
          <p className="text-center text-muted-foreground">Loading games...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredGames.map((game) => (
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
                  onDownload={() => handleDownload(game.id, game.title, game.category)}
                  onFavoriteToggle={() => handleFavoriteToggle(game.id)}
                  isFavorite={favorites.some((fav: any) => fav.gameId === game.id)}
                />
              ))}
            </div>

            {filteredGames.length === 0 && (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground">No games found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {games.length === 0 ? "Admin hasn't uploaded any games yet" : "Try adjusting your search or filters"}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <AgeVerificationDialog
        open={showAgeVerification}
        onOpenChange={setShowAgeVerification}
        onVerified={() => setAgeVerified(true)}
      />

      <DenuvoWarningDialog
        open={showDenuvoWarning}
        onOpenChange={setShowDenuvoWarning}
        onContinue={handleDenuvoConfirm}
        gameTitle={pendingDownload?.title || ""}
      />
    </div>
  );
}