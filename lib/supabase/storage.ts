import { createClient } from "./client";

export async function uploadEventImage(file: File, eventId: string) {
  const supabase = createClient();

  const fileExt = file.name.split(".").pop();
  const fileName = `${eventId}-${Date.now()}.${fileExt}`;
  const filePath = `${new Date()}/${fileName}`;

  const { data, error } = await supabase.storage
    .from("event-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Error uploading image:", error);
    return { url: null, error };
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("event-images").getPublicUrl(filePath);

  return { url: publicUrl, error: null };
}

export async function deleteEventImage(imageUrl: string) {
  const supabase = createClient();

  // Extract file path from URL
  const urlParts = imageUrl.split("/");
  const filePath = urlParts.slice(-2).join("/");

  const { error } = await supabase.storage
    .from("event-images")
    .remove([filePath]);

  if (error) {
    console.error("Error deleting image:", error);
    return { error };
  }

  return { error: null };
}

export async function uploadProfileAvatar(file: File, userId: string) {
  const supabase = createClient();

  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  const { data, error } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true, // Allow overwriting existing avatar
    });

  if (error) {
    console.error("Error uploading avatar:", error);
    return { url: null, error };
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(filePath);

  return { url: publicUrl, error: null };
}
