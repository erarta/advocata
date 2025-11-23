'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, MessageSquare, DollarSign } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils/formatters';

// Mock data - replace with actual API calls
const stats = [
  {
    title: 'Total Users',
    value: 1234,
    icon: Users,
    change: '+12.5%',
    changeType: 'positive' as const,
  },
  {
    title: 'Active Lawyers',
    value: 89,
    icon: UserCheck,
    change: '+5.2%',
    changeType: 'positive' as const,
  },
  {
    title: 'Active Consultations',
    value: 45,
    icon: MessageSquare,
    change: '-2.4%',
    changeType: 'negative' as const,
  },
  {
    title: 'Monthly Revenue',
    value: 245000,
    icon: DollarSign,
    change: '+18.3%',
    changeType: 'positive' as const,
    isCurrency: true,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Overview of your platform performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stat.isCurrency ? formatCurrency(stat.value) : formatNumber(stat.value)}
              </div>
              <p
                className={`text-xs ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">No recent activity to display</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
