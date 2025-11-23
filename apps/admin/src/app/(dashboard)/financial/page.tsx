import { redirect } from 'next/navigation';

export default function FinancialPage() {
  // Redirect to payouts page as the default financial page
  redirect('/dashboard/financial/payouts');
}
