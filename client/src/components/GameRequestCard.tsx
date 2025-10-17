import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Check, X } from "lucide-react";

interface GameRequestCardProps {
  id: string;
  username: string;
  gameTitle: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  onApprove?: () => void;
  onReject?: () => void;
  isAdmin?: boolean;
}

export default function GameRequestCard({
  username,
  gameTitle,
  description,
  status,
  createdAt,
  onApprove,
  onReject,
  isAdmin = false,
}: GameRequestCardProps) {
  const statusColors = {
    pending: "bg-chart-5/20 text-chart-5 border-chart-5/30",
    approved: "bg-chart-3/20 text-chart-3 border-chart-3/30",
    rejected: "bg-destructive/20 text-destructive border-destructive/30",
  };

  return (
    <Card className="hover-elevate" data-testid={`card-request-${gameTitle.toLowerCase().replace(/\s/g, '-')}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg" data-testid="text-request-title">{gameTitle}</CardTitle>
            <CardDescription data-testid="text-request-user">
              Requested by: {username} • {createdAt}
            </CardDescription>
          </div>
          <Badge className={statusColors[status]} data-testid="badge-status">
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground" data-testid="text-request-description">{description}</p>
        {isAdmin && status === "pending" && (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={onApprove}
              data-testid="button-approve"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={onReject}
              data-testid="button-reject"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}