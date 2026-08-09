export interface PageHeaderProps {
  eyebrow?: string
  title: string
  description?: string
}

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <header className="space-y-2.5 sm:space-y-3 mb-8 sm:mb-12">
      {eyebrow && (
        <div className="text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.2em] text-primary/80">
          {eyebrow}
        </div>
      )}
      <h1 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-normal tracking-tight text-foreground leading-tight">
        {title}
      </h1>
      {description && (
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
          {description}
        </p>
      )}
    </header>
  )
}
