import { Stack } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';

export default function ChatLayout() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: COLORS.primary,
        headerBackTitle: "Zurück",
        headerStyle: {
          backgroundColor: COLORS.white,
        },
        headerShadowVisible: true,
      }}
    >
      <Stack.Screen 
        name="[id]" 
        options={{ 
          title: "Chat",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                marginRight: 16,
                padding: 8,
                borderRadius: 20,
                backgroundColor: COLORS.backgroundLight,
              }}
            >
              <ArrowLeft size={20} color={COLORS.primary} />
            </TouchableOpacity>
          ),
        }} 
      />
    </Stack>
  );
}