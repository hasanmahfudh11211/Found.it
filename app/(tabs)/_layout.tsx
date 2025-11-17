import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import React from "react";
import { useAuth } from "../../providers/AuthProvider";

export default function TabsLayout() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Redirect href="/(auth)/login" />;
  return (
    <Tabs screenOptions={{ headerShown: true, headerTitleAlign: "center", headerShadowVisible: false, tabBarActiveTintColor: "#2563EB" }}>
      <Tabs.Screen name="home" options={{ title: "Beranda", headerTitle: "Foundshit", tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} /> }} />
      <Tabs.Screen name="riwayat" options={{ title: "Riwayat", headerTitle: "Laporan Saya", tabBarIcon: ({ color, size }) => <Ionicons name="document-text" color={color} size={size} /> }} />
      <Tabs.Screen name="lapor" options={{ title: "Lapor", headerTitle: "Lapor", tabBarIcon: ({ color, size }) => <Ionicons name="add-circle" color={color} size={size} /> }} />
      <Tabs.Screen name="profil" options={{ title: "Profil", headerTitle: "Profil", tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} /> }} />
      <Tabs.Screen name="users" options={{ href: null }} />
    </Tabs>
  );
}


