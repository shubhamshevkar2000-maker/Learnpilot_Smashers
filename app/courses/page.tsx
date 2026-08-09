// @ts-nocheck
"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ExternalLink, Sparkles, BookMarked, Search, ArrowRight, Compass
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { createClient } from "@/lib/supabase/client"
import type { LearnerProfile } from "@/types/database.types"
import { RESOURCE_REGISTRY, type ExternalResource } from "@/lib/data/resource-registry"
import { DOMAIN_REGISTRY } from "@/lib/generator/curriculum-registry"
import { AppShell } from "@/components/layout/app-shell"
import { PageHeader } from "@/components/layout/page-header"



const DOMAIN_FILTERS = [
  { id: "all", label: "All" },
  { id: "python", label: "Python" },
  { id: "java", label: "Java" },
  { id: "dsa", label: "DSA" },
  { id: "frontend", label: "Frontend" },
  { id: "backend", label: "Backend" },
  { id: "data science", label: "Data Science" },
  { id: "ml", label: "AI / ML" },
  { id: "databases", label: "Databases" },
  { id: "cloud", label: "Cloud" },
]

export default function CoursesPage() {
  return (
    <ProtectedRoute>
      <CoursesContent />
    </ProtectedRoute>
  )
}

function CoursesContent() {
  const router = useRouter()
  const { user, isConfigured, signOut } = useAuth()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<LearnerProfile | null>(null)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [activeDomainFilter, setActiveDomainFilter] = useState("all")
  
  const [recommendedCourses, setRecommendedCourses] = useState<ExternalResource[]>([])

  const loadData = useCallback(async () => {
    if (!user || !isConfigured) {
      if (!isConfigured) router.replace("/login")
      return
    }

    try {
      const { data: profData } = await supabase
        .from("learner_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle()

      if (profData && profData.onboarding_completed) {
        setProfile(profData)
        
        const lowerGoal = (profData.learning_goal || "").toLowerCase()
        const matchedDomainIds = new Set<string>()
        
        // Match explicit domains
        for (const config of DOMAIN_REGISTRY) {
          for (const alias of config.aliases) {
            if (lowerGoal.includes(alias) || alias.includes(lowerGoal)) {
              matchedDomainIds.add(config.id)
            }
          }
        }
        
        // Add fallback matching if no exact domain match
        let fallbackMatched = false
        const recs: ExternalResource[] = []
        
        for (const res of RESOURCE_REGISTRY) {
          if (matchedDomainIds.has(res.domain)) {
            recs.push(res)
          } else if (lowerGoal.includes(res.domain) || res.domain.includes(lowerGoal) || res.skills.some(s => lowerGoal.includes(s.toLowerCase()))) {
            recs.push(res)
            fallbackMatched = true
          }
        }
        
        // If absolutely zero matches based on domain/skills, fallback to the most generic matches (first 3 courses)
        if (recs.length === 0 && profData.learning_goal) {
          recs.push(...RESOURCE_REGISTRY.slice(0, 3))
        }
        
        setRecommendedCourses(recs.slice(0, 6)) // Top 6 recommended
      } else {
        router.replace("/onboarding")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [user, isConfigured, supabase, router])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleNavClick = (item) => {
    if (item.href && item.href !== "#") router.push(item.href)
  }
  
  const filteredCatalog = useMemo(() => {
    return RESOURCE_REGISTRY.filter(res => {
      // Domain filter
      if (activeDomainFilter !== "all") {
        if (activeDomainFilter === "data science") {
           if (!["ml", "python"].includes(res.domain)) return false
        } else if (res.domain !== activeDomainFilter) {
          return false
        }
      }
      
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesTitle = res.title.toLowerCase().includes(query)
        const matchesProvider = res.provider.toLowerCase().includes(query)
        const matchesSkill = res.skills.some(s => s.toLowerCase().includes(query))
        if (!matchesTitle && !matchesProvider && !matchesSkill) return false
      }
      
      return true
    })
  }, [searchQuery, activeDomainFilter])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
        </div>
      </div>
    )
  }

  const displayName = profile?.display_name || user?.user_metadata?.full_name || "Learner"

  return (
    <AppShell maxWidth="1100px">
      <div className="space-y-8">
        <PageHeader 
          title="COURSE LIBRARY" 
          description="Explore real courses and learning resources across technology domains." 
        />
        
        {/* Global Search and Filter */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input
                  type="text"
                  placeholder="Search by course, skill or provider..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-border/40 bg-card/30 pl-10 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground mr-2 shrink-0">DOMAIN</span>
              {DOMAIN_FILTERS.map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setActiveDomainFilter(filter.id)}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${activeDomainFilter === filter.id ? 'bg-foreground text-background' : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/40'}`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </section>
          
          {/* Recommendations (Only if goal is set, otherwise prompt to set one) */}
          <section className="space-y-6 pt-4 border-t border-border/40">
            <div className="flex items-center gap-2 pb-2">
              <Sparkles className="text-primary" size={18} />
              <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">RECOMMENDED FOR YOUR ROADMAP</h2>
            </div>
            
            {!profile?.learning_goal ? (
              <div className="rounded-xl border border-border/40 bg-card/30 p-6 flex flex-col items-center justify-center text-center space-y-3">
                <Compass className="text-muted-foreground" size={32} />
                <div>
                  <p className="text-sm font-medium text-foreground">No Goal Set</p>
                  <p className="text-xs text-muted-foreground mt-1">Set a learning goal in Settings to receive personalized recommendations.</p>
                </div>
                <Link href="/settings" className="mt-2 text-xs font-medium text-primary hover:underline">Go to Settings</Link>
              </div>
            ) : recommendedCourses.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">We couldn't find exact matches for "{profile.learning_goal}". Try generalizing your goal or browsing the global catalog.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recommendedCourses.map(res => (
                  <a key={`rec-${res.id}`} href={res.url} target="_blank" rel="noopener noreferrer" className="flex flex-col group rounded-xl border border-primary/20 bg-primary/5 p-5 transition-all hover:border-primary/40 hover:bg-primary/10 hover:-translate-y-1 hover:shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">{res.type}</span>
                      <ExternalLink size={14} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                    </div>
                    <h3 className="font-serif text-lg mb-1 text-foreground leading-tight">{res.title}</h3>
                    <p className="text-xs font-medium text-muted-foreground mb-3">{res.provider}</p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {res.skills.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="text-[9px] px-1.5 py-0.5 bg-background border border-border/40 rounded text-muted-foreground">{skill}</span>
                      ))}
                      {res.skills.length > 3 && <span className="text-[9px] px-1.5 py-0.5 bg-background border border-border/40 rounded text-muted-foreground">+{res.skills.length - 3}</span>}
                    </div>
                    
                    <div className="mt-auto pt-4 flex items-center justify-between text-xs text-muted-foreground font-medium border-t border-primary/10">
                      <span className="capitalize">{res.level}</span>
                      <span className="group-hover:text-primary transition-colors flex items-center gap-1">Open Resource <ArrowRight size={12} /></span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </section>

          {/* Global Catalog */}
          <section className="space-y-6 pt-8 border-t border-border/40">
            <div className="flex items-center gap-2 pb-2">
              <BookMarked className="text-muted-foreground" size={18} />
              <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">EXPLORE ALL COURSES</h2>
            </div>
            
            {filteredCatalog.length === 0 ? (
               <div className="py-12 text-center text-sm text-muted-foreground border border-dashed border-border/40 rounded-xl">
                 No courses found matching your filters.
               </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCatalog.map(res => (
                  <a key={res.id} href={res.url} target="_blank" rel="noopener noreferrer" className="flex flex-col group rounded-xl border border-border/40 bg-card/30 p-5 transition-all hover:border-border hover:bg-muted/30">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-2 items-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground border border-border/40 px-2 py-0.5 rounded">{res.domain}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{res.type}</span>
                      </div>
                      <ExternalLink size={14} className="text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                    </div>
                    <h3 className="font-serif text-base mb-1 text-foreground leading-tight group-hover:text-primary transition-colors">{res.title}</h3>
                    <p className="text-[11px] text-muted-foreground mb-3">{res.provider}</p>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mb-4 leading-relaxed">{res.description}</p>
                    
                    <div className="mt-auto pt-4 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/40">
                      <span className="capitalize">{res.level}</span>
                      <span className="group-hover:text-primary transition-colors flex items-center gap-1 font-medium">Open Course <ArrowRight size={11} /></span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </section>
          
      </div>
    </AppShell>
  )
}
