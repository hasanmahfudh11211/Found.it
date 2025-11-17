import React from "react";
import { Text } from "react-native";
import UICard from "./Card";

export default function UIStatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <UICard style={{ width: "48%" }}>
      <Text style={{ color: "#6B7280", marginBottom: 4 }}>{label}</Text>
      <Text style={{ fontSize: 24, fontWeight: "800" }}>{value}</Text>
    </UICard>
  );
}



