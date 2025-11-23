'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CommissionConfig, CommissionImpact } from '@/lib/types/financial';
import {
  useUpdateCommissionConfig,
  usePreviewCommissionImpact,
  useResetCommissionConfig,
} from '@/lib/hooks/use-financial';
import { Loader2, AlertCircle, TrendingDown, TrendingUp, Percent } from 'lucide-react';

const commissionFormSchema = z.object({
  global: z.object({
    default_rate: z.number().min(0).max(100),
    minimum_amount: z.number().min(0),
    maximum_amount: z.number().min(0).optional(),
  }),
  by_consultation_type: z.object({
    chat: z.number().min(0).max(100),
    video: z.number().min(0).max(100),
    voice: z.number().min(0).max(100),
    in_person: z.number().min(0).max(100),
    emergency: z.number().min(0).max(100),
  }),
  by_subscription_tier: z.object({
    free: z.number().min(0).max(100),
    basic: z.number().min(0).max(100),
    premium: z.number().min(0).max(100),
    vip: z.number().min(0).max(100),
  }),
  by_lawyer_tier: z.object({
    new_lawyers: z.number().min(0).max(100),
    regular_lawyers: z.number().min(0).max(100),
    top_performers: z.number().min(0).max(100),
    vip_lawyers: z.number().min(0).max(100),
  }),
});

type CommissionFormValues = z.infer<typeof commissionFormSchema>;

interface CommissionConfigFormProps {
  initialConfig: CommissionConfig;
}

export function CommissionConfigForm({ initialConfig }: CommissionConfigFormProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [impact, setImpact] = useState<CommissionImpact | null>(null);

  const updateConfigMutation = useUpdateCommissionConfig();
  const previewImpactMutation = usePreviewCommissionImpact();
  const resetConfigMutation = useResetCommissionConfig();

  const form = useForm<CommissionFormValues>({
    resolver: zodResolver(commissionFormSchema),
    defaultValues: initialConfig,
  });

  // Update form when initialConfig changes
  useEffect(() => {
    form.reset(initialConfig);
  }, [initialConfig, form]);

  const handlePreviewImpact = async () => {
    const values = form.getValues();
    try {
      const result = await previewImpactMutation.mutateAsync(values);
      setImpact(result);
      setShowPreview(true);
    } catch (error) {
      console.error('Failed to preview impact:', error);
    }
  };

  const onSubmit = (values: CommissionFormValues) => {
    setShowConfirmDialog(true);
  };

  const handleConfirmSave = () => {
    const values = form.getValues();
    updateConfigMutation.mutate(values, {
      onSuccess: () => {
        setShowConfirmDialog(false);
        setShowPreview(false);
      },
    });
  };

  const handleReset = () => {
    resetConfigMutation.mutate(undefined, {
      onSuccess: (newConfig) => {
        form.reset(newConfig);
        setShowResetDialog(false);
      },
    });
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Global Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Global Settings</CardTitle>
              <CardDescription>
                Default commission rates applicable to all consultations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="global.default_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Commission Rate (%)</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                        <Percent className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormDescription>
                      The default percentage taken as commission
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="global.minimum_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Commission (₽)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Minimum commission amount per consultation
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="global.maximum_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Commission (₽)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value ? parseFloat(value) : undefined);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum commission cap (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* By Consultation Type */}
          <Card>
            <CardHeader>
              <CardTitle>Commission by Consultation Type</CardTitle>
              <CardDescription>
                Different rates for different consultation types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="by_consultation_type.chat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chat Consultations (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="by_consultation_type.video"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video Consultations (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="by_consultation_type.voice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Voice Calls (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="by_consultation_type.in_person"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>In-Person Consultations (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="by_consultation_type.emergency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Calls (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* By Subscription Tier */}
          <Card>
            <CardHeader>
              <CardTitle>Commission by Subscription Tier</CardTitle>
              <CardDescription>
                Different rates based on user subscription level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="by_subscription_tier.free"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Free Users (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="by_subscription_tier.basic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Basic Subscription (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="by_subscription_tier.premium"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Premium Subscription (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="by_subscription_tier.vip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>VIP Subscription (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* By Lawyer Tier */}
          <Card>
            <CardHeader>
              <CardTitle>Commission by Lawyer Performance</CardTitle>
              <CardDescription>
                Incentivize high performers with lower commission rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="by_lawyer_tier.new_lawyers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        New Lawyers ({"<"}10 consultations) (%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="by_lawyer_tier.regular_lawyers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Regular Lawyers (10-50 consultations) (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="by_lawyer_tier.top_performers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Top Performers ({">"}50 consultations) (%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="by_lawyer_tier.vip_lawyers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>VIP Lawyers (Custom Commission) (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Impact Preview */}
          {showPreview && impact && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-medium">Impact Preview</div>
                  <div className="text-sm">
                    These changes will affect <strong>{impact.affected_payouts}</strong>{' '}
                    pending payouts.
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span>Total amount change:</span>
                    {impact.total_amount_change > 0 ? (
                      <Badge variant="destructive" className="gap-1">
                        <TrendingUp className="h-3 w-3" />+
                        {impact.total_amount_change.toLocaleString('ru-RU')} ₽
                      </Badge>
                    ) : (
                      <Badge variant="default" className="gap-1 bg-green-600">
                        <TrendingDown className="h-3 w-3" />
                        {Math.abs(impact.total_amount_change).toLocaleString('ru-RU')}{' '}
                        ₽
                      </Badge>
                    )}
                  </div>
                  {impact.lawyer_impact.length > 0 && (
                    <div className="text-xs text-muted-foreground mt-2">
                      Top affected lawyers: {impact.lawyer_impact.slice(0, 3).map(l => l.lawyer_name).join(', ')}
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowResetDialog(true)}
            >
              Reset to Defaults
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handlePreviewImpact}
                disabled={previewImpactMutation.isPending}
              >
                {previewImpactMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Preview Impact'
                )}
              </Button>
              <Button type="submit" disabled={updateConfigMutation.isPending}>
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </Form>

      {/* Confirm Save Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Commission Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to update the commission configuration. This will affect
              how commissions are calculated for all future consultations.
              {impact && impact.affected_payouts > 0 && (
                <>
                  <br />
                  <br />
                  <strong>
                    {impact.affected_payouts} pending payouts will be affected by
                    these changes.
                  </strong>
                </>
              )}
              <br />
              <br />
              Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSave}
              disabled={updateConfigMutation.isPending}
            >
              {updateConfigMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Confirm & Save'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset to Default Configuration</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all commission rates to their default values. Any
              custom configuration will be lost.
              <br />
              <br />
              Are you sure you want to reset?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              disabled={resetConfigMutation.isPending}
            >
              {resetConfigMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                'Reset Configuration'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
