import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, XCircle, Shield } from "lucide-react";
import type { User } from "@shared/schema";

export default function AdminUsers() {
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-3xl font-bold mb-2"
          style={{ fontFamily: "Montserrat, sans-serif" }}
          data-testid="text-admin-users-title"
        >
          Manage Users
        </h1>
        <p className="text-muted-foreground" data-testid="text-admin-users-subtitle">
          View all registered users and their license status
        </p>
      </div>

      <Card>
        {isLoading ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        ) : users && users.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead data-testid="header-user-username">Username</TableHead>
                <TableHead data-testid="header-user-role">Role</TableHead>
                <TableHead data-testid="header-user-license">License Key</TableHead>
                <TableHead data-testid="header-user-joined">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                  <TableCell className="font-medium" data-testid={`text-user-username-${user.id}`}>
                    {user.username}
                  </TableCell>
                  <TableCell>
                    {user.isAdmin ? (
                      <Badge className="bg-accent text-accent-foreground" data-testid={`badge-admin-${user.id}`}>
                        <Shield className="w-3 h-3 mr-1" />
                        Admin
                      </Badge>
                    ) : (
                      <Badge variant="secondary" data-testid={`badge-user-${user.id}`}>
                        User
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.licenseKey ? (
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded" data-testid={`text-user-license-${user.id}`}>
                          {user.licenseKey}
                        </code>
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span>No license</span>
                        <XCircle className="w-4 h-4" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell data-testid={`text-user-joined-${user.id}`}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-12 text-center">
            <p className="text-muted-foreground" data-testid="text-no-users">
              No users registered yet
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
