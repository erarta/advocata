'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { CommissionConfigForm } from '@/components/financial/commission-config-form';
import { useCommissionConfig, useCommissionHistory } from '@/lib/hooks/use-financial';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, History } from 'lucide-react';

export default function CommissionsPage() {
  const { data: config, isLoading: configLoading } = useCommissionConfig();
  const { data: history, isLoading: historyLoading } = useCommissionHistory();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Commission Configuration</h1>
        <p className="text-muted-foreground">
          Manage platform commission rates across different categories
        </p>
      </div>

      {/* Commission Configuration Form */}
      {configLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      ) : config ? (
        <CommissionConfigForm initialConfig={config} />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              Failed to load commission configuration
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Commission History */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5" />
            <div>
              <CardTitle>Commission Rate Change History</CardTitle>
              <CardDescription>
                Track all changes made to commission rates
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : history && history.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Changed By</TableHead>
                    <TableHead>Commission Type</TableHead>
                    <TableHead className="text-right">Old Rate</TableHead>
                    <TableHead className="text-center">Change</TableHead>
                    <TableHead className="text-right">New Rate</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((entry) => {
                    const rateChange = entry.new_rate - entry.old_rate;
                    const isIncrease = rateChange > 0;

                    return (
                      <TableRow key={entry.id}>
                        <TableCell className="text-sm">
                          {format(new Date(entry.changed_at), 'MMM d, yyyy HH:mm')}
                        </TableCell>
                        <TableCell className="font-medium">
                          {entry.admin_name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {entry.commission_type.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {entry.old_rate}%
                        </TableCell>
                        <TableCell className="text-center">
                          {isIncrease ? (
                            <Badge
                              variant="destructive"
                              className="gap-1 font-normal"
                            >
                              <TrendingUp className="h-3 w-3" />
                              +{rateChange.toFixed(1)}%
                            </Badge>
                          ) : rateChange < 0 ? (
                            <Badge
                              variant="default"
                              className="gap-1 font-normal bg-green-600"
                            >
                              <TrendingDown className="h-3 w-3" />
                              {rateChange.toFixed(1)}%
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="font-normal">
                              No change
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {entry.new_rate}%
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {entry.notes || '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No commission rate changes yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
