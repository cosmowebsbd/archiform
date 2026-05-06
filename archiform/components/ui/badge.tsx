import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset transition-colors',
  {
    variants: {
      variant: {
        default:   'bg-brand-50 text-brand-700 ring-brand-200',
        secondary: 'bg-secondary text-secondary-foreground ring-border',
        success:   'bg-green-50 text-green-700 ring-green-200',
        warning:   'bg-yellow-50 text-yellow-700 ring-yellow-200',
        danger:    'bg-red-50 text-red-700 ring-red-200',
        info:      'bg-blue-50 text-blue-700 ring-blue-200',
        purple:    'bg-purple-50 text-purple-700 ring-purple-200',
        outline:   'bg-transparent text-foreground ring-border',
        navy:      'bg-navy-900 text-white ring-navy-800',
        new:       'bg-brand-500 text-white ring-brand-600',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
