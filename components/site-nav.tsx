"use client";

import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
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

const floatingIconBtn =
  "size-10 rounded-lg hover:bg-accent hover:text-accent-foreground";

function NavAuthControls({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Show when="signed-out">
        <div className="flex items-center gap-2">
          <SignInButton>
            <Button variant="outline" size="sm">
              Entrar
            </Button>
          </SignInButton>
          <SignUpButton>
            <Button size="sm">Crear cuenta</Button>
          </SignUpButton>
        </div>
      </Show>
      <Show when="signed-in">
        <UserButton />
      </Show>
    </div>
  );
}

export function SiteNav() {
  const pathname = usePathname();
  const isAuthRoute =
    pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");
  const isNewTrade = pathname === "/new-trade";

  if (isAuthRoute) {
    return null;
  }

  if (isNewTrade) {
    return (
      <>
        <Button variant="ghost" size="icon" className={`${floatingBtn} left-4`} asChild>
          <Link href="/" aria-label="Inicio">
            <Home className="size-5" />
          </Link>
        </Button>
        <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
          <NavAuthControls className="flex items-center" />
          <Button variant="ghost" size="icon" className={floatingIconBtn} asChild>
            <Link href="/history" aria-label="Historial">
              <History className="size-5" />
            </Link>
          </Button>
        </div>
      </>
    );
  }

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-end gap-1 px-4">
        {navLinks.map((link) => (
          <Button key={link.href} variant="ghost" size="sm" asChild>
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
        <NavAuthControls className="ml-2 flex items-center border-l border-border pl-3" />
      </div>
      <Separator />
    </header>
  );
}
