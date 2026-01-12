import { useState, useEffect } from "react";
import Link from "next/link";
import { useCookies } from "react-cookie";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Geist } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const features = [
  {
    title: "Job Hunting Log",
    description: "Track your job applications, interviews, and hiring journey all in one place.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    gradient: "from-orange-500 to-amber-500",
  },
  {
    title: "Daily Activity Tracker",
    description: "Log your daily work activities and keep track of your productivity and accomplishments.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    title: "Progress Insights",
    description: "Get clear visibility into your career journey with organized logs and easy navigation.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    gradient: "from-violet-500 to-purple-500",
  },
];

// Floating decoration component
const FloatingShape = ({ className, delay = 0, duration = 20 }) => (
  <div
    className={`absolute pointer-events-none ${className}`}
    style={{
      animation: `float ${duration}s ease-in-out infinite`,
      animationDelay: `${delay}s`,
    }}
  />
);

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [cookies] = useCookies(["auth_token"]);

  // Only check auth after client-side hydration to prevent SSR mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const isLoggedIn = mounted && !!cookies.auth_token;

  return (
    <div className={`${geistSans.className} min-h-screen bg-background overflow-hidden`}>
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Animated gradient orbs */}
        <div
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary/30 to-orange-400/20 rounded-full blur-3xl"
          style={{ animation: 'pulse 8s ease-in-out infinite' }}
        />
        <div
          className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-violet-500/20 to-purple-400/10 rounded-full blur-3xl"
          style={{ animation: 'pulse 10s ease-in-out infinite', animationDelay: '2s' }}
        />
        <div
          className="absolute -bottom-20 right-1/3 w-72 h-72 bg-gradient-to-br from-emerald-500/20 to-teal-400/10 rounded-full blur-3xl"
          style={{ animation: 'pulse 12s ease-in-out infinite', animationDelay: '4s' }}
        />

        {/* Floating geometric shapes */}
        <FloatingShape
          className="top-20 left-[10%] w-4 h-4 bg-gradient-to-br from-primary to-orange-400 rounded-full opacity-60"
          delay={0}
          duration={15}
        />
        <FloatingShape
          className="top-40 right-[15%] w-6 h-6 bg-gradient-to-br from-violet-500 to-purple-400 rounded-lg rotate-45 opacity-50"
          delay={2}
          duration={18}
        />
        <FloatingShape
          className="top-[60%] left-[5%] w-3 h-3 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-full opacity-40"
          delay={4}
          duration={20}
        />
        <FloatingShape
          className="top-[30%] right-[8%] w-5 h-5 border-2 border-primary/30 rounded-full"
          delay={1}
          duration={22}
        />
        <FloatingShape
          className="bottom-40 left-[20%] w-4 h-4 border-2 border-violet-500/30 rounded-lg rotate-12"
          delay={3}
          duration={16}
        />
        <FloatingShape
          className="bottom-20 right-[25%] w-3 h-3 bg-gradient-to-br from-primary to-orange-400 rounded-full opacity-50"
          delay={5}
          duration={19}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-orange-400 rounded-lg flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-all duration-300 group-hover:scale-105">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent">
              WorkNote
            </span>
          </Link>
          <Link href={isLoggedIn ? "/dashboard" : "/login"}>
            <Button
              size="sm"
              className="bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 hover:scale-105"
            >
              {isLoggedIn ? "Go to Dashboard" : "Sign In"}
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 md:py-32 lg:py-40">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center relative">
            {/* Glowing badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-sm font-medium text-primary">Now in Beta — Free to Use</span>
            </div>

            {/* Main heading with glow effect */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              Your Work Journey,{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent">
                  Organized
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent blur-2xl opacity-50" aria-hidden="true">
                  Organized
                </span>
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              WorkNote helps you track job applications, log daily activities, and stay on top of your career journey — all in one simple, beautiful app.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
              <Link href={isLoggedIn ? "/dashboard" : "/login"}>
                <Button
                  size="lg"
                  className="group w-full sm:w-auto text-base px-8 py-6 rounded-2xl bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 hover:scale-105"
                >
                  {isLoggedIn ? "Go to Dashboard" : "Get Started Free"}
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="group w-full sm:w-auto text-base px-8 py-6 rounded-2xl border-2 hover:bg-muted/50 transition-all duration-300 hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Watch Demo
              </Button>
            </div>

            {/* Stats or trust indicators */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-muted-foreground animate-in fade-in slide-in-from-bottom-12 duration-700 delay-500">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-background bg-gradient-to-br from-primary/80 to-orange-400/80"
                      style={{ zIndex: 4 - i }}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">Join 1,000+ users</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-amber-500 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="text-sm font-medium">4.9/5 rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 text-sm font-medium mb-4">
              Features
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                Succeed
              </span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Simple yet powerful tools designed to help you stay organized and focused on your career goals.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient border effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />

                <Card className="relative h-full bg-card/80 backdrop-blur-sm border-border/50 rounded-3xl overflow-hidden transition-all duration-500 hover:border-transparent hover:shadow-2xl hover:-translate-y-2">
                  <CardHeader className="p-8">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                      {feature.icon}
                    </div>
                    <CardTitle className="text-2xl font-bold mb-3">{feature.title}</CardTitle>
                    <CardDescription className="text-base text-muted-foreground leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="relative max-w-4xl mx-auto">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-orange-500/20 to-amber-500/20 rounded-[3rem] blur-3xl" />

            <div className="relative bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-xl border border-border/50 rounded-[2rem] p-12 md:p-16 text-center overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-2xl" />
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full blur-2xl" />

              <h2 className="relative text-4xl md:text-5xl font-bold text-foreground mb-6">
                Ready to Take Control of{" "}
                <span className="bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent">
                  Your Journey?
                </span>
              </h2>
              <p className="relative text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
                Join thousands of professionals who use WorkNote to organize their work life and accelerate their careers.
              </p>
              <Link href={isLoggedIn ? "/dashboard" : "/login"}>
                <Button
                  size="lg"
                  className="group relative text-base px-10 py-7 rounded-2xl bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 hover:scale-105"
                >
                  {isLoggedIn ? "Go to Dashboard" : "Start Your Free Account"}
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-border/50 py-12 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-orange-400 rounded-lg flex items-center justify-center shadow-lg shadow-primary/25">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent">
                WorkNote
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2026 WorkNote. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) rotate(5deg);
          }
          50% {
            transform: translateY(-10px) rotate(-3deg);
          }
          75% {
            transform: translateY(-25px) rotate(3deg);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
}
