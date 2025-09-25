import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/contexts/NotificationsContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

export function NotificationsDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return `${interval} ano${interval > 1 ? 's' : ''} atrás`;

    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval} mês${interval > 1 ? 'es' : ''} atrás`;

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval} dia${interval > 1 ? 's' : ''} atrás`;

    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval} hora${interval > 1 ? 's' : ''} atrás`;

    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval} minuto${interval > 1 ? 's' : ''} atrás`;

    return `${Math.floor(seconds)} segundo${seconds !== 1 ? 's' : ''} atrás`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative"
          size="icon"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-sm font-semibold">Notificações</h2>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              className="text-xs"
              onClick={() => markAllAsRead()}
            >
              Marcar todas como lidas
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              Nenhuma notificação
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  'flex flex-col items-start p-4 cursor-pointer',
                  !notification.read && 'bg-accent/50'
                )}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{notification.title}</span>
                  {!notification.read && (
                    <Badge variant="default" className="h-auto py-0 px-1">
                      Nova
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {notification.message}
                </p>
                <span className="text-xs text-muted-foreground">
                  {formatTimeAgo(notification.created_at)}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}