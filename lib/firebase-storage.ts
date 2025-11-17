import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { firebaseStorage } from "./firebase";

export async function uploadToFirebaseStorage(localUri: string): Promise<string> {
  console.log("📤 Starting Firebase Storage upload...");
  console.log("📂 Local URI:", localUri);

  try {
    // Generate unique filename
    const fileExt = localUri.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const storagePath = `reports/${fileName}`;

    console.log("📝 File name:", fileName);
    console.log("📍 Storage path:", storagePath);

    // Fetch local file
    console.log("🔄 Fetching local file...");
    const response = await fetch(localUri);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch local file: ${response.status}`);
    }

    const blob = await response.blob();
    console.log("✅ Local file fetched");
    console.log("📦 Blob size:", blob.size, "bytes");
    console.log("📋 Blob type:", blob.type);

    // Create storage reference
    const storageRef = ref(firebaseStorage, storagePath);
    console.log("🚀 Uploading to Firebase Storage...");

    // Upload file
    const uploadResult = await uploadBytes(storageRef, blob, {
      contentType: blob.type || "image/jpeg",
    });

    console.log("✅ Upload complete!");

    // Get download URL
    console.log("🔗 Getting download URL...");
    const downloadURL = await getDownloadURL(uploadResult.ref);
    
    console.log("✅ Firebase upload berhasil!");
    console.log("🔗 Public URL:", downloadURL);

    return downloadURL;
  } catch (error: any) {
    console.error("❌ Firebase upload error:", error);
    console.error("❌ Error message:", error?.message);
    throw new Error(`Upload gagal: ${error?.message || "Unknown error"}`);
  }
}


