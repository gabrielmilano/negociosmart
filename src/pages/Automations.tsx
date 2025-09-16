import { useState } from "react";
import { Plus, Filter, Search, Star, Package, Calendar, Cloud, RotateCw, Clock, AlertTriangle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AutomationCard } from "@/components/Dashboard/AutomationCard";
import { NewAutomationModal } from "@/components/Automations/NewAutomationModal";

const automationTypes = [
  {
    id: "reviews",
    name: "Monitor de Avaliações",
    description: "Seja notificado instantaneamente sobre novas avaliações",
    icon: Star,
    color: "bg-gradient-warning",
    count: 3
  },
  {
    id: "inventory", 
    name: "Controle de Estoque",
    description: "Alertas quando produtos estão acabando",
    icon: Package,
    color: "bg-gradient-primary",
    count: 2
  },
  {
    id: "scheduling",
    name: "Agendamento Inteligente", 
    description: "Confirmações automáticas de agendamentos",
    icon: Calendar,
    color: "bg-gradient-success",
    count: 4
  },
  {
    id: "backup",
    name: "Backup Automático",
    description: "Seus dados sempre seguros na nuvem",
    icon: Cloud,
    color: "bg-gradient-primary",
    count: 1
  },
  {
    id: "competitors",
    name: "Monitor de Concorrência",
    description: "Acompanhe preços e promoções da concorrência", 
    icon: Search,
    color: "bg-gradient-destructive",
    count: 2
  }
];

const allAutomations = [
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
  },
  {
    id: "6",
    name: "Avaliações Facebook",
    type: "Monitor de Avaliações",
    status: "active" as const,
    lastRun: "há 30 minutos",
    executions: 834,
    icon: Star,
    description: "Monitora avaliações e comentários na página do Facebook"
  }
];

export default function Automations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showNewAutomationModal, setShowNewAutomationModal] = useState(false);

  const filteredAutomations = allAutomations.filter(automation => {
    const matchesSearch = automation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         automation.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || automation.type === selectedType;
    return matchesSearch && matchesType;
  });

  // Statistics
  const stats = {
    active: allAutomations.filter(a => a.status === 'active').length,
    inactive: allAutomations.filter(a => a.status === 'inactive').length,
    error: allAutomations.filter(a => a.status === 'error').length,
    totalSavings: "45h/mês"
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <RotateCw className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Suas Automações</h1>
            <p className="text-muted-foreground">
              Gerencie todos os seus fluxos automatizados
            </p>
          </div>
        </div>
        
        <Button 
          className="bg-gradient-primary shadow-elegant hover:scale-105 transition-all duration-200"
          onClick={() => setShowNewAutomationModal(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Automação
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-success/20 bg-success/5">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2 bg-success/20 rounded-lg">
              <RotateCw className="h-4 w-4 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-success">{stats.active}</p>
              <p className="text-sm text-muted-foreground">Ativas</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-warning/20 bg-warning/5">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2 bg-warning/20 rounded-lg">
              <Clock className="h-4 w-4 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-warning">{stats.inactive}</p>
              <p className="text-sm text-muted-foreground">Pausadas</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-destructive/20 bg-destructive/5">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2 bg-destructive/20 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-destructive">{stats.error}</p>
              <p className="text-sm text-muted-foreground">Com Erro</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{stats.totalSavings}</p>
              <p className="text-sm text-muted-foreground">Economia</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Automation Types Overview */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Tipos de Automação</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {automationTypes.map((type) => (
            <Card 
              key={type.id}
              className={`cursor-pointer transition-all duration-200 hover:scale-105 relative overflow-hidden ${selectedType === type.name ? 'ring-2 ring-primary shadow-lg' : 'shadow-md'}`}
              onClick={() => setSelectedType(selectedType === type.name ? null : type.name)}
            >
              <div className={`absolute inset-0 ${type.color} opacity-10`} />
              <CardHeader className="relative pb-2">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${type.color}`}>
                    <type.icon className="h-4 w-4 text-white" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {type.count}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <CardTitle className="text-sm font-semibold mb-1 text-foreground">
                  {type.name}
                </CardTitle>
                <CardDescription className="text-xs line-clamp-2 text-muted-foreground">
                  {type.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
          <Input
            placeholder="Buscar automações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        
        <Button 
          variant="outline" 
          onClick={() => setSelectedType(null)}
          className={`shrink-0 ${selectedType ? "bg-accent" : ""}`}
        >
          <Filter className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">
            {selectedType ? `Filtrado: ${selectedType}` : "Todos os Tipos"}
          </span>
          <span className="sm:hidden">
            {selectedType ? "Filtrado" : "Todos"}
          </span>
        </Button>
      </div>

      {/* Automations Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 className="text-xl font-semibold text-foreground">
            Suas Automações {selectedType && `- ${selectedType}`}
          </h2>
          <span className="text-sm text-muted-foreground">
            {filteredAutomations.length} automação{filteredAutomations.length !== 1 ? 'ões' : ''} encontrada{filteredAutomations.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        {filteredAutomations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAutomations.map((automation) => (
              <AutomationCard key={automation.id} {...automation} />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center border border-border">
            <div className="space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Nenhuma automação encontrada</h3>
                <p className="text-muted-foreground text-sm">
                  Tente ajustar os filtros ou criar uma nova automação
                </p>
              </div>
              <Button 
                className="bg-gradient-primary shadow-elegant"
                onClick={() => setShowNewAutomationModal(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeira Automação
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* New Automation Modal */}
      <NewAutomationModal 
        open={showNewAutomationModal} 
        onOpenChange={setShowNewAutomationModal} 
      />
    </div>
  );
}