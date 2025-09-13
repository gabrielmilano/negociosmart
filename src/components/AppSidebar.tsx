import { useState } from "react"
import { 
  LayoutDashboard, 
  Zap, 
  Webhook, 
  Activity, 
  Settings, 
  Plus,
  Star,
  Package,
  Calendar,
  Cloud,
  Search,
  Package2
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const mainNavItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Automações", url: "/automations", icon: Zap },
  { title: "Estoque", url: "/estoque", icon: Package2 },
  { title: "Webhooks", url: "/webhooks", icon: Webhook },
  { title: "Logs", url: "/logs", icon: Activity },
  { title: "Configurações", url: "/settings", icon: Settings },
]

const automationTypes = [
  { title: "Monitor de Avaliações", url: "/automations/reviews", icon: Star },
  { title: "Controle de Estoque", url: "/automations/inventory", icon: Package },
  { title: "Agendamento", url: "/automations/scheduling", icon: Calendar },
  { title: "Backup Automático", url: "/automations/backup", icon: Cloud },
  { title: "Monitor Concorrência", url: "/automations/competitors", icon: Search },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const isCollapsed = state === "collapsed"

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/"
    }
    return currentPath.startsWith(path)
  }

  const getNavClasses = (path: string) => {
    const active = isActive(path)
    return active 
      ? "bg-primary text-primary-foreground font-medium shadow-elegant" 
      : "hover:bg-accent hover:text-accent-foreground transition-all duration-200"
  }

  return (
    <Sidebar
      className="border-r border-border"
      collapsible="icon"
    >
      <SidebarContent className="px-2 py-4">
        {/* Logo */}
        <div className="px-4 mb-6">
          {!isCollapsed ? (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-foreground">AutoFlow</span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto">
              <Zap className="h-5 w-5 text-white" />
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-10">
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/"}
                      className={getNavClasses(item.url)}
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Actions */}
        {!isCollapsed && (
          <SidebarGroup>
            <SidebarGroupLabel>Criar Nova</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className="h-10">
                    <NavLink 
                      to="/automations/new" 
                      className="hover:bg-success hover:text-success-foreground transition-all duration-200"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Nova Automação</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Automation Types */}
        {!isCollapsed && (
          <SidebarGroup>
            <SidebarGroupLabel>Tipos de Automação</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {automationTypes.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="h-9 text-sm">
                      <NavLink 
                        to={item.url}
                        className={getNavClasses(item.url)}
                      >
                        <item.icon className="h-3.5 w-3.5" />
                        <span className="truncate">{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  )
}