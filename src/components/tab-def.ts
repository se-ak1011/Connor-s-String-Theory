import type Ionicons from '@expo/vector-icons/Ionicons';
import type { Href } from 'expo-router';

// Shared by app-tabs.tsx (native) and app-tabs.web.tsx — each route group
// (public vs portal) passes its own tab list rather than either file
// hardcoding one.
export type TabDef = {
  name: string;
  href: Href;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};
