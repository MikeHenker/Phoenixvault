import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Download, Star, TrendingUp, Play } from "lucide-react";
import type { Game, User } from "@shared/schema";

export default function Home() {
  const [, setLocation] = useLocation();

  const { data: session, isLoading } = useQuery<{ user: User | null }>({
    queryKey: ["/api/session"],
  });

  const { data: games } = useQuery<Game[]>({
    queryKey: ["/api/games"],
    enabled: !!session?.user,
  });

  // Redirect to registration if not logged in
  useEffect(() => {
    if (!isLoading && session && !session.user) {
      setLocation("/register");
    }
  }, [session, isLoading, setLocation]);

  const featuredGames = games?.filter((game) => game.featured && game.isActive).slice(0, 1) || [];
  const recentGames = games?.filter((game) => game.isActive).slice(0, 8) || [];

  // Show loading or redirect - don't render content if not authenticated
  if (isLoading || !session?.user) {
    return null;
  }

  const heroBackgroundImage = featuredGames[0]?.imageUrl || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&h=1080&fit=crop";

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[70vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${heroBackgroundImage})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        </div>

        <div className="relative h-full max-w-7xl mx-auto px-6 flex items-center">
          <div className="max-w-2xl space-y-6">
            <Badge
              className="text-xs font-semibold tracking-wider uppercase"
              data-testid="badge-beta"
            >
              <Star className="w-3 h-3 mr-1" />
              Premium Access
            </Badge>
            <h1
              className="text-6xl font-bold tracking-tight"
              style={{ fontFamily: "Montserrat, sans-serif" }}
              data-testid="text-hero-title"
            >
              {featuredGames[0]?.title || "The Future of Gaming"}
            </h1>
            <div 
              className="text-lg text-muted-foreground max-w-xl" 
              data-testid="text-hero-description"
              dangerouslySetInnerHTML={{ 
                __html: featuredGames[0]?.description || 
                  "Experience premium access to the most anticipated games. Join Phoenix Games today." 
              }}
            />
            <div className="flex gap-4 pt-4">
              {session?.user ? (
                <Link href="/library">
                  <Button
                    size="lg"
                    className="px-8 text-base font-semibold backdrop-blur-sm"
                    data-testid="button-browse-library"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Browse Library
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button
                      size="lg"
                      className="px-8 text-base font-semibold backdrop-blur-sm"
                      data-testid="button-get-started"
                    >
                      Get Started
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button
                      size="lg"
                      variant="outline"
                      className="px-8 text-base font-semibold backdrop-blur-md bg-background/20"
                      data-testid="button-join-beta"
                    >
                      Join Now
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Recently Added Games */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2
              className="text-3xl font-bold mb-2"
              style={{ fontFamily: "Montserrat, sans-serif" }}
              data-testid="text-section-title-recent"
            >
              Recently Added
            </h2>
            <p className="text-muted-foreground" data-testid="text-section-subtitle-recent">
              Discover the latest additions to our growing library
            </p>
          </div>
          <Link href="/library">
            <Button variant="ghost" data-testid="button-view-all">
              View All
              <TrendingUp className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card
                key={i}
                className="overflow-hidden animate-pulse"
                data-testid={`skeleton-game-${i}`}
              >
                <div className="aspect-[460/215] bg-muted" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recentGames.map((game) => (
              <Link key={game.id} href={`/game/${game.id}`}>
                <Card
                  className="group overflow-hidden hover-elevate transition-all duration-300 cursor-pointer"
                  data-testid={`card-game-${game.id}`}
                >
                  <div className="relative aspect-[460/215] overflow-hidden bg-muted">
                    <img
                      src={game.imageUrl}
                      alt={game.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      data-testid={`img-game-${game.id}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        size="sm"
                        className="w-full"
                        data-testid={`button-download-${game.id}`}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3
                      className="font-bold text-lg mb-1 line-clamp-1"
                      data-testid={`text-game-title-${game.id}`}
                    >
                      {game.title}
                    </h3>
                    <p
                      className="text-sm text-muted-foreground line-clamp-2"
                      data-testid={`text-game-category-${game.id}`}
                    >
                      {game.category}
                    </p>
                    {game.tags && game.tags.length > 0 && (
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {game.tags.slice(0, 2).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                            data-testid={`badge-tag-${tag}`}
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
      </section>
    </div>
  );
}