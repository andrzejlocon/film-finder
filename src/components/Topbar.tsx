"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface TopbarProps {
  user?: {
    email: string;
  } | null;
  className?: string;
}

export function Topbar({ user, className }: TopbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navigationLinks = user
    ? [
        { href: "/recommendations", label: "Recommendations" },
        { href: "/watchlist", label: "Watchlist" },
        { href: "/profile", label: "Profile" },
      ]
    : [];

  const handleSignOut = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to sign out");
      }

      window.location.href = "/login";
    } catch (e) {
      console.error("Error during sign out:", e);
      toast.error("Failed to sign out. Please try again.");
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className="container flex h-14 items-center mx-auto">
        <div className="mr-4 flex items-center">
          {/* Mobile Menu */}
          {user && (
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="mr-2 md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] sm:w-[280px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col space-y-4 mt-4">
                  {navigationLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="text-sm font-medium transition-colors hover:text-primary px-2"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                    </a>
                  ))}
                  <Button
                    variant="ghost"
                    className="justify-start px-2"
                    onClick={() => {
                      setIsOpen(false);
                      handleSignOut();
                    }}
                  >
                    Sign out
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          )}

          <a href="/" className="flex items-center space-x-2">
            <span className="font-bold">FilmFinder</span>
          </a>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {user &&
              navigationLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  {link.label}
                </a>
              ))}
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="hidden md:flex items-center space-x-4">
                <span className="text-sm text-muted-foreground" data-testid="user-email">
                  {user.email}
                </span>
                <Button variant="outline" onClick={handleSignOut} data-testid="sign-out-button">
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button variant="outline" asChild>
                <a href="/login">Sign In</a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
