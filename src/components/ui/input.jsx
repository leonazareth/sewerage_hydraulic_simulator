import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-[31px] w-full rounded-[2px] border border-[rgba(15,27,42,0.16)] bg-white px-2.5 py-1 text-sm text-[#0F1B2A] placeholder:text-[#94A3B0] transition-colors focus-visible:outline-none focus-visible:border-[#5C8A6E] focus-visible:ring-[2px] focus-visible:ring-[rgba(92,138,110,0.14)] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input } 