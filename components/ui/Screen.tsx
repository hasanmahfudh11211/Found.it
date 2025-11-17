import React from "react";
import { SafeAreaView, ViewStyle } from "react-native";

export default function UIScreen({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: "#F8FAFC" }, style]}>{children}</SafeAreaView>
  );
}



