import { Link } from "react-router-dom";
import { Button } from "@aottg2/ui";
import { AuthShell } from "../Auth/AuthShell";

export default function UnityAuthComplete() {
  const params = new URLSearchParams(window.location.search);
  const success = params.get("status") === "success";

  return (
    <AuthShell
      title={success ? "Signed in" : "Sign-in failed"}
      subtitle={success ? "You can return to AOTTG2." : "Return to the game and try again."}
    >
      <Button asChild size="lg" className="w-full">
        <Link to="/">Back to website</Link>
      </Button>
    </AuthShell>
  );
}
