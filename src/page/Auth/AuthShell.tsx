import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Card, CardContent, CardDescription, CardTitle } from "../../components/ui/card";
import ContainerTexture from "../../assets/images/bg-light.webp";
import { cn } from "../../lib/utils";

interface AuthShellProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  maxWidthClass?: string;
  cardClassName?: string;
}

export function AuthShell({
  title,
  subtitle,
  children,
  maxWidthClass = "max-w-md",
  cardClassName,
}: AuthShellProps) {
  return (
    <main className="relative z-10 flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-2 text-neutral-950 md:min-h-[calc(100vh-4rem)] md:py-3">
      <div className={cn("mx-auto flex w-full items-center justify-center", maxWidthClass)}>
        <Card
          className={cn(
            "w-full overflow-hidden border-0 bg-white text-neutral-950 shadow-[0_28px_90px_rgba(0,0,0,0.78)] backdrop-blur-sm drop-shadow-2xl",
            cardClassName,
          )}
          style={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.78), rgba(255, 255, 255, 0.84)), url(${ContainerTexture})`,
            backgroundPosition: "center, center",
            backgroundRepeat: "repeat, repeat",
            backgroundSize: "auto, 640px 360px",
          }}
        >
          {title && (
            <div className="bg-primary px-6 py-3">
              <CardTitle className="text-2xl text-white md:text-3xl">
                {title}
              </CardTitle>
            </div>
          )}
          <CardContent className="p-6 text-neutral-950 [&_label]:text-neutral-950 md:p-7">
            {subtitle && (
              <CardDescription className="mb-6 text-base font-semibold text-neutral-700">
                {subtitle}
              </CardDescription>
            )}
            {children}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export function BackHomeLink() {
  return (
    <p className="mt-5 text-center text-sm font-semibold">
      <Link className="text-neutral-700 underline-offset-4 hover:text-neutral-950 hover:underline" to="/">
        ← Back to website
      </Link>
    </p>
  );
}

export function ErrorMessage({ children }: { children: ReactNode }) {
  return (
    <Alert variant="destructive">
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}

export function SuccessMessage({ children }: { children: ReactNode }) {
  return (
    <Alert variant="success">
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}
