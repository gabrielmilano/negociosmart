import { LucideIcon } from "lucide-react";

export interface AutomationType {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  count: number;
}

export interface Automation {
  id: string;
  name: string;
  type: string;
  status: "active" | "inactive" | "error";
  lastRun: string;
  executions: number;
  icon: LucideIcon;
  description: string;
}