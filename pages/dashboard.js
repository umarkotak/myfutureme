import { useEffect } from "react";
import { useRouter } from "next/router";
import { useCookies } from "react-cookie";

export default function Dashboard() {
  const router = useRouter();
  const [cookies] = useCookies(["auth_token"]);

  useEffect(() => {
    // Redirect to applications page (or login if not authenticated)
    if (!cookies.auth_token) {
      router.replace("/login");
    } else {
      router.replace("/a/dashboard");
    }
  }, [router, cookies.auth_token]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-muted-foreground">Redirecting...</div>
    </div>
  );
}
