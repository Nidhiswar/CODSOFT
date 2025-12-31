import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-500 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/50 hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98]",
        destructive:
          "bg-destructive text-white shadow-md hover:bg-destructive/90 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]",
        outline:
          "border-2 border-primary/80 bg-transparent text-primary hover:bg-primary hover:text-white hover:border-primary hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 dark:border-white/60 dark:text-white dark:hover:bg-white/20 dark:hover:border-white",
        secondary:
          "bg-secondary text-secondary-foreground shadow-lg shadow-secondary/30 hover:bg-secondary/90 hover:shadow-xl hover:shadow-secondary/40 hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98]",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:scale-[1.02] active:scale-[0.98]",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80",
        glass: "glass text-foreground hover:bg-white/30 dark:hover:bg-white/10 hover:-translate-y-0.5 hover:shadow-lg",
        hero: "bg-gradient-to-r from-primary to-spice-leaf text-white shadow-lg shadow-primary/40 hover:shadow-2xl hover:shadow-primary/60 hover:-translate-y-1.5 hover:scale-[1.03] hover:brightness-110 active:scale-[0.98]",
        warm: "bg-gradient-to-r from-spice-gold to-spice-cinnamon text-white shadow-lg shadow-spice-gold/30 hover:shadow-2xl hover:shadow-spice-gold/50 hover:-translate-y-1.5 hover:scale-[1.03] hover:brightness-110 active:scale-[0.98]",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-md px-4",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
