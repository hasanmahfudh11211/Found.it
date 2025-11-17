// d:\Kuliah\Semester 7\Implementas Aplikasi Mobile\Foundshit\app\admin\users.tsx
import { Ionicons } from "@expo/vector-icons";
import { collection, onSnapshot, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import UICard from "../../components/ui/Card";
import UIScreen from "../../components/ui/Screen";
import { firestoreDb } from "../../lib/firebase";

type UserItem = { id: string; displayName?: string; email?: string; role?: string };

export default function AdminUsersScreen() {
  const [items, setItems] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usersRef = collection(firestoreDb, "users");
    const pengRef = collection(firestoreDb, "pengguna");
    const qUsers = query(usersRef);
    const qPeng = query(pengRef);

    let unsubUsers: (() => void) | null = null;
    let unsubPeng: (() => void) | null = null;

    unsubUsers = onSnapshot(qUsers, (snap) => {
      const list = snap.docs.map((d) => {
        const data = d.data() as any;
        return { id: d.id, displayName: data.displayName, email: data.email, role: data.role };
      });
      if (list.length > 0) {
        setItems(list);
        setLoading(false);
      } else {
        unsubPeng = onSnapshot(qPeng, (snap2) => {
          const list2 = snap2.docs.map((d) => {
            const data = d.data() as any;
            return {
              id: d.id,
              displayName: data.namatampilan || data.displayName,
              email: data["e-mail"] || data.email,
              role: data.peran || data.role,
            };
          });
          setItems(list2);
          setLoading(false);
        });
      }
    });

    return () => {
      try { unsubUsers && unsubUsers(); } catch {}
      try { unsubPeng && unsubPeng(); } catch {}
    };
  }, []);

  if (loading) {
    return (
      <UIScreen>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={{ marginTop: 12, color: "#6B7280" }}>Memuat pengguna...</Text>
        </View>
      </UIScreen>
    );
  }

  return (
    <UIScreen>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 60 }}>
            <Ionicons name="people" size={48} color="#D1D5DB" />
            <Text style={{ marginTop: 16, fontSize: 16, fontWeight: "600", color: "#6B7280" }}>
              Tidak ada pengguna
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <UICard style={{ padding: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#DBEAFE", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="person" size={22} color="#3B82F6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: "800", color: "#111827" }}>
                  {item.displayName || "Pengguna"}
                </Text>
                <Text style={{ fontSize: 12, color: "#6B7280" }}>{item.email || "-"}</Text>
              </View>
              <View style={{ backgroundColor: (item.role === "admin" ? "#EDE9FE" : "#F3F4F6"), paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: (item.role === "admin" ? "#C4B5FD" : "#E5E7EB") }}>
                <Text style={{ color: (item.role === "admin" ? "#7C3AED" : "#6B7280"), fontSize: 12, fontWeight: "800" }}>
                  {item.role === "admin" ? "Admin" : "User"}
                </Text>
              </View>
            </View>
          </UICard>
        )}
      />
    </UIScreen>
  );
}