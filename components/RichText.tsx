import { Fragment } from "react";

/**
 * Renders question-bank text with lightweight code formatting:
 *   ```fenced blocks``` → a monospace code block (indentation kept)
 *   `inline code`       → monospace inline code (newlines kept, for multi-line output)
 * Always renders a <div>, so it can safely hold code blocks.
 */
export function RichText({ text, className = "" }: { text: string; className?: string }) {
  const parts = text.split(/```\n?([\s\S]*?)\n?```/g); // odd indexes are code blocks
  return (
    <div className={className}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <pre
            key={i}
            className="my-3 overflow-x-auto rounded-lg bg-umber-dark/90 px-4 py-3 text-left font-mono text-[0.72em] leading-relaxed font-medium text-cream sm:text-[0.62em]"
          >
            {part}
          </pre>
        ) : (
          part && <Inline key={i} text={part.trim()} />
        ),
      )}
    </div>
  );
}

function Inline({ text }: { text: string }) {
  const segs = text.split(/`([^`]+)`/g); // odd indexes are inline code
  return (
    <>
      {segs.map((s, i) =>
        i % 2 === 1 ? (
          <code key={i} className="rounded bg-umber-dark/20 px-1.5 py-0.5 font-mono text-[0.92em] whitespace-pre-wrap">
            {s}
          </code>
        ) : (
          <Fragment key={i}>{s}</Fragment>
        ),
      )}
    </>
  );
}
