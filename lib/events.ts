export interface Event {
  id: string
  title: string
  description: string
  date: Date
  location: string
  status: "draft" | "published" | "cancelled"
  attendees: number
  maxAttendees: number
  createdAt: Date
  updatedAt: Date
}

// Mock events data
export const mockEvents: Event[] = [
  {
    id: "1",
    title: "Tech Conference 2024",
    description: "Annual technology conference featuring the latest innovations in software development.",
    date: new Date("2024-03-15"),
    location: "Convention Center, Jakarta",
    status: "published",
    attendees: 150,
    maxAttendees: 200,
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    title: "Web Development Workshop",
    description: "Hands-on workshop covering modern web development frameworks and best practices.",
    date: new Date("2024-04-20"),
    location: "Tech Hub, Bandung",
    status: "published",
    attendees: 45,
    maxAttendees: 50,
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-25"),
  },
  {
    id: "3",
    title: "AI & Machine Learning Summit",
    description: "Exploring the future of artificial intelligence and machine learning applications.",
    date: new Date("2024-05-10"),
    location: "University Auditorium, Surabaya",
    status: "draft",
    attendees: 0,
    maxAttendees: 300,
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-01"),
  },
  {
    id: "4",
    title: "Startup Networking Event",
    description: "Connect with entrepreneurs, investors, and startup enthusiasts.",
    date: new Date("2024-02-28"),
    location: "Co-working Space, Jakarta",
    status: "cancelled",
    attendees: 25,
    maxAttendees: 100,
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-02-20"),
  },
]

export function getAllEvents(): Event[] {
  return mockEvents
}

export function getEventById(id: string): Event | undefined {
  return mockEvents.find((event) => event.id === id)
}

export function getEventStats() {
  const events = getAllEvents()
  return {
    total: events.length,
    published: events.filter((e) => e.status === "published").length,
    draft: events.filter((e) => e.status === "draft").length,
    cancelled: events.filter((e) => e.status === "cancelled").length,
    totalAttendees: events.reduce((sum, e) => sum + e.attendees, 0),
  }
}
