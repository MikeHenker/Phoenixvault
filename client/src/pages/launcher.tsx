import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  Download, 
  Trash2, 
  Upload, 
  Search,
  Calendar,
  Users,
  Star
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Game } from '@/types/electron';

interface FileWithPath extends File {
  path: string;
}

export default function Launcher() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingMetadata, setFetchingMetadata] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  // Load games on mount
  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      if (window.electronAPI) {
        const loadedGames = await window.electronAPI.getGames();
        setGames(loadedGames);
      }
    } catch (error) {
      console.error('Failed to load games:', error);
      toast({
        title: 'Error',
        description: 'Failed to load games',
        variant: 'destructive'
      });
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    if (!window.electronAPI) return;

    const files = Array.from(e.dataTransfer.files) as FileWithPath[];
    
    for (const file of files) {
      try {
        setLoading(true);
        const newGame = await window.electronAPI.addGame(file.path);
        setGames(prev => [...prev, newGame]);
        toast({
          title: 'Game added',
          description: `${newGame.name} has been added to your library`
        });
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to add game',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleAddGame = async () => {
    if (!window.electronAPI) return;

    try {
      const filePath = await window.electronAPI.selectGameFile();
      if (!filePath) return;

      setLoading(true);
      const newGame = await window.electronAPI.addGame(filePath);
      setGames(prev => [...prev, newGame]);
      toast({
        title: 'Game added',
        description: `${newGame.name} has been added to your library`
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add game',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async (game: Game) => {
    if (!window.electronAPI) return;

    try {
      setFetchingMetadata(game.id);
      const updatedGame = await window.electronAPI.fetchSteamMetadata(game.id, game.name);
      setGames(prev => prev.map(g => g.id === game.id ? updatedGame : g));
      toast({
        title: 'Metadata downloaded',
        description: `Information for ${updatedGame.name} has been updated`
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch metadata from Steam',
        variant: 'destructive'
      });
    } finally {
      setFetchingMetadata(null);
    }
  };

  const launchGame = async (game: Game) => {
    if (!window.electronAPI) return;

    try {
      await window.electronAPI.launchGame(game.path);
      toast({
        title: 'Game launched',
        description: `${game.name} is starting...`
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to launch game',
        variant: 'destructive'
      });
    }
  };

  const deleteGame = async (gameId: string) => {
    if (!window.electronAPI) return;

    try {
      await window.electronAPI.deleteGame(gameId);
      setGames(prev => prev.filter(g => g.id !== gameId));
      toast({
        title: 'Game removed',
        description: 'Game has been removed from your library'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove game',
        variant: 'destructive'
      });
    } finally {
      setDeleteDialog(null);
    }
  };

  const filteredGames = games.filter(game =>
    game.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Game Launcher</h1>
          <p className="text-muted-foreground">Manage and launch your games with Steam metadata</p>
        </div>

        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-games"
            />
          </div>
          <Button 
            onClick={handleAddGame} 
            disabled={loading}
            data-testid="button-add-game"
          >
            <Upload className="w-4 h-4 mr-2" />
            Add Game
          </Button>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-8 mb-8 transition-colors ${
            dragActive ? 'border-primary bg-primary/5' : 'border-border'
          }`}
          data-testid="dropzone-games"
        >
          <div className="text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">Drag & Drop Game Executables Here</p>
            <p className="text-sm text-muted-foreground">
              Supported formats: .exe, .app, .sh, .bat, .lnk
            </p>
          </div>
        </div>

        {filteredGames.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              {searchQuery ? 'No games found matching your search' : 'No games in your library yet. Add some games to get started!'}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-400px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredGames.map((game) => (
                <Card key={game.id} className="overflow-hidden" data-testid={`card-game-${game.id}`}>
                  <CardHeader className="p-0">
                    {game.steamData?.headerImage ? (
                      <img
                        src={game.steamData.headerImage}
                        alt={game.name}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-muted flex items-center justify-center">
                        <span className="text-4xl font-bold text-muted-foreground">
                          {game.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 truncate" data-testid={`text-game-name-${game.id}`}>
                      {game.name}
                    </h3>
                    
                    {game.steamData ? (
                      <div className="space-y-2 text-sm">
                        {game.steamData.description && (
                          <p className="text-muted-foreground line-clamp-2">
                            {game.steamData.description}
                          </p>
                        )}
                        
                        {game.steamData.genres && game.steamData.genres.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {game.steamData.genres.slice(0, 3).map((genre, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {genre}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-muted-foreground">
                          {game.steamData.releaseDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span className="text-xs">{game.steamData.releaseDate}</span>
                            </div>
                          )}
                          {game.steamData.metacriticScore && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              <span className="text-xs">{game.steamData.metacriticScore}</span>
                            </div>
                          )}
                        </div>

                        {game.steamData.developers && game.steamData.developers.length > 0 && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Users className="w-3 h-3" />
                            <span className="text-xs truncate">{game.steamData.developers.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No metadata available</p>
                    )}
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex gap-2">
                    <Button
                      onClick={() => launchGame(game)}
                      className="flex-1"
                      data-testid={`button-launch-${game.id}`}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Play
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => fetchMetadata(game)}
                      disabled={fetchingMetadata === game.id}
                      data-testid={`button-metadata-${game.id}`}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setDeleteDialog(game.id)}
                      data-testid={`button-delete-${game.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove game from library?</AlertDialogTitle>
            <AlertDialogDescription>
              This will only remove the game from your launcher. The game files will not be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialog && deleteGame(deleteDialog)}
              data-testid="button-confirm-delete"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
