import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Search, Filter } from "lucide-react";
import type { Game } from "@shared/schema";

export default function Library() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const { data: games, isLoading } = useQuery<Game[]>({
    queryKey: ["/api/games"],
  });

  const filteredGames =
    games
      ?.filter((game) => {
        const matchesSearch =
          game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          game.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory =
          categoryFilter === "all" || game.category === categoryFilter;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === "recent") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else if (sortBy === "alphabetical") {
          return a.title.localeCompare(b.title);
        }
        return 0;
      }) || [];

  const categories = Array.from(new Set(games?.map((g) => g.category) || []));

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-4xl font-bold mb-2"
            style={{ fontFamily: "Montserrat, sans-serif" }}
            data-testid="text-library-title"
          >
            Game Library
          </h1>
          <p className="text-muted-foreground" data-testid="text-library-subtitle">
            Browse and download all available games
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-[200px]" data-testid="select-category">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[200px]" data-testid="select-sort">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recently Added</SelectItem>
              <SelectItem value="alphabetical">Alphabetical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Games Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card
                key={i}
                className="overflow-hidden animate-pulse"
                data-testid={`skeleton-library-game-${i}`}
              >
                <div className="aspect-[460/215] bg-muted" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredGames.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground text-lg" data-testid="text-no-games">
              No games found matching your criteria
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGames.map((game) => (
              <Link key={game.id} href={`/game/${game.id}`}>
                <Card
                  className="group overflow-hidden hover-elevate transition-all duration-300 cursor-pointer"
                  data-testid={`card-library-game-${game.id}`}
                >
                  <div className="relative aspect-[460/215] overflow-hidden bg-muted">
                    <img
                      src={game.imageUrl}
                      alt={game.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      data-testid={`img-library-game-${game.id}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        size="sm"
                        className="w-full"
                        data-testid={`button-library-download-${game.id}`}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3
                      className="font-bold text-lg mb-1 line-clamp-1"
                      data-testid={`text-library-game-title-${game.id}`}
                    >
                      {game.title}
                    </h3>
                    <p
                      className="text-sm text-muted-foreground line-clamp-2"
                      data-testid={`text-library-game-category-${game.id}`}
                    >
                      {game.category}
                    </p>
                    {game.tags && game.tags.length > 0 && (
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {game.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                            data-testid={`badge-library-tag-${tag}`}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
