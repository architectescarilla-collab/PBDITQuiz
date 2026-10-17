import { Fragment } from "react";

/** True for long questions (e.g. situations), so screens can use a smaller font. */
export const isLong = (text: string) => text.replace(/```[\s\S]*?```/g, "").length > 140;

/**
 * Renders question-bank text with lightweight code formatting:
 *   ```fenced blocks``` → a monospace code block (indentation kept)
 *   `inline code`       → monospace inline code (newlines kept, for multi-line output)
 *   blank line          → new paragraph; a leading "Situation:" gets a small label
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
          part.trim() && <Paragraphs key={i} text={part.trim()} />
        ),
      )}
    </div>
  );
}

function Paragraphs({ text }: { text: string }) {
  const paras = text.split(/\n{2,}/);
  // a single paragraph stays inline so short answers can sit next to a label
  if (paras.length === 1) return <Paragraph text={text} />;
  return (
    <>
      {paras.map((p, j) => (
        <span key={j} className={j > 0 ? "mt-3 block" : "block"}>
          <Paragraph text={p} />
        </span>
      ))}
    </>
  );
}

function Paragraph({ text }: { text: string }) {
  const m = /^Situation:\s*/.exec(text);
  if (!m) return <Inline text={text} />;
  return (
    <>
      <span className="mr-2 inline-block rounded-full bg-accent/85 px-2 py-0.5 align-middle text-[0.6em] font-extrabold tracking-wider text-ink uppercase">
        Situation
      </span>
      <Inline text={text.slice(m[0].length)} />
    </>
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
