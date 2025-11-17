import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import UICard from "../../components/ui/Card";
import UIInput from "../../components/ui/Input";
import UIScreen from "../../components/ui/Screen";
import { firestoreDb } from "../../lib/firebase";
import { showToast } from "../../lib/toast";

export default function EditReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      if (!id) return;
      console.log("📝 EditScreen: Loading laporan dengan ID:", id);
      try {
        const snap = await getDoc(doc(firestoreDb, "reports", String(id)));
        if (!snap.exists()) {
          console.error("❌ Laporan tidak temu");
          Alert.alert("Error", "Laporan tidak temu");
          router.back();
          return;
        }
        const d = snap.data() as any;
        console.log("✅ Data loaded:", d);
        setTitle(d.title || "");
        setDescription(d.description || "");
        setLocation(d.location || "");
      } catch (e) {
        console.error("❌ Error loading laporan:", e);
        Alert.alert("Error", "Gagal memuat data laporan");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function onSave() {
    if (!id) return;
    if (!title.trim() || !description.trim() || !location.trim()) {
      console.warn("⚠️ Form tidak lengkap");
      Alert.alert("Form belum lengkap", "Isi judul, deskripsi, dan lokasi.");
      return;
    }
    console.log("💾 Menyimpan perubahan laporan...");
    setSaving(true);
    try {
      await updateDoc(doc(firestoreDb, "reports", String(id)), {
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
      });
      console.log("✅ Laporan berhasil diupdate");
      showToast("Laporan berhasil diperbarui");
      router.back();
    } catch (e: any) {
      console.error("❌ Error update laporan:", e);
      Alert.alert("Gagal", e?.message ?? "Tidak dapat menyimpan");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <UIScreen>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={{ marginTop: 12, color: "#6B7280", fontSize: 14 }}>Memuat data...</Text>
        </View>
      </UIScreen>
    );
  }

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

        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 28, fontWeight: "900", color: "#111827", marginBottom: 4 }}>✏️ Edit Laporan</Text>
          <Text style={{ fontSize: 14, color: "#6B7280" }}>Perbarui informasi laporan Anda</Text>
        </View>

        {/* Detail Barang */}
        <UICard style={{ marginBottom: 16, padding: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
            <Ionicons name="information-circle-outline" size={20} color="#3B82F6" style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827" }}>Detail Barang</Text>
          </View>
          <UIInput 
            label="Judul" 
            placeholder="Dompet hitam merek..." 
            value={title} 
            onChangeText={setTitle} 
          />
          <View style={{ height: 12 }} />
          <UIInput 
            label="Deskripsi" 
            placeholder="Ceritakan detail kejadian, ciri-ciri barang, dll" 
            value={description} 
            onChangeText={setDescription} 
            multiline 
          />
        </UICard>

        {/* Lokasi */}
        <UICard style={{ marginBottom: 24, padding: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
            <Ionicons name="location-outline" size={20} color="#EF4444" style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827" }}>Lokasi</Text>
          </View>
          <UIInput 
            label="Lokasi Utama" 
            placeholder="Gedung A, Kantin, Parkiran..." 
            value={location} 
            onChangeText={setLocation} 
          />
        </UICard>

        {/* Info Note */}
        <View style={{ 
          backgroundColor: "#FEF3C7", 
          borderWidth: 1, 
          borderColor: "#FCD34D",
          borderRadius: 12, 
          padding: 14, 
          marginBottom: 24,
          flexDirection: "row",
          alignItems: "flex-start"
        }}>
          <Ionicons name="information-circle" size={20} color="#D97706" style={{ marginRight: 10, marginTop: 2 }} />
          <Text style={{ fontSize: 13, color: "#92400E", flex: 1, lineHeight: 20 }}>
            Catatan: Foto, kategori, dan kontak tidak dapat diubah. Hanya judul, deskripsi, dan lokasi yang bisa diperbarui.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={{ gap: 12, marginBottom: 32 }}>
          {/* Save Button */}
          <Pressable
            onPress={onSave}
            disabled={saving}
            style={{
              backgroundColor: saving ? "#9CA3AF" : "#3B82F6",
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              shadowColor: "#3B82F6",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: saving ? 0 : 0.3,
              shadowRadius: 8,
              elevation: saving ? 0 : 4,
            }}
          >
            {saving ? (
              <>
                <ActivityIndicator color="white" size="small" style={{ marginRight: 8 }} />
                <Text style={{ color: "white", fontSize: 16, fontWeight: "800" }}>Menyimpan...</Text>
              </>
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={22} color="white" style={{ marginRight: 8 }} />
                <Text style={{ color: "white", fontSize: 16, fontWeight: "800" }}>Simpan Perubahan</Text>
              </>
            )}
          </Pressable>

          {/* Cancel Button */}
          <Pressable
            onPress={() => router.back()}
            disabled={saving}
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
            <Ionicons name="close-circle-outline" size={20} color="#6B7280" style={{ marginRight: 8 }} />
            <Text style={{ color: "#6B7280", fontSize: 16, fontWeight: "800" }}>Batal</Text>
          </Pressable>
        </View>
      </ScrollView>
    </UIScreen>
  );
}



