import { Stack } from "expo-router";
import { AuthProvider } from "../providers/AuthProvider";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: true, headerTitleAlign: "center", headerShadowVisible: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ title: "Masuk" }} />
        <Stack.Screen name="(auth)/register" options={{ title: "Daftar" }} />
        <Stack.Screen name="detail/[id]" options={{ title: "Detail Laporan" }} />
      </Stack>
    </AuthProvider>
  );
}
