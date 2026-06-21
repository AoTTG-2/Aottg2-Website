import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardTitle, cn, toast } from "@aottg2/ui";
import ContainerTexture from "../../assets/images/bg-light.webp";

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
    <main className="relative z-10 flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-2 text-foreground md:min-h-[calc(100vh-4rem)] md:py-3">
      <div className={cn("mx-auto flex w-full items-center justify-center", maxWidthClass)}>
        <Card
          className={cn(
            "w-full overflow-hidden border border-border bg-card text-card-foreground shadow-[0_28px_90px_rgba(0,0,0,0.78)] backdrop-blur-sm drop-shadow-2xl",
            cardClassName,
          )}
          style={{
            backgroundImage: `linear-gradient(hsl(var(--card) / 0.88), hsl(var(--card) / 0.94)), url(${ContainerTexture})`,
            backgroundPosition: "center, center",
            backgroundRepeat: "repeat, repeat",
            backgroundSize: "auto, 640px 360px",
          }}
        >
          {title && (
            <div className="bg-primary px-6 py-3">
              <CardTitle className="text-white">
                {title}
              </CardTitle>
            </div>
          )}
          <CardContent className="p-6 text-card-foreground [&_label]:text-card-foreground md:p-7">
            {subtitle && (
              <CardDescription className="mb-6 text-base font-semibold text-muted-foreground">
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
      <Link className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline" to="/">
        ← Back to website
      </Link>
    </p>
  );
}

export function ErrorMessage({ children }: { children: ReactNode }) {
  useEffect(() => {
    toast.error("Error", { description: children, id: `error-${typeof children === "string" ? children : "message"}` });
  }, [children]);

  return null;
}

export function SuccessMessage({ children }: { children: ReactNode }) {
  useEffect(() => {
    toast.success("Success", { description: children, id: `success-${typeof children === "string" ? children : "message"}` });
  }, [children]);

  return null;
}
