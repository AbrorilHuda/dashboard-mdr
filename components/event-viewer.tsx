"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User } from "lucide-react";
import { getPublishedEvents } from "@/lib/supabase/events";
import type { Database } from "@/types/database";
import Image from "next/image";

type Event = Database["public"]["Tables"]["events"]["Row"] & {
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

export function EventViewer() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      const { events: fetchedEvents } = await getPublishedEvents();
      setEvents(fetchedEvents as Event[]);
      setIsLoading(false);
    };

    loadEvents();
  }, []);

  const renderMarkdown = (content: string) => {
    // Simple markdown rendering - in production, use a proper markdown library
    return content
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mb-3">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-medium mb-2">$1</h3>')
      .replace(/^\* (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, "<br>");
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Memuat event...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        Event & Workshop
      </h2>

      {events.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-600">
              Belum ada event yang dipublikasikan.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              {event.image_url && (
                <div className="w-full h-64">
                  <Image
                    src={event.image_url || "/placeholder.svg"}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-2xl">{event.title}</CardTitle>
                  <Badge className="bg-green-100 text-green-800">
                    Published
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(event.created_at).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                  {event.profiles?.full_name && (
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {event.profiles.full_name}
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                {event.description && (
                  <p className="text-gray-700 mb-4 text-lg">
                    {event.description}
                  </p>
                )}

                {event.content && (
                  <div
                    className="prose prose-purple max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: `<p class="mb-4">${renderMarkdown(
                        event.content
                      )}</p>`,
                    }}
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
