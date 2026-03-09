import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getWikiArticle, wikiArticles } from "@/lib/wiki";

export function generateStaticParams() {
  return wikiArticles.map((article) => ({ slug: article.slug }));
}

export default async function WikiArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getWikiArticle(slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{article.audience}</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">{article.title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{article.summary}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-500">Screen Path: {article.screenPath}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={"/wiki" as Route} className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700">All Guides</Link>
            <Link href="/projects" className="rounded-xl bg-brand-steel px-4 py-3 text-sm font-semibold text-white">Projects</Link>
          </div>
        </div>
        <div className="mt-5 rounded-2xl bg-slate-50 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Why This Guide Exists</p>
          <p className="mt-3 text-sm leading-6 text-slate-700">{article.purpose}</p>
        </div>
        {article.relatedSections?.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {article.relatedSections.map((section) => (
              <span key={section} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">Supports: {section}</span>
            ))}
          </div>
        ) : null}
      </section>
      <section className="space-y-4">
        {article.steps.map((step, index) => (
          <article key={step.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Step {index + 1}</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">{step.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-700">{step.body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
