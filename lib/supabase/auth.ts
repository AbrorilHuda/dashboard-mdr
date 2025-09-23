import { createClient } from "./client";
import type { Database } from "@/types/database";

export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string
) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo:
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
        `${window.location.origin}/auth/callback`,
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    console.error("Error signing up:", error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Error signing in:", error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function resetPassword(email: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });

  if (error) {
    console.error("Error resetting password:", error);
    return { error };
  }

  return { data, error: null };
}

export async function updatePassword(newPassword: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    console.error("Error updating password:", error);
    return { error };
  }

  return { data, error: null };
}

export async function resendConfirmation(email: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo:
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
        `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    console.error("Error resending confirmation:", error);
    return { error };
  }

  return { data, error: null };
}

export async function signInWithGoogle() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    console.error("Error signing in with Google:", error);
    return { error };
  }

  return { data };
}

export async function signOut() {
  const supabase = createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Error signing out:", error);
    return { error };
  }

  // Redirect to home page
  window.location.href = "/";
}

export async function getCurrentUser() {
  const supabase = createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Error getting current user:", error);
    return { user: null, error };
  }

  return { user, error: null };
}

export async function getUserProfile(userId: string) {
  const supabase = createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error getting user profile:", error);
    return { profile: null, error };
  }

  return { profile, error: null };
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<Database["public"]["Tables"]["profiles"]["Update"]>
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating user profile:", error);
    return { profile: null, error };
  }

  return { profile: data, error: null };
}

export async function uploadProfileAvatar(file: File, userId: string) {
  const supabase = createClient();

  const fileExt = file.name.split(".").pop();
  const fileName = `avatar-${userId}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
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

export async function downloadUserData(userId: string) {
  const supabase = createClient();

  try {
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError) {
      throw profileError;
    }

    // Get user's events (if they created any)
    // const { data: events, error: eventsError } = await supabase
    //   .from("events")
    //   .select("*")
    //   .eq("created_by", userId);

    // if (eventsError && eventsError.code !== "PGRST116") {
    //   // PGRST116 = no rows returned
    //   throw eventsError;
    // }

    // Get user auth data
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      throw userError;
    }

    // Compile all user data
    const userData = {
      profile: profile,
      auth: {
        id: user?.id,
        email: user?.email,
        created_at: user?.created_at,
        last_sign_in_at: user?.last_sign_in_at,
      },
      exported_at: new Date().toISOString(),
    };

    return { data: userData, error: null };
  } catch (error) {
    console.error("Error downloading user data:", error);
    return { data: null, error };
  }
}

export async function deleteUserAccount(userId: string) {
  const supabase = createClient();

  try {
    // Delete user's events first (if any)
    const { error: eventsError } = await supabase
      .from("events")
      .delete()
      .eq("created_by", userId);

    if (eventsError && eventsError.code !== "PGRST116") {
      throw eventsError;
    }

    // Delete user's profile
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileError) {
      throw profileError;
    }

    // Delete user's avatar from storage (if exists)
    const { error: storageError } = await supabase.storage
      .from("avatars")
      .remove([
        `avatars/${userId}.jpg`,
        `avatars/${userId}.png`,
        `avatars/${userId}.jpeg`,
      ]);

    // Storage errors are not critical, so we don't throw them

    // Finally, delete the auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);

    if (authError) {
      throw authError;
    }

    return { error: null };
  } catch (error) {
    console.error("Error deleting user account:", error);
    return { error };
  }
}
