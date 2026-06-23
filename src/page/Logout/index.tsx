import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getLoginNext, redirectHref } from "../../auth/loginRedirect";
import { useAuth } from "../../auth/useAuth";
import { Spinner } from "@aottg2/ui";
import { AuthShell } from "../Auth/AuthShell";

export default function Logout() {
  const [searchParams] = useSearchParams();
  const { logout } = useAuth();

  useEffect(() => {
    let active = true;

    logout()
      .catch(() => {
        // logout already clears local credentials even when the network fails
      })
      .finally(() => {
        if (!active) return;
        window.location.replace(redirectHref(getLoginNext(searchParams.get("next"))));
      });

    return () => {
      active = false;
    };
  }, [logout, searchParams]);

  return (
    <AuthShell title="Signing out..." subtitle="Ending your AoTTG2 session.">
      <Spinner className="mx-auto mt-8" label="Signing out" />
    </AuthShell>
  );
}
