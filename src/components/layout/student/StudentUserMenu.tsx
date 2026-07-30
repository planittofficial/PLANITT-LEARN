"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, ShoppingBag, User, ShieldAlert } from "lucide-react";

import { Avatar } from "@/components/ui/Avatar";
import { ROUTES } from "@/constants/routes";
import { alvestCheckoutUrl } from "@/constants/urls";
import { cn } from "@/lib/utils";

type StudentUserMenuProps = {
  name: string;
  email?: string;
  isAdmin?: boolean;
  onLogout: () => void;
};

export function StudentUserMenu({ name, email, isAdmin, onLogout }: StudentUserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const displayName = name || email || "Learner";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-lg py-1 pl-1 pr-2 outline-none transition hover:bg-overlay-hover focus-visible:ring-2 focus-visible:ring-brand/30",
          open && "bg-overlay-hover",
        )}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Avatar name={displayName} size="sm" />
        <ChevronDown
          className={cn(
            "hidden h-3.5 w-3.5 text-textMuted transition sm:block",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-borderSubtle bg-surface shadow-theme"
        >
          <div className="border-b border-borderSubtle px-4 py-3">
            <p className="truncate text-sm font-medium text-textPrimary">{displayName}</p>
            {email ? (
              <p className="truncate text-xs text-textMuted">{email}</p>
            ) : null}
          </div>
          <div className="p-1.5">
            {isAdmin ? (
              <Link
                href={ROUTES.ADMIN.HOME}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-brand font-semibold transition hover:bg-overlay-hover"
              >
                <ShieldAlert className="h-4 w-4 shrink-0 text-brand" />
                Admin console
              </Link>
            ) : null}
            <Link
              href={ROUTES.STUDENT.PROFILE}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-textSecondary transition hover:bg-overlay-hover hover:text-textPrimary"
            >
              <User className="h-4 w-4 shrink-0" />
              Profile
            </Link>
            <a
              href={alvestCheckoutUrl()}
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-textSecondary transition hover:bg-overlay-hover hover:text-textPrimary"
            >
              <ShoppingBag className="h-4 w-4 shrink-0" />
              Buy courses
            </a>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onLogout();
                router.push(ROUTES.STUDENT.LOGIN);
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-rose-500 transition hover:bg-rose-500/10"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Log out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
