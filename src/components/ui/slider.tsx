import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "../../lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => {
  const valueCount = Array.isArray(props.value)
    ? props.value.length
    : Array.isArray(props.defaultValue)
    ? props.defaultValue.length
    : 1

  // Standard thumb styling for better visibility
  const thumbStyle: React.CSSProperties = {
    backgroundColor: '#3b82f6', // Blue color
    border: '3px solid white',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
    cursor: 'pointer'
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
      <SliderPrimitive.Track className="relative h-3 w-full grow overflow-hidden rounded-full bg-gray-200">
        <SliderPrimitive.Range className="absolute h-full bg-blue-500 rounded-full" />
      </SliderPrimitive.Track>
      {Array.from({ length: valueCount }).map((_, i) => (
        
        <SliderPrimitive.Thumb
          key={i}
          className="block h-6 w-6 rounded-full ring-offset-background transition-all duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none"
          style={thumbStyle}
          aria-label={valueCount > 1 ? `Value ${i + 1}` : 'Value'}
        />
      ))}
    </SliderPrimitive.Root>
  )
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
