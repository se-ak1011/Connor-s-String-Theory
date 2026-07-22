import { Stack } from 'expo-router';

export default function PortalLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="progress" />
      <Stack.Screen name="community" />
    </Stack>
  );
}
