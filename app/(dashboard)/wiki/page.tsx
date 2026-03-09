import type { Route } from "next";
import Link from "next/link";
import { wikiArticles } from "@/lib/wiki";

export default function WikiIndexPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Application Wiki</p>
          <h1 className="text-3xl font-semibold text-slate-950">User Guide</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">Step-by-step operating instructions stored directly inside the application so every employee can learn the workflows where they work.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Purpose</p>
          <p className="mt-3 text-sm leading-6 text-slate-700">This wiki is the operating playbook for the platform. Use it to train users, standardize how records are handled, and reduce interpretation gaps between field teams, engineers, and leadership.</p>
        </div>
      </section>
      <div className="grid gap-4 xl:grid-cols-2">
        {wikiArticles.map((article) => (
          <article key={article.slug} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{article.audience}</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">{article.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{article.summary}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-500">Screen Path: {article.screenPath}</p>
            <p className="mt-3 text-sm leading-6 text-slate-700">{article.purpose}</p>
            {article.relatedSections?.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {article.relatedSections.map((section) => (
                  <span key={section} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{section}</span>
                ))}
              </div>
            ) : null}
            <p className="mt-4 text-xs uppercase tracking-[0.16em] text-slate-500">{article.steps.length} operating steps</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href={`/wiki/${article.slug}` as Route} className="inline-flex rounded-xl bg-brand-steel px-4 py-3 text-sm font-semibold text-white">Open Guide</Link>
              <Link href="/projects" className="inline-flex rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700">Back to Projects</Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
