import { cn } from '@/lib/utils'

interface RoleBadgeProps {
  role: string
  size?: 'sm' | 'md'
}

const roleConfig: Record<string, { label: string; color: string; bg: string }> = {
  OWNER:  { label: 'Owner',  color: 'text-purple-700', bg: 'bg-purple-100' },
  ADMIN:  { label: 'Admin',  color: 'text-blue-700',   bg: 'bg-blue-100' },
  MEMBER: { label: 'Member', color: 'text-gray-600',   bg: 'bg-gray-100' },
}

export default function RoleBadge({ role, size = 'sm' }: RoleBadgeProps) {
  const cfg = roleConfig[role] || roleConfig.MEMBER
  return (
    <span className={cn(
      'font-semibold rounded-full',
      size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1',
      cfg.bg, cfg.color
    )}>
      {cfg.label}
    </span>
  )
}