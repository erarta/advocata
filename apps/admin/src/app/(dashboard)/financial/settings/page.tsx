'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  useFinancialSettings,
  useUpdateFinancialSettings,
  useTestPaymentGateway,
  useTestWebhook,
} from '@/lib/hooks/use-financial';
import { FinancialSettings, PayoutFrequency } from '@/lib/types/financial';
import {
  CreditCard,
  Building2,
  FileText,
  Calendar,
  Shield,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const settingsFormSchema = z.object({
  payment_gateway: z.object({
    yookassa_shop_id: z.string().min(1, 'Shop ID is required'),
    yookassa_secret_key: z.string().min(1, 'Secret key is required'),
    test_mode: z.boolean(),
    webhook_url: z.string().url('Must be a valid URL'),
  }),
  bank_account: z.object({
    account_number: z.string().min(1, 'Account number is required'),
    bank_name: z.string().min(1, 'Bank name is required'),
    bik: z.string().length(9, 'BIK must be 9 digits'),
    account_holder: z.string().min(1, 'Account holder is required'),
    legal_name: z.string().min(1, 'Legal name is required'),
  }),
  tax: z.object({
    vat_rate: z.number().min(0).max(100),
    tax_id: z.string().min(1, 'Tax ID is required'),
    company_legal_name: z.string().min(1, 'Company legal name is required'),
  }),
  payout_schedule: z.object({
    frequency: z.enum(['weekly', 'bi-weekly', 'monthly']),
    payout_day: z.number().min(1).max(31),
    minimum_threshold: z.number().min(0),
  }),
  refund_policy: z.object({
    automatic_refund_window_days: z.number().min(1),
    auto_approve_threshold: z.number().min(0),
  }),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export default function FinancialSettingsPage() {
  const { data: settings, isLoading } = useFinancialSettings();
  const updateSettingsMutation = useUpdateFinancialSettings();
  const testGatewayMutation = useTestPaymentGateway();
  const testWebhookMutation = useTestWebhook();

  const [lastTestResult, setLastTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: settings,
  });

  // Update form when settings are loaded
  useEffect(() => {
    if (settings) {
      form.reset(settings);
    }
  }, [settings, form]);

  const onSubmit = (values: SettingsFormValues) => {
    updateSettingsMutation.mutate(values as FinancialSettings);
  };

  const handleTestGateway = async () => {
    const result = await testGatewayMutation.mutateAsync();
    setLastTestResult(result);
  };

  const handleTestWebhook = async () => {
    const result = await testWebhookMutation.mutateAsync();
    setLastTestResult(result);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Settings</h1>
          <p className="text-muted-foreground">
            Configure payment gateways and financial policies
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financial Settings</h1>
        <p className="text-muted-foreground">
          Configure payment gateways, bank accounts, and financial policies
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Payment Gateway Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                <div>
                  <CardTitle>Payment Gateway (YooKassa)</CardTitle>
                  <CardDescription>
                    Configure YooKassa payment gateway integration
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="payment_gateway.yookassa_shop_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shop ID</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="123456" />
                    </FormControl>
                    <FormDescription>Your YooKassa shop ID</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payment_gateway.yookassa_secret_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secret Key</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="••••••••••••••••"
                      />
                    </FormControl>
                    <FormDescription>
                      Your YooKassa secret key (will be masked)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payment_gateway.test_mode"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Test Mode</FormLabel>
                      <FormDescription>
                        Enable test mode for development and testing
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payment_gateway.webhook_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Webhook URL</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="https://api.advocata.ru/webhooks/yookassa"
                      />
                    </FormControl>
                    <FormDescription>
                      URL for receiving payment notifications
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestGateway}
                  disabled={testGatewayMutation.isPending}
                >
                  {testGatewayMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    'Test API Connection'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestWebhook}
                  disabled={testWebhookMutation.isPending}
                >
                  {testWebhookMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    'Test Webhook'
                  )}
                </Button>
              </div>

              {lastTestResult && (
                <div
                  className={`flex items-center gap-2 p-3 rounded-lg ${
                    lastTestResult.success
                      ? 'bg-green-50 text-green-900'
                      : 'bg-red-50 text-red-900'
                  }`}
                >
                  {lastTestResult.success ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <span className="text-sm">{lastTestResult.message}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bank Account Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                <div>
                  <CardTitle>Bank Account Information</CardTitle>
                  <CardDescription>
                    Platform bank account for receiving payments
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bank_account.account_holder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Holder</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bank_account.legal_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Legal Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bank_account.bank_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bank_account.bik"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>BIK (Bank Identification Code)</FormLabel>
                      <FormControl>
                        <Input {...field} maxLength={9} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bank_account.account_number"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Account Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tax Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <div>
                  <CardTitle>Tax Settings</CardTitle>
                  <CardDescription>Configure tax rates and company tax information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tax.vat_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>VAT Rate (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>Value Added Tax rate</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tax.tax_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax ID (ИНН)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>Company tax identification number</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tax.company_legal_name"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Company Legal Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Payout Schedule */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <div>
                  <CardTitle>Payout Schedule</CardTitle>
                  <CardDescription>
                    Configure automatic payout frequency and thresholds
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="payout_schedule.frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payout Frequency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>How often to process payouts</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="payout_schedule.payout_day"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payout Day</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="31"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Day of month (1-31) or week (1-7)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="payout_schedule.minimum_threshold"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Minimum Payout Threshold (₽)</FormLabel>
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
                        Minimum amount required to trigger payout
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Refund Policy */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <div>
                  <CardTitle>Refund Policy</CardTitle>
                  <CardDescription>
                    Configure automatic refund rules and thresholds
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="refund_policy.automatic_refund_window_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Automatic Refund Window (Days)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Users can request refunds within this period
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="refund_policy.auto_approve_threshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Auto-Approve Threshold (₽)</FormLabel>
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
                        Auto-approve refunds below this amount
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end">
            <Button type="submit" disabled={updateSettingsMutation.isPending}>
              {updateSettingsMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
