import { forwardRef, useState, type ComponentPropsWithoutRef } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Input, cn } from "@aottg2/ui";

type PasswordInputProps = Omit<ComponentPropsWithoutRef<typeof Input>, "type">;

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, disabled, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    const label = visible ? "Hide password" : "Show password";
    const Icon = visible ? FiEyeOff : FiEye;

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={visible ? "text" : "password"}
          className={cn("pr-10", className)}
          disabled={disabled}
          {...props}
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          aria-label={label}
          aria-pressed={visible}
          title={label}
          disabled={disabled}
          onClick={() => setVisible((value) => !value)}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";
