import React from "react";
import { Text, TextInput, View } from "react-native";

type InputProps = {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (t: string) => void;
  secureTextEntry?: boolean;
  multiline?: boolean;
  keyboardType?: "default" | "email-address";
  rightElement?: React.ReactNode;
};

export default function UIInput({ label, rightElement, ...props }: InputProps) {
  return (
    <View style={{ gap: 6 }}>
      {!!label && <Text style={{ color: "#374151", fontWeight: "600" }}>{label}</Text>}
      <View style={{ position: "relative" }}>
        <TextInput
          {...props}
          style={{
            borderWidth: 1,
            borderColor: "#E5E7EB",
            borderRadius: 12,
            padding: 12,
            backgroundColor: "#FFFFFF",
            minHeight: props.multiline ? 96 : undefined,
            textAlignVertical: props.multiline ? "top" : "auto",
            paddingRight: rightElement ? 40 : 12,
          }}
          placeholderTextColor="#9CA3AF"
        />
        {!!rightElement && (
          <View style={{ position: "absolute", right: 10, top: 10 }}>{rightElement}</View>
        )}
      </View>
    </View>
  );
}



