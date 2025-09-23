"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Plus } from "lucide-react"
import { getAllEvents, deleteEvent } from "@/lib/supabase/events"
import { EventForm } from "./event-form"
import type { Database } from "@/types/database"

type Event = Database["public"]["Tables"]["events"]["Row"] & {
  profiles: {
    full_name: string | null
    avatar_url: string | null
  } | null
}

export function EventList() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  const loadEvents = async () => {
    setIsLoading(true)
    const { events: fetchedEvents } = await getAllEvents()
    setEvents(fetchedEvents as Event[])
    setIsLoading(false)
  }

  useEffect(() => {
    loadEvents()
  }, [])

  const handleDelete = async (eventId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus event ini?")) {
      const { error } = await deleteEvent(eventId)
      if (!error) {
        loadEvents()
      } else {
        alert("Gagal menghapus event")
      }
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingEvent(null)
    loadEvents()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800"
      case "draft":
        return "bg-yellow-100 text-yellow-800"
      case "archived":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "published":
        return "Published"
      case "draft":
        return "Draft"
      case "archived":
        return "Archived"
      default:
        return status
    }
  }

  if (showForm || editingEvent) {
    return (
      <EventForm
        event={editingEvent || undefined}
        onSuccess={handleFormSuccess}
        onCancel={() => {
          setShowForm(false)
          setEditingEvent(null)
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Manajemen Event
        </h2>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Buat Event Baru
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Memuat event...</p>
        </div>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-600">Belum ada event yang dibuat.</p>
            <Button
              onClick={() => setShowForm(true)}
              className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Buat Event Pertama
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <div className="flex">
                {event.image_url && (
                  <div className="w-48 h-32 flex-shrink-0">
                    <img
                      src={event.image_url || "/placeholder.svg"}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl">{event.title}</CardTitle>
                    <Badge className={getStatusColor(event.status)}>{getStatusText(event.status)}</Badge>
                  </div>

                  {event.description && <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>}

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      <p>Dibuat: {new Date(event.created_at).toLocaleDateString("id-ID")}</p>
                      {event.profiles?.full_name && <p>Oleh: {event.profiles.full_name}</p>}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingEvent(event)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(event.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
