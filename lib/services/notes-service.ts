import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"

export type NoteSourceType = "daily_journey" | "journey" | "learning_path" | "activity" | "course" | "lesson" | "general"

export interface LearnerNote {
  id: string
  user_id: string
  title: string
  content: string
  tags: string[]
  images?: string[]
  source_type: NoteSourceType
  source_id?: string | null
  source_title?: string | null
  source_day?: number | null
  source_module_id?: string | null
  source_module_title?: string | null
  source_sequence?: number | null
  is_pinned: boolean
  created_at: string
  updated_at: string
}

function getLocalNotesKey(userId: string): string {
  return `learnpilot_notes_${userId}`
}

export function getLocalNotes(userId: string): LearnerNote[] {
  if (typeof window === "undefined" || !userId) return []
  try {
    const raw = localStorage.getItem(getLocalNotesKey(userId))
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed.map((item: any) => ({
          id: item.id || `note_${Date.now()}`,
          user_id: item.user_id || userId,
          title: item.title || "Untitled Note",
          content: item.content || "",
          tags: Array.isArray(item.tags) ? item.tags : [],
          images: Array.isArray(item.images) ? item.images : [],
          source_type: item.source_type || "general",
          source_id: item.source_id || null,
          source_title: item.source_title || null,
          source_day: item.source_day !== undefined ? item.source_day : null,
          source_module_id: item.source_module_id || null,
          source_module_title: item.source_module_title || null,
          source_sequence: item.source_sequence !== undefined ? item.source_sequence : null,
          is_pinned: !!item.is_pinned,
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString(),
        }))
      }
    }
  } catch (err) {
    console.error("Failed to parse local notes:", err)
  }
  return []
}

export function saveLocalNotes(userId: string, notes: LearnerNote[]): void {
  if (typeof window === "undefined" || !userId) return
  try {
    localStorage.setItem(getLocalNotesKey(userId), JSON.stringify(notes))
  } catch (err) {
    console.error("Failed to save local notes:", err)
  }
}

/**
 * Compresses an uploaded image file client-side into a lightweight WebP/JPEG data URL.
 */
export async function compressImageFile(file: File, maxDimension = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      resolve("")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let width = img.width
        let height = img.height

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          } else {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }

        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          resolve(e.target?.result as string || "")
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        // Try webp first, fallback to jpeg
        try {
          const dataUrl = canvas.toDataURL("image/webp", quality)
          resolve(dataUrl)
        } catch {
          const dataUrl = canvas.toDataURL("image/jpeg", quality)
          resolve(dataUrl)
        }
      }
      img.onerror = () => reject(new Error("Failed to load image for compression"))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error("Failed to read image file"))
    reader.readAsDataURL(file)
  })
}

/**
 * Fetch all notes for the authenticated user from Supabase with LocalStorage sync fallback.
 */
export async function fetchUserNotes(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<LearnerNote[]> {
  if (!userId) return []

  const localNotes = getLocalNotes(userId)

  try {
    const { data, error } = await (supabase
      .from("learner_notes" as any)
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false }) as any)

    if (!error && data && Array.isArray(data)) {
      const localMap = new Map(localNotes.map(n => [n.id, n]))

      const formatted: LearnerNote[] = data.map((item: any) => {
        const local = localMap.get(item.id)
        return {
          id: item.id,
          user_id: item.user_id,
          title: item.title || item.topic || "Untitled Note",
          content: item.content || item.note_content || "",
          tags: Array.isArray(item.tags) ? item.tags : (local?.tags || []),
          images: Array.isArray(item.images) ? item.images : (local?.images || []),
          source_type: (item.source_type === "journey" || item.source_type === "daily_journey")
            ? "daily_journey"
            : item.source_type || "general",
          source_id: item.source_id || item.activity_id || item.module_id || local?.source_id || null,
          source_title: item.source_title || local?.source_title || null,
          source_day: item.source_day !== undefined ? item.source_day : (local?.source_day || null),
          source_module_id: item.source_module_id || local?.source_module_id || null,
          source_module_title: item.source_module_title || local?.source_module_title || null,
          source_sequence: item.source_sequence !== undefined ? item.source_sequence : (local?.source_sequence || null),
          is_pinned: !!item.is_pinned,
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString(),
        }
      })

      // Merge any local notes that haven't synced yet
      const remoteIds = new Set(formatted.map(n => n.id))
      const unsyncedLocals = localNotes.filter(n => !remoteIds.has(n.id))
      const merged = [...formatted, ...unsyncedLocals]

      saveLocalNotes(userId, merged)
      return merged
    }
  } catch (err) {
    console.warn("Supabase notes fetch error, using local fallback", err)
  }

  return localNotes
}

/**
 * Create a new note for the learner.
 */
export async function createNote(
  supabase: SupabaseClient<Database>,
  userId: string,
  initialData?: Partial<LearnerNote>
): Promise<LearnerNote> {
  const newNote: LearnerNote = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `note_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    user_id: userId,
    title: initialData?.title?.trim() ?? "Untitled Note",
    content: initialData?.content ?? "",
    tags: initialData?.tags || [],
    images: initialData?.images || [],
    source_type: (initialData?.source_type === "journey" || initialData?.source_type === "daily_journey")
      ? "daily_journey"
      : initialData?.source_type || "general",
    source_id: initialData?.source_id || null,
    source_title: initialData?.source_title || null,
    source_day: initialData?.source_day !== undefined ? initialData.source_day : null,
    source_module_id: initialData?.source_module_id || null,
    source_module_title: initialData?.source_module_title || null,
    source_sequence: initialData?.source_sequence !== undefined ? initialData.source_sequence : null,
    is_pinned: !!initialData?.is_pinned,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  // Update Local State first for instantaneous response
  const currentLocal = getLocalNotes(userId)
  const updatedLocal = [newNote, ...currentLocal.filter(n => n.id !== newNote.id)]
  saveLocalNotes(userId, updatedLocal)

  // Try Remote Supabase Insert
  try {
    const { data, error } = await (supabase
      .from("learner_notes" as any)
      .insert({
        id: newNote.id,
        user_id: newNote.user_id,
        title: newNote.title,
        content: newNote.content,
        tags: newNote.tags,
        source_type: newNote.source_type === "daily_journey" ? "journey" : newNote.source_type,
        source_id: newNote.source_id,
        source_title: newNote.source_title,
        is_pinned: newNote.is_pinned,
      } as any)
      .select()
      .single() as any)

    if (!error && data) {
      return {
        ...newNote,
        id: data.id,
        created_at: data.created_at || newNote.created_at,
        updated_at: data.updated_at || newNote.updated_at,
      }
    }
  } catch (err) {
    console.warn("Supabase insert note error, persisted locally", err)
  }

  return newNote
}

/**
 * Update an existing note.
 */
export async function updateNote(
  supabase: SupabaseClient<Database>,
  userId: string,
  noteId: string,
  updates: Partial<Pick<LearnerNote, "title" | "content" | "tags" | "images" | "is_pinned" | "source_type" | "source_title" | "source_id" | "source_day" | "source_module_id" | "source_module_title" | "source_sequence">>
): Promise<LearnerNote | null> {
  const currentLocal = getLocalNotes(userId)
  const targetIndex = currentLocal.findIndex((n) => n.id === noteId)

  const updatedTimestamp = new Date().toISOString()

  let updatedNote: LearnerNote | null = null

  if (targetIndex !== -1) {
    updatedNote = {
      ...currentLocal[targetIndex],
      ...updates,
      updated_at: updatedTimestamp,
    }
    currentLocal[targetIndex] = updatedNote
    saveLocalNotes(userId, currentLocal)
  }

  try {
    const payload: any = {
      updated_at: updatedTimestamp,
    }
    if (updates.title !== undefined) payload.title = updates.title
    if (updates.content !== undefined) payload.content = updates.content
    if (updates.tags !== undefined) payload.tags = updates.tags
    if (updates.source_type !== undefined) {
      payload.source_type = updates.source_type === "daily_journey" ? "journey" : updates.source_type
    }
    if (updates.source_id !== undefined) payload.source_id = updates.source_id
    if (updates.source_title !== undefined) payload.source_title = updates.source_title
    if (updates.is_pinned !== undefined) payload.is_pinned = updates.is_pinned

    const { error } = await (supabase
      .from("learner_notes" as any)
      .update(payload)
      .eq("id", noteId)
      .eq("user_id", userId) as any)

    if (error) {
      console.warn("Supabase note update error:", error)
    }
  } catch (err) {
    console.warn("Supabase note update network error:", err)
  }

  return updatedNote
}

/**
 * Delete a note.
 */
export async function deleteNote(
  supabase: SupabaseClient<Database>,
  userId: string,
  noteId: string
): Promise<boolean> {
  const currentLocal = getLocalNotes(userId)
  const filtered = currentLocal.filter((n) => n.id !== noteId)
  saveLocalNotes(userId, filtered)

  try {
    await (supabase
      .from("learner_notes" as any)
      .delete()
      .eq("id", noteId)
      .eq("user_id", userId) as any)
  } catch (err) {
    console.warn("Supabase note delete error:", err)
  }

  return true
}

/**
 * Helper to search, filter, and sort notes in memory.
 */
export function filterAndSortNotes(
  notes: LearnerNote[],
  query: string,
  filterType: "all" | "pinned" | "learning_path" | "course" | "journey" | "general",
  sortBy: "updated_desc" | "created_desc" | "title_asc",
  tagFilter?: string | null
): LearnerNote[] {
  const cleanQuery = query.trim().toLowerCase()

  const filtered = notes.filter((n) => {
    // Search query matching title, content, or tags
    const matchQuery =
      !cleanQuery ||
      n.title.toLowerCase().includes(cleanQuery) ||
      n.content.toLowerCase().includes(cleanQuery) ||
      (n.source_title && n.source_title.toLowerCase().includes(cleanQuery)) ||
      (n.source_module_title && n.source_module_title.toLowerCase().includes(cleanQuery)) ||
      n.tags.some((t) => t.toLowerCase().includes(cleanQuery))

    if (!matchQuery) return false

    // Tag filter matching
    if (tagFilter && !n.tags.some((t) => t.toLowerCase() === tagFilter.toLowerCase())) {
      return false
    }

    // Filter type matching
    if (filterType === "pinned") return n.is_pinned
    if (filterType === "learning_path") return n.source_type === "learning_path" || n.source_type === "activity"
    if (filterType === "course") return n.source_type === "course" || n.source_type === "lesson"
    if (filterType === "journey") return n.source_type === "journey" || n.source_type === "daily_journey"
    if (filterType === "general") return n.source_type === "general"

    return true
  })

  // Sort
  return filtered.sort((a, b) => {
    // Pinned notes always rank higher unless specifically sorting by title
    if (sortBy !== "title_asc" && a.is_pinned !== b.is_pinned) {
      return a.is_pinned ? -1 : 1
    }

    // When viewing Daily Journey filter specifically without explicit other sort, order by curriculum sequence
    if (filterType === "journey" && sortBy === "updated_desc") {
      const dayA = a.source_day || 999
      const dayB = b.source_day || 999
      if (dayA !== dayB) return dayA - dayB

      const seqA = a.source_sequence || 999
      const seqB = b.source_sequence || 999
      if (seqA !== seqB) return seqA - seqB

      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    }

    if (sortBy === "created_desc") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
    if (sortBy === "title_asc") {
      return a.title.localeCompare(b.title)
    }
    // Default: updated_desc
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  })
}
