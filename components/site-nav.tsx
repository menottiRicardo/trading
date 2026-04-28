"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { History, Home } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/new-trade", label: "Nuevo trade" },
  { href: "/history", label: "Historial" },
];

const floatingBtn =
  "fixed top-4 z-40 size-10 rounded-lg hover:bg-accent hover:text-accent-foreground";

export function SiteNav() {
  const pathname = usePathname();
  const isNewTrade = pathname === "/new-trade";

  if (isNewTrade) {
    return (
      <>
        <Button variant="ghost" size="icon" className={`${floatingBtn} left-4`} asChild>
          <Link href="/" aria-label="Inicio">
            <Home className="size-5" />
          </Link>
        </Button>
        <Button variant="ghost" size="icon" className={`${floatingBtn} right-4`} asChild>
          <Link href="/history" aria-label="Historial">
            <History className="size-5" />
          </Link>
        </Button>
      </>
    );
  }

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-12 max-w-xl items-center gap-1 px-4">
        {navLinks.map((link) => (
          <Button key={link.href} variant="ghost" size="sm" asChild>
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </div>
      <Separator />
    </header>
  );
}
