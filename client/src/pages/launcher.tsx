
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Github, Star, Gamepad2, Sparkles, Tag, Search, PlayCircle } from "lucide-react";

export default function Launcher() {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    // Simulate download
    window.open("https://github.com/MikeHenker/Pixelvault/releases", "_blank");
    setTimeout(() => setDownloading(false), 2000);
  };

  const features = [
    {
      icon: Sparkles,
      title: "Beautiful Modern UI",
      description: "Glassmorphism design with blur effects and vibrant gradients"
    },
    {
      icon: Gamepad2,
      title: "Drag & Drop Games",
      description: "Simply drag any .exe file to add games to your library"
    },
    {
      icon: Search,
      title: "Smart Search & Filters",
      description: "Instantly find games with powerful search and filtering"
    },
    {
      icon: Tag,
      title: "Tags & Organization",
      description: "Organize games with custom tags and favorites"
    },
    {
      icon: PlayCircle,
      title: "Steam Integration",
      description: "Import Steam games and fetch metadata automatically"
    },
    {
      icon: Star,
      title: "Play Statistics",
      description: "Track play count and last played dates"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1
            className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-teal-400 bg-clip-text text-transparent"
            style={{ fontFamily: "Montserrat, sans-serif" }}
            data-testid="text-launcher-title"
          >
            🎮 PixelVault Launcher
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="text-launcher-subtitle">
            Your Gaming Universe - A stunning, modern game library manager for Windows
          </p>
          <div className="flex gap-3 justify-center mt-6">
            <Badge variant="secondary" className="text-sm">
              Windows 10/11
            </Badge>
            <Badge variant="secondary" className="text-sm">
              .NET 6.0+
            </Badge>
            <Badge variant="secondary" className="text-sm">
              MIT License
            </Badge>
          </div>
        </div>

        {/* Hero Card */}
        <Card className="mb-8 overflow-hidden">
          <div className="relative aspect-[21/9] bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-teal-500/20">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Gamepad2 className="w-24 h-24 mx-auto mb-4 text-primary" />
                <h2 className="text-3xl font-bold mb-4">Desktop Game Library Manager</h2>
                <Button
                  size="lg"
                  onClick={handleDownload}
                  disabled={downloading}
                  className="gap-2"
                  data-testid="button-download-launcher"
                >
                  <Download className="w-5 h-5" />
                  {downloading ? "Opening Download..." : "Download PixelVault"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 ml-3"
                  onClick={() => window.open("https://github.com/MikeHenker/Pixelvault", "_blank")}
                  data-testid="button-github"
                >
                  <Github className="w-5 h-5" />
                  View on GitHub
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="features" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="features" data-testid="tab-features">Features</TabsTrigger>
            <TabsTrigger value="installation" data-testid="tab-installation">Installation</TabsTrigger>
            <TabsTrigger value="usage" data-testid="tab-usage">Usage Guide</TabsTrigger>
          </TabsList>

          <TabsContent value="features" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="hover-elevate" data-testid={`card-feature-${index}`}>
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="installation" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Installation Steps</CardTitle>
                <CardDescription>Get started with PixelVault in minutes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">1</span>
                    Download
                  </h3>
                  <p className="text-muted-foreground ml-8">
                    Download the latest release from the GitHub releases page
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-8"
                    onClick={() => window.open("https://github.com/MikeHenker/Pixelvault/releases", "_blank")}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Go to Releases
                  </Button>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">2</span>
                    Extract & Run
                  </h3>
                  <p className="text-muted-foreground ml-8">
                    Extract the ZIP file and run <code className="bg-muted px-2 py-1 rounded">GameLibrary.exe</code>
                  </p>
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Requirements</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Windows 10 or Windows 11</li>
                    <li>.NET 6.0 Runtime or later</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usage" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Adding Games</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Method 1: Drag & Drop</h4>
                    <p className="text-muted-foreground">
                      Simply drag any <code className="bg-muted px-2 py-1 rounded">.exe</code> file onto the PixelVault window
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Method 2: Steam Import</h4>
                    <div className="text-muted-foreground">
                      Click the <Badge variant="outline">📥 Import</Badge> button to automatically import all your Steam games
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Managing Your Library</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Search className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Search</h4>
                      <p className="text-sm text-muted-foreground">Use the search box in the sidebar to find games instantly</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Filters</h4>
                      <p className="text-sm text-muted-foreground">Click Favorites, Recent, or All Games to filter your library</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Tag className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Tags</h4>
                      <p className="text-sm text-muted-foreground">Add custom tags to categorize and organize your games</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pro Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">💡 Mark games as favorites with ⭐ for quick access</p>
                  <p className="text-sm text-muted-foreground">💡 Add personal notes to remember where you left off</p>
                  <p className="text-sm text-muted-foreground">💡 Sort by "Most Played" to see your favorite games</p>
                  <p className="text-sm text-muted-foreground">💡 Your library auto-saves to AppData</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <Card className="mt-8 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-teal-500/10">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-3">Ready to organize your gaming library?</h3>
            <p className="text-muted-foreground mb-6">
              Download PixelVault now and experience the future of game library management
            </p>
            <Button
              size="lg"
              onClick={handleDownload}
              disabled={downloading}
              className="gap-2"
            >
              <Download className="w-5 h-5" />
              Download Now
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              Made with 💜 by the community • MIT License
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
