type MarkdownLessonProps = {
  markdown: string;
};

export function MarkdownLesson({ markdown }: MarkdownLessonProps) {
  const blocks = markdown.split("\n\n");

  return (
    <div className="prose-lesson">
      {blocks.map((block, i) => {
        if (block.startsWith("## ")) {
          return (
            <h2 key={i} className="mb-3 mt-6 text-xl font-semibold text-textPrimary first:mt-0">
              {block.replace(/^##\s*/, "")}
            </h2>
          );
        }
        if (block.startsWith("### ")) {
          return (
            <h3 key={i} className="mb-2 mt-4 text-lg font-semibold text-textPrimary">
              {block.replace(/^###\s*/, "")}
            </h3>
          );
        }
        if (block.startsWith("- ")) {
          const items = block.split("\n").filter((l) => l.startsWith("- "));
          return (
            <ul key={i} className="mb-4 list-inside list-disc space-y-1 text-sm text-textSecondary">
              {items.map((item, j) => (
                <li key={j}>{item.replace(/^-\s*/, "")}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="mb-4 text-sm leading-relaxed text-textSecondary">
            {block}
          </p>
        );
      })}
    </div>
  );
}
