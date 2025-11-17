import React from "react";
import { View, Text } from "react-native";

export default function UIBadge({ text, color = "#2563EB" }: { text: string; color?: string }) {
  return (
    <View style={{ alignSelf: "flex-start", backgroundColor: color + "22", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
      <Text style={{ color, fontWeight: "600", fontSize: 12 }}>{text}</Text>
    </View>
  );
}



