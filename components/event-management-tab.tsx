"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getAllEvents, getEventStats, type Event } from "@/lib/events"
import { useToast } from "@/hooks/use-toast"
import { Search, MoreHorizontal, Plus, Calendar, Users, FileText, MapPin, Clock } from "lucide-react"

export function EventManagementTab() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [events] = useState<Event[]>(getAllEvents())
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    maxAttendees: "",
    status: "draft" as Event["status"],
  })

  const stats = getEventStats()

  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleEventAction = (action: string, event: Event) => {
    toast({
      title: `${action} Event`,
      description: `Aksi "${action}" berhasil dilakukan pada "${event.title}"`,
    })
  }

  const handleCreateEvent = () => {
    toast({
      title: "Event Berhasil Dibuat",
      description: `"${newEvent.title}" telah berhasil dibuat.`,
    })
    setIsCreateDialogOpen(false)
    setNewEvent({
      title: "",
      description: "",
      date: "",
      location: "",
      maxAttendees: "",
      status: "draft",
    })
  }

  const getStatusBadge = (status: Event["status"]) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Dipublikasi</Badge>
      case "draft":
        return (
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            Draft
          </Badge>
        )
      case "cancelled":
        return <Badge variant="destructive">Dibatalkan</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-purple-700">Manajemen Event</h2>
        <p className="text-muted-foreground">Buat, kelola, dan publikasikan event untuk komunitas MaduraDev.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Total Event</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Semua event yang dibuat</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Dipublikasi</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
            <p className="text-xs text-muted-foreground">Event yang aktif</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Draft Event</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.draft}</div>
            <p className="text-xs text-muted-foreground">Event belum dipublikasi</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Total Peserta</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalAttendees}</div>
            <p className="text-xs text-muted-foreground">Di semua event</p>
          </CardContent>
        </Card>
      </div>

      {/* Events Management Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-purple-700">Semua Event</CardTitle>
              <CardDescription>Kelola event dan pantau performanya.</CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Buat Event
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Buat Event Baru</DialogTitle>
                  <DialogDescription>
                    Isi detail untuk membuat event baru. Anda bisa mempublikasikannya nanti.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Judul Event</Label>
                    <Input
                      id="title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      placeholder="Masukkan judul event"
                      className="focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Deskripsi</Label>
                    <Textarea
                      id="description"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      placeholder="Deskripsikan event Anda"
                      rows={3}
                      className="focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="date">Tanggal</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                        className="focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="maxAttendees">Maks Peserta</Label>
                      <Input
                        id="maxAttendees"
                        type="number"
                        value={newEvent.maxAttendees}
                        onChange={(e) => setNewEvent({ ...newEvent, maxAttendees: e.target.value })}
                        placeholder="100"
                        className="focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location">Lokasi</Label>
                    <Input
                      id="location"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      placeholder="Lokasi event"
                      className="focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={newEvent.status}
                      onValueChange={(value: Event["status"]) => setNewEvent({ ...newEvent, status: value })}
                    >
                      <SelectTrigger className="focus:ring-purple-500 focus:border-purple-500">
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Dipublikasi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button
                    onClick={handleCreateEvent}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    Buat Event
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari event..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          {/* Events Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-purple-50">
                  <TableHead className="text-purple-700">Event</TableHead>
                  <TableHead className="text-purple-700">Tanggal</TableHead>
                  <TableHead className="text-purple-700">Lokasi</TableHead>
                  <TableHead className="text-purple-700">Peserta</TableHead>
                  <TableHead className="text-purple-700">Status</TableHead>
                  <TableHead className="text-right text-purple-700">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow key={event.id} className="hover:bg-purple-50/50">
                    <TableCell>
                      <div>
                        <div className="font-medium text-purple-700">{event.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">{event.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        {event.date.toLocaleDateString("id-ID")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                        {event.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                        {event.attendees}/{event.maxAttendees}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(event.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-purple-100">
                            <span className="sr-only">Buka menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEventAction("Lihat", event)}>
                            Lihat detail
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEventAction("Edit", event)}>
                            Edit event
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {event.status === "draft" && (
                            <DropdownMenuItem onClick={() => handleEventAction("Publikasi", event)}>
                              Publikasikan event
                            </DropdownMenuItem>
                          )}
                          {event.status === "published" && (
                            <DropdownMenuItem onClick={() => handleEventAction("Batal Publikasi", event)}>
                              Batal publikasi
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleEventAction("Duplikat", event)}>
                            Duplikat event
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleEventAction("Batalkan", event)}
                            className="text-orange-600"
                          >
                            Batalkan event
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEventAction("Hapus", event)} className="text-red-600">
                            Hapus event
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Tidak ada event yang ditemukan.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
