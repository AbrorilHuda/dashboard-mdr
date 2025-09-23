"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, MoreHorizontal, Users, Shield, Clock } from "lucide-react";
import { AddUserDialog } from "./add-user-dialog";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export function UserManagementTab() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadUsers = async () => {
    const supabase = createClient();

    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading users:", error);
      toast({
        title: "Gagal memuat data user",
        description: "Terjadi kesalahan saat memuat data user.",
        variant: "destructive",
      });
    } else {
      setUsers(profiles || []);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, [toast]);

  const filteredUsers = users.filter(
    (user) =>
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUsers = users.length;
  const adminUsers = users.filter((user) => user.role === "admin").length;
  const regularUsers = users.filter((user) => user.role === "user").length;

  const handleUserAction = async (action: string, user: Profile) => {
    const supabase = createClient();

    try {
      if (action === "Toggle Role") {
        const newRole = user.role === "admin" ? "user" : "admin";
        const { error } = await supabase
          .from("profiles")
          .update({ role: newRole })
          .eq("id", user.id);

        if (error) throw error;

        // Update local state
        setUsers(
          users.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
        );

        toast({
          title: "Role berhasil diubah",
          description: `${user.full_name || user.email} sekarang menjadi ${
            newRole === "admin" ? "Administrator" : "Member"
          }`,
        });
      } else if (action === "Delete") {
        const { error } = await supabase.auth.admin.deleteUser(user.id);

        if (error) throw error;

        // Remove from local state
        setUsers(users.filter((u) => u.id !== user.id));

        toast({
          title: "User berhasil dihapus",
          description: `${
            user.full_name || user.email
          } telah dihapus dari sistem`,
        });
      } else {
        toast({
          title: `${action} User`,
          description: `Aksi "${action}" berhasil dilakukan pada ${
            user.full_name || user.email
          }`,
        });
      }
    } catch (error) {
      console.error(`Error ${action}:`, error);
      toast({
        title: "Gagal melakukan aksi",
        description: "Terjadi kesalahan saat melakukan aksi.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Memuat data user...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-purple-700">
          Manajemen User
        </h2>
        <p className="text-muted-foreground">
          Kelola user, role, dan permission komunitas MaduraDev.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">
              Total User
            </CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">
              {totalUsers}
            </div>
            <p className="text-xs text-muted-foreground">
              Semua user terdaftar
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">
              Administrator
            </CardTitle>
            <Shield className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {adminUsers}
            </div>
            <p className="text-xs text-muted-foreground">
              User dengan akses admin
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">
              Member Biasa
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {regularUsers}
            </div>
            <p className="text-xs text-muted-foreground">Akun member standar</p>
          </CardContent>
        </Card>
      </div>

      {/* User Management Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-purple-700">Semua User</CardTitle>
              <CardDescription>
                Daftar semua user dalam sistem MaduraDev.
              </CardDescription>
            </div>
            <AddUserDialog onUserAdded={loadUsers} />
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-purple-50">
                  <TableHead className="text-purple-700">User</TableHead>
                  <TableHead className="text-purple-700">Role</TableHead>
                  <TableHead className="text-purple-700">Bergabung</TableHead>
                  <TableHead className="text-purple-700">Status</TableHead>
                  <TableHead className="text-right text-purple-700">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-purple-50/50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8 border-2 border-purple-100">
                          <AvatarImage
                            src={user.avatar_url || "/placeholder.svg"}
                            alt={user.full_name || "User"}
                          />
                          <AvatarFallback className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs">
                            {(user.full_name || user.email || "U").charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-purple-700">
                            {user.full_name || "Nama belum diset"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.role === "admin" ? "default" : "secondary"
                        }
                        className={
                          user.role === "admin"
                            ? "bg-gradient-to-r from-purple-600 to-pink-600"
                            : "bg-purple-100 text-purple-700"
                        }
                      >
                        {user.role === "admin" ? "Administrator" : "Member"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString("id-ID")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="text-green-600 border-green-600"
                      >
                        Aktif
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-purple-100"
                          >
                            <span className="sr-only">Buka menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleUserAction("Lihat", user)}
                          >
                            Lihat detail
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleUserAction("Toggle Role", user)
                            }
                          >
                            {user.role === "admin"
                              ? "Jadikan Member"
                              : "Jadikan Admin"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              handleUserAction("Reset Password", user)
                            }
                          >
                            Reset password
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUserAction("Suspend", user)}
                            className="text-orange-600"
                          >
                            Suspend user
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUserAction("Delete", user)}
                            className="text-red-600"
                          >
                            Hapus user
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Tidak ada user yang ditemukan.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
