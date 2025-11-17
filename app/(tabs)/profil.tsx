import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { collection, doc, getDoc, onSnapshot, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import UICard from "../../components/ui/Card";
import UIScreen from "../../components/ui/Screen";
import { firebaseAuth, firestoreDb } from "../../lib/firebase";
import { useAuth } from "../../providers/AuthProvider";

export default function ProfilScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, aktif: 0, selesai: 0 });
  const [role, setRole] = useState<"user" | "admin">("user");
  
  useEffect(() => {
    if (!user) return;
    
    const ref = collection(firestoreDb, "reports");
    const q = query(ref);
    
    const unsub = onSnapshot(q, (snap) => {
      const allData = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      const userReports = allData.filter((item: any) => item.uidPelapor === user.uid && item.status !== "Dihapus");
      
      setStats({
        total: userReports.length,
        aktif: userReports.filter((item: any) => item.status === "Aktif").length,
        selesai: userReports.filter((item: any) => item.status === "Selesai").length,
      });
    });
    
    return () => unsub();
  }, [user]);

  useEffect(() => {
    (async () => {
      if (!user?.uid) return;
      try {
        const snapUsers = await getDoc(doc(firestoreDb, "users", user.uid));
        let r: any = snapUsers.exists() ? (snapUsers.data() as any)?.role : undefined;
        if (!r) {
          const snapPengguna = await getDoc(doc(firestoreDb, "pengguna", user.uid));
          r = snapPengguna.exists() ? (snapPengguna.data() as any)?.peran : undefined;
        }
        setRole(r === "admin" ? "admin" : "user");
      } catch {
        setRole("user");
      }
    })();
  }, [user]);
  
  async function onLogout() {
    Alert.alert(
      "Keluar",
      "Apakah Anda yakin ingin keluar?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Keluar",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("🚪 Logout user:", user?.email);
              await signOut(firebaseAuth);
              console.log("✅ Berhasil logout");
              router.replace("/(auth)/login");
            } catch (e: any) {
              console.error("❌ Error logout:", e);
              Alert.alert("Gagal", e?.message ?? "Tidak dapat logout");
            }
          },
        },
      ]
    );
  }

  return (
    <UIScreen>
      <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 28, fontWeight: "900", color: "#111827", marginBottom: 4 }}>👤 Profil</Text>
          <Text style={{ fontSize: 14, color: "#6B7280" }}>Informasi akun dan statistik</Text>
        </View>

        {/* Profile Card */}
        <UICard style={{ marginBottom: 16, padding: 20 }}>
          {/* Avatar */}
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: "#DBEAFE",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
            }}>
              <Ionicons name="person" size={40} color="#3B82F6" />
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Text style={{ fontSize: 20, fontWeight: "900", color: "#111827" }}>
                {user?.displayName || "Pengguna"}
              </Text>
              {role === "admin" && <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827"}}>👑</Text> }
            </View>
            <Text style={{ fontSize: 14, color: "#6B7280" }}>
              {user?.email}
            </Text>


          </View>

          {/* Divider */}
          <View style={{ height: 1, backgroundColor: "#E5E7EB", marginBottom: 16 }} />

          {/* User Info */}
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="mail" size={18} color="#6B7280" style={{ marginRight: 10, width: 24 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 2 }}>Email</Text>
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151" }}>{user?.email}</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="key" size={18} color="#6B7280" style={{ marginRight: 10, width: 24 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 2 }}>User ID</Text>
                <Text style={{ fontSize: 12, fontWeight: "400", color: "#9CA3AF", fontFamily: "monospace" }}>
                  {user?.uid?.slice(0, 20)}...
                </Text>
              </View>
            </View>
          </View>
        </UICard>

        {/* Stats Cards */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 12 }}>📊 Statistik Laporan</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {/* Total */}
            <View style={{ flex: 1 }}>
              <UICard style={{ padding: 16, backgroundColor: "#F0F9FF", borderWidth: 1, borderColor: "#BFDBFE" }}>
                <Ionicons name="document-text" size={24} color="#3B82F6" style={{ marginBottom: 8 }} />
                <Text style={{ fontSize: 24, fontWeight: "900", color: "#1E40AF", marginBottom: 2 }}>{stats.total}</Text>
                <Text style={{ fontSize: 12, color: "#3B82F6", fontWeight: "600" }}>Total</Text>
              </UICard>
            </View>
            {/* Aktif */}
            <View style={{ flex: 1 }}>
              <UICard style={{ padding: 16, backgroundColor: "#ECFDF5", borderWidth: 1, borderColor: "#A7F3D0" }}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" style={{ marginBottom: 8 }} />
                <Text style={{ fontSize: 24, fontWeight: "900", color: "#059669", marginBottom: 2 }}>{stats.aktif}</Text>
                <Text style={{ fontSize: 12, color: "#10B981", fontWeight: "600" }}>Aktif</Text>
              </UICard>
            </View>
            {/* Selesai */}
            <View style={{ flex: 1 }}>
              <UICard style={{ padding: 16, backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: "#E5E7EB" }}>
                <Ionicons name="checkmark-done-circle" size={24} color="#6B7280" style={{ marginBottom: 8 }} />
                <Text style={{ fontSize: 24, fontWeight: "900", color: "#6B7280", marginBottom: 2 }}>{stats.selesai}</Text>
                <Text style={{ fontSize: 12, color: "#6B7280", fontWeight: "600" }}>Selesai</Text>
              </UICard>
            </View>
          </View>
        </View>

        {role === "admin" && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 12 }}>👑 Admin Panel</Text>
            <UICard style={{ padding: 0, overflow: "hidden", borderColor: "#C4B5FD", borderWidth: 2 }}>
              <Pressable
                onPress={() => router.push("/(tabs)/users")}
                style={{ flexDirection: "row", alignItems: "center", padding: 16 }}
              >
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#F5F3FF", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                  <Ionicons name="people" size={20} color="#7C3AED" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827" }}>Kelola Pengguna</Text>
                  <Text style={{ fontSize: 12, color: "#6B7280" }}>Lihat daftar pengguna</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </Pressable>
            </UICard>
          </View>
        )}

        {/* Menu Items */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 12 }}>⚙️ Pengaturan</Text>
          
          <UICard style={{ padding: 0, overflow: "hidden" }}>
            <Pressable
              onPress={() => router.push("/(tabs)/riwayat")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#F3F4F6",
              }}
            >
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#DBEAFE",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}>
                <Ionicons name="time" size={20} color="#3B82F6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: "600", color: "#111827" }}>Riwayat Laporan</Text>
                <Text style={{ fontSize: 12, color: "#6B7280" }}>Lihat semua laporanmu</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>

            <Pressable
              onPress={() => Alert.alert("Info", "Aplikasi Lost & Found ITS NU Pekalongan")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 16,
              }}
            >
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#FEF3C7",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}>
                <Ionicons name="information-circle" size={20} color="#F59E0B" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: "600", color: "#111827" }}>Tentang Aplikasi</Text>
                <Text style={{ fontSize: 12, color: "#6B7280" }}>Found.it v1.0.0</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>
          </UICard>
        </View>

        {/* About Card */}
        <UICard style={{ backgroundColor: "#F0F9FF", borderWidth: 1, borderColor: "#BFDBFE", padding: 16, marginBottom: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
            <Ionicons name="school" size={20} color="#3B82F6" style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#1E40AF" }}>Found.it</Text>
          </View>
          <Text style={{ fontSize: 12, color: "#3B82F6", lineHeight: 18 }}>
            Aplikasi Lost & Found untuk membantu mahasiswa ITS NU Pekalongan menemukan barang hilang dan mengembalikan barang Temuan.
          </Text>
        </UICard>

        {/* Logout Button */}
        <Pressable
          onPress={onLogout}
          style={{
            backgroundColor: "#FEE2E2",
            borderWidth: 2,
            borderColor: "#FECACA",
            borderRadius: 12,
            paddingVertical: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
          }}
        >
          <Ionicons name="log-out-outline" size={22} color="#DC2626" style={{ marginRight: 8 }} />
          <Text style={{ color: "#DC2626", fontSize: 16, fontWeight: "800" }}>Keluar</Text>
        </Pressable>
      </ScrollView>
    </UIScreen>
  );
}


