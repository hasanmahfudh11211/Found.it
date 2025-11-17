import React from "react";
import { View, ViewStyle } from "react-native";

export default function UICard({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return (
    <View
      style={[
        {
          backgroundColor: "#FFFFFF",
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#E5E7EB",
          padding: 16,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}



