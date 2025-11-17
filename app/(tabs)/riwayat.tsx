import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { collection, doc, onSnapshot, query, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, Text, View } from "react-native";
import UICard from "../../components/ui/Card";
import UIScreen from "../../components/ui/Screen";
import { firestoreDb } from "../../lib/firebase";
import { showToast } from "../../lib/toast";
import { useAuth } from "../../providers/AuthProvider";

type Item = { 
  id: string; 
  title: string; 
  description: string; 
  location: string; 
  status: string; 
  kategori: string; 
  uidPelapor: string;
  tanggalPosting?: any;
  fotoUrl?: string;
};

export default function RiwayatScreen() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"Semua" | "Aktif" | "Selesai">("Semua");

  useEffect(() => {
    if (!user) {
      console.warn("⚠️ User tidak login");
      return;
    }
    console.log("🔄 RiwayatScreen: Loading laporan user...");
    const ref = collection(firestoreDb, "reports");
    
    // SIMPLIFIED QUERY: Fetch ALL reports, filter by user di client-side
    // Menghindari composite index requirement
    const simpleQuery = query(ref);
    
    const unsub = onSnapshot(
      simpleQuery,
      (snap) => {
        console.log("✅ Total data loaded:", snap.docs.length, "laporan");
        // Filter by user dan sort di client-side
        const allData = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Item[];
        const userReports = allData
          .filter(item => item.uidPelapor === user.uid)
          .sort((a: any, b: any) => {
            const timeA = a.tanggalPosting?.toMillis?.() || 0;
            const timeB = b.tanggalPosting?.toMillis?.() || 0;
            return timeB - timeA;
          });
        console.log("✅ Riwayat user:", userReports.length, "laporan");
        setItems(userReports);
        setLoading(false);
      },
      (err) => {
        console.error("❌ Error loading riwayat:", err);
        const errorCode = (err as any)?.code;
        if (errorCode === "permission-denied") {
          console.error("🔴 PERMISSION DENIED! Setup Firebase dulu!");
          Alert.alert("Permission Denied", "Firestore belum di-setup. Buka SETUP_FIREBASE.md");
        }
      }
    );
    
    return () => {
      try { 
        unsub(); 
        console.log("🔄 RiwayatScreen listener unsubscribed");
      } catch (e) {
        console.error("Error unsubscribing:", e);
      }
    };
  }, [user]);

  // Soft delete: update status menjadi "Dihapus" atau "Dibatalkan"
  async function onDelete(id: string, title: string) {
    Alert.alert("Hapus laporan?", `Apakah Anda yakin ingin menghapus "${title}"?`, [
      { text: "Batal", style: "cancel" },
      { 
        text: "Hapus", 
        style: "destructive", 
        onPress: async () => { 
          try {
            console.log("🗑️ Soft delete laporan:", id);
            // Soft delete: Update status instead of actual delete
            await updateDoc(doc(firestoreDb, "reports", id), { 
              status: "Dihapus" 
            });
            console.log("✅ Laporan berhasil dihapus");
            showToast("Laporan dihapus");
          } catch (e: any) {
            console.error("❌ Error hapus laporan:", e);
            Alert.alert("Gagal", e?.message ?? "Tidak dapat menghapus laporan");
          }
        } 
      },
    ]);
  }

  const filteredItems = items
    .filter(i => i.status !== "Dihapus")
    .filter(i => {
      if (filter === "Semua") return true;
      return i.status === filter;
    });

  return (
    <UIScreen>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ padding: 16, paddingBottom: 12 }}>
          <Text style={{ fontSize: 28, fontWeight: "900", color: "#111827", marginBottom: 4 }}>📋 Riwayat Laporan</Text>
          <Text style={{ fontSize: 14, color: "#6B7280" }}>Kelola semua laporan yang kamu buat</Text>
        </View>

        {/* Filter Tabs */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {(["Semua", "Aktif", "Selesai"] as const).map((tab) => (
              <Pressable
                key={tab}
                onPress={() => setFilter(tab)}
                style={{
                  flex: 1,
                  backgroundColor: filter === tab ? "#3B82F6" : "white",
                  borderWidth: 2,
                  borderColor: filter === tab ? "#3B82F6" : "#E5E7EB",
                  borderRadius: 12,
                  paddingVertical: 10,
                  alignItems: "center",
                }}
              >
                <Text style={{
                  color: filter === tab ? "white" : "#6B7280",
                  fontWeight: filter === tab ? "800" : "600",
                  fontSize: 14,
                }}>
                  {tab}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Stats */}
        {!loading && (
          <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
            <Text style={{ fontSize: 12, color: "#6B7280" }}>
              {filteredItems.length} laporan Temu
            </Text>
          </View>
        )}

        {/* List */}
        {loading ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={{ marginTop: 12, color: "#6B7280" }}>Memuat riwayat...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredItems}
            keyExtractor={(i) => i.id}
            contentContainerStyle={{ padding: 16, paddingTop: 0 }}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            ListEmptyComponent={
              <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 60 }}>
                <Ionicons name="file-tray-outline" size={64} color="#D1D5DB" />
                <Text style={{ marginTop: 16, fontSize: 16, fontWeight: "600", color: "#6B7280" }}>
                  Belum ada laporan
                </Text>
                <Text style={{ marginTop: 4, fontSize: 14, color: "#9CA3AF", textAlign: "center" }}>
                  {filter === "Semua" 
                    ? "Buat laporan pertamamu di tab Lapor"
                    : `Tidak ada laporan dengan status "${filter}"`
                  }
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <Pressable 
                onPress={() => router.push({ pathname: "/detail/[id]", params: { id: item.id } })}
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <UICard style={{ 
                  borderWidth: 2, 
                  borderColor: item.kategori === "Hilang" ? "#FEE2E2" : "#D1FAE5" 
                }}>
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    {/* Thumbnail */}
                    {item.fotoUrl ? (
                      <Image 
                        source={{ uri: item.fotoUrl }} 
                        style={{ 
                          width: 80, 
                          height: 80, 
                          borderRadius: 8,
                          backgroundColor: "#F3F4F6"
                        }} 
                        contentFit="cover" 
                      />
                    ) : (
                      <View style={{ 
                        width: 80, 
                        height: 80, 
                        borderRadius: 8, 
                        backgroundColor: "#F3F4F6",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        <Ionicons name="image-outline" size={32} color="#D1D5DB" />
                      </View>
                    )}

                    {/* Content */}
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: "900", color: "#111827", marginBottom: 4 }}>
                        {item.title}
                      </Text>
                      <Text style={{ color: "#6B7280", fontSize: 13, marginBottom: 6 }} numberOfLines={2}>
                        {item.description}
                      </Text>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 8 }}>
                        <Ionicons name="location" size={14} color="#EF4444" />
                        <Text style={{ color: "#374151", fontSize: 12, flex: 1 }} numberOfLines={1}>
                          {item.location}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Badges */}
                  <View style={{ flexDirection: "row", gap: 6, marginTop: 12 }}>
                    <View style={{ 
                      backgroundColor: item.kategori === "Hilang" ? "#FEE2E2" : "#D1FAE5", 
                      paddingHorizontal: 10, 
                      paddingVertical: 4, 
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: item.kategori === "Hilang" ? "#FECACA" : "#A7F3D0",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}>
                      <Text style={{ fontSize: 12 }}>{item.kategori === "Hilang" ? "😢" : "✅"}</Text>
                      <Text style={{ 
                        color: item.kategori === "Hilang" ? "#DC2626" : "#059669", 
                        fontSize: 11, 
                        fontWeight: "800" 
                      }}>
                        {item.kategori === "Hilang" ? "HILANG" : "Temu"}
                      </Text>
                    </View>
                    <View style={{ 
                      backgroundColor: item.status === "Aktif" ? "#DBEAFE" : "#F3F4F6", 
                      paddingHorizontal: 10, 
                      paddingVertical: 4, 
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: item.status === "Aktif" ? "#BFDBFE" : "#E5E7EB",
                    }}>
                      <Text style={{ 
                        color: item.status === "Aktif" ? "#1E40AF" : "#6B7280", 
                        fontSize: 11, 
                        fontWeight: "700" 
                      }}>
                        {item.status}
                      </Text>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  {item.status === "Aktif" && (
                    <View style={{ flexDirection: "row", gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#F3F4F6" }}>
                      <Pressable
                        onPress={() => router.push({ pathname: "/edit/[id]", params: { id: item.id } })}
                        style={{
                          flex: 1,
                          backgroundColor: "white",
                          borderWidth: 2,
                          borderColor: "#E5E7EB",
                          borderRadius: 8,
                          paddingVertical: 8,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                        }}
                      >
                        <Ionicons name="pencil" size={16} color="#3B82F6" />
                        <Text style={{ color: "#3B82F6", fontWeight: "700", fontSize: 13 }}>Edit</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => onDelete(item.id, item.title)}
                        style={{
                          flex: 1,
                          backgroundColor: "#FEE2E2",
                          borderWidth: 2,
                          borderColor: "#FECACA",
                          borderRadius: 8,
                          paddingVertical: 8,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                        }}
                      >
                        <Ionicons name="trash-outline" size={16} color="#DC2626" />
                        <Text style={{ color: "#DC2626", fontWeight: "700", fontSize: 13 }}>Hapus</Text>
                      </Pressable>
                    </View>
                  )}
                </UICard>
              </Pressable>
            )}
          />
        )}
      </View>
    </UIScreen>
  );
}


