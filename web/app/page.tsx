import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Search, AlertCircle, MessageSquare } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="px-6 h-16 flex items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-primary">CampusSync</h1>
        </div>
        <nav className="flex gap-4">
          <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4">
            Login
          </Link>
          <Link href="/signup" className="text-sm font-medium hover:underline underline-offset-4">
            Sign Up
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center mx-auto px-4">
            <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold">
              The Unified Digital Desk for Your Campus
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Everything you need in one place. Notices, Lost & Found, Issue Reporting, and an AI-Powered Help Desk.
            </p>
            <div className="space-x-4">
              <Button asChild size="lg">
                <Link href="/login">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="container space-y-6 py-8 dark:bg-transparent md:py-12 lg:py-24 mx-auto px-4">
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-4">
            <div className="relative overflow-hidden rounded-lg border bg-background p-2 transition-all hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <MessageSquare className="h-12 w-12 text-primary" />
                <div className="space-y-2">
                  <h3 className="font-bold">Notices</h3>
                  <p className="text-sm text-muted-foreground">AI-summarized official announcements.</p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-2 transition-all hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <Search className="h-12 w-12 text-primary" />
                <div className="space-y-2">
                  <h3 className="font-bold">Lost & Found</h3>
                  <p className="text-sm text-muted-foreground">Find lost items with visual matching.</p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-2 transition-all hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <AlertCircle className="h-12 w-12 text-primary" />
                <div className="space-y-2">
                  <h3 className="font-bold">Issues</h3>
                  <p className="text-sm text-muted-foreground">Report and track campus infrastructure issues.</p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-2 transition-all hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <MapPin className="h-12 w-12 text-primary" />
                <div className="space-y-2">
                  <h3 className="font-bold">Campus Map</h3>
                  <p className="text-sm text-muted-foreground">Navigate your campus easily.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-6 md:px-8 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row mx-auto">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built for CampusSync.
          </p>
        </div>
      </footer>
    </div>
  );
}
