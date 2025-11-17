import * as ImageManipulator from "expo-image-manipulator";
import { uploadToFirebaseStorage } from "./firebase-storage";
import { uploadToSupabase } from "./supabase";

// Toggle this to switch between Supabase and Firebase Storage
const USE_FIREBASE_STORAGE = false; // Tetap pakai Supabase Storage

export async function uploadImage(localUri: string): Promise<string> {
  console.log("📸 Starting image upload process...");
  console.log("🔧 Using:", USE_FIREBASE_STORAGE ? "Firebase Storage" : "Supabase Storage");
  
  // Compress to max width 1280, JPEG quality 0.7
  console.log("🔄 Compressing image...");
  const manipulated = await ImageManipulator.manipulateAsync(
    localUri,
    [{ resize: { width: 1280 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );
  console.log("✅ Image compressed");
  console.log("📂 Compressed URI:", manipulated.uri);

  // Upload to selected storage
  if (USE_FIREBASE_STORAGE) {
    return uploadToFirebaseStorage(manipulated.uri);
  } else {
    return uploadToSupabase(manipulated.uri);
  }
}


