"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"

interface SaveCollegeButtonProps {
  collegeId: string
  initialSaved: boolean
}

export function SaveCollegeButton({ collegeId, initialSaved }: SaveCollegeButtonProps) {
  const [isSaved, setIsSaved] = useState(initialSaved)
  const [isLoading, setIsLoading] = useState(false)

  async function toggle() {
    setIsLoading(true)
    try {
      const res = await fetch("/api/user/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collegeId }),
      })
      const data = await res.json()
      setIsSaved(data.data.saved)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={isSaved ? "secondary" : "primary"}
      size="sm"
      onClick={toggle}
      loading={isLoading}
      className="press"
    >
      <svg
        className={`w-4 h-4 transition-transform duration-300 ${isSaved ? "scale-110" : ""}`}
        viewBox="0 0 24 24"
        fill={isSaved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
      </svg>
      {isSaved ? "Saved" : "Save College"}
    </Button>
  )
}
