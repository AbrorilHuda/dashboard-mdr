"use client";

import type React from "react";
import { useToast } from "@/hooks/use-toast"; // Import useToast hook
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Save,
  X,
  Camera,
  MapPin,
  Calendar,
  Globe,
  Download,
  Trash2,
} from "lucide-react";
import {
  updateUserProfile,
  uploadProfileAvatar,
  downloadUserData,
  deleteUserAccount,
} from "@/lib/supabase/auth";
import {
  generateSuratKeteranganPdf,
  SuratConfig,
} from "@/lib/pdf/generateIdCardPdf";

export function ProfileTab() {
  const { user, profile } = useAuth();
  const { toast } = useToast(); // Declare useToast hook
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    location: "",
    website: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        location: profile.location || "",
        website: profile.website || "",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await updateUserProfile(user.id, formData);

      if (error) {
        throw error;
      }

      setIsEditing(false);
      toast({
        title: "Profil berhasil diperbarui",
        description: "Informasi profil Anda telah disimpan.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Gagal memperbarui profil",
        description: "Terjadi kesalahan saat menyimpan profil.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        location: profile.location || "",
        website: profile.website || "",
      });
    }
    setIsEditing(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsLoading(true);
    try {
      const { url, error } = await uploadProfileAvatar(file, user.id);

      if (error) {
        throw error;
      }

      // Update profile with new avatar URL
      await updateUserProfile(user.id, { avatar_url: url });

      toast({
        title: "Avatar berhasil diperbarui",
        description: "Foto profil Anda telah diperbarui.",
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Gagal mengupload avatar",
        description: "Terjadi kesalahan saat mengupload foto profil.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error }: { data: any; error: any } = await downloadUserData(
        user.id
      );

      if (error) {
        throw error;
      }

      // Create and download JSON file
      // const blob = new Blob([JSON.stringify(data, null, 2)], {
      //   type: "application/json",
      // });
      // const url = URL.createObjectURL(blob);
      // const a = document.createElement("a");
      // a.href = url;
      // a.download = `data-${user.email}-${
      //   new Date().toISOString().split("T")[0]
      // }.json`;
      // document.body.appendChild(a);
      // a.click();
      // document.body.removeChild(a);
      // URL.revokeObjectURL(url);

      const config: SuratConfig = {
        //nomorSurat: "21/2025/SKA", // isi jika mau custom
        namaPenandatangan: "abrordc",
        jabatanPenandatangan: "Lead",
        organisasi: "maduradev",
        logoUrl: "https://avatars.githubusercontent.com/u/195263666?s=200&v=4", // opsional
      };

      await generateSuratKeteranganPdf(data, config);
      console.log("PDF generated");

      toast({
        title: "Data berhasil diunduh",
        description: "File data Anda telah diunduh ke komputer.",
      });
    } catch (error) {
      console.error("Error downloading data:", error);
      toast({
        title: "Gagal mengunduh data",
        description: "Terjadi kesalahan saat mengunduh data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    const confirmed = window.confirm(
      "Apakah Anda yakin ingin menghapus akun? Tindakan ini tidak dapat dibatalkan dan semua data Anda akan dihapus permanen."
    );

    if (!confirmed) return;

    setIsLoading(true);
    try {
      const { error } = await deleteUserAccount(user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Akun berhasil dihapus",
        description: "Akun Anda telah dihapus permanen.",
      });

      // Redirect to login after account deletion
      window.location.href = "/auth/signin";
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Gagal menghapus akun",
        description: "Terjadi kesalahan saat menghapus akun.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || !profile) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Profil Saya</h2>
        <p className="text-muted-foreground">
          Kelola informasi profil dan preferensi akun Anda.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-purple-700">Informasi Profil</CardTitle>
            <CardDescription>
              Perbarui informasi pribadi dan bio Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-20 w-20 border-4 border-purple-100">
                  <AvatarImage
                    src={profile.avatar_url || "/placeholder.svg"}
                    alt={profile.full_name || "User"}
                  />
                  <AvatarFallback className="text-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                    {profile.full_name?.charAt(0) ||
                      user.email?.charAt(0) ||
                      "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    id="avatar-upload"
                    disabled={isLoading}
                  />
                  <Label
                    htmlFor="avatar-upload"
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white border-purple-200 hover:bg-purple-50 border-2"
                  >
                    <Camera className="h-4 w-4 text-purple-600" />
                  </Label>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium">
                  {profile.full_name || user.email}
                </h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <Badge
                  variant={profile.role === "admin" ? "default" : "secondary"}
                  className={`mt-1 ${
                    profile.role === "admin"
                      ? "bg-gradient-to-r from-purple-600 to-pink-600"
                      : "bg-purple-100 text-purple-700"
                  }`}
                >
                  {profile.role === "admin" ? "Administrator" : "Member"}
                </Badge>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nama Lengkap</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  disabled={!isEditing}
                  className="focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email || ""}
                  disabled={true} // Email from Google cannot be changed
                  className="bg-gray-50"
                />
                <p className="text-xs text-muted-foreground">
                  Email dari akun Google tidak dapat diubah
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Ceritakan tentang diri Anda..."
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  disabled={!isEditing}
                  rows={3}
                  className="focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Lokasi
                  </Label>
                  <Input
                    id="location"
                    placeholder="Madura, Indonesia"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    disabled={!isEditing}
                    className="focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">
                    <Globe className="inline h-4 w-4 mr-1" />
                    Website
                  </Label>
                  <Input
                    id="website"
                    placeholder="https://yourwebsite.com"
                    value={formData.website}
                    onChange={(e) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                    disabled={!isEditing}
                    className="focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Batal
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {isLoading ? (
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Simpan
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profil
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Account Details Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-purple-700">Detail Akun</CardTitle>
            <CardDescription>Informasi dan status akun Anda.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <Label className="text-sm font-medium text-purple-700">
                  Provider Login
                </Label>
                <p className="text-sm flex items-center mt-1">
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google Account
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Role
                  </Label>
                  <p className="text-sm capitalize font-medium text-purple-700">
                    {profile.role === "admin" ? "Administrator" : "Member"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Status
                  </Label>
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-600 mt-1"
                  >
                    Aktif
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Bergabung Sejak
                </Label>
                <p className="text-sm flex items-center mt-1">
                  <Calendar className="h-4 w-4 mr-2 text-purple-600" />
                  {new Date(profile.created_at).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-3 text-purple-700">
                Aksi Akun
              </h4>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start hover:bg-purple-50 border-purple-200 bg-transparent"
                  onClick={handleDownloadData}
                  disabled={isLoading}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Unduh Data Saya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start hover:bg-red-50 border-red-200 text-red-600 bg-transparent"
                  onClick={handleDeleteAccount}
                  disabled={isLoading}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus Akun
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
