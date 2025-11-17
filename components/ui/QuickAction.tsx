import React from "react";
import { Pressable, Text, View } from "react-native";
import UICard from "./Card";

export default function UIQuickAction({ icon, title, onPress }: { icon: React.ReactNode; title: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ width: "48%" }}>
      <UICard>
        <View style={{ alignItems: "center", gap: 8 }}>
          {icon}
          <Text style={{ fontWeight: "600" }}>{title}</Text>
        </View>
      </UICard>
    </Pressable>
  );
}



