import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral" | "warning";
  icon: ReactNode;
  gradient?: "primary" | "success" | "warning" | "destructive";
  className?: string;
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  changeType = "neutral", 
  icon, 
  gradient = "primary",
  className 
}: MetricCardProps) {
  const gradientClasses = {
    primary: "bg-gradient-primary",
    success: "bg-gradient-success", 
    warning: "bg-gradient-warning",
    destructive: "bg-gradient-destructive"
  };

  const shadowClasses = {
    primary: "shadow-elegant",
    success: "shadow-success",
    warning: "shadow-warning", 
    destructive: "shadow-destructive"
  };

  const changeClasses = {
    positive: "text-success",
    negative: "text-destructive",
    neutral: "text-muted-foreground",
    warning: "text-warning"
  };

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300 hover:scale-105 border-0",
      shadowClasses[gradient],
      className
    )}>
      <div className={cn("absolute inset-0", gradientClasses[gradient])} />
      <div className="relative bg-card/90 backdrop-blur-sm h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="text-muted-foreground">
            {icon}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground mb-1">
            {value}
          </div>
          {change && (
            <p className={cn("text-xs", changeClasses[changeType])}>
              {change}
            </p>
          )}
        </CardContent>
      </div>
    </Card>
  );
}