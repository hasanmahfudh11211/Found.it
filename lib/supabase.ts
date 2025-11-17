import Constants from "expo-constants";

// Minimal REST upload to Supabase Storage (avoids bringing realtime deps)
export async function uploadToSupabase(localUri: string): Promise<string> {
  console.log("📤 Starting Supabase upload...");
  console.log("📂 Local URI:", localUri);
  
  const cfg = (Constants.expoConfig?.extra as any)?.supabase;
  
  if (!cfg?.url || !cfg?.anonKey || !cfg?.bucket) {
    console.error("❌ Supabase config incomplete:", { url: !!cfg?.url, key: !!cfg?.anonKey, bucket: cfg?.bucket });
    throw new Error("Konfigurasi Supabase belum lengkap. Cek app.json");
  }

  console.log("✅ Supabase config OK");
  console.log("🔗 URL:", cfg.url);
  console.log("🪣 Bucket:", cfg.bucket);

  const fileExt = localUri.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
  const uploadPath = `${cfg.bucket}/${fileName}`;

  console.log("📝 File name:", fileName);
  console.log("📍 Upload path:", uploadPath);

  try {
    console.log("🔄 Fetching local file...");
    const res = await fetch(localUri);
    
    if (!res.ok) {
      throw new Error(`Failed to fetch local file: ${res.status}`);
    }
    
    console.log("✅ Local file fetched");
    const blob = await res.blob();
    console.log("📦 Blob size:", blob.size, "bytes");
    console.log("📋 Blob type:", blob.type);

    const uploadUrl = `${cfg.url}/storage/v1/object/${uploadPath}`;
    console.log("🚀 Uploading to:", uploadUrl);

    const uploadResp = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        authorization: `Bearer ${cfg.anonKey}`,
        apikey: cfg.anonKey,
        "content-type": blob.type || "image/jpeg",
        "x-upsert": "false",
      },
      body: blob as any,
    });

    console.log("📡 Upload response status:", uploadResp.status);

    if (!uploadResp.ok) {
      const txt = await uploadResp.text();
      console.error("❌ Upload failed:", uploadResp.status, txt);
      throw new Error(`Upload gagal: ${uploadResp.status} - ${txt}`);
    }

    // Public URL (bucket must be public)
    const publicUrl = `${cfg.url}/storage/v1/object/public/${uploadPath}`;
    console.log("✅ Upload berhasil!");
    console.log("🔗 Public URL:", publicUrl);
    
    return publicUrl;
  } catch (error: any) {
    console.error("❌ Upload error detail:", error);
    console.error("❌ Error message:", error?.message);
    console.error("❌ Error stack:", error?.stack);
    throw new Error(`Upload gagal: ${error?.message || "Network error"}`);
  }
}


