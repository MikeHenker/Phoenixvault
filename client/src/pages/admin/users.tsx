import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle2, XCircle } from "lucide-react";
import type { User } from "@shared/schema";

export default function AdminUsers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const approveUserMutation = useMutation({
    mutationFn: async ({ userId, isApproved }: { userId: string; isApproved: boolean }) => {
      return await apiRequest("PATCH", `/api/admin/users/${userId}`, { isApproved });
    },
    onSuccess: (_, { isApproved }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: isApproved ? "User approved" : "User rejected",
        description: isApproved
          ? "User can now log in to their account"
          : "User account has been rejected",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1
          className="text-3xl font-bold mb-2"
          style={{ fontFamily: "Montserrat, sans-serif" }}
          data-testid="text-users-title"
        >
          Users Management
        </h1>
        <p className="text-muted-foreground" data-testid="text-users-subtitle">
          Manage registered users and their access
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle data-testid="text-users-card-title">Registered Users</CardTitle>
          <CardDescription data-testid="text-users-card-description">
            View and manage all registered users. Approve or reject pending accounts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead data-testid="table-head-username">Username</TableHead>
                <TableHead data-testid="table-head-license">License Key</TableHead>
                <TableHead data-testid="table-head-role">Role</TableHead>
                <TableHead data-testid="table-head-status">Status</TableHead>
                <TableHead data-testid="table-head-registered">Registered</TableHead>
                <TableHead data-testid="table-head-actions">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id} data-testid={`user-row-${user.username}`}>
                  <TableCell className="font-medium" data-testid={`user-username-${user.username}`}>
                    {user.username}
                  </TableCell>
                  <TableCell data-testid={`user-license-${user.username}`}>
                    {user.licenseKey || "N/A"}
                  </TableCell>
                  <TableCell data-testid={`user-role-${user.username}`}>
                    {user.isAdmin ? (
                      <Badge data-testid={`badge-admin-${user.username}`}>Admin</Badge>
                    ) : (
                      <Badge variant="secondary" data-testid={`badge-user-${user.username}`}>User</Badge>
                    )}
                  </TableCell>
                  <TableCell data-testid={`user-status-${user.username}`}>
                    {user.isApproved ? (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Approved
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell data-testid={`user-registered-${user.username}`}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell data-testid={`user-actions-${user.username}`}>
                    {!user.isAdmin && (
                      <div className="flex gap-2">
                        {!user.isApproved && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => approveUserMutation.mutate({ userId: user.id, isApproved: true })}
                            disabled={approveUserMutation.isPending}
                            data-testid={`button-approve-${user.username}`}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                        )}
                        {user.isApproved && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => approveUserMutation.mutate({ userId: user.id, isApproved: false })}
                            disabled={approveUserMutation.isPending}
                            data-testid={`button-revoke-${user.username}`}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Revoke
                          </Button>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}