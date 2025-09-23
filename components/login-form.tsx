"use client";

import type React from "react";

import {
  signInWithEmail,
  signUpWithEmail,
  resetPassword,
} from "@/lib/supabase/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Lock, User, AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // Sign in form state
  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  });

  // Sign up form state
  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });

  // Reset password form state
  const [resetEmail, setResetEmail] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const { data, error } = await signInWithEmail(
        signInData.email,
        signInData.password
      );

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          setMessage({
            type: "error",
            text: "Email belum diverifikasi. Silakan cek email Anda dan klik link verifikasi.",
          });
        } else if (error.message.includes("Invalid login credentials")) {
          setMessage({
            type: "error",
            text: "Email atau password salah. Silakan coba lagi.",
          });
        } else {
          setMessage({ type: "error", text: error.message });
        }
        return;
      }

      // Redirect will be handled by middleware
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Error signing in:", error);
      setMessage({
        type: "error",
        text: "Terjadi kesalahan saat masuk. Silakan coba lagi.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (signUpData.password !== signUpData.confirmPassword) {
      setMessage({ type: "error", text: "Password tidak cocok." });
      setIsLoading(false);
      return;
    }

    if (signUpData.password.length < 6) {
      setMessage({ type: "error", text: "Password minimal 6 karakter." });
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await signUpWithEmail(
        signUpData.email,
        signUpData.password,
        signUpData.fullName
      );

      if (error) {
        if (error.message.includes("User already registered")) {
          setMessage({
            type: "error",
            text: "Email sudah terdaftar. Silakan gunakan email lain atau masuk dengan akun yang ada.",
          });
        } else {
          setMessage({ type: "error", text: error.message });
        }
        return;
      }

      setMessage({
        type: "success",
        text: "Akun berhasil dibuat! Silakan cek email Anda untuk verifikasi.",
      });

      // Reset form
      setSignUpData({
        email: "",
        password: "",
        confirmPassword: "",
        fullName: "",
      });
    } catch (error) {
      console.error("Error signing up:", error);
      setMessage({
        type: "error",
        text: "Terjadi kesalahan saat mendaftar. Silakan coba lagi.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await resetPassword(resetEmail);

      if (error) {
        setMessage({ type: "error", text: error.message });
        return;
      }

      setMessage({
        type: "success",
        text: "Link reset password telah dikirim ke email Anda.",
      });
      setResetEmail("");
    } catch (error) {
      console.error("Error resetting password:", error);
      setMessage({
        type: "error",
        text: "Terjadi kesalahan. Silakan coba lagi.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">&lt;/&gt;</span>
            </div>
            <h1 className="text-2xl font-bold">
              Madura<span className="text-purple-600">Dev</span>
            </h1>
          </div>
          <p className="text-muted-foreground">
            Masuk ke dashboard komunitas developer Madura
          </p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-xl">Selamat Datang</CardTitle>
            <CardDescription>
              Masuk atau daftar untuk mengakses dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            {message && (
              <Alert
                className={`mb-4 ${
                  message.type === "error"
                    ? "border-red-200 bg-red-50"
                    : message.type === "success"
                    ? "border-green-200 bg-green-50"
                    : "border-blue-200 bg-blue-50"
                }`}
              >
                {message.type === "error" ? (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
                <AlertDescription
                  className={
                    message.type === "error"
                      ? "text-red-800"
                      : message.type === "success"
                      ? "text-green-800"
                      : "text-blue-800"
                  }
                >
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="signin">Masuk</TabsTrigger>
                <TabsTrigger value="signup">Daftar</TabsTrigger>
                <TabsTrigger value="reset">Reset</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="nama@email.com"
                        className="pl-10"
                        value={signInData.email}
                        onChange={(e) =>
                          setSignInData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="Password"
                        className="pl-10"
                        value={signInData.password}
                        onChange={(e) =>
                          setSignInData((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    size="lg"
                  >
                    {isLoading ? (
                      <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : null}
                    {isLoading ? "Memproses..." : "Masuk"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nama Lengkap</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Nama lengkap"
                        className="pl-10"
                        value={signUpData.fullName}
                        onChange={(e) =>
                          setSignUpData((prev) => ({
                            ...prev,
                            fullName: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="nama@email.com"
                        className="pl-10"
                        value={signUpData.email}
                        onChange={(e) =>
                          setSignUpData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Password (min. 6 karakter)"
                        className="pl-10"
                        value={signUpData.password}
                        onChange={(e) =>
                          setSignUpData((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">Konfirmasi Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-confirm"
                        type="password"
                        placeholder="Konfirmasi password"
                        className="pl-10"
                        value={signUpData.confirmPassword}
                        onChange={(e) =>
                          setSignUpData((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    size="lg"
                  >
                    {isLoading ? (
                      <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : null}
                    {isLoading ? "Memproses..." : "Daftar"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="reset" className="space-y-4">
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="nama@email.com"
                        className="pl-10"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    size="lg"
                  >
                    {isLoading ? (
                      <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : null}
                    {isLoading ? "Mengirim..." : "Kirim Link Reset"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-4 text-xs text-muted-foreground text-center">
              <p>Dengan masuk, Anda menyetujui syarat dan ketentuan</p>
              <p>komunitas MaduraDev</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
