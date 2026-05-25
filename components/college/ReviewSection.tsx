"use client"

import { useState } from "react"
import Image from "next/image"
import type { Session } from "next-auth"
import { Card, CardHeader, CardBody } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"

interface Review {
  id: string
  rating: number
  content: string
  createdAt: Date
  user: { name: string | null; image: string | null }
}

interface ReviewSectionProps {
  collegeId: string
  reviews: Review[]
  reviewCount: number
  session: Session | null
}

export function ReviewSection({ collegeId, reviews: initialReviews, reviewCount, session }: ReviewSectionProps) {
  const [reviews, setReviews] = useState(initialReviews)
  const [rating, setRating] = useState(0)
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)

  async function submitReview() {
    if (!rating || content.length < 10) {
      setError("Please provide a rating and at least 10 characters.")
      return
    }
    setIsSubmitting(true)
    setError("")
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collegeId, rating, content }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setReviews([data.data, ...reviews])
      setRating(0)
      setContent("")
      setShowForm(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Student Reviews ({reviewCount})</h2>
          {session && !showForm && (
            <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
              Write a review
            </Button>
          )}
        </div>
      </CardHeader>
      <CardBody className="space-y-5">
        {showForm && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-4 border border-gray-200">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Your Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setRating(star)} className="text-2xl leading-none">
                    <span className={star <= rating ? "text-amber-400" : "text-gray-300"}>★</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Your Review</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                placeholder="Share your experience (at least 10 characters)..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">{content.length} / 2000</p>
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <div className="flex gap-2">
              <Button onClick={submitReview} loading={isSubmitting} size="sm">Submit Review</Button>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {reviews.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">No reviews yet. Be the first!</p>
        )}

        {reviews.map((review) => (
          <div key={review.id} className="flex gap-3">
            <div className="flex-shrink-0">
              {review.user.image ? (
                <Image src={review.user.image} alt={review.user.name ?? "User"} width={36} height={36} className="rounded-full" />
              ) : (
                <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold text-sm">
                  {review.user.name?.[0] ?? "U"}
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-900">{review.user.name ?? "Anonymous"}</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className={`text-xs ${s <= review.rating ? "text-amber-400" : "text-gray-200"}`}>★</span>
                  ))}
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{review.content}</p>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  )
}
