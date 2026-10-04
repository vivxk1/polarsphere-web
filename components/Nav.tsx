"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/discover", label: "Discover" },
  { href: "/polar-ai", label: "Polar AI" },
  { href: "/expeditions", label: "Expeditions" },
  { href: "/stations", label: "Stations" },
  { href: "/data", label: "Data" },
  { href: "/outreach", label: "Outreach" },
  { href: "/admin/ingest", label: "Ingest" },
];

export default function Nav() {
  const path = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#08131f]/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-ice-500 text-sm font-bold text-white">
            360
          </span>
          <span className="text-sm font-semibold tracking-tight text-ice-50">
            PolarSphere <span className="text-ice-300">360</span>
          </span>
        </Link>

        <nav className="ml-auto flex flex-wrap items-center gap-1 text-[13px]">
          {LINKS.map((l) => {
            const active = l.href === "/" ? path === "/" : path.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-md px-2.5 py-1.5 transition ${
                  active ? "bg-ice-500/20 text-ice-100" : "text-ice-300/80 hover:bg-white/5 hover:text-ice-100"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
