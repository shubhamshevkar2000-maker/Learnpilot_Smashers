import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"

export type NoteSourceType = "learning_path" | "activity" | "course" | "lesson" | "journey" | "general"

export interface LearnerNote {
  id: string
  user_id: string
  title: string
  content: string
  tags: string[]
  source_type: NoteSourceType
  source_id?: string | null
  source_title?: string | null
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
      return JSON.parse(raw) as LearnerNote[]
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
 * Fetch all notes for the authenticated user from Supabase with LocalStorage sync fallback.
 */
export async function fetchUserNotes(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<LearnerNote[]> {
  if (!userId) return []

  try {
    const { data, error } = await (supabase
      .from("learner_notes" as any)
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false }) as any)

    if (!error && data && Array.isArray(data)) {
      const formatted: LearnerNote[] = data.map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        title: item.title || "Untitled Note",
        content: item.content || "",
        tags: Array.isArray(item.tags) ? item.tags : [],
        source_type: item.source_type || "general",
        source_id: item.source_id || null,
        source_title: item.source_title || null,
        is_pinned: !!item.is_pinned,
        created_at: item.created_at || new Date().toISOString(),
        updated_at: item.updated_at || new Date().toISOString(),
      }))

      saveLocalNotes(userId, formatted)
      return formatted
    }
  } catch (err) {
    console.warn("Supabase notes fetch error, using local fallback", err)
  }

  return getLocalNotes(userId)
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
    title: initialData?.title?.trim() || "Untitled Note",
    content: initialData?.content || "",
    tags: initialData?.tags || [],
    source_type: initialData?.source_type || "general",
    source_id: initialData?.source_id || null,
    source_title: initialData?.source_title || null,
    is_pinned: !!initialData?.is_pinned,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  // Update Local State first
  const currentLocal = getLocalNotes(userId)
  const updatedLocal = [newNote, ...currentLocal]
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
        source_type: newNote.source_type,
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
  updates: Partial<Pick<LearnerNote, "title" | "content" | "tags" | "is_pinned" | "source_type" | "source_title" | "source_id">>
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
    const { error } = await (supabase
      .from("learner_notes" as any)
      .update({
        ...updates,
        updated_at: updatedTimestamp,
      } as any)
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
  sortBy: "updated_desc" | "created_desc" | "title_asc"
): LearnerNote[] {
  const cleanQuery = query.trim().toLowerCase()

  let filtered = notes.filter((n) => {
    // Search query matching title, content, or tags
    const matchQuery =
      !cleanQuery ||
      n.title.toLowerCase().includes(cleanQuery) ||
      n.content.toLowerCase().includes(cleanQuery) ||
      n.tags.some((t) => t.toLowerCase().includes(cleanQuery))

    if (!matchQuery) return false

    // Filter type matching
    if (filterType === "pinned") return n.is_pinned
    if (filterType === "learning_path") return n.source_type === "learning_path" || n.source_type === "activity"
    if (filterType === "course") return n.source_type === "course" || n.source_type === "lesson"
    if (filterType === "journey") return n.source_type === "journey"
    if (filterType === "general") return n.source_type === "general"

    return true
  })

  // Sort
  return filtered.sort((a, b) => {
    // Pinned notes always rank higher unless specifically sorting by title
    if (sortBy !== "title_asc" && a.is_pinned !== b.is_pinned) {
      return a.is_pinned ? -1 : 1
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
