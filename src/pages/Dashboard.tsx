import { 
  Zap,
  Package,
  AlertTriangle
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
    value: "1",
    change: "estoque",
    changeType: "neutral" as const,
    icon: <Zap className="h-4 w-4" />,
    gradient: "primary" as const
  },
  {
    title: "Produtos em Estoque",
    value: "0",
    change: "itens cadastrados",
    changeType: "neutral" as const,
    icon: <Package className="h-4 w-4" />,
    gradient: "success" as const
  },
  {
    title: "Produtos Críticos",
    value: "0",
    change: "abaixo do mínimo",
    changeType: "neutral" as const,
    icon: <AlertTriangle className="h-4 w-4" />,
    gradient: "warning" as const
  }
];

const automations = [
  {
    id: "2", 
    name: "Controle Estoque Loja Principal",
    type: "Controle de Estoque",
    status: "active" as const,
    lastRun: "há 15 minutos",
    executions: 0,
    icon: Package,
    description: "Alerta quando produtos atingem estoque mínimo definido"
  }
];

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface DashboardMetrics {
  totalProducts: number;
  criticalProducts: number;
  activeAutomations: number;
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalProducts: 0,
    criticalProducts: 0,
    activeAutomations: 1 // Apenas automação de estoque
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      // Buscar total de produtos
      const { data: products, error: productsError } = await supabase
        .from('estoque')
        .select('id, quantidade_atual, estoque_minimo')
        .returns<Array<{
          id: string;
          quantidade_atual: number;
          estoque_minimo: number;
        }>>();

      if (!productsError && products) {
        setMetrics(current => ({
          ...current,
          totalProducts: products.length,
          criticalProducts: products.filter(p => p.quantidade_atual < p.estoque_minimo).length
        }));
      }
    };

    fetchMetrics();
  }, []);

  const metricsData = [
    {
      title: "Automações Ativas",
      value: metrics.activeAutomations.toString(),
      change: "estoque",
      changeType: "neutral" as const,
      icon: <Zap className="h-4 w-4" />,
      gradient: "primary" as const
    },
    {
      title: "Produtos em Estoque",
      value: metrics.totalProducts.toString(),
      change: "itens cadastrados",
      changeType: "neutral" as const,
      icon: <Package className="h-4 w-4" />,
      gradient: "success" as const
    },
    {
      title: "Produtos Críticos",
      value: metrics.criticalProducts.toString(),
      change: "abaixo do mínimo",
      changeType: "warning" as const,
      icon: <AlertTriangle className="h-4 w-4" />,
      gradient: "warning" as const
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do seu estoque
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricsData.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Alerts */}
      <div className="mt-6 space-y-4">
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

      {/* Automations Grid */}
      <div className="mt-6">
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