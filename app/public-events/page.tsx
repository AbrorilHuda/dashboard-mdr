"use client"

import { EventViewer } from "@/components/event-viewer"

export default function PublicEventsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">&lt;/&gt;</span>
            </div>
            <h1 className="text-3xl font-bold">
              Madura<span className="text-purple-600">Dev</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">Komunitas Developer Madura - Event & Workshop</p>
        </div>

        <EventViewer />
      </div>
    </div>
  )
}
