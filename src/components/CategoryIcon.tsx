import { getCategoryConfig } from '@/constants/categories'
import { cn } from '@/lib/utils'

interface Props {
  name: string
  size?: 'sm' | 'md' | 'lg'
}

export default function CategoryIcon({ name, size = 'md' }: Props) {
  const config = getCategoryConfig(name)
  const Icon = config.icon

  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  return (
    <div className={cn('rounded-full flex items-center justify-center shrink-0', config.bgColor, sizes[size])}>
      <Icon className={cn(config.color, iconSizes[size])} />
    </div>
  )
}
