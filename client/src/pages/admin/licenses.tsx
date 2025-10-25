import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Copy, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { License } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function AdminLicenses() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [customKey, setCustomKey] = useState("");

  const { data: licenses, isLoading } = useQuery<License[]>({
    queryKey: ["/api/admin/licenses"],
  });

  const createLicenseMutation = useMutation({
    mutationFn: async (key?: string) => {
      return await apiRequest("POST", "/api/admin/licenses", key ? { key } : {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/licenses"] });
      toast({ title: "License created successfully!" });
      setCustomKey("");
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error creating license", description: error.message, variant: "destructive" });
    },
  });

  const toggleLicenseMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return await apiRequest("PATCH", `/api/admin/licenses/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/licenses"] });
      toast({ title: "License updated successfully!" });
    },
    onError: (error: Error) => {
      toast({ title: "Error updating license", description: error.message, variant: "destructive" });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard!" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createLicenseMutation.mutate(customKey || undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ fontFamily: "Montserrat, sans-serif" }}
            data-testid="text-admin-licenses-title"
          >
            Manage Licenses
          </h1>
          <p className="text-muted-foreground" data-testid="text-admin-licenses-subtitle">
            Create and manage beta access license keys
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-license">
              <Plus className="w-4 h-4 mr-2" />
              Create License
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle data-testid="text-dialog-license-title">Create New License</DialogTitle>
              <DialogDescription data-testid="text-dialog-license-description">
                Generate a new license key for beta access. Leave blank to auto-generate.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="licenseKey" data-testid="label-license-key-custom">
                  Custom License Key (optional)
                </Label>
                <Input
                  id="licenseKey"
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  placeholder="Leave blank to auto-generate"
                  className="font-mono"
                  data-testid="input-license-key-custom"
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="flex-1" data-testid="button-generate-license">
                  {customKey ? "Create License" : "Generate License"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCustomKey("");
                    setIsDialogOpen(false);
                  }}
                  data-testid="button-cancel-license"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        {isLoading ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">Loading licenses...</p>
          </div>
        ) : licenses && licenses.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead data-testid="header-license-key">License Key</TableHead>
                <TableHead data-testid="header-status">Status</TableHead>
                <TableHead data-testid="header-used-by">Used By</TableHead>
                <TableHead data-testid="header-created">Created</TableHead>
                <TableHead data-testid="header-license-actions">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {licenses.map((license) => (
                <TableRow key={license.id} data-testid={`row-license-${license.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code
                        className="text-sm font-mono bg-muted px-2 py-1 rounded"
                        data-testid={`text-license-key-${license.id}`}
                      >
                        {license.key}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => copyToClipboard(license.key)}
                        data-testid={`button-copy-${license.id}`}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {license.isActive ? (
                      <Badge className="bg-green-500/20 text-green-500 border-green-500/30" data-testid={`badge-active-${license.id}`}>
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" data-testid={`badge-inactive-${license.id}`}>
                        <XCircle className="w-3 h-3 mr-1" />
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell data-testid={`text-used-by-${license.id}`}>
                    {license.usedBy ? (
                      <Badge variant="outline">Used</Badge>
                    ) : (
                      <span className="text-muted-foreground">Not used</span>
                    )}
                  </TableCell>
                  <TableCell data-testid={`text-created-${license.id}`}>
                    {new Date(license.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        toggleLicenseMutation.mutate({
                          id: license.id,
                          isActive: !license.isActive,
                        })
                      }
                      data-testid={`button-toggle-${license.id}`}
                    >
                      {license.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-12 text-center">
            <p className="text-muted-foreground" data-testid="text-no-licenses">
              No licenses yet. Create your first license key!
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
