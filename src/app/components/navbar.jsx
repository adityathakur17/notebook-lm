"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogOut, LogIn } from "lucide-react"

export default function Navbar() {
  const { data: session, status } = useSession()
  const isLoading = status === "loading"

  return (
    <nav className="flex h-16 items-center justify-between border-b border-border bg-background px-6 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="rounded-lg bg-primary p-2">
          <span className="font-bold text-primary-foreground">NLM</span>
        </div>
        <span className="text-lg font-semibold text-foreground">NotebookLM</span>
      </div>

      <div className="flex items-center gap-4">
        {session ? (
          <>
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-foreground">{session.user?.name}</span>
                <span className="text-xs text-muted-foreground">{session.user?.email}</span>
              </div>
              <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">
                  {session.user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <Button onClick={() => signOut()} variant="outline" size="sm" disabled={isLoading} className="gap-2">
              <LogOut className="size-4" />
              Sign Out
            </Button>
          </>
        ) : (
          <Button onClick={() => signIn()} disabled={isLoading} size="sm" className="gap-2">
            <LogIn className="size-4" />
            {isLoading ? "Loading..." : "Login"}
          </Button>
        )}
      </div>
    </nav>
  )
}
