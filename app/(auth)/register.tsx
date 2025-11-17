import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import UIButton from "../../components/ui/Button";
import UIInput from "../../components/ui/Input";
import UIScreen from "../../components/ui/Screen";
import { firebaseAuth } from "../../lib/firebase";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  async function onRegister() {
    if (!email.trim() || !password.trim()) {
      setError("Email dan password harus diisi");
      return;
    }
    
    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }
    
    console.log("📝 Register attempt:", email.trim());
    setLoading(true);
    setError(null);
    
    try {
      const cred = await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password);
      console.log("✅ Register berhasil:", cred.user.email);
      
      if (name.trim()) {
        await updateProfile(cred.user, { displayName: name.trim() });
        console.log("✅ Display name updated:", name.trim());
      }
      
      Alert.alert("Berhasil", "Akun berhasil dibuat. Silakan masuk.");
      router.replace("/(auth)/login");
    } catch (e: any) {
      console.error("❌ Register error:", e);
      const code: string | undefined = e?.code;
      
      if (code === "auth/operation-not-allowed") {
        console.error("🔴 Email/Password auth belum diaktifkan!");
        setError("Email/Password auth belum diaktifkan di Firebase. Buka Firebase Console > Authentication > Sign-in method > Enable Email/Password.");
      } else if (code === "auth/email-already-in-use") {
        setError("Email sudah terdaftar. Silakan login.");
      } else if (code === "auth/weak-password") {
        setError("Password terlalu lemah (minimal 6 karakter).");
      } else if (code === "auth/invalid-email") {
        setError("Format email tidak valid.");
      } else if (code === "auth/network-request-failed") {
        setError("Koneksi internet bermasalah. Cek koneksi Anda.");
      } else {
        setError(e?.message ?? "Registrasi gagal");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <UIScreen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={64}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, gap: 16, justifyContent: "center" }} keyboardShouldPersistTaps="handled">
          <Text style={{ fontSize: 28, fontWeight: "700" }}>Buat akun</Text>
          <Text style={{ color: "#6B7280" }}>Daftar untuk mulai melapor/menemukan</Text>
          {!!error && <Text style={{ color: "#DC2626" }}>{error}</Text>}
          <UIInput label="Nama" placeholder="Nama lengkap" value={name} onChangeText={setName} />
          <UIInput label="Email" placeholder="nama@kampus.ac.id" keyboardType="email-address" value={email} onChangeText={setEmail} />
          <UIInput
            label="Password"
            placeholder="••••••"
            secureTextEntry={!showPw}
            value={password}
            onChangeText={setPassword}
            rightElement={
              <Pressable onPress={() => setShowPw((s) => !s)}>
                <Ionicons name={showPw ? "eye" : "eye-off"} size={20} color="#6B7280" />
              </Pressable>
            }
          />
          <UIButton title={loading ? "Memproses..." : "Daftar"} onPress={onRegister} disabled={loading} />
          <Text style={{ color: "#6B7280" }}>
            Sudah punya akun? <Link href="/(auth)/login">Masuk</Link>
          </Text>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </UIScreen>
  );
}


