import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"

const MoonSunSwitch = React.forwardRef<
    React.ElementRef<typeof SwitchPrimitives.Root>,
    React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
    <SwitchPrimitives.Root
        className={cn(
            "peer inline-flex h-[34px] w-[80px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[var(--background-night)] data-[state=unchecked]:bg-[var(--background-day)]",
            className
        )}
        {...props}
        ref={ref}
    >
      <SwitchPrimitives.Thumb
          className={cn(
              "pointer-events-none block h-[26px] w-[26px] rounded-full shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-[46px] data-[state=unchecked]:translate-x-0.5",
              "before:absolute before:content-[''] before:h-[26px] before:w-[26px] before:rounded-full before:transition-all",
              "before:bg-[var(--sun)] data-[state=checked]:before:bg-[var(--moon)]",
              "after:absolute after:content-[''] after:h-1 after:w-1 after:rounded-full after:bg-[var(--crater)] after:opacity-0 after:transition-opacity data-[state=checked]:after:opacity-100",
              "after:bottom-[65%] after:right-[16%] after:shadow-[inset_0_-1px_2px_var(--moon-shadow),_-8px_7px_0_3px_var(--crater),_2px_10px_0_var(--crater)]"
          )}
      >
        <div className="absolute inset-0 overflow-hidden rounded-full">
          <div
              className={cn(
                  "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[var(--cloud)] shadow-[0_-10px_0_8px_var(--cloud),_-10px_0px_0_8px_var(--cloud),_-45px_4px_0_5px_var(--cloud),_-60px_0px_0_3px_var(--cloud),_-29px_2px_0_8px_var(--cloud)] transition-transform duration-300",
                  "data-[state=checked]:translate-y-[260%] data-[state=unchecked]:translate-y-0"
              )}
          />
          <div
              className={cn(
                  "absolute left-1/4 top-1/4 h-0 w-0 border-[10px] border-transparent border-b-[7px] border-b-[var(--star)] rotate-[35deg] transition-transform duration-300",
                  "data-[state=checked]:scale-[0.3] data-[state=checked]:translate-x-1/2 data-[state=unchecked]:scale-0"
              )}
          />
          <div
              className={cn(
                  "absolute right-1/4 top-1/2 h-0 w-0 border-[10px] border-transparent border-b-[7px] border-b-[var(--star)] rotate-[35deg] transition-transform duration-300",
                  "data-[state=checked]:scale-[0.4] data-[state=checked]:translate-x-[225%] data-[state=checked]:translate-y-[300%] data-[state=unchecked]:scale-0"
              )}
          />
        </div>
      </SwitchPrimitives.Thumb>
    </SwitchPrimitives.Root>
))

MoonSunSwitch.displayName = SwitchPrimitives.Root.displayName

export { MoonSunSwitch }