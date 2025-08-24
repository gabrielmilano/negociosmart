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
  Clock,
  Copy,
  TestTube,
  BarChart3
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface AutomationCardProps {
  id: string;
  name: string;
  type: string;
  status: "active" | "inactive" | "error";
  lastRun?: string;
  executions: number;
  icon: React.ElementType;
  description: string;
  webhook?: string;
  successRate?: number;
  avgTime?: string;
  todayExecutions?: number;
}

export function AutomationCard({
  id,
  name,
  type,
  status,
  lastRun,
  executions,
  icon: Icon,
  description,
  webhook = `https://app.fluxolocal.com.br/wh/${id}`,
  successRate = 98,
  avgTime = "1.2s",
  todayExecutions = Math.floor(Math.random() * 20)
}: AutomationCardProps) {
  const [copied, setCopied] = useState(false);
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

  const copyWebhook = async () => {
    await navigator.clipboard.writeText(webhook);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTest = () => {
    // TODO: Implement test functionality
    console.log("Testing automation:", id);
  };

  const cardBorderClass = status === 'active' 
    ? 'border-success/30' 
    : status === 'error' 
    ? 'border-destructive/30' 
    : status === 'inactive' 
    ? 'border-warning/30' 
    : 'border-border/50';

  const cardBgClass = status === 'active' 
    ? 'bg-success/5' 
    : status === 'error' 
    ? 'bg-destructive/5' 
    : status === 'inactive' 
    ? 'bg-warning/5' 
    : '';

  return (
    <Card className={cn(
      "group hover:shadow-elegant transition-all duration-300 hover:scale-[1.02] relative",
      cardBorderClass,
      cardBgClass
    )}>
      {status === 'error' && (
        <Badge className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground z-10">
          ERRO
        </Badge>
      )}

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
        <div className="flex items-center space-x-3">
          <div className={cn(
            "p-2 rounded-lg",
            status === 'active' ? 'bg-success' : 
            status === 'error' ? 'bg-destructive' :
            status === 'inactive' ? 'bg-warning' : 'bg-gradient-primary'
          )}>
            <Icon className="h-4 w-4 text-white" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">{name}</CardTitle>
            <Badge variant="outline" className="text-xs mt-1">
              {type}
            </Badge>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative z-20">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="z-50 bg-background">
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Editar
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
            <DropdownMenuItem className="text-destructive">
              <XCircle className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      
      <CardContent className="space-y-4 relative z-10">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>

        {/* Webhook URL */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Webhook URL</label>
          <div className="flex items-center space-x-2 p-2 bg-muted/50 rounded-md">
            <code className="flex-1 text-xs font-mono text-foreground truncate">
              {webhook}
            </code>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={copyWebhook}
            >
              {copied ? (
                <CheckCircle className="h-3 w-3 text-success" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>

        {/* Status and Last Run */}
        <div className="flex items-center justify-between">
          <Badge className={cn("flex items-center space-x-1", config.badge)}>
            <StatusIcon className="h-3 w-3" />
            <span>{config.text}</span>
          </Badge>
          
          {lastRun && (
            <p className="text-xs text-muted-foreground">
              Última: {lastRun}
            </p>
          )}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-border/50">
          <div>
            <p className="text-sm font-medium">{todayExecutions}</p>
            <p className="text-xs text-muted-foreground">Hoje</p>
          </div>
          <div>
            <p className="text-sm font-medium">{successRate}%</p>
            <p className="text-xs text-muted-foreground">Sucesso</p>
          </div>
          <div>
            <p className="text-sm font-medium">{avgTime}</p>
            <p className="text-xs text-muted-foreground">Tempo</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Activity className="mr-1 h-3 w-3" />
            Ver Logs
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={handleTest}
          >
            <TestTube className="mr-1 h-3 w-3" />
            Testar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}