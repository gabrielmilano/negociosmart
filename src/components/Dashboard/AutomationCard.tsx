import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  Play, 
  Pause, 
  Settings,
  Activity,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface AutomationCardProps {
  id: string;
  name: string;
  type: string;
  status: "active" | "inactive" | "error";
  lastRun?: string;
  executions: number;
  icon: React.ElementType;
  description: string;
}

export function AutomationCard({
  id,
  name,
  type,
  status,
  lastRun,
  executions,
  icon: Icon,
  description
}: AutomationCardProps) {
  const statusConfig = {
    active: {
      badge: "bg-success text-success-foreground",
      icon: CheckCircle,
      text: "Ativo"
    },
    inactive: {
      badge: "bg-muted text-muted-foreground",
      icon: Clock,
      text: "Inativo"
    },
    error: {
      badge: "bg-destructive text-destructive-foreground",
      icon: XCircle,
      text: "Erro"
    }
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <Card className="group hover:shadow-elegant transition-all duration-300 hover:scale-[1.02] border-border/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-primary rounded-lg">
            <Icon className="h-4 w-4 text-white" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">{name}</CardTitle>
            <p className="text-sm text-muted-foreground">{type}</p>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Configurar
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Activity className="mr-2 h-4 w-4" />
              Ver Logs
            </DropdownMenuItem>
            <DropdownMenuItem>
              {status === "active" ? (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Ativar
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>
        
        <div className="flex items-center justify-between">
          <Badge className={cn("flex items-center space-x-1", config.badge)}>
            <StatusIcon className="h-3 w-3" />
            <span>{config.text}</span>
          </Badge>
          
          <div className="text-right">
            <p className="text-sm font-medium">{executions} execuções</p>
            {lastRun && (
              <p className="text-xs text-muted-foreground">{lastRun}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}