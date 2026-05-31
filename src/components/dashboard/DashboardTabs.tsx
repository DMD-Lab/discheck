"use client";

import { usePathname } from "next/navigation";
import { Link } from "next-view-transitions";

const tabs = [
  { href: "/dashboard/home", label: "Accueil", labelMobile: "Accueil" },
  {
    href: "/dashboard/profile",
    label: "Mon profil musical",
    labelMobile: "Profil musical",
  },
  {
    href: "/dashboard/collection",
    label: "Ma collection",
    labelMobile: "Collection",
  },
];

export default function DashboardTabs() {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 border-b border-border mb-5">
      {tabs.map(({ href, label, labelMobile }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`px-3 py-2.5 text-xs sm:text-sm sm:px-4 font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
              active
                ? "border-primary text-text-green"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            <span className="sm:hidden">{labelMobile}</span>
            <span className="hidden sm:inline">{label}</span>
          </Link>
        );
      })}
    </div>
  );
}
