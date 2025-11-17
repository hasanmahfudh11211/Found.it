import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Linking from "expo-linking";
import { router, useLocalSearchParams } from "expo-router";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Share, Text, View } from "react-native";
import UICard from "../../components/ui/Card";
import UIScreen from "../../components/ui/Screen";
import { firestoreDb } from "../../lib/firebase";
import { useAuth } from "../../providers/AuthProvider";

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<any | null>(null);
  const isOwner = useMemo(() => !!user && item?.uidPelapor === user.uid, [user, item]);

  useEffect(() => {
    if (!id) return;
    console.log("🔍 DetailScreen: Loading laporan ID:", id);
    const ref = doc(firestoreDb, "reports", String(id));
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          console.error("❌ Laporan tidak temu");
          setItem(null);
          setLoading(false);
          return;
        }
        const data = { id: snap.id, ...snap.data() };
        console.log("✅ Data loaded:", data);
        setItem(data);
        setLoading(false);
      },
      (error) => {
        console.error("❌ Error loading detail:", error);
        Alert.alert("Error", "Gagal memuat detail laporan");
        setLoading(false);
      }
    );
    return () => unsub();
  }, [id]);

  async function markDone() {
    if (!id) return;
    try {
      await updateDoc(doc(firestoreDb, "reports", String(id)), { status: "Selesai" });
      Alert.alert("Berhasil", "Laporan ditandai selesai.");
      router.back();
    } catch (e: any) {
      Alert.alert("Gagal", e?.message ?? "Tidak dapat memperbarui status");
    }
  }

  async function contactReporter() {
    const email: string | undefined = item?.kontakPelapor?.email || undefined;
    const other: string | undefined = item?.kontakPelapor?.other || undefined;
    if (email) {
      const url = `mailto:${email}?subject=Menanggapi laporan ${encodeURIComponent(item?.title || "laporan")}`;
      await Linking.openURL(url);
      return;
    }
    if (other) {
      await Linking.openURL(other);
      return;
    }
    Alert.alert("Kontak tidak tersedia", "Reporter belum menyertakan kontak.");
  }

  async function onShare() {
    const text = `Laporan: ${item?.title}\nKategori: ${item?.kategori}\nStatus: ${item?.status}\nLokasi: ${item?.location}`;
    try {
      await Share.share({ title: item?.title || "Laporan", message: text });
    } catch {}
  }

  if (loading) {
    return (
      <UIScreen>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={{ marginTop: 12, color: "#6B7280" }}>Memuat detail...</Text>
        </View>
      </UIScreen>
    );
  }

  if (!item) {
    return (
      <UIScreen>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <Ionicons name="alert-circle-outline" size={64} color="#9CA3AF" />
          <Text style={{ marginTop: 16, fontSize: 18, fontWeight: "600", color: "#111827" }}>Data tidak temu</Text>
          <Text style={{ marginTop: 8, color: "#6B7280", textAlign: "center" }}>Laporan ini mungkin telah dihapus atau tidak ada.</Text>
          <Pressable
            onPress={() => router.back()}
            style={{
              marginTop: 24,
              backgroundColor: "#3B82F6",
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "white", fontWeight: "600" }}>Kembali</Text>
          </Pressable>
        </View>
      </UIScreen>
    );
  }

  // Safe to access item here - item is guaranteed to exist
  const formattedDate = item?.tanggalPosting?.toDate?.() 
    ? new Date(item.tanggalPosting.toDate()).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    : "Tidak diketahui";

  return (
    <UIScreen>
      <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        {/* Header dengan Back Button */}
        <Pressable
          onPress={() => router.back()}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#3B82F6" />
          <Text style={{ marginLeft: 8, fontSize: 16, fontWeight: "600", color: "#3B82F6" }}>Kembali</Text>
        </Pressable>

        {/* Foto */}
        {!!item.fotoUrl && (
          <View style={{ marginBottom: 20 }}>
            <Image 
              source={{ uri: item.fotoUrl }} 
              style={{ 
                width: "100%", 
                height: 280, 
                borderRadius: 16,
                backgroundColor: "#F3F4F6"
              }} 
              contentFit="cover" 
            />
          </View>
        )}

        {/* Status Badges */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <View style={{
            backgroundColor: item.kategori === "Hilang" ? "#FEE2E2" : "#D1FAE5",
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: item.kategori === "Hilang" ? "#FECACA" : "#A7F3D0",
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
          }}>
            <Text style={{ fontSize: 16 }}>{item.kategori === "Hilang" ? "😢" : "✅"}</Text>
            <Text style={{
              color: item.kategori === "Hilang" ? "#DC2626" : "#059669",
              fontWeight: "800",
              fontSize: 12,
            }}>
              {item.kategori === "Hilang" ? "HILANG" : "temu"}
            </Text>
          </View>
          <View style={{
            backgroundColor: item.status === "Aktif" ? "#DBEAFE" : "#F3F4F6",
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: item.status === "Aktif" ? "#BFDBFE" : "#E5E7EB",
          }}>
            <Text style={{
              color: item.status === "Aktif" ? "#1E40AF" : "#6B7280",
              fontWeight: "700",
              fontSize: 12,
            }}>
              {item.status}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={{ fontSize: 28, fontWeight: "900", color: "#111827", marginBottom: 20 }}>
          {item.title}
        </Text>

        {/* Detail Barang */}
        <UICard style={{ marginBottom: 16, padding: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <Ionicons name="document-text-outline" size={20} color="#3B82F6" style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827" }}>Deskripsi</Text>
          </View>
          <Text style={{ color: "#374151", lineHeight: 22, fontSize: 15 }}>{item.description}</Text>
        </UICard>

        {/* Lokasi */}
        <UICard style={{ marginBottom: 16, padding: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <Ionicons name="location" size={20} color="#EF4444" style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827" }}>Lokasi</Text>
          </View>
          <Text style={{ color: "#374151", fontSize: 15, fontWeight: "600" }}>{item.location}</Text>
          {!!item.locationNote && (
            <Text style={{ color: "#6B7280", marginTop: 6, fontSize: 14 }}>Catatan: {item.locationNote}</Text>
          )}
        </UICard>

        {/* Info Pelapor */}
        <UICard style={{ marginBottom: 16, padding: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <Ionicons name="person-circle-outline" size={20} color="#8B5CF6" style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827" }}>Info Pelapor</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
            <Ionicons name="person" size={16} color="#6B7280" style={{ marginRight: 6 }} />
            <Text style={{ color: "#374151", fontSize: 14 }}>{item.reporterName || "Pengguna"}</Text>
          </View>
          {!!item.kontakPelapor?.email && (
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <Ionicons name="mail" size={16} color="#6B7280" style={{ marginRight: 6 }} />
              <Text style={{ color: "#374151", fontSize: 14 }}>{item.kontakPelapor?.email}</Text>
            </View>
          )}
          {!!item.kontakPelapor?.other && (
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <Ionicons name="call" size={16} color="#6B7280" style={{ marginRight: 6 }} />
              <Text style={{ color: "#374151", fontSize: 14 }}>{item.kontakPelapor?.other}</Text>
            </View>
          )}
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
            <Ionicons name="time" size={16} color="#6B7280" style={{ marginRight: 6 }} />
            <Text style={{ color: "#6B7280", fontSize: 12 }}>Dilaporkan: {formattedDate}</Text>
          </View>
        </UICard>

        {/* Action Buttons */}
        <View style={{ gap: 12, marginBottom: 32 }}>
          {/* Contact Button */}
          <Pressable
            onPress={contactReporter}
            style={{
              backgroundColor: "#10B981",
              borderRadius: 12,
              paddingVertical: 14,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#10B981",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Ionicons name="chatbubble-ellipses" size={20} color="white" style={{ marginRight: 8 }} />
            <Text style={{ color: "white", fontSize: 16, fontWeight: "800" }}>Hubungi Pelapor</Text>
          </Pressable>

          {/* Share Button */}
          <Pressable
            onPress={onShare}
            style={{
              backgroundColor: "white",
              borderWidth: 2,
              borderColor: "#E5E7EB",
              borderRadius: 12,
              paddingVertical: 14,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="share-social" size={20} color="#3B82F6" style={{ marginRight: 8 }} />
            <Text style={{ color: "#3B82F6", fontSize: 16, fontWeight: "800" }}>Bagikan</Text>
          </Pressable>

          {/* Mark Done - Only for owner */}
          {isOwner && item.status === "Aktif" && (
            <Pressable
              onPress={markDone}
              style={{
                backgroundColor: "#F59E0B",
                borderRadius: 12,
                paddingVertical: 14,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="checkmark-done-circle" size={20} color="white" style={{ marginRight: 8 }} />
              <Text style={{ color: "white", fontSize: 16, fontWeight: "800" }}>Tandai Selesai</Text>
            </Pressable>
          )}

          {/* Edit Button - Only for owner and active */}
          {isOwner && item.status === "Aktif" && (
            <Pressable
              onPress={() => router.push({ pathname: "/edit/[id]", params: { id: String(id) } })}
              style={{
                backgroundColor: "white",
                borderWidth: 2,
                borderColor: "#E5E7EB",
                borderRadius: 12,
                paddingVertical: 14,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="pencil" size={20} color="#6B7280" style={{ marginRight: 8 }} />
              <Text style={{ color: "#6B7280", fontSize: 16, fontWeight: "800" }}>Edit Laporan</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </UIScreen>
  );
}


