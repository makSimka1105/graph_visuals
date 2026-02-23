"use client";

import * as React from "react";
import {
  Tooltip as TooltipRoot,
  TooltipContent as TooltipContentPrimitive,
  TooltipPortal,
  TooltipProvider as TooltipProviderPrimitive,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipContentPrimitive>,
  React.ComponentPropsWithoutRef<typeof TooltipContentPrimitive>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPortal>
    <TooltipContentPrimitive
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 overflow-hidden rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-200 shadow-xl",
        "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        className
      )}
      {...props}
    />
  </TooltipPortal>
));
TooltipContent.displayName = "TooltipContent";

function TooltipProvider({ children, delayDuration = 400, ...props }: React.ComponentProps<typeof TooltipProviderPrimitive>) {
  return (
    <TooltipProviderPrimitive delayDuration={delayDuration} {...props}>
      {children}
    </TooltipProviderPrimitive>
  );
}

export { TooltipRoot as Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
