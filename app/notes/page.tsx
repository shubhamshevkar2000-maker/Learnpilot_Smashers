"use client"

import { useState, useEffect, useCallback, useRef, useTransition } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Compass,
  Layers,
  BookOpen,
  Bot,
  CheckCircle,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Plus,
  Search,
  Pin,
  Trash2,
  Tag,
  ArrowLeft,
  Clock,
  Sparkles,
  AlertCircle,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading,
  Code,
  Check,
  Filter,
  ExternalLink,
  BookMarked,
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { ThemeToggle } from "@/components/theme-toggle"
import { createClient } from "@/lib/supabase/client"
import {
  fetchUserNotes,
  createNote,
  updateNote,
  deleteNote,
  filterAndSortNotes,
  type LearnerNote,
  type NoteSourceType
} from "@/lib/services/notes-service"

interface NavItem {
  id: string
  label: string
  icon: typeof Compass
  href: string
  active?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: Layers, href: "/dashboard" },
  { id: "journey", label: "Daily Journey", icon: CalendarIcon, href: "/journey" },
  { id: "path", label: "Learning Path", icon: Compass, href: "/path" },
  { id: "courses", label: "Courses", icon: BookOpen, href: "/courses" },
  { id: "ai-coach", label: "AI Coach", icon: Bot, href: "/ai-coach" },
  { id: "assessments", label: "Assessments", icon: CheckCircle, href: "/assessments" },
  { id: "progress", label: "Progress", icon: BarChart3, href: "/progress" },
  { id: "notes", label: "Notes", icon: FileText, href: "/notes", active: true },
  { id: "settings", label: "Settings", icon: Settings, href: "#" },
]

function CalendarIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  )
}

export default function NotesPage() {
  return (
    <ProtectedRoute>
      <NotesContent />
    </ProtectedRoute>
  )
}

function NotesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isConfigured, signOut } = useAuth()
  const supabase = createClient()

  // State
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState<LearnerNote[]>([])
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  
  // Editor Form State
  const [editorTitle, setEditorTitle] = useState("")
  const [editorContent, setEditorContent] = useState("")
  const [editorTags, setEditorTags] = useState<string[]>([])
  const [newTagInput, setNewTagInput] = useState("")
  
  // Save State
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved" | "error">("saved")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "pinned" | "learning_path" | "course" | "journey" | "general">("all")
  const [sortBy, setSortBy] = useState<"updated_desc" | "created_desc" | "title_asc">("updated_desc")

  // UI state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileView, setMobileView] = useState<"list" | "editor">("list")
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [activeToast, setActiveToast] = useState<string | null>(null)

  // Auto-save Debounce Ref
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const contentTextAreaRef = useRef<HTMLTextAreaElement | null>(null)

  // 1. Initial Load
  const loadNotesData = useCallback(async () => {
    if (!user) return
    if (!isConfigured) {
      router.replace("/login")
      return
    }

    try {
      const fetched = await fetchUserNotes(supabase, user.id)
      setNotes(fetched)

      // Handle URL Context parameters if learner creates a note from another section
      const paramSourceType = searchParams.get("source_type") as NoteSourceType | null
      const paramSourceTitle = searchParams.get("source_title")
      const paramSourceId = searchParams.get("source_id")
      const autoCreate = searchParams.get("create") === "true"

      if (autoCreate || (paramSourceType && paramSourceTitle)) {
        const created = await createNote(supabase, user.id, {
          title: paramSourceTitle ? `Note: ${paramSourceTitle}` : "Untitled Note",
          source_type: paramSourceType || "general",
          source_title: paramSourceTitle || null,
          source_id: paramSourceId || null,
          tags: paramSourceType ? [paramSourceType] : []
        })
        setNotes(prev => [created, ...prev])
        setSelectedNoteId(created.id)
        setEditorTitle(created.title)
        setEditorContent(created.content)
        setEditorTags(created.tags)
        setMobileView("editor")
      } else if (fetched.length > 0) {
        setSelectedNoteId(fetched[0].id)
        setEditorTitle(fetched[0].title)
        setEditorContent(fetched[0].content)
        setEditorTags(fetched[0].tags || [])
      }
    } catch (err) {
      console.error("Error loading notes:", err)
      setErrorMessage("Failed to load notes. Please refresh.")
    } finally {
      setLoading(false)
    }
  }, [user, isConfigured, supabase, router, searchParams])

  useEffect(() => {
    loadNotesData()
  }, [loadNotesData])

  // Selected Note Object
  const selectedNote = notes.find(n => n.id === selectedNoteId) || null

  // Switch Selected Note
  const handleSelectNote = (note: LearnerNote) => {
    // If unsaved changes pending on current note, force flush save first
    if (saveTimeoutRef.current && selectedNoteId) {
      clearTimeout(saveTimeoutRef.current)
      persistCurrentNote(selectedNoteId, editorTitle, editorContent, editorTags)
    }

    setSelectedNoteId(note.id)
    setEditorTitle(note.title)
    setEditorContent(note.content)
    setEditorTags(note.tags || [])
    setSaveStatus("saved")
    setMobileView("editor")
  }

  // 2. Persist Note Helper
  const persistCurrentNote = async (
    noteId: string,
    title: string,
    content: string,
    tags: string[]
  ) => {
    if (!user) return
    setSaveStatus("saving")

    const updated = await updateNote(supabase, user.id, noteId, {
      title: title.trim() || "Untitled Note",
      content: content,
      tags: tags
    })

    if (updated) {
      setNotes(prev => prev.map(n => n.id === noteId ? updated : n))
      setSaveStatus("saved")
    } else {
      setSaveStatus("error")
      setErrorMessage("Unable to save your note. Your changes are still saved locally.")
    }
  }

  // 3. Trigger Auto-save on Input
  const triggerAutoSave = (newTitle: string, newContent: string, newTags: string[]) => {
    if (!selectedNoteId) return
    setSaveStatus("unsaved")

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      persistCurrentNote(selectedNoteId, newTitle, newContent, newTags)
    }, 600)
  }

  const handleTitleChange = (val: string) => {
    setEditorTitle(val)
    triggerAutoSave(val, editorContent, editorTags)
  }

  const handleContentChange = (val: string) => {
    setEditorContent(val)
    triggerAutoSave(editorTitle, val, editorTags)
  }

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      const tagClean = newTagInput.trim().replace(/^#/, "")
      if (tagClean && !editorTags.includes(tagClean)) {
        const updatedTags = [...editorTags, tagClean]
        setEditorTags(updatedTags)
        setNewTagInput("")
        triggerAutoSave(editorTitle, editorContent, updatedTags)
      }
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = editorTags.filter(t => t !== tagToRemove)
    setEditorTags(updatedTags)
    triggerAutoSave(editorTitle, editorContent, updatedTags)
  }

  // 4. Create Note Action
  const handleCreateNote = async (sourceType?: NoteSourceType, sourceTitle?: string) => {
    if (!user) return
    setLoading(true)

    try {
      const created = await createNote(supabase, user.id, {
        title: sourceTitle ? `Note: ${sourceTitle}` : "Untitled Note",
        source_type: sourceType || "general",
        source_title: sourceTitle || null
      })

      // Always reset active filter to "all" and clear search query so new note is visible in left list
      setFilterType("all")
      setSearchQuery("")

      setNotes(prev => [created, ...prev])
      setSelectedNoteId(created.id)
      setEditorTitle(created.title)
      setEditorContent(created.content)
      setEditorTags(created.tags || [])
      setSaveStatus("saved")
      setMobileView("editor")
    } catch (err) {
      console.error("Failed to create note:", err)
      setErrorMessage("Could not create note. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // 5. Toggle Pin Action
  const handleTogglePin = async (e: React.MouseEvent, note: LearnerNote) => {
    e.stopPropagation()
    if (!user) return

    const newPinned = !note.is_pinned
    const updated = await updateNote(supabase, user.id, note.id, { is_pinned: newPinned })

    if (updated) {
      setNotes(prev => prev.map(n => n.id === note.id ? updated : n))
      setActiveToast(newPinned ? "Note pinned to top" : "Note unpinned")
      setTimeout(() => setActiveToast(null), 2500)
    }
  }

  // 6. Delete Note Action
  const handleDeleteNoteConfirm = async () => {
    if (!selectedNoteId || !user) return
    setDeleteConfirmOpen(false)

    const targetId = selectedNoteId
    const remainingAll = notes.filter(n => n.id !== targetId)
    const remainingProcessed = processedNotes.filter(n => n.id !== targetId)
    
    setNotes(remainingAll)

    const nextNote = remainingProcessed.length > 0 ? remainingProcessed[0] : (remainingAll.length > 0 ? remainingAll[0] : null)

    if (nextNote) {
      setSelectedNoteId(nextNote.id)
      setEditorTitle(nextNote.title)
      setEditorContent(nextNote.content)
      setEditorTags(nextNote.tags || [])
    } else {
      setSelectedNoteId(null)
      setEditorTitle("")
      setEditorContent("")
      setEditorTags([])
    }

    setMobileView("list")
    await deleteNote(supabase, user.id, targetId)

    setActiveToast("Note deleted")
    setTimeout(() => setActiveToast(null), 2500)
  }

  // 7. Format Toolbar Helper
  const applyFormatting = (syntax: string, wrapper: boolean = false) => {
    if (!contentTextAreaRef.current) return
    const textarea = contentTextAreaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = editorContent.substring(start, end)

    let replacement = ""
    if (wrapper) {
      replacement = `${syntax}${selectedText || "text"}${syntax}`
    } else {
      replacement = `${syntax}${selectedText}`
    }

    const newContent = editorContent.substring(0, start) + replacement + editorContent.substring(end)
    setEditorContent(newContent)
    triggerAutoSave(editorTitle, newContent, editorTags)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + syntax.length, start + syntax.length + selectedText.length)
    }, 50)
  }

  const handleNavClick = (item: NavItem) => {
    if (item.href !== "#") {
      router.push(item.href)
      return
    }
    setActiveToast(`${item.label} section coming soon.`)
    setTimeout(() => setActiveToast(null), 2800)
  }

  const handleSignOut = async () => {
    await signOut()
    router.replace("/login")
  }

  // Processed Notes list based on Search, Filter, Sort
  const processedNotes = filterAndSortNotes(notes, searchQuery, filterType, sortBy)

  const handleOpenNoteSource = (note: LearnerNote) => {
    if (note.source_type === "journey") {
      router.push("/journey")
    } else if (note.source_type === "course" || note.source_type === "lesson") {
      if (note.source_id) {
        router.push(`/courses/${note.source_id}`)
      } else {
        router.push("/courses")
      }
    } else if (note.source_type === "learning_path" || note.source_type === "activity") {
      router.push("/path")
    }
  }

  const displayName = user?.user_metadata?.full_name || "Learner"
  const avatarInitial = displayName.charAt(0).toUpperCase() || "L"

  if (loading && notes.length === 0) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
          <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
            Opening Notebook...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary transition-colors duration-300 overflow-hidden">
      {/* Toast Notification */}
      {activeToast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-full border border-border/80 bg-card/95 px-4 py-2 text-xs text-foreground shadow-md backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
          <span>{activeToast}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border/60 bg-card p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-destructive">
              <div className="p-2 rounded-full bg-destructive/10">
                <Trash2 size={18} />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Delete this note?</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This action cannot be undone. All recorded insights in this note will be permanently removed. (Your course or activity progress will NOT be affected).
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteNoteConfirm}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity"
              >
                Delete Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-52 flex-col justify-between border-r border-border/40 bg-background/95 px-4 py-5 backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          <div className="flex items-center justify-between pb-5">
            <Link
              href="/"
              className="text-[11px] font-semibold tracking-[0.25em] text-foreground transition-opacity hover:opacity-80"
            >
              LEARNPILOT
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg p-1 text-muted-foreground hover:text-foreground lg:hidden"
            >
              <X size={16} />
            </button>
          </div>

          <nav className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                    item.active
                      ? "font-medium text-primary bg-primary/5"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <Icon size={14} className={item.active ? "text-primary" : "text-muted-foreground"} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="space-y-2.5 pt-3 border-t border-border/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[11px] font-medium text-primary">
                {avatarInitial}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-foreground">{displayName}</p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground transition-colors hover:text-destructive"
          >
            <LogOut size={12} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Layout */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <header className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-border/40 bg-card/30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/40 text-foreground hover:bg-muted lg:hidden"
            >
              <Menu size={16} />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-primary flex items-center gap-1">
                  <BookMarked size={12} />
                  PERSONAL WORKSPACE
                </span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground font-mono">{notes.length} {notes.length === 1 ? 'note' : 'notes'}</span>
              </div>
              <h1 className="font-serif text-xl sm:text-2xl font-normal tracking-tight text-foreground">
                My Learning Notebook
              </h1>
            </div>
          </div>

          <button
            onClick={() => handleCreateNote()}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-sm shadow-primary/20 transition-all hover:opacity-90 active:scale-95"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">New Note</span>
            <span className="sm:hidden">Note</span>
          </button>
        </header>

        {/* Notes Workspace Grid */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          
          {/* LEFT: Note List & Search Filter Bar */}
          <div
            className={`w-full lg:w-80 xl:w-96 border-r border-border/40 bg-card/20 flex flex-col shrink-0 overflow-hidden transition-all ${
              mobileView === "editor" ? "hidden lg:flex" : "flex"
            }`}
          >
            {/* Search & Filters */}
            <div className="p-4 border-b border-border/40 space-y-3 shrink-0">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search notes, tags, content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-border/40 bg-background pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
                {(["all", "pinned", "learning_path", "course", "journey", "general"] as const).map((ft) => (
                  <button
                    key={ft}
                    onClick={() => setFilterType(ft)}
                    className={`shrink-0 px-2.5 py-1 rounded-lg capitalize transition-colors ${
                      filterType === ft
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    }`}
                  >
                    {ft === "learning_path" ? "Learning Path" : ft === "course" ? "Courses" : ft === "journey" ? "Daily Journey" : ft}
                  </button>
                ))}
              </div>

              {/* Sort selector */}
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                <span>Sort by</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent font-medium text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="updated_desc" className="bg-card">Recently Updated</option>
                  <option value="created_desc" className="bg-card">Recently Created</option>
                  <option value="title_asc" className="bg-card">Title A–Z</option>
                </select>
              </div>
            </div>

            {/* Note Cards List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {processedNotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center px-4 space-y-3">
                  <div className="p-3 rounded-2xl bg-muted/40 text-muted-foreground">
                    <FileText size={24} />
                  </div>
                  {notes.length === 0 ? (
                    <>
                      <h3 className="text-xs font-semibold text-foreground">No notes in your Notebook</h3>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Capture something you learned today and keep it for later.
                      </p>
                      <button
                        onClick={() => handleCreateNote()}
                        className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 text-xs font-medium transition-colors"
                      >
                        Create your first note
                      </button>
                    </>
                  ) : (
                    <>
                      <h3 className="text-xs font-semibold text-foreground">No matching notes</h3>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        No notes match your current search query or filter selection.
                      </p>
                      <button
                        onClick={() => { setSearchQuery(""); setFilterType("all"); }}
                        className="text-xs text-primary underline"
                      >
                        Reset filters
                      </button>
                    </>
                  )}
                </div>
              ) : (
                processedNotes.map((note) => {
                  const isSelected = note.id === selectedNoteId
                  const preview = note.content ? note.content.replace(/[#*`_]/g, "").slice(0, 75) : "Empty note content..."
                  const updatedDate = new Date(note.updated_at)
                  const timeStr = updatedDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })

                  return (
                    <div
                      key={note.id}
                      onClick={() => handleSelectNote(note)}
                      className={`group relative p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border/40 hover:border-border hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className={`text-xs font-semibold truncate ${isSelected ? "text-primary" : "text-foreground"}`}>
                          {note.title || "Untitled Note"}
                        </h4>

                        <button
                          onClick={(e) => handleTogglePin(e, note)}
                          className={`p-1 rounded-md transition-colors ${
                            note.is_pinned
                              ? "text-primary bg-primary/10"
                              : "text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground hover:bg-muted"
                          }`}
                        >
                          <Pin size={12} className={note.is_pinned ? "fill-current" : ""} />
                        </button>
                      </div>

                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed mb-2 font-sans">
                        {preview}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                        <div className="flex items-center gap-1.5 truncate max-w-[70%]">
                          {note.source_type && note.source_type !== "general" && (
                            <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                              {note.source_type === "journey" ? "Daily Journey" : note.source_type === "course" ? "Course" : note.source_type === "learning_path" ? "Learning Path" : note.source_type}
                            </span>
                          )}
                          {note.tags && note.tags.length > 0 && (
                            <span className="truncate text-primary/80">#{note.tags[0]}</span>
                          )}
                        </div>
                        <span className="shrink-0">{timeStr}</span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* RIGHT / MAIN EDITOR */}
          <div
            className={`flex-1 flex flex-col h-full bg-background min-w-0 overflow-hidden ${
              mobileView === "list" ? "hidden lg:flex" : "flex"
            }`}
          >
            {selectedNote ? (
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                
                {/* Editor Header Bar */}
                <div className="px-6 py-3 border-b border-border/40 bg-card/10 flex items-center justify-between shrink-0 gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setMobileView("list")}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground lg:hidden"
                    >
                      <ArrowLeft size={14} />
                      <span>Back</span>
                    </button>

                    {/* Context / Source Badge & Open Button */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                        {selectedNote.source_type === "journey"
                          ? "Daily Journey"
                          : selectedNote.source_type === "course"
                          ? "Course"
                          : selectedNote.source_type === "learning_path"
                          ? "Learning Path"
                          : "General Note"}
                      </span>
                      {selectedNote.source_title && (
                        <span className="truncate max-w-[220px] text-foreground font-medium text-[11px]">
                          → {selectedNote.source_title}
                        </span>
                      )}
                      {selectedNote.source_type && selectedNote.source_type !== "general" && (
                        <button
                          onClick={() => handleOpenNoteSource(selectedNote)}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline ml-1"
                        >
                          <span>Open Source</span>
                          <ExternalLink size={11} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Actions & Status */}
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                      {saveStatus === "saving" && (
                        <>
                          <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                          <span>Saving...</span>
                        </>
                      )}
                      {saveStatus === "unsaved" && (
                        <>
                          <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                          <span>Unsaved changes</span>
                        </>
                      )}
                      {saveStatus === "saved" && (
                        <>
                          <Check size={12} className="text-green-500" />
                          <span>Saved</span>
                        </>
                      )}
                      {saveStatus === "error" && (
                        <>
                          <AlertCircle size={12} className="text-destructive" />
                          <span className="text-destructive">Save error</span>
                        </>
                      )}
                    </span>

                    <button
                      onClick={(e) => handleTogglePin(e, selectedNote)}
                      className={`p-2 rounded-lg border transition-colors ${
                        selectedNote.is_pinned
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-border/40 text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                      title={selectedNote.is_pinned ? "Unpin Note" : "Pin Note"}
                    >
                      <Pin size={14} className={selectedNote.is_pinned ? "fill-current" : ""} />
                    </button>

                    <button
                      onClick={() => setDeleteConfirmOpen(true)}
                      className="p-2 rounded-lg border border-border/40 text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10 transition-colors"
                      title="Delete Note"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Editor Scroll Container */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 max-w-4xl mx-auto w-full">
                  
                  {/* Note Title Input */}
                  <input
                    type="text"
                    placeholder="Untitled Note"
                    value={editorTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full text-2xl sm:text-3xl font-serif font-medium bg-transparent border-none text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
                  />

                  {/* Tags Manager */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 pb-2 border-b border-border/30">
                    <Tag size={13} className="text-muted-foreground shrink-0" />
                    {editorTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted/60 text-[11px] font-medium text-foreground group"
                      >
                        #{tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="text-muted-foreground hover:text-destructive ml-0.5"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      placeholder="Add tag (Press Enter)..."
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none py-1"
                    />
                  </div>

                  {/* Format Toolbar */}
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-card border border-border/40 shrink-0 text-muted-foreground">
                    <button
                      onClick={() => applyFormatting("**", true)}
                      className="p-1.5 rounded-lg hover:text-foreground hover:bg-muted transition-colors"
                      title="Bold"
                    >
                      <Bold size={13} />
                    </button>
                    <button
                      onClick={() => applyFormatting("*", true)}
                      className="p-1.5 rounded-lg hover:text-foreground hover:bg-muted transition-colors"
                      title="Italic"
                    >
                      <Italic size={13} />
                    </button>
                    <button
                      onClick={() => applyFormatting("## ")}
                      className="p-1.5 rounded-lg hover:text-foreground hover:bg-muted transition-colors"
                      title="Heading"
                    >
                      <Heading size={13} />
                    </button>
                    <button
                      onClick={() => applyFormatting("- ")}
                      className="p-1.5 rounded-lg hover:text-foreground hover:bg-muted transition-colors"
                      title="Bullet List"
                    >
                      <List size={13} />
                    </button>
                    <button
                      onClick={() => applyFormatting("1. ")}
                      className="p-1.5 rounded-lg hover:text-foreground hover:bg-muted transition-colors"
                      title="Numbered List"
                    >
                      <ListOrdered size={13} />
                    </button>
                    <button
                      onClick={() => applyFormatting("```\n", false)}
                      className="p-1.5 rounded-lg hover:text-foreground hover:bg-muted transition-colors"
                      title="Code Block"
                    >
                      <Code size={13} />
                    </button>
                  </div>

                  {/* Main Text Content Editor Area */}
                  <textarea
                    ref={contentTextAreaRef}
                    placeholder="Start typing your note here... Use markdown or plain text to capture key insights, code snippets, and explanations."
                    value={editorContent}
                    onChange={(e) => handleContentChange(e.target.value)}
                    className="w-full min-h-[450px] bg-transparent border-none text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/40 focus:outline-none resize-none font-sans"
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="p-4 rounded-3xl bg-muted/30 text-muted-foreground">
                  <FileText size={32} />
                </div>
                <h3 className="text-sm font-semibold text-foreground">No note selected</h3>
                <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                  Select a note from the left sidebar to edit or create a new note to start capturing your learning insights.
                </p>
                <button
                  onClick={() => handleCreateNote()}
                  className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-sm shadow-primary/20 hover:opacity-90 transition-opacity"
                >
                  <Plus size={14} />
                  <span>Create New Note</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}
