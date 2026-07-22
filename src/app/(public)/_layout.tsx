import AppTabs from '@/components/app-tabs';
import type { TabDef } from '@/components/tab-def';

const PUBLIC_TABS: TabDef[] = [
  { name: 'index', href: '/', label: 'Home', icon: 'home' },
  { name: 'meet-pickles', href: '/meet-pickles', label: 'Meet Pickles', icon: 'paw' },
  { name: 'book', href: '/book', label: 'Book', icon: 'calendar' },
  { name: 'contact', href: '/contact', label: 'Contact', icon: 'chatbubble-ellipses' },
];

export default function PublicLayout() {
  return <AppTabs tabs={PUBLIC_TABS} />;
}
