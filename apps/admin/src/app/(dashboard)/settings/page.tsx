// Settings Page - Redirect to Platform Settings
import { redirect } from 'next/navigation';

export default function SettingsPage() {
  redirect('/settings/platform');
}
