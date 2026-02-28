import { useEffect, useState } from "react";
import Link from "next/link";
import { useCookies } from "react-cookie";
import { Space_Grotesk, Inter } from "next/font/google";

import { Button } from "@/components/ui/button";

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
});

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const features = [
  {
    title: "Daily Log",
    description: "Capture what you did each day, what moved forward, and what needs attention tomorrow.",
    href: "/a/worklogs",
    status: "Live",
  },
  {
    title: "Job Hunting Tracker",
    description: "Track applications, interview stages, and follow-ups with one clean timeline.",
    href: "/a/applications",
    status: "Live",
  },
  {
    title: "My Journal",
    description: "Create video-based journals and keep your notes in one focused timeline.",
    href: "/a/journal",
    status: "Live",
  },
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [cookies] = useCookies(["auth_token"]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLoggedIn = mounted && !!cookies.auth_token;

  return (
    <div
      className={`${bodyFont.className} ${headingFont.variable} min-h-screen bg-[#1e1e1e] text-[#d4d4d4]`}
      style={{
        backgroundImage:
          "radial-gradient(circle at 15% 10%, rgba(86, 156, 214, 0.18), transparent 30%), radial-gradient(circle at 85% 0%, rgba(78, 201, 176, 0.12), transparent 28%)",
      }}
    >
      <header className="sticky top-0 z-30 border-b border-[#3c3c3c] bg-[#1e1e1e]/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#3c3c3c] bg-[#252526] text-xs font-semibold text-[#9cdcfe]">
              mf
            </span>
            <span className="font-[var(--font-heading)] text-xl tracking-tight text-[#e8e8e8]">my future me</span>
          </Link>
          <Link href={isLoggedIn ? "/a/dashboard" : "/login"}>
            <Button className="h-9 rounded-md border border-[#3c3c3c] bg-[#007acc] px-4 text-sm font-medium text-white hover:bg-[#0e639c]">
              {isLoggedIn ? "Dashboard" : "Sign in"}
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pt-20">
        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="inline-flex rounded-md border border-[#3c3c3c] bg-[#252526] px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-[#9cdcfe]">
              Prepare your future
            </p>
            <h1 className="mt-5 max-w-3xl font-[var(--font-heading)] text-5xl leading-[1.05] text-[#f3f3f3] sm:text-6xl">
              Build tomorrow with focused actions today.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#b4b4b4] sm:text-lg">
              my future me is a focused workspace for personal growth: daily logs, career momentum, and my journal.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={isLoggedIn ? "/a/dashboard" : "/login"}>
                <Button className="h-11 w-full rounded-md bg-[#007acc] px-6 text-sm font-semibold text-white hover:bg-[#0e639c] sm:w-auto">
                  {isLoggedIn ? "Continue" : "Get started"}
                </Button>
              </Link>
              <Link href="/a/worklogs">
                <Button
                  variant="outline"
                  className="h-11 w-full rounded-md border-[#3c3c3c] bg-[#252526] px-6 text-sm font-semibold text-[#d4d4d4] hover:bg-[#2d2d30] sm:w-auto"
                >
                  Open daily log
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-[#3c3c3c] bg-[#252526]/90 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#4ec9b0]">Why this app</p>
            <div className="mt-5 space-y-3">
              <div className="rounded-lg border border-[#3c3c3c] bg-[#1f1f1f] px-4 py-3 text-sm text-[#c8c8c8]">Stay consistent with your daily life records</div>
              <div className="rounded-lg border border-[#3c3c3c] bg-[#1f1f1f] px-4 py-3 text-sm text-[#c8c8c8]">See job search progress clearly and early</div>
              <div className="rounded-lg border border-[#3c3c3c] bg-[#1f1f1f] px-4 py-3 text-sm text-[#c8c8c8]">Keep faith-centered reflection in your routine</div>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="font-[var(--font-heading)] text-3xl text-[#f3f3f3] sm:text-4xl">Core features</h2>
            <p className="text-sm text-[#9da1a6]">Minimal tools, meaningful progress.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-xl border border-[#3c3c3c] bg-[#252526] p-5 transition-colors hover:border-[#4d4d4d] hover:bg-[#2a2a2d]"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[#f3f3f3]">{feature.title}</h3>
                  <span className="rounded border border-[#3c3c3c] bg-[#1f1f1f] px-2 py-0.5 text-xs text-[#9da1a6]">
                    {feature.status}
                  </span>
                </div>
                <p className="text-sm leading-6 text-[#b4b4b4]">{feature.description}</p>
                <Link href={feature.href} className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#9cdcfe] hover:text-[#c5e7ff]">
                  {feature.status === "Planned" ? "View roadmap" : "Open feature"}
                  <span aria-hidden="true">{"->"}</span>
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-2xl border border-[#3c3c3c] bg-[#252526]/85 p-8 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ce9178]">Start now</p>
          <h3 className="mt-3 max-w-2xl font-[var(--font-heading)] text-3xl text-[#f3f3f3] sm:text-4xl">
            Your future self grows from what you repeat daily.
          </h3>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href={isLoggedIn ? "/a/dashboard" : "/login"}>
              <Button className="h-11 w-full rounded-md bg-[#007acc] px-6 text-sm font-semibold text-white hover:bg-[#0e639c] sm:w-auto">
                {isLoggedIn ? "Go to dashboard" : "Create your routine"}
              </Button>
            </Link>
            <Link href="/a/applications">
              <Button
                variant="outline"
                className="h-11 w-full rounded-md border-[#3c3c3c] bg-[#1f1f1f] px-6 text-sm font-semibold text-[#d4d4d4] hover:bg-[#2d2d30] sm:w-auto"
              >
                Open job tracker
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#3c3c3c] px-4 py-6 sm:px-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 text-sm text-[#9da1a6] sm:flex-row sm:items-center sm:justify-between">
          <p>my future me</p>
          <p>A minimalist space for intentional growth.</p>
        </div>
      </footer>
    </div>
  );
}
