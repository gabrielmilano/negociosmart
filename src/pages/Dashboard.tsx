import { 
  Zap, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Star,
  Package,
  Calendar,
  Cloud,
  Search
} from "lucide-react";
import { MetricCard } from "@/components/Dashboard/MetricCard";
import { AutomationCard } from "@/components/Dashboard/AutomationCard";
import { ActivityChart } from "@/components/Dashboard/ActivityChart";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

const metrics = [
  {
    title: "Automações Ativas",
    value: "12",
    change: "+2 esta semana",
    changeType: "positive" as const,
    icon: <Zap className="h-4 w-4" />,
    gradient: "primary" as const
  },
  {
    title: "Execuções Hoje",
    value: "234",
    change: "+12% vs ontem",
    changeType: "positive" as const,
    icon: <TrendingUp className="h-4 w-4" />,
    gradient: "success" as const
  },
  {
    title: "Tempo Economizado",
    value: "42h",
    change: "neste mês",
    changeType: "neutral" as const,
    icon: <Clock className="h-4 w-4" />,
    gradient: "warning" as const
  },
  {
    title: "Taxa de Sucesso",
    value: "98.5%",
    change: "+0.3% vs semana passada",
    changeType: "positive" as const,
    icon: <CheckCircle className="h-4 w-4" />,
    gradient: "success" as const
  }
];

const automations = [
  {
    id: "1",
    name: "Monitor de Avaliações Google",
    type: "Monitor de Avaliações",
    status: "active" as const,
    lastRun: "há 2 minutos",
    executions: 1247,
    icon: Star,
    description: "Monitora novas avaliações no Google My Business e envia notificações instantâneas"
  },
  {
    id: "2", 
    name: "Controle Estoque Loja Principal",
    type: "Controle de Estoque",
    status: "active" as const,
    lastRun: "há 15 minutos",
    executions: 892,
    icon: Package,
    description: "Alerta quando produtos atingem estoque mínimo definido"
  },
  {
    id: "3",
    name: "Confirmação Agendamentos",
    type: "Agendamento Inteligente", 
    status: "active" as const,
    lastRun: "há 1 hora",
    executions: 456,
    icon: Calendar,
    description: "Envia confirmações automáticas para agendamentos do Google Calendar"
  },
  {
    id: "4",
    name: "Backup Diário Dados",
    type: "Backup Automático",
    status: "inactive" as const,
    lastRun: "ontem às 23:30",
    executions: 30,
    icon: Cloud,
    description: "Realiza backup automático dos dados críticos da empresa"
  },
  {
    id: "5",
    name: "Monitor Preços Concorrência",
    type: "Monitor de Concorrência",
    status: "error" as const,
    lastRun: "há 3 horas",
    executions: 201,
    icon: Search,
    description: "Monitora preços da concorrência e alerta sobre mudanças significativas"
  }
];

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral das suas automações empresariais
          </p>
        </div>
        
        <Link to="/automations/new">
          <Button className="bg-gradient-primary shadow-elegant hover:scale-105 transition-all duration-200">
            <Plus className="mr-2 h-4 w-4" />
            Nova Automação
          </Button>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityChart />
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Atividade Recente</h3>
          <div className="space-y-3">
            <div className="p-3 bg-card border border-border rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse-glow" />
                <span className="text-sm font-medium">Monitor de Avaliações executado</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">há 2 minutos</p>
            </div>
            
            <div className="p-3 bg-card border border-border rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-warning rounded-full" />
                <span className="text-sm font-medium">Estoque baixo detectado</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">há 15 minutos</p>
            </div>
            
            <div className="p-3 bg-card border border-border rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-destructive rounded-full" />
                <span className="text-sm font-medium">Erro no monitor de preços</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">há 3 horas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Automations Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Suas Automações</h2>
          <Link to="/automations">
            <Button variant="outline">Ver Todas</Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {automations.map((automation) => (
            <AutomationCard key={automation.id} {...automation} />
          ))}
        </div>
      </div>
    </div>
  );
}