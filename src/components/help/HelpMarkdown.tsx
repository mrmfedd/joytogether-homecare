import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

const prose =
  "help-prose max-w-none text-[15px] leading-relaxed text-[var(--midnight)] [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-xl [&_h2]:text-[var(--midnight)] [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:my-1 [&_a]:text-[var(--royal)] [&_a]:underline [&_code]:rounded [&_code]:bg-[var(--cream)] [&_code]:px-1 [&_hr]:my-8 [&_hr]:border-line";

export function HelpMarkdown({ content }: { content: string }) {
  return (
    <div className={prose}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
