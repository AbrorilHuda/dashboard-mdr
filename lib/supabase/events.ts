import { createClient } from "./client"
import type { Database } from "@/types/database"

type Event = Database["public"]["Tables"]["events"]["Row"]
type EventInsert = Database["public"]["Tables"]["events"]["Insert"]
type EventUpdate = Database["public"]["Tables"]["events"]["Update"]

export async function getPublishedEvents() {
  const supabase = createClient()

  const { data: events, error } = await supabase
    .from("events")
    .select(`
      *,
      profiles:author_id (
        full_name,
        avatar_url
      )
    `)
    .eq("status", "published")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching published events:", error)
    return { events: [], error }
  }

  return { events: events || [], error: null }
}

export async function getAllEvents() {
  const supabase = createClient()

  const { data: events, error } = await supabase
    .from("events")
    .select(`
      *,
      profiles:author_id (
        full_name,
        avatar_url
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching all events:", error)
    return { events: [], error }
  }

  return { events: events || [], error: null }
}

export async function getEventById(id: string) {
  const supabase = createClient()

  const { data: event, error } = await supabase
    .from("events")
    .select(`
      *,
      profiles:author_id (
        full_name,
        avatar_url
      )
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching event:", error)
    return { event: null, error }
  }

  return { event, error: null }
}

export async function createEvent(event: EventInsert) {
  const supabase = createClient()

  const { data, error } = await supabase.from("events").insert(event).select().single()

  if (error) {
    console.error("Error creating event:", error)
    return { event: null, error }
  }

  return { event: data, error: null }
}

export async function updateEvent(id: string, updates: EventUpdate) {
  const supabase = createClient()

  const { data, error } = await supabase.from("events").update(updates).eq("id", id).select().single()

  if (error) {
    console.error("Error updating event:", error)
    return { event: null, error }
  }

  return { event: data, error: null }
}

export async function deleteEvent(id: string) {
  const supabase = createClient()

  const { error } = await supabase.from("events").delete().eq("id", id)

  if (error) {
    console.error("Error deleting event:", error)
    return { error }
  }

  return { error: null }
}
