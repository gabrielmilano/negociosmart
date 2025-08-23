import { useState } from "react";
import { Plus, Filter, Search, Star, Package, Calendar, Cloud, Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { AutomationCard } from "@/components/Dashboard/AutomationCard";

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
    icon: SearchIcon,
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
    icon: SearchIcon,
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

  const filteredAutomations = allAutomations.filter(automation => {
    const matchesSearch = automation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         automation.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || automation.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Automações</h1>
          <p className="text-muted-foreground">
            Gerencie todas as suas automações empresariais
          </p>
        </div>
        
        <Link to="/automations/new">
          <Button className="bg-gradient-primary shadow-elegant hover:scale-105 transition-all duration-200">
            <Plus className="mr-2 h-4 w-4" />
            Nova Automação
          </Button>
        </Link>
      </div>

      {/* Automation Types Overview */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Tipos de Automação</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {automationTypes.map((type) => (
            <Card 
              key={type.id}
              className={`cursor-pointer transition-all duration-200 hover:scale-105 border-0 shadow-elegant ${selectedType === type.name ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setSelectedType(selectedType === type.name ? null : type.name)}
            >
              <div className={`absolute inset-0 ${type.color} rounded-lg`} />
              <div className="relative bg-card/90 backdrop-blur-sm h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <type.icon className="h-6 w-6 text-foreground" />
                    <Badge variant="secondary" className="text-xs">
                      {type.count}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-sm font-semibold mb-1">
                    {type.name}
                  </CardTitle>
                  <CardDescription className="text-xs line-clamp-2">
                    {type.description}
                  </CardDescription>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar automações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button 
          variant="outline" 
          onClick={() => setSelectedType(null)}
          className={selectedType ? "bg-accent" : ""}
        >
          <Filter className="mr-2 h-4 w-4" />
          {selectedType ? `Filtrado: ${selectedType}` : "Todos os Tipos"}
        </Button>
      </div>

      {/* Automations Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">
            Suas Automações {selectedType && `- ${selectedType}`}
          </h2>
          <span className="text-sm text-muted-foreground">
            {filteredAutomations.length} automação{filteredAutomations.length !== 1 ? 'ões' : ''} encontrada{filteredAutomations.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        {filteredAutomations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAutomations.map((automation) => (
              <AutomationCard key={automation.id} {...automation} />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Nenhuma automação encontrada</h3>
                <p className="text-muted-foreground">
                  Tente ajustar os filtros ou criar uma nova automação
                </p>
              </div>
              <Link to="/automations/new">
                <Button className="bg-gradient-primary">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeira Automação
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}