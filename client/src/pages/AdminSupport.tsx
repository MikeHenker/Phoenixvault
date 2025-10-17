
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "@/components/AdminSidebar";
import SupportTicketCard from "@/components/SupportTicketCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function AdminSupport() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['/api/support'],
  });

  const updateTicketMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/support/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to update ticket');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support'] });
      toast({
        title: "Success",
        description: "Ticket updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update ticket",
        variant: "destructive",
      });
    }
  });

  const style = {
    "--sidebar-width": "16rem",
  };

  const openTickets = tickets.filter((t: any) => t.status === "open");
  const inProgressTickets = tickets.filter((t: any) => t.status === "in_progress");
  const resolvedTickets = tickets.filter((t: any) => t.status === "resolved");

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
              <h1 className="text-2xl font-display font-bold">Support Tickets</h1>
            </div>
          </header>
          
          <main className="flex-1 overflow-auto p-6">
            <Tabs defaultValue="open" className="w-full">
              <TabsList>
                <TabsTrigger value="open" data-testid="tab-open">
                  Open ({openTickets.length})
                </TabsTrigger>
                <TabsTrigger value="in_progress" data-testid="tab-in-progress">
                  In Progress ({inProgressTickets.length})
                </TabsTrigger>
                <TabsTrigger value="resolved" data-testid="tab-resolved">
                  Resolved ({resolvedTickets.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="open" className="space-y-4 mt-6">
                {openTickets.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No open tickets</p>
                ) : (
                  openTickets.map((ticket: any) => (
                    <SupportTicketCard
                      key={ticket.id}
                      id={ticket.id}
                      username={ticket.userId}
                      subject={ticket.subject}
                      message={ticket.description}
                      status={ticket.status}
                      priority={ticket.priority || "medium"}
                      createdAt={new Date(ticket.createdAt).toLocaleDateString()}
                      isAdmin={true}
                      onRespond={() => updateTicketMutation.mutate({ id: ticket.id, status: 'in_progress' })}
                      onResolve={() => updateTicketMutation.mutate({ id: ticket.id, status: 'resolved' })}
                    />
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="in_progress" className="space-y-4 mt-6">
                {inProgressTickets.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No tickets in progress</p>
                ) : (
                  inProgressTickets.map((ticket: any) => (
                    <SupportTicketCard
                      key={ticket.id}
                      id={ticket.id}
                      username={ticket.userId}
                      subject={ticket.subject}
                      message={ticket.description}
                      status={ticket.status}
                      priority={ticket.priority || "medium"}
                      createdAt={new Date(ticket.createdAt).toLocaleDateString()}
                      isAdmin={true}
                      onResolve={() => updateTicketMutation.mutate({ id: ticket.id, status: 'resolved' })}
                    />
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="resolved" className="space-y-4 mt-6">
                {resolvedTickets.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No resolved tickets</p>
                ) : (
                  resolvedTickets.map((ticket: any) => (
                    <SupportTicketCard
                      key={ticket.id}
                      id={ticket.id}
                      username={ticket.userId}
                      subject={ticket.subject}
                      message={ticket.description}
                      status={ticket.status}
                      priority={ticket.priority || "medium"}
                      createdAt={new Date(ticket.createdAt).toLocaleDateString()}
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
