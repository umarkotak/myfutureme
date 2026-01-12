import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { GoogleLogin } from "@react-oauth/google";
import { useCookies } from "react-cookie";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Geist } from "next/font/google";
import api from "@/lib/api";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export default function Login() {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [, setCookie] = useCookies(["auth_token"]);

  // Check for error in URL params
  const urlError = router.query.error;

  const handleSuccess = async (credentialResponse) => {
    setError(null);
    try {
      // credentialResponse.credential is the JWT (ID token)
      const result = await api.googleLogin(credentialResponse.credential);

      // Store the auth token in cookie (API returns access_token)
      if (result.access_token) {
        setCookie("auth_token", result.access_token, {
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 7 days
          sameSite: "strict",
          secure: process.env.NODE_ENV === "production",
        });
      }

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    }
  };

  const handleError = () => {
    setError("Google Sign-In failed. Please try again.");
  };

  return (
    <div className={`${geistSans.className} min-h-screen bg-background flex items-center justify-center p-4`}>
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="text-center pb-2">
          <Link href="/" className="inline-block mb-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent">
              WorkNote
            </h1>
          </Link>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription className="text-base">
            Sign in to continue to your workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {(error || urlError) && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
              {error || urlError}
            </div>
          )}

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              useOneTap
              theme="outline"
              size="large"
              width="350"
              text="continue_with"
              shape="rectangular"
            />
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-foreground">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
