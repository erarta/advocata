'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  MessageSquare,
  BarChart3,
  DollarSign,
  FileText,
  Settings,
  HeadphonesIcon,
  Activity,
  Scale,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Badge } from '@/components/ui/badge';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  {
    name: 'Lawyers',
    icon: UserCheck,
    children: [
      { name: 'All Lawyers', href: '/lawyers' },
      { name: 'Pending Verification', href: '/lawyers/pending', badge: 5 },
      { name: 'Performance', href: '/lawyers/performance' },
    ],
  },
  { name: 'Users', href: '/users', icon: Users },
  {
    name: 'Consultations',
    icon: MessageSquare,
    children: [
      { name: 'All Consultations', href: '/consultations' },
      { name: 'Live Monitor', href: '/consultations/live' },
      { name: 'Disputes', href: '/consultations/disputes' },
      { name: 'Emergency Calls', href: '/consultations/emergency' },
    ],
  },
  {
    name: 'Analytics',
    icon: BarChart3,
    children: [
      { name: 'Overview', href: '/dashboard/analytics' },
      { name: 'Revenue', href: '/dashboard/analytics/revenue' },
      { name: 'User Growth', href: '/dashboard/analytics/users' },
      { name: 'Lawyer Performance', href: '/dashboard/analytics/lawyers' },
      { name: 'Platform', href: '/dashboard/analytics/platform' },
      { name: 'Reports', href: '/dashboard/analytics/reports' },
      { name: 'Financial', href: '/dashboard/analytics/financial' },
    ],
  },
  { name: 'Financial', href: '/financial', icon: DollarSign },
  { name: 'Content', href: '/content', icon: FileText },
  { name: 'Support', href: '/support', icon: HeadphonesIcon },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900 text-white">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <h1 className="text-xl font-bold">Advocata Admin</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          if (item.children) {
            return (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center px-3 py-2 text-sm font-medium text-gray-300">
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </div>
                <div className="ml-9 space-y-1">
                  {item.children.map((child) => {
                    const isActive = pathname === child.href;
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          'flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors',
                          isActive
                            ? 'bg-gray-800 text-white'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        )}
                      >
                        <span>{child.name}</span>
                        {child.badge && (
                          <Badge variant="destructive" className="ml-2">
                            {child.badge}
                          </Badge>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          }

          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
