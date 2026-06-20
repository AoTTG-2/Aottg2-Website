import * as React from "react";
import InputTexture from "../../assets/images/bg-dark.webp";
import { cn } from "../../lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, style, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "account-input-engraved flex h-12 w-full rounded-none border-0 bg-neutral-700 px-4 py-3 text-base font-medium text-white transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-white/68 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        style={{
          backgroundImage: `linear-gradient(rgba(48, 48, 48, 0.74), rgba(38, 38, 38, 0.78)), url(${InputTexture})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          ...style,
        }}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
