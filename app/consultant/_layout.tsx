import { Stack } from 'expo-router';
import { COLORS } from '@/constants/colors';

export default function ConsultantLayout() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: COLORS.primary,
        headerBackTitle: "Zurück",
      }}
    >
      <Stack.Screen 
        name="[id]" 
        options={{ 
          title: "Berater-Profil",
        }} 
      />
    </Stack>
  );
}