import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import UIButton from "../../components/ui/Button";
import UIInput from "../../components/ui/Input";
import UIScreen from "../../components/ui/Screen";
import { firebaseAuth } from "../../lib/firebase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  async function onLogin() {
    if (!email.trim() || !password.trim()) {
      setError("Email dan password harus diisi");
      return;
    }
    
    console.log("🔐 Login attempt:", email.trim());
    setLoading(true);
    setError(null);
    
    try {
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
      console.log("✅ Login berhasil:", userCredential.user.email);
      Alert.alert("Berhasil", "Anda berhasil masuk.");
      router.replace("/(tabs)/home");
    } catch (e: any) {
      console.error("❌ Login error:", e);
      const code: string | undefined = e?.code;
      
      if (code === "auth/operation-not-allowed") {
        console.error("🔴 Email/Password auth belum diaktifkan!");
        setError("Email/Password auth belum diaktifkan di Firebase. Buka Firebase Console > Authentication > Sign-in method > Enable Email/Password.");
      } else if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
        setError("Email atau password salah.");
      } else if (code === "auth/too-many-requests") {
        setError("Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.");
      } else if (code === "auth/network-request-failed") {
        setError("Koneksi internet bermasalah. Cek koneksi Anda.");
      } else {
        setError(e?.message ?? "Login gagal");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <UIScreen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={64}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, gap: 16, justifyContent: "center" }} keyboardShouldPersistTaps="handled">
          <Text style={{ fontSize: 28, fontWeight: "700" }}>Selamat datang 👋</Text>
          <Text style={{ color: "#6B7280" }}>Masuk untuk melanjutkan</Text>
          {!!error && <Text style={{ color: "#DC2626" }}>{error}</Text>}
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
          <UIButton title={loading ? "Memproses..." : "Masuk"} onPress={onLogin} disabled={loading} />
          <Text style={{ color: "#6B7280" }}>
            Belum punya akun? <Link href="/(auth)/register">Daftar</Link>
          </Text>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </UIScreen>
  );
}


