import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { collection, onSnapshot, query, Timestamp } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, TextInput, View } from "react-native";
import UICard from "../../components/ui/Card";
import UIScreen from "../../components/ui/Screen";
import UISection from "../../components/ui/Section";
import { firestoreDb } from "../../lib/firebase";

type ReportItem = {
  id: string;
  title: string;
  description: string;
  location: string;
  fotoUrl?: string;
  reporterName?: string;
  status: "Aktif" | "Selesai" | "Ditemukan";
  kategori: "Hilang" | "Ditemukan";
  tanggalPosting?: Timestamp;
};

export default function HomeScreen() {
  const [items, setItems] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"Semua" | "Hilang" | "Ditemukan">("Semua");
  const [search, setSearch] = useState("");

  useEffect(() => {
    console.log("🔄 HomeScreen: Memulai listener Firestore...");
    const reportsRef = collection(firestoreDb, "reports");
    
    // SIMPLIFIED QUERY: Fetch ALL reports, filter di client-side
    // Ini menghindari composite index requirement dan permission issues
    const simpleQuery = query(reportsRef);

    const unsub = onSnapshot(
      simpleQuery,
      (snap) => {
        console.log("✅ Data berhasil dimuat:", snap.docs.length, "total laporan");
        // Filter dan sort di client-side
        const allData: ReportItem[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        const activeData = allData
          .filter(item => item.status === "Aktif")
          .sort((a, b) => {
            const timeA = a.tanggalPosting?.toMillis?.() || 0;
            const timeB = b.tanggalPosting?.toMillis?.() || 0;
            return timeB - timeA; // Descending order
          });
        console.log("📦 Data laporan Aktif:", activeData.length, "laporan");
        console.log("📦 Data:", activeData);
        setItems(activeData);
        setLoading(false);
        setRefreshing(false);
        setUsingFallback(false);
        setError(null);
      },
      (err) => {
        console.error("❌ Error Firestore:", err);
        const errorCode = (err as any)?.code;
        const errorMsg = (err as any)?.message;
        
        if (errorCode === "permission-denied") {
          console.error("🔴 PERMISSION DENIED! Firebase belum di-setup!");
          console.error("📖 Buka SETUP_FIREBASE.md untuk setup!");
          setError("Permission Denied: Firestore belum di-setup. Buka SETUP_FIREBASE.md");
        } else if (errorCode === "failed-precondition") {
          console.warn("⚠️ Index issue (seharusnya tidak terjadi dengan simple query)");
          setError("Index error: " + errorMsg);
        } else {
          console.error("❌ Error lain:", errorCode, errorMsg);
          setError(`Error: ${errorMsg || "Gagal memuat data"}`);
        }
        
        setLoading(false);
        setRefreshing(false);
      }
    );
    
    return () => {
      try { 
        unsub(); 
        console.log("🔄 HomeScreen listener unsubscribed");
      } catch (e) {
        console.error("Error unsubscribing:", e);
      }
    };
  }, []);

  function onRefresh() {
    setRefreshing(true);
  }

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  // Filter data untuk display
  const filteredItems = items.filter(i => {
    const matchFilter = filter === "Semua" ? true : i.kategori === filter;
    const matchSearch = search.trim() === "" ? true : 
      (i.title + " " + i.description).toLowerCase().includes(search.trim().toLowerCase());
    return matchFilter && matchSearch;
  });

  console.log("🔍 Filtered items for display:", filteredItems.length);
  console.log("🔍 Filter state:", filter, "| Search:", search);

  return (
    <UIScreen>
    <FlatList
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16 }}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListEmptyComponent={
        <View style={{ paddingTop: 40 }}>
          {usingFallback && (
            <Text style={{ color: "#b45309", marginBottom: 12 }}>
              Index Firestore belum dibuat. App menampilkan semua laporan sementara. Buat index dari link di log, lalu reload.
            </Text>
          )}
          <Text style={{ textAlign: "center", color: "#6B7280" }}>
            Belum ada laporan.{"\n"}
            {items.length > 0 && `(${items.length} laporan tersaring oleh filter)`}
          </Text>
        </View>
      }
      renderItem={({ item }) => {
        console.log("🎨 Rendering item:", item.title);
        return (
          <Pressable 
            onPress={() => router.push({ pathname: "/detail/[id]", params: { id: item.id } })}
            style={{ 
              shadowColor: "#000", 
              shadowOffset: { width: 0, height: 2 }, 
              shadowOpacity: 0.1, 
              shadowRadius: 8,
              elevation: 3
            }}
          >
            <UICard style={{ borderWidth: 2, borderColor: item.kategori === "Hilang" ? "#FEE2E2" : "#D1FAE5" }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 18, fontWeight: "900", color: "#111827", marginBottom: 4 }}>{item.title}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <View style={{ 
                      backgroundColor: item.kategori === "Hilang" ? "#FEE2E2" : "#D1FAE5",
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: item.kategori === "Hilang" ? "#FECACA" : "#A7F3D0"
                    }}>
                      <Text style={{ 
                        color: item.kategori === "Hilang" ? "#DC2626" : "#059669",
                        fontWeight: "800",
                        fontSize: 11
                      }}>
                        {item.kategori === "Hilang" ? "😢 HILANG" : "✅ DITEMUKAN"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              {!!item.fotoUrl && (
                <Image 
                  source={{ uri: item.fotoUrl }} 
                  style={{ 
                    width: "100%", 
                    height: 180, 
                    borderRadius: 12, 
                    marginBottom: 12,
                    backgroundColor: "#F3F4F6"
                  }} 
                  contentFit="cover" 
                />
              )}
              <Text style={{ color: "#4B5563", marginBottom: 8, fontSize: 14, lineHeight: 20 }} numberOfLines={2}>
                {item.description}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <Ionicons name="location" size={16} color="#EF4444" />
                <Text style={{ color: "#111827", fontWeight: "600", fontSize: 13 }}>{item.location}</Text>
              </View>
              {!!item.reporterName && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Ionicons name="person" size={16} color="#3B82F6" />
                  <Text style={{ color: "#6B7280", fontSize: 12 }}>Dilaporkan oleh <Text style={{ fontWeight: "600" }}>{item.reporterName}</Text></Text>
                </View>
              )}
            </UICard>
          </Pressable>
        );
      }}
      data={filteredItems}
      ListHeaderComponent={
        <View style={{ gap: 16 }}>
          {!!error && (
            <UICard style={{ backgroundColor: "#FEE2E2", borderColor: "#DC2626", borderWidth: 1 }}>
              <Text style={{ color: "#DC2626", fontWeight: "600" }}>⚠️ {error}</Text>
            </UICard>
          )}
          <UICard style={{ padding: 0, overflow: "hidden", elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 }}>
            {/* Gradient Header */}
            <View style={{ height: 160, backgroundColor: "#1e40af", position: "relative" }}>
              <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#3b82f6", opacity: 0.3 }} />
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 }}>
                <Text style={{ color: "white", fontSize: 28, fontWeight: "900", marginBottom: 4, textAlign: "center" }}>🔍 Found.it</Text>
                <Text style={{ color: "#bfdbfe", fontSize: 14, textAlign: "center" }}>Kehilangan atau Menemukan Barang?             Laporkan di Found.it</Text>
              </View>
            </View>
            <View style={{ padding: 20, marginTop: -30 }}>
              <Pressable onPress={() => router.push("/(tabs)/lapor")} style={{ shadowColor: "#2563EB", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 }}>
                <View style={{ backgroundColor: "#2563EB", paddingVertical: 16, borderRadius: 16, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}>
                  <Text style={{ fontSize: 20 }}>📝</Text>
                  <Text style={{ color: "white", fontWeight: "800", fontSize: 16 }}>Buat Laporan Baru</Text>
                </View>
              </Pressable>
            </View>
          </UICard>

          <UISection title="📊 Statistik Hari Ini">
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <View style={{ flex: 1, alignItems: "center" }}>
                <Text style={{ fontSize: 32, marginBottom: 4 }}>😢</Text>
                <Text style={{ fontSize: 36, fontWeight: "900", color: "#DC2626", marginBottom: 2 }}>{items.filter(i => i.kategori === "Hilang").length}</Text>
                <Text style={{ fontSize: 12, color: "#6B7280", fontWeight: "600" }}>Barang Hilang</Text>
              </View>
              <View style={{ width: 1, height: 40, backgroundColor: "#E5E7EB" }} />
              <View style={{ flex: 1, alignItems: "center" }}>
                <Text style={{ fontSize: 32, marginBottom: 4 }}>✅</Text>
                <Text style={{ fontSize: 36, fontWeight: "900", color: "#059669", marginBottom: 2 }}>{items.filter(i => i.kategori === "Ditemukan").length}</Text>
                <Text style={{ fontSize: 12, color: "#6B7280", fontWeight: "600" }}>Barang Temu</Text>
              </View>
            </View>
          </UISection>


          <UISection title="📋 Laporan Terbaru">
            <View style={{ backgroundColor: "white", borderRadius: 16, padding: 12, marginBottom: 12, borderWidth: 2, borderColor: "#E5E7EB", flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="search" size={20} color="#9CA3AF" />
              <TextInput
                placeholder="Cari laporan..."
                value={search}
                onChangeText={setSearch}
                style={{ flex: 1, fontSize: 14, color: "#111827" }}
                placeholderTextColor="#9CA3AF"
              />
              {search.length > 0 && (
                <Pressable onPress={() => setSearch("")}>
                  <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                </Pressable>
              )}
            </View>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              {(["Semua", "Hilang", "Ditemukan"] as const).map((f) => (
                <Pressable key={f} onPress={() => setFilter(f)}>
                  <View style={{ 
                    paddingVertical: 8, 
                    paddingHorizontal: 16, 
                    borderRadius: 20, 
                    borderWidth: 2, 
                    borderColor: filter === f ? "#2563EB" : "#E5E7EB", 
                    backgroundColor: filter === f ? "#2563EB" : "#FFFFFF",
                    shadowColor: filter === f ? "#2563EB" : "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: filter === f ? 0.3 : 0,
                    shadowRadius: 4,
                    elevation: filter === f ? 3 : 0
                  }}>
                    <Text style={{ color: filter === f ? "#FFFFFF" : "#6B7280", fontWeight: "700", fontSize: 13 }}>
                      {f === "Semua" ? "🔍 Semua" : f === "Hilang" ? "😢 Hilang" : "✅ Ditemukan"}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </UISection>
        </View>
      }
    />
    </UIScreen>
  );
}


