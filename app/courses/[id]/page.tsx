"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import CoursesPage from "../page"

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  // Re-uses the main CoursesPage component which handles selection seamlessly
  return <CoursesPage />
}
