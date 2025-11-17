import React from "react";
import { Text, View, ViewStyle } from "react-native";

export default function UISection({ 
  title, 
  children, 
  style 
}: { 
  title: string; 
  children: React.ReactNode; 
  style?: ViewStyle;
}) {
  return (
    <View style={[{ gap: 8 }, style]}>
      <Text style={{ fontSize: 18, fontWeight: "700", color: "#111827" }}>
        {title}
      </Text>
      {children}
    </View>
  );
}
