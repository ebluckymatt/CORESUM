import Link from "next/link";
import { projectSections } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function ProjectNav({ projectId, active }: { projectId: string; active: string }) {
  return (
    <nav className="mb-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2">
      <div className="flex min-w-max gap-2">
        {projectSections.map((section) => (
          <Link
            key={section.slug}
            href={section.slug === "dashboard" ? `/projects/${projectId}` : `/projects/${projectId}/${section.slug}`}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-medium",
              active === section.slug ? "bg-brand-steel text-white" : "text-slate-600 hover:bg-slate-100"
            )}
          >
            {section.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
