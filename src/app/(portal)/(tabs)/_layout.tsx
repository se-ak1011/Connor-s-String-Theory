import AppTabs from '@/components/app-tabs';
import type { TabDef } from '@/components/tab-def';

const PORTAL_TABS: TabDef[] = [
  { name: 'index', href: '/', label: 'Home', icon: 'home' },
  { name: 'training', href: '/training', label: 'Training', icon: 'school' },
  { name: 'sessions', href: '/sessions', label: 'Sessions', icon: 'calendar' },
  { name: 'coach', href: '/coach', label: 'Coach', icon: 'chatbubble-ellipses' },
  { name: 'profile', href: '/profile', label: 'Profile', icon: 'person-circle' },
];

export default function PortalTabsLayout() {
  return <AppTabs tabs={PORTAL_TABS} />;
}
