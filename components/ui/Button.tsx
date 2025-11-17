import React from "react";
import { Pressable, Text, ViewStyle } from "react-native";

type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  style?: ViewStyle;
};

export default function UIButton({ title, onPress, variant = "primary", disabled, style }: ButtonProps) {
  const base: ViewStyle = {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  };
  const variants: Record<string, ViewStyle> = {
    primary: { backgroundColor: disabled ? "#9CA3AF" : "#2563EB" },
    secondary: { backgroundColor: disabled ? "#E5E7EB" : "#111827" },
    ghost: { backgroundColor: "transparent", borderWidth: 1, borderColor: "#D1D5DB" },
  };
  const textColor = variant === "primary" ? "#ffffff" : variant === "secondary" ? "#ffffff" : "#111827";

  return (
    <Pressable onPress={onPress} disabled={disabled} style={[base, variants[variant], style]}
      android_ripple={{ color: "#00000022" }}>
      <Text style={{ color: textColor, fontWeight: "600", fontSize: 16 }}>{title}</Text>
    </Pressable>
  );
}



