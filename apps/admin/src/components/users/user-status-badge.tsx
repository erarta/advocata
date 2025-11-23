import { Badge } from '@/components/ui/badge';
import { UserStatus } from '@/lib/types/user';

interface UserStatusBadgeProps {
  status: UserStatus;
}

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  const variants: Record<
    UserStatus,
    { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }
  > = {
    [UserStatus.ACTIVE]: { variant: 'default', label: 'Активный' },
    [UserStatus.INACTIVE]: { variant: 'secondary', label: 'Неактивный' },
    [UserStatus.SUSPENDED]: { variant: 'destructive', label: 'Приостановлен' },
    [UserStatus.BANNED]: { variant: 'destructive', label: 'Заблокирован' },
  };

  const config = variants[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
