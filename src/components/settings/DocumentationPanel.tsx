import { useMemo, useRef, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import { useTranslation } from "react-i18next";
import trGuide from "../../content/usageGuide/tr.md?raw";
import enGuide from "../../content/usageGuide/en.md?raw";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseTopLevelSections(markdown: string) {
  return markdown
    .split("\n")
    .filter((line) => line.startsWith("# "))
    .map((line) => {
      const title = line.slice(2).trim();
      return { id: slugify(title), title };
    });
}

const mdComponents = {
  h1: ({ children }: { children?: ReactNode }) => {
    const text = String(children ?? "");
    const id = slugify(text);
    return (
      <h1
        id={id}
        className="scroll-mt-6 border-b border-zinc-200 pb-3 text-xl font-bold text-zinc-900 dark:border-vb-border dark:text-zinc-100"
      >
        {children}
      </h1>
    );
  },
  h2: ({ children }: { children?: ReactNode }) => (
    <h2 className="mt-8 text-base font-semibold text-zinc-800 dark:text-zinc-200">
      {children}
    </h2>
  ),
  h3: ({ children }: { children?: ReactNode }) => (
    <h3 className="mt-5 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
      {children}
    </h3>
  ),
  p: ({ children }: { children?: ReactNode }) => (
    <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
      {children}
    </p>
  ),
  ul: ({ children }: { children?: ReactNode }) => (
    <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
      {children}
    </ul>
  ),
  ol: ({ children }: { children?: ReactNode }) => (
    <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
      {children}
    </ol>
  ),
  li: ({ children }: { children?: ReactNode }) => (
    <li className="leading-relaxed">{children}</li>
  ),
  strong: ({ children }: { children?: ReactNode }) => (
    <strong className="font-semibold text-zinc-800 dark:text-zinc-200">
      {children}
    </strong>
  ),
  hr: () => <hr className="my-10 border-zinc-200 dark:border-vb-border" />,
};

export function DocumentationPanel() {
  const { t, i18n } = useTranslation();
  const articleRef = useRef<HTMLElement>(null);

  const markdown = i18n.language.startsWith("tr") ? trGuide : enGuide;
  const sections = useMemo(() => parseTopLevelSections(markdown), [markdown]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <header className="mb-8">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          {t("settings.docsSection.title")}
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {t("settings.docsSection.description")}
        </p>
      </header>

      <div className="flex gap-8">
        <nav className="sticky top-0 hidden w-52 shrink-0 self-start lg:block">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
            {t("settings.docsSection.toc")}
          </p>
          <ul className="space-y-1">
            {sections.map(({ id, title }) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => scrollTo(id)}
                  className="w-full rounded-lg px-2 py-1.5 text-left text-xs leading-snug text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-vb-accent dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  {title}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <article
          ref={articleRef}
          className="min-w-0 flex-1 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-vb-border dark:bg-zinc-900 lg:p-8"
        >
          <ReactMarkdown components={mdComponents}>{markdown}</ReactMarkdown>
        </article>
      </div>
    </div>
  );
}
