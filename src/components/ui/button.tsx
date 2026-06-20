import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import BrushPrimaryImage from "../../assets/images/brush.webp";
import BrushSecondaryImage from "../../assets/images/brush-secondary.webp";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none text-sm font-medium uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background/70 shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        account: "border border-white/20 bg-white/10 text-white shadow-sm hover:bg-white/15",
        oauthDiscord: "bg-secondary text-white shadow-sm hover:bg-secondary/90",
        oauthGoogle: "bg-white text-black shadow-sm hover:bg-white/90",
        brush: "account-brush-button font-primary text-xl text-white shadow-none",
        brushSecondary: "account-brush-button font-primary text-xl text-white shadow-none",
        brushGoogle: "account-brush-button account-brush-button-google font-primary text-xl text-white shadow-none",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-8",
        icon: "h-10 w-10",
        account: "h-12 w-full px-4 py-3 text-base normal-case tracking-normal",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const brushImages = {
  brush: BrushPrimaryImage,
  brushSecondary: BrushSecondaryImage,
  brushGoogle: BrushPrimaryImage,
} as const;

let brushInstanceCount = 0;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, style, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const brushImage = variant ? brushImages[variant as keyof typeof brushImages] : undefined;
    const brushIndexRef = React.useRef<number>();

    if (brushImage && brushIndexRef.current == null) {
      brushIndexRef.current = brushInstanceCount % 8;
      brushInstanceCount += 1;
    }

    const brushStyle = brushImage
      ? ({
          "--button-brush-image": `url(${brushImage})`,
          "--button-brush-delay": `${(brushIndexRef.current ?? 0) * 45}ms`,
        } as React.CSSProperties)
      : undefined;

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        style={{ ...brushStyle, ...style }}
        {...props}
      >
        {brushImage && !asChild ? (
          <span className="account-brush-button-content">
            {children}
          </span>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button };
