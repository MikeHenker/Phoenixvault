import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, CheckCircle, XCircle, Check } from "lucide-react";

interface SupportTicketCardProps {
  id: string;
  username: string;
  subject: string;
  message: string;
  status: "open" | "in-progress" | "resolved";
  priority: "low" | "medium" | "high";
  createdAt: string;
  onRespond?: (ticketId: string) => void;
  onResolve?: (ticketId: string) => void;
  isAdmin?: boolean;
}

export default function SupportTicketCard({
  id,
  username,
  subject,
  message,
  status,
  priority,
  createdAt,
  onRespond,
  onResolve,
  isAdmin = false,
}: SupportTicketCardProps) {
  const priorityColors = {
    low: "bg-chart-3/20 text-chart-3 border-chart-3/30",
    medium: "bg-chart-5/20 text-chart-5 border-chart-5/30",
    high: "bg-destructive/20 text-destructive border-destructive/30",
  };

  const statusColors = {
    open: "bg-chart-4/20 text-chart-4 border-chart-4/30",
    "in-progress": "bg-chart-5/20 text-chart-5 border-chart-5/30",
    resolved: "bg-chart-3/20 text-chart-3 border-chart-3/30",
  };

  return (
    <Card className="hover-elevate" data-testid={`card-ticket-${subject.toLowerCase().replace(/\s/g, '-')}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg" data-testid="text-ticket-subject">{subject}</CardTitle>
            <CardDescription data-testid="text-ticket-user">
              From: {username} • {createdAt}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge className={priorityColors[priority]} data-testid="badge-priority">
              {priority}
            </Badge>
            <Badge className={statusColors[status]} data-testid="badge-status">
              {status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground" data-testid="text-ticket-message">{message}</p>
        {isAdmin && status !== "resolved" && (
          <div className="flex gap-2">
            <Button size="sm" variant="default" onClick={() => onRespond?.(id)} data-testid="button-respond">
              <MessageSquare className="h-4 w-4 mr-2" />
              Respond
            </Button>
            <Button size="sm" variant="outline" onClick={() => onResolve?.(id)} data-testid="button-resolve">
              <CheckCircle className="h-4 w-4 mr-2" />
              Resolve
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}