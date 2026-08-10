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

function serializeMetadata(note: Partial<LearnerNote>): string {
  return JSON.stringify({
    tags: note.tags || [],
    images: note.images || [],
    source_type: (note.source_type === "journey" || note.source_type === "daily_journey")
      ? "journey"
      : (note.source_type || "general"),
    source_id: note.source_id || null,
    source_title: note.source_title || null,
    source_day: note.source_day !== undefined ? note.source_day : null,
    source_module_id: note.source_module_id || null,
    source_module_title: note.source_module_title || null,
    source_sequence: note.source_sequence !== undefined ? note.source_sequence : null,
    is_pinned: !!note.is_pinned,
    updated_at: note.updated_at || new Date().toISOString(),
  })
}

function deserializeMetadata(raw?: string | null): Partial<LearnerNote> {
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    if (typeof parsed === "object" && parsed !== null) {
      return {
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        images: Array.isArray(parsed.images) ? parsed.images : [],
        source_type: (parsed.source_type === "journey" || parsed.source_type === "daily_journey")
          ? "daily_journey"
          : (parsed.source_type || "general"),
        source_id: parsed.source_id || null,
        source_title: parsed.source_title || null,
        source_day: parsed.source_day !== undefined ? parsed.source_day : null,
        source_module_id: parsed.source_module_id || null,
        source_module_title: parsed.source_module_title || null,
        source_sequence: parsed.source_sequence !== undefined ? parsed.source_sequence : null,
        is_pinned: !!parsed.is_pinned,
        updated_at: parsed.updated_at || null,
      }
    }
  } catch {
    // If difficulty_reflection was a plain text string
  }
  return {}
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
      .order("created_at", { ascending: false }) as any)

    if (!error && data && Array.isArray(data)) {
      const localMap = new Map(localNotes.map((n) => [n.id, n]))

      const formatted: LearnerNote[] = data.map((item: any) => {
        const meta = deserializeMetadata(item.difficulty_reflection)
        const local = localMap.get(item.id)

        const isPinned = item.is_pinned !== undefined
          ? !!item.is_pinned
          : (meta.is_pinned !== undefined ? !!meta.is_pinned : !!local?.is_pinned)

        const tags = Array.isArray(item.tags) && item.tags.length > 0
          ? item.tags
          : (meta.tags && meta.tags.length > 0 ? meta.tags : (local?.tags || []))

        const rawSource = item.source_type || meta.source_type || local?.source_type || "general"
        const sourceType: NoteSourceType = (rawSource === "journey" || rawSource === "daily_journey")
          ? "daily_journey"
          : (rawSource as NoteSourceType)

        const sourceTitle = item.source_title || meta.source_title || local?.source_title || null
        const images = Array.isArray(item.images) ? item.images : (meta.images || local?.images || [])
        const updatedAt = item.updated_at || meta.updated_at || local?.updated_at || item.created_at || new Date().toISOString()

        return {
          id: item.id,
          user_id: item.user_id,
          title: item.title || item.topic || "Untitled Note",
          content: item.content || item.note_content || "",
          tags,
          images,
          source_type: sourceType,
          source_id: item.source_id || meta.source_id || item.activity_id || item.module_id || local?.source_id || null,
          source_title: sourceTitle,
          source_day: item.source_day !== undefined ? item.source_day : (meta.source_day !== undefined ? meta.source_day : (local?.source_day || null)),
          source_module_id: item.source_module_id || meta.source_module_id || item.module_id || local?.source_module_id || null,
          source_module_title: item.source_module_title || meta.source_module_title || local?.source_module_title || null,
          source_sequence: item.source_sequence !== undefined ? item.source_sequence : (meta.source_sequence !== undefined ? meta.source_sequence : (local?.source_sequence || null)),
          is_pinned: isPinned,
          created_at: item.created_at || new Date().toISOString(),
          updated_at: updatedAt,
        }
      })

      // Merge any local notes that haven't synced yet
      const remoteIds = new Set(formatted.map((n) => n.id))
      const unsyncedLocals = localNotes.filter((n) => !remoteIds.has(n.id))
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
  const updatedLocal = [newNote, ...currentLocal.filter((n) => n.id !== newNote.id)]
  saveLocalNotes(userId, updatedLocal)

  // Try Remote Supabase Insert
  try {
    const { data, error } = await (supabase
      .from("learner_notes" as any)
      .insert({
        id: newNote.id,
        user_id: newNote.user_id,
        topic: newNote.title,
        note_content: newNote.content,
        difficulty_reflection: serializeMetadata(newNote),
      } as any)
      .select()
      .single() as any)

    if (!error && data) {
      return {
        ...newNote,
        id: data.id,
        created_at: data.created_at || newNote.created_at,
        updated_at: newNote.updated_at,
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
    const payload: any = {}
    if (updatedNote) {
      payload.topic = updatedNote.title
      payload.note_content = updatedNote.content
      payload.difficulty_reflection = serializeMetadata(updatedNote)
    } else {
      if (updates.title !== undefined) payload.topic = updates.title
      if (updates.content !== undefined) payload.note_content = updates.content
      payload.difficulty_reflection = serializeMetadata(updates)
    }

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
