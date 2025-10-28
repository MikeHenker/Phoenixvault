import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Game, InsertGame } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function AdminGames() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [isSteamImportOpen, setIsSteamImportOpen] = useState(false);
  const [steamSearchQuery, setSteamSearchQuery] = useState("");
  const [steamSearchResults, setSteamSearchResults] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    downloadUrl: "",
    category: "",
    tags: "",
    featured: false,
  });

  const { data: games, isLoading } = useQuery<Game[]>({
    queryKey: ["/api/games"],
  });

  const createGameMutation = useMutation({
    mutationFn: async (data: InsertGame) => {
      return await apiRequest("POST", "/api/admin/games", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      toast({ title: "Game created successfully!" });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error creating game", description: error.message, variant: "destructive" });
    },
  });

  const updateGameMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertGame> }) => {
      return await apiRequest("PATCH", `/api/admin/games/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      toast({ title: "Game updated successfully!" });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error updating game", description: error.message, variant: "destructive" });
    },
  });

  const deleteGameMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/admin/games/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      toast({ title: "Game deleted successfully!" });
    },
    onError: (error: Error) => {
      toast({ title: "Error deleting game", description: error.message, variant: "destructive" });
    },
  });

  const steamImportMutation = useMutation({
    mutationFn: async (appId: string) => {
      const response = await fetch("/api/admin/games/import-steam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ appId }),
      });
      if (!response.ok) throw new Error("Failed to import from Steam");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      setIsSteamImportOpen(false);
      setSteamSearchQuery("");
      setSteamSearchResults([]);
      toast({
        title: "Game imported",
        description: `${data.game.title} has been imported from Steam with screenshots`,
      });
    },
    onError: (error: Error) => {
      toast({ title: "Error importing game", description: error.message, variant: "destructive" });
    },
  });

  const searchSteam = async () => {
    if (!steamSearchQuery.trim()) return;

    try {
      const response = await fetch(`/api/steam/search?query=${encodeURIComponent(steamSearchQuery)}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Search failed");
      const results = await response.json();
      setSteamSearchResults(results);
    } catch (error: any) {
      toast({
        title: "Search failed",
        description: error.message || "Could not search Steam",
        variant: "destructive",
      });
    }
  };


  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      imageUrl: "",
      downloadUrl: "",
      category: "",
      tags: "",
      featured: false,
    });
    setEditingGame(null);
  };

  const handleEdit = (game: Game) => {
    setEditingGame(game);
    setFormData({
      title: game.title,
      description: game.description,
      imageUrl: game.imageUrl,
      downloadUrl: game.downloadUrl,
      category: game.category,
      tags: game.tags?.join(", ") || "",
      featured: game.featured,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const gameData = {
      ...formData,
      tags: formData.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
    };

    if (editingGame) {
      updateGameMutation.mutate({ id: editingGame.id, data: gameData });
    } else {
      createGameMutation.mutate(gameData as InsertGame);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ fontFamily: "Montserrat, sans-serif" }}
            data-testid="text-admin-games-title"
          >
            Manage Games
          </h1>
          <p className="text-muted-foreground" data-testid="text-admin-games-subtitle">
            Add, edit, and remove games from your library
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isSteamImportOpen} onOpenChange={setIsSteamImportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Import from Steam
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Import Game from Steam</DialogTitle>
                <DialogDescription>
                  Search for a game on Steam to automatically import details, screenshots, and trailers
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search Steam games..."
                    value={steamSearchQuery}
                    onChange={(e) => setSteamSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchSteam()}
                  />
                  <Button onClick={searchSteam} disabled={steamImportMutation.isPending}>Search</Button>
                </div>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {steamSearchResults.map((result) => (
                    <Card key={result.appId} className="p-4 cursor-pointer hover:bg-accent" onClick={() => steamImportMutation.mutate(result.appId)}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{result.name}</h4>
                          <p className="text-sm text-muted-foreground">App ID: {result.appId}</p>
                        </div>
                        <Button size="sm" disabled={steamImportMutation.isPending}>
                          {steamImportMutation.isPending ? "Importing..." : "Import"}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} data-testid="button-add-game">
                <Plus className="w-4 h-4 mr-2" />
                Add Game
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle data-testid="text-dialog-title">
                  {editingGame ? "Edit Game" : "Add New Game"}
                </DialogTitle>
                <DialogDescription data-testid="text-dialog-description">
                  {editingGame ? "Update game information" : "Add a new game to the library"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" data-testid="label-game-title">
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    data-testid="input-game-title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" data-testid="label-game-description">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    required
                    data-testid="input-game-description"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl" data-testid="label-game-image">
                    Image URL (460x215 recommended)
                  </Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    required
                    data-testid="input-game-image"
                  />
                  {formData.imageUrl && (
                    <div className="aspect-[460/215] rounded-lg overflow-hidden border">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        data-testid="img-game-preview"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="downloadUrl" data-testid="label-game-download">
                    Download URL
                  </Label>
                  <Input
                    id="downloadUrl"
                    type="url"
                    value={formData.downloadUrl}
                    onChange={(e) => setFormData({ ...formData, downloadUrl: e.target.value })}
                    placeholder="https://example.com/download"
                    required
                    data-testid="input-game-download"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" data-testid="label-game-category">
                    Category
                  </Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Action, RPG, Strategy, etc."
                    required
                    data-testid="input-game-category"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags" data-testid="label-game-tags">
                    Tags (comma-separated)
                  </Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="Multiplayer, Singleplayer, Co-op"
                    data-testid="input-game-tags"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                    data-testid="switch-game-featured"
                  />
                  <Label htmlFor="featured" data-testid="label-game-featured">
                    Featured Game
                  </Label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1" data-testid="button-save-game">
                    {editingGame ? "Update Game" : "Create Game"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetForm();
                      setIsDialogOpen(false);
                    }}
                    data-testid="button-cancel-game"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        {isLoading ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">Loading games...</p>
          </div>
        ) : games && games.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead data-testid="header-image">Image</TableHead>
                <TableHead data-testid="header-title">Title</TableHead>
                <TableHead data-testid="header-category">Category</TableHead>
                <TableHead data-testid="header-tags">Tags</TableHead>
                <TableHead data-testid="header-featured">Featured</TableHead>
                <TableHead data-testid="header-actions">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {games.map((game) => (
                <TableRow key={game.id} data-testid={`row-game-${game.id}`}>
                  <TableCell>
                    <img
                      src={game.imageUrl}
                      alt={game.title}
                      className="w-20 h-10 object-cover rounded"
                      data-testid={`img-table-game-${game.id}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium" data-testid={`text-table-title-${game.id}`}>
                    {game.title}
                  </TableCell>
                  <TableCell data-testid={`text-table-category-${game.id}`}>
                    {game.category}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {game.tags?.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {game.featured && (
                      <Badge className="bg-accent text-accent-foreground">Featured</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(game)}
                        data-testid={`button-edit-${game.id}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this game?")) {
                            deleteGameMutation.mutate(game.id);
                          }
                        }}
                        data-testid={`button-delete-${game.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-12 text-center">
            <p className="text-muted-foreground" data-testid="text-no-games-admin">
              No games yet. Add your first game to get started!
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}