import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "../../lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => {
  const valueCount = Array.isArray((props as any).value)
    ? (props as any).value.length
    : Array.isArray((props as any).defaultValue)
    ? (props as any).defaultValue.length
    : 1

  // Owl thumb styling
  // NOTE: we intentionally keep focus ring for accessibility
  const owlThumbStyle: React.CSSProperties = {
    backgroundImage: "url('/lovable-uploads/5fe3b0cf-7820-4923-864e-c104acbfbfb8.png')",
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center'
  }

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
        <SliderPrimitive.Range className="absolute h-full bg-primary" />
      </SliderPrimitive.Track>
      {Array.from({ length: valueCount }).map((_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          className="block h-6 w-6 rounded-full ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none"
          style={owlThumbStyle}
          aria-label={valueCount > 1 ? `Value ${i + 1}` : 'Value'}
        />
      ))}
    </SliderPrimitive.Root>
  )
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
