import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "@/components/AdminSidebar";
import GameUploadForm from "@/components/GameUploadForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import type { Game } from "@shared/schema";

export default function AdminGames() {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const { token } = useAuth();
  const { toast } = useToast();

  const { data: games = [], isLoading } = useQuery<Game[]>({
    queryKey: ["/api/games"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (gameData: any) => {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(gameData),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to upload game");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      setUploadDialogOpen(false);
      toast({
        title: "Success",
        description: "Game uploaded successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (gameId: string) => {
      const res = await fetch(`/api/games/${gameId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to delete game");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      toast({
        title: "Success",
        description: "Game deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete game",
        variant: "destructive",
      });
    },
  });

  const handleGameUpload = (gameData: any) => {
    uploadMutation.mutate(gameData);
  };

  const style = {
    "--sidebar-width": "16rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-2xl font-display font-bold">Manage Games</h1>
            </div>
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-game">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Game
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Upload New Game</DialogTitle>
                  <DialogDescription>Add a new game to the Phoenix Games library</DialogDescription>
                </DialogHeader>
                <GameUploadForm onSubmit={handleGameUpload} />
              </DialogContent>
            </Dialog>
          </header>

          <main className="flex-1 overflow-auto p-6">
            {isLoading ? (
              <p className="text-muted-foreground">Loading games...</p>
            ) : (
              <div className="space-y-4">
                {games.map((game) => (
                  <Card key={game.id} className="hover-elevate" data-testid={`card-game-${game.id}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg" data-testid={`text-game-title-${game.id}`}>{game.title}</h3>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="secondary">{game.category}</Badge>
                            <Badge variant="outline">{game.platform}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            {game.downloads} downloads
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" data-testid={`button-edit-${game.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            data-testid={`button-delete-${game.id}`}
                            onClick={() => deleteMutation.mutate(game.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}