// @ts-nocheck
"use client"

import { useState, useEffect, useCallback, useRef } from "react"
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
  Calendar,
  Image as ImageIcon,
  Eye,
  Edit3,
  Columns,
  Quote,
  Minus,
  CheckSquare,
  Square,
  Link as LinkIcon,
  Copy,
  Maximize2,
  Upload,
  FolderTree,
  ChevronRight,
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
  compressImageFile,
  type LearnerNote,
  type NoteSourceType,
} from "@/lib/services/notes-service"

interface NavItem {
  id: string
  label: string
  icon: any
  href: string
  active?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: Layers, href: "/dashboard" },
  { id: "journey", label: "Daily Journey", icon: Calendar, href: "/journey" },
  { id: "path", label: "Learning Path", icon: Compass, href: "/path" },
  { id: "courses", label: "Courses", icon: BookOpen, href: "/courses" },
  { id: "ai-coach", label: "AI Coach", icon: Bot, href: "/ai-coach" },
  { id: "assessments", label: "Assessments", icon: CheckCircle, href: "/assessments" },
  { id: "progress", label: "Progress", icon: BarChart3, href: "/progress" },
  { id: "notes", label: "Notes", icon: FileText, href: "/notes", active: true },
  { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
]

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
  const [editorImages, setEditorImages] = useState<string[]>([])
  const [newTagInput, setNewTagInput] = useState("")

  // Editor View Mode: "write" | "preview" | "split"
  const [viewMode, setViewMode] = useState<"write" | "preview" | "split">("write")

  // Save State
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved" | "error">("saved")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "pinned" | "learning_path" | "course" | "journey" | "general">("all")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"updated_desc" | "created_desc" | "title_asc">("updated_desc")

  // UI state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileView, setMobileView] = useState<"list" | "editor">("list")
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [activeToast, setActiveToast] = useState<string | null>(null)
  const [previewModalImage, setPreviewModalImage] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  // Refs
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const contentTextAreaRef = useRef<HTMLTextAreaElement | null>(null)
  const titleInputRef = useRef<HTMLInputElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

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
          source_type: (paramSourceType === "journey" || paramSourceType === "daily_journey") ? "daily_journey" : (paramSourceType || "general"),
          source_title: paramSourceTitle || null,
          source_id: paramSourceId || null,
          tags: paramSourceType ? [paramSourceType] : [],
          images: [],
        })
        setNotes((prev) => [created, ...prev.filter((n) => n.id !== created.id)])
        setSelectedNoteId(created.id)
        setEditorTitle(created.title)
        setEditorContent(created.content)
        setEditorTags(created.tags || [])
        setEditorImages(created.images || [])
        setMobileView("editor")
      } else if (fetched.length > 0) {
        setSelectedNoteId(fetched[0].id)
        setEditorTitle(fetched[0].title)
        setEditorContent(fetched[0].content)
        setEditorTags(fetched[0].tags || [])
        setEditorImages(fetched[0].images || [])
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
  const selectedNote = notes.find((n) => n.id === selectedNoteId) || null

  // Switch Selected Note
  const handleSelectNote = (note: LearnerNote) => {
    if (saveTimeoutRef.current && selectedNoteId) {
      clearTimeout(saveTimeoutRef.current)
      persistCurrentNote(selectedNoteId, editorTitle, editorContent, editorTags, editorImages)
    }

    setSelectedNoteId(note.id)
    setEditorTitle(note.title)
    setEditorContent(note.content)
    setEditorTags(note.tags || [])
    setEditorImages(note.images || [])
    setSaveStatus("saved")
    setMobileView("editor")
  }

  // 2. Persist Note Helper
  const persistCurrentNote = async (
    noteId: string,
    title: string,
    content: string,
    tags: string[],
    images: string[]
  ) => {
    if (!user) return
    setSaveStatus("saving")

    const updated = await updateNote(supabase, user.id, noteId, {
      title: title.trim() || "Untitled Note",
      content: content,
      tags: tags,
      images: images,
    })

    if (updated) {
      setNotes((prev) => prev.map((n) => (n.id === noteId ? updated : n)))
      setSaveStatus("saved")
    } else {
      setSaveStatus("error")
      setErrorMessage("Unable to save note to cloud. Changes are safely preserved locally.")
    }
  }

  // 3. Trigger Auto-save on Input
  const triggerAutoSave = (
    newTitle: string,
    newContent: string,
    newTags: string[],
    newImages: string[]
  ) => {
    if (!selectedNoteId) return
    setSaveStatus("unsaved")

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      persistCurrentNote(selectedNoteId, newTitle, newContent, newTags, newImages)
    }, 500)
  }

  const handleTitleChange = (val: string) => {
    setEditorTitle(val)
    triggerAutoSave(val, editorContent, editorTags, editorImages)
  }

  const handleContentChange = (val: string) => {
    setEditorContent(val)
    triggerAutoSave(editorTitle, val, editorTags, editorImages)
  }

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      const tagClean = newTagInput.trim().replace(/^#/, "").toLowerCase()
      if (tagClean && !editorTags.includes(tagClean)) {
        const updatedTags = [...editorTags, tagClean]
        setEditorTags(updatedTags)
        setNewTagInput("")
        triggerAutoSave(editorTitle, editorContent, updatedTags, editorImages)
      }
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = editorTags.filter((t) => t !== tagToRemove)
    setEditorTags(updatedTags)
    triggerAutoSave(editorTitle, editorContent, updatedTags, editorImages)
  }

  // 4. Create Note Action (Instant Blank Note)
  const handleCreateNote = async (sourceType?: NoteSourceType, sourceTitle?: string) => {
    if (!user) return

    // Flush any pending save
    if (saveTimeoutRef.current && selectedNoteId) {
      clearTimeout(saveTimeoutRef.current)
      persistCurrentNote(selectedNoteId, editorTitle, editorContent, editorTags, editorImages)
    }

    const created = await createNote(supabase, user.id, {
      title: sourceTitle ? `Note: ${sourceTitle}` : "Untitled Note",
      content: "",
      source_type: sourceType || "general",
      source_title: sourceTitle || null,
      tags: sourceType && sourceType !== "general" ? [sourceType] : [],
      images: [],
    })

    // Reset filters so the new note is immediately visible in the list
    setFilterType("all")
    setSelectedTag(null)
    setSearchQuery("")

    setNotes((prev) => [created, ...prev.filter((n) => n.id !== created.id)])
    setSelectedNoteId(created.id)
    setEditorTitle(created.title)
    setEditorContent("")
    setEditorTags(created.tags || [])
    setEditorImages([])
    setSaveStatus("saved")
    setMobileView("editor")
    setViewMode("write")

    // Instantly focus the title input
    setTimeout(() => {
      if (titleInputRef.current) {
        titleInputRef.current.focus()
        titleInputRef.current.select()
      }
    }, 50)
  }

  // 5. Toggle Pin Action
  const handleTogglePin = async (e: React.MouseEvent, note: LearnerNote) => {
    e.stopPropagation()
    if (!user) return

    const newPinned = !note.is_pinned
    const updated = await updateNote(supabase, user.id, note.id, { is_pinned: newPinned })

    if (updated) {
      setNotes((prev) => prev.map((n) => (n.id === note.id ? updated : n)))
      setActiveToast(newPinned ? "Note pinned to top" : "Note unpinned")
      setTimeout(() => setActiveToast(null), 2200)
    }
  }

  // 6. Delete Note Action
  const handleDeleteNoteConfirm = async () => {
    if (!selectedNoteId || !user) return
    setDeleteConfirmOpen(false)

    const targetId = selectedNoteId
    const remainingAll = notes.filter((n) => n.id !== targetId)
    const remainingProcessed = processedNotes.filter((n) => n.id !== targetId)

    setNotes(remainingAll)

    const nextNote =
      remainingProcessed.length > 0
        ? remainingProcessed[0]
        : remainingAll.length > 0
        ? remainingAll[0]
        : null

    if (nextNote) {
      setSelectedNoteId(nextNote.id)
      setEditorTitle(nextNote.title)
      setEditorContent(nextNote.content)
      setEditorTags(nextNote.tags || [])
      setEditorImages(nextNote.images || [])
    } else {
      setSelectedNoteId(null)
      setEditorTitle("")
      setEditorContent("")
      setEditorTags([])
      setEditorImages([])
    }

    setMobileView("list")
    await deleteNote(supabase, user.id, targetId)

    setActiveToast("Note deleted")
    setTimeout(() => setActiveToast(null), 2200)
  }

  // 7. Image Upload & Attachment Handlers
  const handleImageFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0 || !selectedNoteId) return
    setIsUploadingImage(true)

    try {
      const newImageUrls: string[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (file.type.startsWith("image/")) {
          const compressed = await compressImageFile(file, 1200, 0.82)
          if (compressed) {
            newImageUrls.push(compressed)
          }
        }
      }

      if (newImageUrls.length > 0) {
        const updatedImages = [...editorImages, ...newImageUrls]
        setEditorImages(updatedImages)

        // Insert markdown image tag at current position in editor
        let insertion = ""
        newImageUrls.forEach((url, idx) => {
          insertion += `\n\n![Attached Image ${editorImages.length + idx + 1}](${url})\n`
        })

        const textarea = contentTextAreaRef.current
        let newContent = editorContent
        if (textarea) {
          const start = textarea.selectionStart || editorContent.length
          newContent = editorContent.substring(0, start) + insertion + editorContent.substring(start)
        } else {
          newContent += insertion
        }

        setEditorContent(newContent)
        triggerAutoSave(editorTitle, newContent, editorTags, updatedImages)
        setActiveToast(`Attached ${newImageUrls.length} image(s)`)
        setTimeout(() => setActiveToast(null), 2500)
      }
    } catch (err) {
      console.error("Failed to process image:", err)
      setActiveToast("Error attaching image. Please try another file.")
      setTimeout(() => setActiveToast(null), 3000)
    } finally {
      setIsUploadingImage(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemoveImage = (imgUrlToRemove: string) => {
    const updatedImages = editorImages.filter((img) => img !== imgUrlToRemove)
    setEditorImages(updatedImages)

    // Remove markdown image references if present
    const cleanContent = editorContent
      .replace(new RegExp(`!\\[[^\\]]*\\]\\(${escapeRegex(imgUrlToRemove)}\\)`, "g"), "")
      .replace(/\n{3,}/g, "\n\n")

    setEditorContent(cleanContent)
    triggerAutoSave(editorTitle, cleanContent, editorTags, updatedImages)
    setActiveToast("Image removed")
    setTimeout(() => setActiveToast(null), 2000)
  }

  // 8. Clipboard Paste & Drag-and-Drop Image Handlers
  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items
    if (!items) return

    const imageFiles: File[] = []
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile()
        if (file) imageFiles.push(file)
      }
    }

    if (imageFiles.length > 0) {
      e.preventDefault()
      const dataTransfer = new DataTransfer()
      imageFiles.forEach((f) => dataTransfer.items.add(f))
      await handleImageFileSelect(dataTransfer.files)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleImageFileSelect(e.dataTransfer.files)
    }
  }

  // 9. Format Toolbar Helper
  const applyFormatting = (prefix: string, suffix: string = "", placeholder: string = "text") => {
    if (!contentTextAreaRef.current) return
    const textarea = contentTextAreaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = editorContent.substring(start, end)

    const textToInsert = selectedText || placeholder
    const replacement = `${prefix}${textToInsert}${suffix}`

    const newContent = editorContent.substring(0, start) + replacement + editorContent.substring(end)
    setEditorContent(newContent)
    triggerAutoSave(editorTitle, newContent, editorTags, editorImages)

    setTimeout(() => {
      textarea.focus()
      const newCursorStart = start + prefix.length
      const newCursorEnd = newCursorStart + textToInsert.length
      textarea.setSelectionRange(newCursorStart, newCursorEnd)
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
  const processedNotes = filterAndSortNotes(notes, searchQuery, filterType, sortBy, selectedTag)

  // Extract all unique tags across notes for quick tag filter
  const allUniqueTags = Array.from(new Set(notes.flatMap((n) => n.tags || []))).filter(Boolean)

  const handleOpenNoteSource = (note: LearnerNote) => {
    if (note.source_type === "journey" || note.source_type === "daily_journey") {
      if (note.source_id) {
        router.push(`/journey?activity_id=${note.source_id}`)
      } else {
        router.push("/journey")
      }
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

  // Grouping for Daily Journey Hierarchical View
  const isJourneyFiltered = filterType === "journey"
  
  // Group journey notes by Day -> Topic -> Activity
  const groupedJourneyNotes: Record<number, Record<string, LearnerNote[]>> = {}
  if (isJourneyFiltered) {
    processedNotes.forEach((n) => {
      const dayNum = n.source_day || 1
      const moduleName = n.source_module_title || "General Journey"
      if (!groupedJourneyNotes[dayNum]) {
        groupedJourneyNotes[dayNum] = {}
      }
      if (!groupedJourneyNotes[dayNum][moduleName]) {
        groupedJourneyNotes[dayNum][moduleName] = []
      }
      groupedJourneyNotes[dayNum][moduleName].push(n)
    })
  }

  const displayName = user?.user_metadata?.full_name || "Learner"
  const avatarInitial = displayName.charAt(0).toUpperCase() || "L"

  return (
    <div className="flex h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary transition-colors duration-300 overflow-hidden">
      {/* Toast Notification */}
      {activeToast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-full border border-border/80 bg-card/95 px-4 py-2 text-xs text-foreground shadow-md backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
          <span>{activeToast}</span>
        </div>
      )}

      {/* Hidden File Input for Image Attachments */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleImageFileSelect(e.target.files)}
      />

      {/* Image Preview Modal */}
      {previewModalImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewModalImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xl">
            <button
              onClick={() => setPreviewModalImage(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-background/80 text-foreground hover:bg-muted shadow-md"
            >
              <X size={16} />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewModalImage}
              alt="Full Preview"
              className="max-h-[85vh] max-w-full object-contain mx-auto"
            />
          </div>
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
      <main className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="shrink-0 flex items-center justify-between px-6 py-3.5 border-b border-border/40 bg-card/30">
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
                <span className="text-xs text-muted-foreground font-mono">
                  {notes.length} {notes.length === 1 ? "note" : "notes"}
                </span>
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
            <span>New Note</span>
          </button>
        </header>

        {/* Notes Workspace Grid */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* LEFT: Note List & Search Filter Bar */}
          <div
            className={`w-full lg:w-80 xl:w-96 border-r border-border/40 bg-card/10 flex flex-col shrink-0 overflow-hidden transition-all ${
              mobileView === "editor" ? "hidden lg:flex" : "flex"
            }`}
          >
            {/* Search & Filters */}
            <div className="p-3.5 border-b border-border/40 space-y-2.5 shrink-0">
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
                    {ft === "learning_path"
                      ? "Learning Path"
                      : ft === "course"
                      ? "Courses"
                      : ft === "journey"
                      ? "Daily Journey"
                      : ft}
                  </button>
                ))}
              </div>

              {/* Tag Badges Filter Bar (if any tags exist) */}
              {allUniqueTags.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[10px]">
                  <span className="text-muted-foreground shrink-0 text-[10px]">Tags:</span>
                  {allUniqueTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                      className={`shrink-0 px-2 py-0.5 rounded-md font-mono transition-colors ${
                        selectedTag === tag
                          ? "bg-primary/20 text-primary border border-primary/40"
                          : "bg-muted/50 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                  {selectedTag && (
                    <button
                      onClick={() => setSelectedTag(null)}
                      className="text-xs text-muted-foreground hover:text-foreground ml-1"
                      title="Clear tag filter"
                    >
                      <X size={11} />
                    </button>
                  )}
                </div>
              )}

              {/* Sort selector */}
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                <span>Sort by</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent font-medium text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="updated_desc" className="bg-card">
                    {filterType === "journey" ? "Curriculum Sequence" : "Recently Updated"}
                  </option>
                  <option value="created_desc" className="bg-card">
                    Recently Created
                  </option>
                  <option value="title_asc" className="bg-card">
                    Title A–Z
                  </option>
                </select>
              </div>
            </div>

            {/* Note Cards List (Hierarchical when Daily Journey filter is active) */}
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
                        Capture insights, code snippets, and key concepts as you learn.
                      </p>
                      <button
                        onClick={() => handleCreateNote()}
                        className="px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-medium transition-all shadow-sm"
                      >
                        Create your first note
                      </button>
                    </>
                  ) : (
                    <>
                      <h3 className="text-xs font-semibold text-foreground">No matching notes</h3>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {filterType === "journey"
                          ? "No Daily Journey notes recorded yet. Complete an activity in Daily Journey to add one!"
                          : "No notes match your current search query or filter selection."}
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery("")
                          setFilterType("all")
                          setSelectedTag(null)
                        }}
                        className="text-xs text-primary underline"
                      >
                        Reset filters
                      </button>
                    </>
                  )}
                </div>
              ) : isJourneyFiltered ? (
                /* Structured Daily Journey Hierarchy View: Day -> Topic -> Activity -> Note */
                <div className="space-y-4">
                  {Object.entries(groupedJourneyNotes).map(([dayStr, modulesObj]) => {
                    const dayNum = parseInt(dayStr, 10)
                    return (
                      <div key={dayStr} className="space-y-2">
                        <div className="flex items-center gap-1.5 px-1 pt-1 text-[10px] font-mono font-bold uppercase tracking-wider text-primary border-b border-border/40 pb-1">
                          <Calendar size={11} />
                          <span>DAY {dayNum} JOURNEY</span>
                        </div>

                        {Object.entries(modulesObj).map(([moduleTitle, moduleNotes]) => (
                          <div key={moduleTitle} className="space-y-1.5 pl-1.5">
                            <div className="text-[10px] font-medium text-muted-foreground truncate flex items-center gap-1">
                              <span className="text-primary/70">▸</span>
                              <span>{moduleTitle}</span>
                            </div>

                            <div className="space-y-1.5 pl-2">
                              {moduleNotes.map((note) => {
                                const isSelected = note.id === selectedNoteId
                                const preview = note.content
                                  ? note.content.replace(/[#*`_!\[\]\(\)]/g, "").slice(0, 65)
                                  : "Empty note..."

                                return (
                                  <div
                                    key={note.id}
                                    onClick={() => handleSelectNote(note)}
                                    className={`group relative p-2.5 rounded-xl border transition-all cursor-pointer ${
                                      isSelected
                                        ? "border-primary bg-primary/5 shadow-sm"
                                        : "border-border/40 hover:border-border hover:bg-muted/30"
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-1 mb-1">
                                      <h4
                                        className={`text-xs font-semibold truncate ${
                                          isSelected ? "text-primary" : "text-foreground"
                                        }`}
                                      >
                                        {note.source_title ? `→ ${note.source_title}` : note.title}
                                      </h4>

                                      <button
                                        onClick={(e) => handleTogglePin(e, note)}
                                        className={`p-1 rounded-md transition-colors ${
                                          note.is_pinned
                                            ? "text-primary bg-primary/10"
                                            : "text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground hover:bg-muted"
                                        }`}
                                      >
                                        <Pin size={11} className={note.is_pinned ? "fill-current" : ""} />
                                      </button>
                                    </div>

                                    <p className="text-[11px] text-muted-foreground line-clamp-1 leading-relaxed mb-1.5 font-sans">
                                      {note.title !== note.source_title ? note.title : preview}
                                    </p>

                                    <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                                      <div className="flex items-center gap-1 truncate">
                                        {note.images && note.images.length > 0 && (
                                          <span className="flex items-center gap-0.5 text-primary/80">
                                            <ImageIcon size={9} />
                                            <span>{note.images.length}</span>
                                          </span>
                                        )}
                                        {note.tags && note.tags.length > 0 && (
                                          <span className="text-primary/80">#{note.tags[0]}</span>
                                        )}
                                      </div>
                                      <span>
                                        {new Date(note.created_at).toLocaleDateString(undefined, {
                                          month: "short",
                                          day: "numeric",
                                        })}
                                      </span>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              ) : (
                /* Standard Card List for All / Pinned / Courses / General */
                processedNotes.map((note) => {
                  const isSelected = note.id === selectedNoteId
                  const preview = note.content
                    ? note.content.replace(/[#*`_!\[\]\(\)]/g, "").slice(0, 75)
                    : "Empty note..."
                  const updatedDate = new Date(note.updated_at)
                  const timeStr = updatedDate.toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })

                  return (
                    <div
                      key={note.id}
                      onClick={() => handleSelectNote(note)}
                      className={`group relative p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border/40 hover:border-border hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4
                          className={`text-xs font-semibold truncate ${
                            isSelected ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {note.title || "Untitled Note"}
                        </h4>

                        <button
                          onClick={(e) => handleTogglePin(e, note)}
                          className={`p-1 rounded-md transition-colors ${
                            note.is_pinned
                              ? "text-primary bg-primary/10"
                              : "text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground hover:bg-muted"
                          }`}
                          title={note.is_pinned ? "Unpin note" : "Pin note to top"}
                        >
                          <Pin size={12} className={note.is_pinned ? "fill-current" : ""} />
                        </button>
                      </div>

                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed mb-2 font-sans">
                        {preview}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                        <div className="flex items-center gap-1.5 truncate max-w-[75%]">
                          {note.source_type && note.source_type !== "general" && (
                            <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                              {note.source_type === "journey" || note.source_type === "daily_journey"
                                ? "Daily Journey"
                                : note.source_type === "course"
                                ? "Course"
                                : note.source_type === "learning_path"
                                ? "Learning Path"
                                : note.source_type}
                            </span>
                          )}
                          {note.images && note.images.length > 0 && (
                            <span className="shrink-0 flex items-center gap-0.5 text-primary/80">
                              <ImageIcon size={10} />
                              <span>{note.images.length}</span>
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

          {/* RIGHT / MAIN EDITOR AREA */}
          <div
            className={`flex-1 flex flex-col h-full bg-background min-w-0 overflow-hidden ${
              mobileView === "list" ? "hidden lg:flex" : "flex"
            }`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            {selectedNote ? (
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Editor Header Bar */}
                <div className="px-6 py-2.5 border-b border-border/40 bg-card/10 flex items-center justify-between shrink-0 gap-4 flex-wrap">
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
                        {selectedNote.source_type === "journey" || selectedNote.source_type === "daily_journey"
                          ? "Daily Journey"
                          : selectedNote.source_type === "course"
                          ? "Course"
                          : selectedNote.source_type === "learning_path"
                          ? "Learning Path"
                          : "General Note"}
                      </span>

                      {/* Structured Journey Breadcrumb: Daily Journey -> Topic -> Activity */}
                      {(selectedNote.source_type === "journey" || selectedNote.source_type === "daily_journey") ? (
                        <span className="text-foreground font-medium text-[11px] flex items-center gap-1 flex-wrap">
                          {selectedNote.source_day && (
                            <span className="text-muted-foreground">Day {selectedNote.source_day}</span>
                          )}
                          {selectedNote.source_module_title && (
                            <>
                              <span className="text-muted-foreground">→</span>
                              <span className="text-muted-foreground">{selectedNote.source_module_title}</span>
                            </>
                          )}
                          {selectedNote.source_title && (
                            <>
                              <span className="text-primary font-semibold">→</span>
                              <span className="text-primary font-semibold">{selectedNote.source_title}</span>
                            </>
                          )}
                        </span>
                      ) : selectedNote.source_title ? (
                        <span className="truncate max-w-[220px] text-foreground font-medium text-[11px]">
                          → {selectedNote.source_title}
                        </span>
                      ) : null}

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

                  {/* Right Actions, View Mode & Status */}
                  <div className="flex items-center gap-3">
                    {/* Write / Preview / Split Toggle */}
                    <div className="flex items-center rounded-lg border border-border/40 bg-muted/40 p-0.5 text-xs">
                      <button
                        onClick={() => setViewMode("write")}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
                          viewMode === "write"
                            ? "bg-card text-foreground font-medium shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        title="Write Markdown"
                      >
                        <Edit3 size={12} />
                        <span className="hidden sm:inline">Write</span>
                      </button>
                      <button
                        onClick={() => setViewMode("preview")}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
                          viewMode === "preview"
                            ? "bg-card text-foreground font-medium shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        title="Live Preview"
                      >
                        <Eye size={12} />
                        <span className="hidden sm:inline">Preview</span>
                      </button>
                      <button
                        onClick={() => setViewMode("split")}
                        className={`hidden md:flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
                          viewMode === "split"
                            ? "bg-card text-foreground font-medium shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        title="Split View"
                      >
                        <Columns size={12} />
                        <span>Split</span>
                      </button>
                    </div>

                    {/* Auto-save Status Indicator */}
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                      {saveStatus === "saving" && (
                        <>
                          <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                          <span className="hidden sm:inline">Saving...</span>
                        </>
                      )}
                      {saveStatus === "unsaved" && (
                        <>
                          <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                          <span className="hidden sm:inline">Unsaved</span>
                        </>
                      )}
                      {saveStatus === "saved" && (
                        <>
                          <Check size={12} className="text-green-500" />
                          <span className="hidden sm:inline">Saved</span>
                        </>
                      )}
                      {saveStatus === "error" && (
                        <>
                          <AlertCircle size={12} className="text-destructive" />
                          <span className="text-destructive hidden sm:inline">Save error</span>
                        </>
                      )}
                    </span>

                    {/* Pin button */}
                    <button
                      onClick={(e) => handleTogglePin(e, selectedNote)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        selectedNote.is_pinned
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-border/40 text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                      title={selectedNote.is_pinned ? "Unpin Note" : "Pin Note"}
                    >
                      <Pin size={13} className={selectedNote.is_pinned ? "fill-current" : ""} />
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => setDeleteConfirmOpen(true)}
                      className="p-1.5 rounded-lg border border-border/40 text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10 transition-colors"
                      title="Delete Note"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Editor Top Bar: Title & Tags */}
                <div className="px-6 pt-5 pb-3 space-y-3 shrink-0 max-w-4xl mx-auto w-full">
                  {/* Note Title Input */}
                  <input
                    ref={titleInputRef}
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
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-muted/60 text-[11px] font-medium text-foreground group"
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
                      className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none py-0.5"
                    />
                  </div>

                  {/* Rich Markdown Formatting Toolbar */}
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-card border border-border/40 shrink-0 text-muted-foreground overflow-x-auto no-scrollbar">
                    <button
                      onClick={() => applyFormatting("**", "**", "bold text")}
                      className="p-1.5 rounded-lg hover:text-foreground hover:bg-muted transition-colors"
                      title="Bold (**text**)"
                    >
                      <Bold size={13} />
                    </button>
                    <button
                      onClick={() => applyFormatting("*", "*", "italic text")}
                      className="p-1.5 rounded-lg hover:text-foreground hover:bg-muted transition-colors"
                      title="Italic (*text*)"
                    >
                      <Italic size={13} />
                    </button>
                    <div className="h-4 w-px bg-border/60 mx-0.5" />
                    <button
                      onClick={() => applyFormatting("# ", "", "Heading 1")}
                      className="p-1.5 rounded-lg hover:text-foreground hover:bg-muted transition-colors font-bold text-xs"
                      title="Heading 1 (#)"
                    >
                      H1
                    </button>
                    <button
                      onClick={() => applyFormatting("## ", "", "Heading 2")}
                      className="p-1.5 rounded-lg hover:text-foreground hover:bg-muted transition-colors font-semibold text-xs"
                      title="Heading 2 (##)"
                    >
                      H2
                    </button>
                    <button
                      onClick={() => applyFormatting("### ", "", "Heading 3")}
                      className="p-1.5 rounded-lg hover:text-foreground hover:bg-muted transition-colors text-xs"
                      title="Heading 3 (###)"
                    >
                      H3
                    </button>
                    <div className="h-4 w-px bg-border/60 mx-0.5" />
                    <button
                      onClick={() => applyFormatting("- ", "", "List item")}
                      className="p-1.5 rounded-lg hover:text-foreground hover:bg-muted transition-colors"
                      title="Bullet List (-)"
                    >
                      <List size={13} />
                    </button>
                    <button
                      onClick={() => applyFormatting("1. ", "", "List item")}
                      className="p-1.5 rounded-lg hover:text-foreground hover:bg-muted transition-colors"
                      title="Numbered List (1.)"
                    >
                      <ListOrdered size={13} />
                    </button>
                    <button
                      onClick={() => applyFormatting("- [ ] ", "", "Task")}
                      className="p-1.5 rounded-lg hover:text-foreground hover:bg-muted transition-colors"
                      title="Checklist (- [ ])"
                    >
                      <CheckSquare size={13} />
                    </button>
                    <div className="h-4 w-px bg-border/60 mx-0.5" />
                    <button
                      onClick={() => applyFormatting("> ", "", "Quote")}
                      className="p-1.5 rounded-lg hover:text-foreground hover:bg-muted transition-colors"
                      title="Quote (>)"
                    >
                      <Quote size={13} />
                    </button>
                    <button
                      onClick={() => applyFormatting("`", "`", "code")}
                      className="p-1.5 rounded-lg hover:text-foreground hover:bg-muted transition-colors"
                      title="Inline Code (`code`)"
                    >
                      <Code size={13} />
                    </button>
                    <button
                      onClick={() => applyFormatting("```javascript\n", "\n```", "// code snippet")}
                      className="p-1.5 rounded-lg hover:text-foreground hover:bg-muted transition-colors text-xs font-mono font-bold"
                      title="Code Block (```)"
                    >
                      {"{ }"}
                    </button>
                    <button
                      onClick={() => applyFormatting("[", "](https://)", "link text")}
                      className="p-1.5 rounded-lg hover:text-foreground hover:bg-muted transition-colors"
                      title="Insert Link ([text](url))"
                    >
                      <LinkIcon size={13} />
                    </button>
                    <button
                      onClick={() => applyFormatting("\n---\n", "", "")}
                      className="p-1.5 rounded-lg hover:text-foreground hover:bg-muted transition-colors"
                      title="Divider (---)"
                    >
                      <Minus size={13} />
                    </button>

                    <div className="h-4 w-px bg-border/60 mx-0.5" />

                    {/* Attach Photo / Image Toolbar Button */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-medium transition-colors"
                      title="Attach Image / Photo"
                    >
                      <ImageIcon size={13} />
                      <span>Attach Image</span>
                    </button>
                  </div>
                </div>

                {/* Main Content Area (Write / Preview / Split) */}
                <div className="flex-1 overflow-y-auto px-6 py-2 max-w-4xl mx-auto w-full">
                  {viewMode === "write" && (
                    <div className="space-y-4">
                      <textarea
                        ref={contentTextAreaRef}
                        placeholder="Write in Markdown or plain text... Tip: Drag & drop images or paste from clipboard."
                        value={editorContent}
                        onChange={(e) => handleContentChange(e.target.value)}
                        onPaste={handlePaste}
                        className="w-full min-h-[400px] bg-transparent border-none text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/40 focus:outline-none resize-none font-sans"
                      />
                    </div>
                  )}

                  {viewMode === "preview" && (
                    <div className="min-h-[400px] py-2">
                      <MarkdownRenderer
                        content={editorContent}
                        onToggleChecklist={(updated) => {
                          setEditorContent(updated)
                          triggerAutoSave(editorTitle, updated, editorTags, editorImages)
                        }}
                        onPreviewImage={(url) => setPreviewModalImage(url)}
                      />
                    </div>
                  )}

                  {viewMode === "split" && (
                    <div className="grid grid-cols-2 gap-6 min-h-[400px]">
                      <div className="border-r border-border/40 pr-4">
                        <textarea
                          ref={contentTextAreaRef}
                          placeholder="Write markdown here..."
                          value={editorContent}
                          onChange={(e) => handleContentChange(e.target.value)}
                          onPaste={handlePaste}
                          className="w-full h-full min-h-[400px] bg-transparent border-none text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/40 focus:outline-none resize-none font-mono text-xs"
                        />
                      </div>
                      <div className="overflow-y-auto pl-2">
                        <MarkdownRenderer
                          content={editorContent}
                          onToggleChecklist={(updated) => {
                            setEditorContent(updated)
                            triggerAutoSave(editorTitle, updated, editorTags, editorImages)
                          }}
                          onPreviewImage={(url) => setPreviewModalImage(url)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Attached Images Gallery & Thumbnail Management */}
                  {editorImages.length > 0 && (
                    <div className="pt-6 pb-4 border-t border-border/30 space-y-2.5">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-semibold uppercase tracking-wider text-[10px] text-foreground flex items-center gap-1.5">
                          <ImageIcon size={12} className="text-primary" />
                          Attached Photos & Media ({editorImages.length})
                        </span>
                        <span className="text-[11px]">Click image to enlarge</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {editorImages.map((imgUrl, idx) => (
                          <div
                            key={idx}
                            className="group relative rounded-xl border border-border/60 bg-muted/20 overflow-hidden shadow-xs hover:border-primary/50 transition-all"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imgUrl}
                              alt={`Attachment ${idx + 1}`}
                              className="h-28 w-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300"
                              onClick={() => setPreviewModalImage(imgUrl)}
                            />

                            {/* Floating Action Overlay */}
                            <div className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none group-hover:pointer-events-auto">
                              <button
                                onClick={() => setPreviewModalImage(imgUrl)}
                                className="p-1.5 rounded-lg bg-card/90 text-foreground hover:bg-card shadow-sm"
                                title="Enlarge"
                              >
                                <Maximize2 size={13} />
                              </button>
                              <button
                                onClick={() => handleRemoveImage(imgUrl)}
                                className="p-1.5 rounded-lg bg-destructive/90 text-destructive-foreground hover:bg-destructive shadow-sm"
                                title="Remove image"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Empty Selection State with Clear Create Action */
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="p-4 rounded-3xl bg-muted/30 text-muted-foreground">
                  <FileText size={36} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-serif font-normal text-foreground">No note selected</h3>
                  <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                    Select a note from the sidebar or click below to start recording your learning notes.
                  </p>
                </div>
                <button
                  onClick={() => handleCreateNote()}
                  className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-medium text-primary-foreground shadow-sm shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
                >
                  <Plus size={15} />
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

/**
 * Robust Rich Markdown Renderer Supporting:
 * Headings (#, ##, ###), Bold (**), Italic (*), Lists, Checklists (- [ ]),
 * Code Blocks (```) with copy button, Quotes (>), Links, and Images.
 */
function MarkdownRenderer({
  content,
  onToggleChecklist,
  onPreviewImage,
}: {
  content: string
  onToggleChecklist: (newContent: string) => void
  onPreviewImage: (url: string) => void
}) {
  if (!content || !content.trim()) {
    return (
      <div className="py-12 text-center text-xs text-muted-foreground italic">
        Empty note preview. Write some markdown content to see it rendered here.
      </div>
    )
  }

  const lines = content.split("\n")
  const elements: React.ReactNode[] = []

  let inCodeBlock = false
  let codeBuffer: string[] = []
  let codeLanguage = ""

  lines.forEach((line, index) => {
    // Code block fences
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        // End code block
        const fullCode = codeBuffer.join("\n")
        elements.push(
          <CodeBlockView key={`code-${index}`} code={fullCode} language={codeLanguage} />
        )
        codeBuffer = []
        codeLanguage = ""
        inCodeBlock = false
        return
      } else {
        // Start code block
        inCodeBlock = true
        codeLanguage = line.trim().replace(/^```/, "").trim()
        codeBuffer = []
        return
      }
    }

    if (inCodeBlock) {
      codeBuffer.push(line)
      return
    }

    // Horizontal Rule
    if (line.trim() === "---" || line.trim() === "***" || line.trim() === "___") {
      elements.push(<hr key={`hr-${index}`} className="my-4 border-border/40" />)
      return
    }

    // Headings
    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={`h1-${index}`} className="text-2xl font-serif font-bold text-foreground mt-4 mb-2">
          {renderInline(line.substring(2))}
        </h1>
      )
      return
    }
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={`h2-${index}`} className="text-xl font-serif font-semibold text-foreground mt-3 mb-1.5">
          {renderInline(line.substring(3))}
        </h2>
      )
      return
    }
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={`h3-${index}`} className="text-base font-serif font-medium text-foreground mt-2.5 mb-1">
          {renderInline(line.substring(4))}
        </h3>
      )
      return
    }

    // Blockquote
    if (line.startsWith("> ")) {
      elements.push(
        <blockquote
          key={`quote-${index}`}
          className="border-l-4 border-primary/40 bg-muted/20 pl-4 py-1.5 my-2 text-xs italic text-muted-foreground rounded-r-lg"
        >
          {renderInline(line.substring(2))}
        </blockquote>
      )
      return
    }

    // Interactive Checklist: - [ ] or - [x]
    const taskMatch = line.match(/^(\s*)-\s*\[([ xX])\]\s*(.*)$/)
    if (taskMatch) {
      const isChecked = taskMatch[2].toLowerCase() === "x"
      const taskText = taskMatch[3]

      const toggleCheck = () => {
        const newLines = [...lines]
        const replacement = isChecked ? `- [ ] ${taskText}` : `- [x] ${taskText}`
        newLines[index] = replacement
        onToggleChecklist(newLines.join("\n"))
      }

      elements.push(
        <div
          key={`task-${index}`}
          onClick={toggleCheck}
          className="flex items-center gap-2.5 py-1 text-xs cursor-pointer group hover:text-foreground"
        >
          {isChecked ? (
            <CheckSquare size={14} className="text-primary shrink-0" />
          ) : (
            <Square size={14} className="text-muted-foreground group-hover:text-foreground shrink-0" />
          )}
          <span className={isChecked ? "line-through text-muted-foreground" : "text-foreground"}>
            {renderInline(taskText)}
          </span>
        </div>
      )
      return
    }

    // Bullet List
    if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      const text = line.trim().substring(2)
      elements.push(
        <li key={`li-${index}`} className="ml-4 list-disc text-xs text-foreground py-0.5 leading-relaxed">
          {renderInline(text)}
        </li>
      )
      return
    }

    // Numbered List
    const numMatch = line.trim().match(/^(\d+)\.\s+(.*)$/)
    if (numMatch) {
      elements.push(
        <li key={`num-${index}`} className="ml-4 list-decimal text-xs text-foreground py-0.5 leading-relaxed">
          {renderInline(numMatch[2])}
        </li>
      )
      return
    }

    // Embedded Markdown Image: ![alt](url)
    const imgMatch = line.trim().match(/^!\[(.*?)\]\((.*?)\)$/)
    if (imgMatch) {
      const alt = imgMatch[1] || "Image"
      const src = imgMatch[2]
      elements.push(
        <div key={`img-${index}`} className="my-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            onClick={() => onPreviewImage(src)}
            className="max-h-80 max-w-full rounded-xl border border-border/60 object-contain cursor-pointer hover:opacity-95 shadow-sm"
          />
          {alt && <p className="text-[10px] text-muted-foreground mt-1 font-mono">{alt}</p>}
        </div>
      )
      return
    }

    // Empty line
    if (!line.trim()) {
      elements.push(<div key={`br-${index}`} className="h-2" />)
      return
    }

    // Regular Paragraph
    elements.push(
      <p key={`p-${index}`} className="text-xs leading-relaxed text-foreground py-0.5">
        {renderInline(line)}
      </p>
    )
  })

  return <div className="space-y-1 font-sans">{elements}</div>
}

/**
 * Format inline markdown tokens: bold, italic, inline code, links
 */
function renderInline(text: string): React.ReactNode {
  // Regex to split by inline markdown elements
  // Matches: `code`, **bold**, *italic*, [link](url)
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g
  const parts = text.split(regex)

  return parts.map((part, i) => {
    if (!part) return null

    // Inline Code
    if (part.startsWith("`") && part.endsWith("`") && part.length > 1) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded-md bg-muted font-mono text-[11px] text-primary border border-border/40"
        >
          {part.slice(1, -1)}
        </code>
      )
    }

    // Bold
    if (part.startsWith("**") && part.endsWith("**") && part.length > 3) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      )
    }

    // Italic
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <em key={i} className="italic">
          {part.slice(1, -1)}
        </em>
      )
    }

    // Link
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/)
    if (linkMatch) {
      return (
        <a
          key={i}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline hover:opacity-80 inline-flex items-center gap-0.5"
        >
          <span>{linkMatch[1]}</span>
          <ExternalLink size={10} />
        </a>
      )
    }

    return part
  })
}

/**
 * Syntax styled code block with copy button
 */
function CodeBlockView({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="my-3 rounded-xl border border-border/60 bg-muted/40 overflow-hidden font-mono text-xs shadow-xs">
      <div className="flex items-center justify-between px-3 py-1.5 bg-card border-b border-border/40 text-[10px] text-muted-foreground">
        <span className="uppercase font-semibold tracking-wider">{language || "CODE"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-[11px] leading-relaxed text-foreground">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function escapeRegex(string: string) {
  return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, "\\$&")
}
