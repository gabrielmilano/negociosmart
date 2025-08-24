import { useState } from "react";
import { X, Star, Package, Cloud, Calendar, Search, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface NewAutomationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const automationTypes = [
  {
    id: "reviews",
    icon: Star,
    title: "Monitor de Avaliações",
    description: "Seja alertado sobre novas avaliações no Google e Facebook",
    benefit: "Responda rapidamente e proteja sua reputação",
    popular: true,
    color: "text-warning"
  },
  {
    id: "inventory",
    icon: Package,
    title: "Controle de Estoque",
    description: "Alertas quando produtos estão acabando",
    benefit: "Nunca mais perca vendas por falta de estoque",
    popular: false,
    color: "text-primary"
  },
  {
    id: "backup",
    icon: Cloud,
    title: "Backup Automático",
    description: "Seus dados importantes sempre seguros na nuvem",
    benefit: "Proteção contra perda de informações",
    popular: false,
    color: "text-accent"
  },
  {
    id: "scheduling",
    icon: Calendar,
    title: "Confirmações de Agendamento",
    description: "Confirmações automáticas via WhatsApp ou Email",
    benefit: "Reduza no-shows e melhore organização",
    popular: false,
    color: "text-success"
  },
  {
    id: "competitors",
    icon: Search,
    title: "Monitor de Preços",
    description: "Acompanhe preços da concorrência automaticamente",
    benefit: "Mantenha-se competitivo no mercado",
    popular: false,
    color: "text-destructive"
  },
  {
    id: "custom",
    icon: Wrench,
    title: "Automação Personalizada",
    description: "Precisa de algo específico? Vamos conversar!",
    benefit: "Solução sob medida para seu negócio",
    popular: false,
    color: "text-muted-foreground",
    isCustom: true
  }
];

export function NewAutomationModal({ open, onOpenChange }: NewAutomationModalProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
    // TODO: Navigate to configuration page or open configuration modal
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold text-center">
            Escolha o Tipo de Automação
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Selecione o que você gostaria de automatizar
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {automationTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Card
                key={type.id}
                className="relative cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 hover:border-primary h-[280px] flex flex-col"
                onClick={() => handleTypeSelect(type.id)}
              >
                {type.popular && (
                  <Badge className="absolute -top-2 -right-2 bg-gradient-warning text-warning-foreground z-10">
                    MAIS USADO
                  </Badge>
                )}

                <CardHeader className="flex-shrink-0 text-center pb-4">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Icon className={`h-6 w-6 ${type.color}`} />
                  </div>
                  <CardTitle className="text-lg font-semibold">
                    {type.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col justify-between text-center">
                  <div className="space-y-3">
                    <CardDescription className="text-sm">
                      {type.description}
                    </CardDescription>
                    <p className="text-xs text-success italic font-medium">
                      {type.benefit}
                    </p>
                  </div>

                  <Button
                    className={`w-full mt-4 ${type.isCustom 
                      ? 'bg-gradient-success hover:bg-success/90' 
                      : 'bg-gradient-primary'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTypeSelect(type.id);
                    }}
                  >
                    {type.isCustom ? 'Falar Conosco' : 'Configurar'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}