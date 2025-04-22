"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useState } from "react";

interface TopbarProps {
  className?: string;
}

export function Topbar({ className }: TopbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navigationLinks = [
    { href: "/recommendations", label: "Rekomendacje" },
    { href: "/films", label: "Moje filmy" },
    { href: "/profile", label: "Profil" },
  ];

  const handleLogout = () => {
    // TODO: Implement logout logic
    console.log("Logout clicked");
  };

  return (
    <header className={cn("w-full border-b bg-background", className)}>
      <div className="container flex h-16 items-center justify-between px-4 mx-auto">
        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {navigationLinks.map((link) => (
              <NavigationMenuItem key={link.href}>
                <NavigationMenuLink
                  className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                  href={link.href}
                >
                  {link.label}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Otwórz menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-4 mt-4 mx-4">
              {navigationLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium transition-colors hover:text-accent-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <Button
                variant="ghost"
                className="justify-start p-0 md:hidden"
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
              >
                Wyloguj
              </Button>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Desktop Logout Button */}
        <Button variant="ghost" onClick={handleLogout} className="hidden md:inline-flex">
          Wyloguj
        </Button>
      </div>
    </header>
  );
}
