import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import React, { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import UICard from "../../components/ui/Card";
import UIInput from "../../components/ui/Input";
import UIScreen from "../../components/ui/Screen";
import { firestoreDb } from "../../lib/firebase";
import { showToast } from "../../lib/toast";
import { uploadImage } from "../../lib/upload";
import { useAuth } from "../../providers/AuthProvider";

export default function LaporScreen() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [kategori, setKategori] = useState<"Hilang" | "Temu">("Hilang");
  const [contact, setContact] = useState("");
  const [locationNote, setLocationNote] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    if (!user) {
      console.warn("⚠️ User belum login");
      Alert.alert("Butuh Login", "Silakan login terlebih dulu untuk membuat laporan.");
      return;
    }
    if (!title.trim() || !description.trim() || !location.trim()) {
      console.warn("⚠️ Form tidak lengkap");
      Alert.alert("Form belum lengkap", "Isi judul, deskripsi, dan lokasi.");
      return;
    }
    console.log("📝 Memulai submit laporan...");
    setSubmitting(true);
    try {
      let fotoUrl: string | null = null;
      if (imageUri) {
        console.log("📷 Mengupload foto...");
        fotoUrl = await uploadImage(imageUri);
        console.log("✅ Foto berhasil diupload:", fotoUrl);
      }
      const reportData = {
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        kontakPelapor: { email: user.email, other: contact.trim() || null },
        locationNote: locationNote.trim() || null,
        fotoUrl,
        kategori,
        status: "Aktif",
        uidPelapor: user.uid,
        reporterName: user.displayName || user.email || "Pengguna",
        tanggalPosting: serverTimestamp(),
      };
      console.log("💾 Menyimpan laporan ke Firestore:", reportData);
      const docRef = await addDoc(collection(firestoreDb, "reports"), reportData);
      console.log("✅ Laporan berhasil dibuat dengan ID:", docRef.id);
      showToast("Laporan berhasil dibuat");
      setTitle("");
      setDescription("");
      setLocation("");
      setKategori("Hilang");
      setImageUri(null);
      setContact("");
      setLocationNote("");
    } catch (e: any) {
      console.error("❌ Error menyimpan laporan:", e);
      showToast(e?.message ?? "Gagal menyimpan laporan", "Gagal");
    } finally {
      setSubmitting(false);
    }
  }

  async function pickImage() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Izin diperlukan", "Aktifkan izin galeri untuk memilih foto.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!res.canceled) {
      setImageUri(res.assets[0].uri);
    }
  }

  return (
    <UIScreen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={64}>
        <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 28, fontWeight: "900", color: "#111827", marginBottom: 4 }}>📝 Buat Laporan</Text>
          <Text style={{ fontSize: 14, color: "#6B7280" }}>Laporkan barang hilang atau yang kamu Temukan</Text>
        </View>

        {/* Kategori - Moved to top for better UX */}
        <UICard style={{ marginBottom: 16, padding: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <Ionicons name="folder-outline" size={20} color="#3B82F6" style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827" }}>Kategori Laporan</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Pressable
              onPress={() => setKategori("Hilang")}
              style={{
                flex: 1,
                backgroundColor: kategori === "Hilang" ? "#FEE2E2" : "#F3F4F6",
                borderWidth: 2,
                borderColor: kategori === "Hilang" ? "#EF4444" : "#E5E7EB",
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 24, marginBottom: 4 }}>😢</Text>
              <Text style={{ fontSize: 15, fontWeight: "800", color: kategori === "Hilang" ? "#DC2626" : "#6B7280" }}>
                HILANG
              </Text>
              {kategori === "Hilang" && <Ionicons name="checkmark-circle" size={20} color="#DC2626" style={{ marginTop: 4 }} />}
            </Pressable>
            <Pressable
              onPress={() => setKategori("Temu")}
              style={{
                flex: 1,
                backgroundColor: kategori === "Temu" ? "#D1FAE5" : "#F3F4F6",
                borderWidth: 2,
                borderColor: kategori === "Temu" ? "#10B981" : "#E5E7EB",
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 24, marginBottom: 4 }}>✅</Text>
              <Text style={{ fontSize: 15, fontWeight: "800", color: kategori === "Temu" ? "#059669" : "#6B7280" }}>
                TEMU
              </Text>
              {kategori === "Temu" && <Ionicons name="checkmark-circle" size={20} color="#059669" style={{ marginTop: 4 }} />}
            </Pressable>
          </View>
        </UICard>

        {/* Detail Barang */}
        <UICard style={{ marginBottom: 16, padding: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
            <Ionicons name="information-circle-outline" size={20} color="#3B82F6" style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827" }}>Detail Barang</Text>
          </View>
          <UIInput label="Judul" placeholder="Dompet hitam merek..." value={title} onChangeText={setTitle} />
          <View style={{ height: 12 }} />
          <UIInput 
            label="Deskripsi" 
            placeholder="Ceritakan detail kejadian, ciri-ciri barang, dll" 
            value={description} 
            onChangeText={setDescription} 
            multiline 
          />
        </UICard>

        {/* Foto */}
        <UICard style={{ marginBottom: 16, padding: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <Ionicons name="camera-outline" size={20} color="#3B82F6" style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827" }}>Foto Barang</Text>
            <Text style={{ fontSize: 12, color: "#9CA3AF", marginLeft: 6 }}>(opsional)</Text>
          </View>
          
          {!imageUri ? (
            <Pressable
              onPress={pickImage}
              style={{
                backgroundColor: "#F9FAFB",
                borderWidth: 2,
                borderColor: "#E5E7EB",
                borderStyle: "dashed",
                borderRadius: 12,
                paddingVertical: 40,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="cloud-upload-outline" size={48} color="#9CA3AF" />
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#6B7280", marginTop: 12 }}>Tap untuk pilih foto</Text>
              <Text style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>JPG, PNG (max 5MB) </Text>
            </Pressable>
          ) : (
            <View>
              <Image 
                source={{ uri: imageUri }} 
                style={{ 
                  width: "100%", 
                  height: 220, 
                  borderRadius: 12,
                  backgroundColor: "#F3F4F6"
                }} 
                contentFit="cover" 
              />
              <Pressable
                onPress={pickImage}
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  backgroundColor: "rgba(0,0,0,0.6)",
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Ionicons name="refresh" size={16} color="white" />
                <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>Ganti</Text>
              </Pressable>
            </View>
          )}
        </UICard>

        {/* Lokasi */}
        <UICard style={{ marginBottom: 16, padding: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
            <Ionicons name="location-outline" size={20} color="#EF4444" style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827" }}>Lokasi</Text>
          </View>
          <UIInput label="Lokasi Utama" placeholder="Gedung A, Kantin, Parkiran..." value={location} onChangeText={setLocation} />
          <View style={{ height: 12 }} />
          <UIInput 
            label="Catatan Lokasi (opsional)" 
            placeholder="Dekat tangga, lantai 2, di samping kiri..." 
            value={locationNote} 
            onChangeText={setLocationNote} 
          />
        </UICard>

        {/* Kontak */}
        <UICard style={{ marginBottom: 24, padding: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
            <Ionicons name="call-outline" size={20} color="#10B981" style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827" }}>Kontak</Text>
          </View>
          <View style={{ 
            backgroundColor: "#FEF3C7", 
            borderWidth: 1, 
            borderColor: "#FCD34D",
            borderRadius: 8, 
            padding: 12, 
            marginBottom: 12,
            flexDirection: "row",
            alignItems: "flex-start"
          }}>
            <Ionicons name="information-circle" size={18} color="#D97706" style={{ marginRight: 8, marginTop: 2 }} />
            <Text style={{ fontSize: 12, color: "#92400E", flex: 1, lineHeight: 18 }}>
              Email Anda ({user?.email}) akan ditampilkan. Kontak tambahan opsional.
            </Text>
          </View>
          <UIInput 
            label="Kontak Tambahan (opsional)" 
            placeholder="No HP / Instagram / Line" 
            value={contact} 
            onChangeText={setContact} 
          />
        </UICard>

        {/* Submit Button */}
        <Pressable
          onPress={onSubmit}
          disabled={submitting}
          style={{
            backgroundColor: submitting ? "#9CA3AF" : "#3B82F6",
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            marginBottom: 32,
            shadowColor: "#3B82F6",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: submitting ? 0 : 0.3,
            shadowRadius: 8,
            elevation: submitting ? 0 : 4,
          }}
        >
          {submitting ? (
            <>
              <ActivityIndicator color="white" size="small" style={{ marginRight: 8 }} />
              <Text style={{ color: "white", fontSize: 16, fontWeight: "800" }}>Menyimpan...</Text>
            </>
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={22} color="white" style={{ marginRight: 8 }} />
              <Text style={{ color: "white", fontSize: 16, fontWeight: "800" }}>Simpan Laporan</Text>
            </>
          )}
        </Pressable>
        <View style={{ height: 40 }} />
      </ScrollView>
      </KeyboardAvoidingView>
    </UIScreen>
  );
}


