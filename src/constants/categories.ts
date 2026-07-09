import {
  UtensilsCrossed, Bus, Fuel, ShoppingBag, Gamepad2, Home,
  HeartPulse, GraduationCap, Smartphone, MoreHorizontal,
  Wallet, Gift, Briefcase, TrendingUp, Mail,
  type LucideIcon,
} from 'lucide-react'
import type { Category } from '@shared/types'

export interface CategoryConfig {
  name: string
  icon: LucideIcon
  color: string
  bgColor: string
}

// 图标映射
const ICON_MAP: Record<string, LucideIcon> = {
  UtensilsCrossed, Bus, Fuel, ShoppingBag, Gamepad2, Home,
  HeartPulse, GraduationCap, Smartphone, MoreHorizontal,
  Wallet, Gift, Briefcase, TrendingUp, Mail,
}

// 默认支出分类（含加油，放在交通后面）
export const DEFAULT_EXPENSE_CATEGORIES: CategoryConfig[] = [
  { name: '餐饮', icon: UtensilsCrossed, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  { name: '交通', icon: Bus, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { name: '加油', icon: Fuel, color: 'text-amber-600', bgColor: 'bg-amber-100' },
  { name: '购物', icon: ShoppingBag, color: 'text-pink-600', bgColor: 'bg-pink-100' },
  { name: '娱乐', icon: Gamepad2, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  { name: '居住', icon: Home, color: 'text-teal-600', bgColor: 'bg-teal-100' },
  { name: '医疗', icon: HeartPulse, color: 'text-red-600', bgColor: 'bg-red-100' },
  { name: '教育', icon: GraduationCap, color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  { name: '通讯', icon: Smartphone, color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
  { name: '其他', icon: MoreHorizontal, color: 'text-gray-600', bgColor: 'bg-gray-100' },
]

export const DEFAULT_INCOME_CATEGORIES: CategoryConfig[] = [
  { name: '工资', icon: Wallet, color: 'text-green-600', bgColor: 'bg-green-100' },
  { name: '奖金', icon: Gift, color: 'text-amber-600', bgColor: 'bg-amber-100' },
  { name: '兼职', icon: Briefcase, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { name: '投资', icon: TrendingUp, color: 'text-teal-600', bgColor: 'bg-teal-100' },
  { name: '红包', icon: Mail, color: 'text-pink-600', bgColor: 'bg-pink-100' },
  { name: '其他', icon: MoreHorizontal, color: 'text-gray-600', bgColor: 'bg-gray-100' },
]

const ALL_DEFAULT = [...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES]

export function getCategoryConfig(name: string): CategoryConfig {
  return ALL_DEFAULT.find(c => c.name === name) ?? DEFAULT_EXPENSE_CATEGORIES[DEFAULT_EXPENSE_CATEGORIES.length - 1]
}

// 将数据库中的 Category 转换为 CategoryConfig
export function dbCategoryToConfig(cat: Category): CategoryConfig {
  const icon = ICON_MAP[cat.icon] ?? MoreHorizontal
  return {
    name: cat.name,
    icon,
    color: cat.color,
    bgColor: cat.bg_color,
  }
}

// 饼图配色
export const CHART_COLORS = [
  '#F97316', '#3B82F6', '#F59E0B', '#EC4899', '#A855F7', '#14B8A6',
  '#EF4444', '#6366F1', '#06B6D4', '#6B7280', '#22C55E', '#0EA5E9',
  '#84CC16', '#F43F5E',
]

// 可选图标列表（用于标签管理）
export const AVAILABLE_ICONS: { name: string; icon: LucideIcon }[] = [
  { name: 'UtensilsCrossed', icon: UtensilsCrossed },
  { name: 'Bus', icon: Bus },
  { name: 'Fuel', icon: Fuel },
  { name: 'ShoppingBag', icon: ShoppingBag },
  { name: 'Gamepad2', icon: Gamepad2 },
  { name: 'Home', icon: Home },
  { name: 'HeartPulse', icon: HeartPulse },
  { name: 'GraduationCap', icon: GraduationCap },
  { name: 'Smartphone', icon: Smartphone },
  { name: 'Wallet', icon: Wallet },
  { name: 'Gift', icon: Gift },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'TrendingUp', icon: TrendingUp },
  { name: 'Mail', icon: Mail },
  { name: 'MoreHorizontal', icon: MoreHorizontal },
]

// 可选颜色
export const AVAILABLE_COLORS: { color: string; bgColor: string }[] = [
  { color: 'text-orange-600', bgColor: 'bg-orange-100' },
  { color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { color: 'text-amber-600', bgColor: 'bg-amber-100' },
  { color: 'text-pink-600', bgColor: 'bg-pink-100' },
  { color: 'text-purple-600', bgColor: 'bg-purple-100' },
  { color: 'text-teal-600', bgColor: 'bg-teal-100' },
  { color: 'text-red-600', bgColor: 'bg-red-100' },
  { color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  { color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
  { color: 'text-green-600', bgColor: 'bg-green-100' },
  { color: 'text-gray-600', bgColor: 'bg-gray-100' },
]
