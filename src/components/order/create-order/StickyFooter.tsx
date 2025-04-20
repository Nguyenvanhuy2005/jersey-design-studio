
import { cn } from "@/lib/utils"

interface StickyFooterProps {
  children: React.ReactNode
  className?: string
}

export function StickyFooter({ children, className }: StickyFooterProps) {
  return (
    <div className={cn(
      "sticky bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t", 
      "mt-6 -mx-6 flex justify-end gap-4",
      className
    )}>
      {children}
    </div>
  )
}
