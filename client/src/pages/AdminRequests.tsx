
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "@/components/AdminSidebar";
import GameRequestCard from "@/components/GameRequestCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function AdminRequests() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['/api/requests'],
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/requests/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to update request');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/requests'] });
      toast({
        title: "Success",
        description: "Request updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update request",
        variant: "destructive",
      });
    }
  });

  const style = {
    "--sidebar-width": "16rem",
  };

  const pendingRequests = requests.filter((r: any) => r.status === "pending");
  const approvedRequests = requests.filter((r: any) => r.status === "approved");
  const rejectedRequests = requests.filter((r: any) => r.status === "rejected");

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-2xl font-display font-bold">Game Requests</h1>
            </div>
          </header>
          
          <main className="flex-1 overflow-auto p-6">
            <Tabs defaultValue="pending" className="w-full">
              <TabsList>
                <TabsTrigger value="pending" data-testid="tab-pending">
                  Pending ({pendingRequests.length})
                </TabsTrigger>
                <TabsTrigger value="approved" data-testid="tab-approved">
                  Approved ({approvedRequests.length})
                </TabsTrigger>
                <TabsTrigger value="rejected" data-testid="tab-rejected">
                  Rejected ({rejectedRequests.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="pending" className="space-y-4 mt-6">
                {pendingRequests.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No pending requests</p>
                ) : (
                  pendingRequests.map((request: any) => (
                    <GameRequestCard
                      key={request.id}
                      id={request.id}
                      username={request.userId}
                      gameTitle={request.gameTitle}
                      description={request.description}
                      status={request.status}
                      createdAt={new Date(request.createdAt).toLocaleDateString()}
                      isAdmin={true}
                      onApprove={() => updateRequestMutation.mutate({ id: request.id, status: 'approved' })}
                      onReject={() => updateRequestMutation.mutate({ id: request.id, status: 'rejected' })}
                    />
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="approved" className="space-y-4 mt-6">
                {approvedRequests.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No approved requests</p>
                ) : (
                  approvedRequests.map((request: any) => (
                    <GameRequestCard
                      key={request.id}
                      id={request.id}
                      username={request.userId}
                      gameTitle={request.gameTitle}
                      description={request.description}
                      status={request.status}
                      createdAt={new Date(request.createdAt).toLocaleDateString()}
                      isAdmin={true}
                    />
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="rejected" className="space-y-4 mt-6">
                {rejectedRequests.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No rejected requests</p>
                ) : (
                  rejectedRequests.map((request: any) => (
                    <GameRequestCard
                      key={request.id}
                      id={request.id}
                      username={request.userId}
                      gameTitle={request.gameTitle}
                      description={request.description}
                      status={request.status}
                      createdAt={new Date(request.createdAt).toLocaleDateString()}
                      isAdmin={true}
                    />
                  ))
                )}
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
