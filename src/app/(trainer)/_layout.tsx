import { Stack } from 'expo-router';

// No tab bar — the trainer's whole app is Home (Pickles, tap for the chip
// orbit) plus the three screens the chips lead to. Nothing else to switch
// between, so a persistent nav bar would just be chrome with nowhere to
// point.
export default function TrainerLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
