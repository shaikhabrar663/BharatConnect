import React, { useState } from 'react';
import { Copy, Check, Info, Terminal } from 'lucide-react';

interface FormattedResponseProps {
  content: string;
  isUser: boolean;
}

// Clean and sanitize code block content to ensure 100% executable, pure code
// without unwanted markdown asterisks (* or **), non-code sentences, or stray bullets
export function cleanPureExecutableCode(rawCode: string, language: string): string {
  if (!rawCode) return '';

  const lang = (language || '').toLowerCase().trim();
  const isHashLang = ['python', 'py', 'bash', 'sh', 'zsh', 'shell', 'yaml', 'yml', 'r', 'ruby', 'dockerfile'].includes(lang);
  const isSqlLang = ['sql', 'psql', 'mysql', 'plsql', 'sqlite'].includes(lang);
  const isHtmlLang = ['html', 'xml', 'svg'].includes(lang);

  const lines = rawCode.split(/\r?\n/);
  const cleaned: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const trimmed = line.trim();

    // 1. Skip non-code conversational introductory phrases at start of code block
    if (i <= 2 && /^(here is (the|your)|below is (the|your)|to run this|solution:|this code|here's the|following is|output:|code:|example:)/i.test(trimmed)) {
      continue;
    }

    // 2. Skip conversational sign-offs or instructions at bottom of code block
    if (i >= lines.length - 3 && /^(hope this helps|let me know|save and run|run in terminal|happy coding|feel free to ask|test with:)/i.test(trimmed)) {
      continue;
    }

    // 3. Convert accidental markdown bold headings into proper language comments
    if (/^\*\*[A-Za-z0-9\s:._-]+\*\*$/.test(trimmed)) {
      const headingText = trimmed.replace(/\*\*/g, '').trim();
      if (isHashLang) {
        cleaned.push(`# ${headingText}`);
      } else if (isSqlLang) {
        cleaned.push(`-- ${headingText}`);
      } else if (isHtmlLang) {
        cleaned.push(`<!-- ${headingText} -->`);
      } else {
        cleaned.push(`// ${headingText}`);
      }
      continue;
    }

    // 4. Strip accidental markdown bullets on code statements (e.g. "* import os", "* def solve():", "• const x = 1", "* print(x)")
    // Keep JSDoc comments like " * @param" intact only inside multiline comments
    if (!line.includes('*/') && !/^\s*\*\s*@/.test(line)) {
      line = line.replace(/^(\s*)[*•]\s+/g, '$1');
      line = line.replace(/^(\s*)-\s+(?=[A-Za-z0-9_$#(/"'{\[])/g, '$1');
    }

    // 5. Strip accidental markdown bold wrapping around code identifiers or statements
    // e.g. "**def process_data():**" -> "def process_data():"
    // e.g. "const **myVar** = 10" -> "const myVar = 10"
    if (line.trim().startsWith('**') && line.trim().endsWith('**') && !line.includes('//') && !line.includes('#') && !line.includes('--')) {
      line = line.trim().slice(2, -2);
    }
    // Remove inline bold wrappers around identifiers without breaking Python **kwargs or arithmetic **
    line = line.replace(/(^|[^\w*])\*\*([A-Za-z0-9_.$]+)\*\*([^\w*]|$)/g, '$1$2$3');
    // Remove accidental italics wrapper around identifiers (e.g. "*my_var*" -> "my_var")
    line = line.replace(/(^|[^\w*])\*([A-Za-z0-9_]+)\*([^\w*]|$)/g, '$1$2$3');

    // 6. Clean stray markdown asterisks inside comment lines (e.g. "// **Step 1:**" -> "// Step 1:")
    if (line.includes('//') || line.includes('#') || line.includes('--')) {
      line = line.replace(/\*\*([^*]+)\*\*/g, '$1');
      line = line.replace(/(#|\/\/|--)\s*\*([^*]+)\*/g, '$1 $2');
    }

    // 7. Ensure conversational advisory phrases inside code fences are converted into proper language comments
    // so code remains 100% syntactically valid and copy-pasteable without syntax errors
    const currentTrimmed = line.trim();
    const isAlreadyComment = currentTrimmed.startsWith('#') || 
                             currentTrimmed.startsWith('//') || 
                             currentTrimmed.startsWith('--') || 
                             currentTrimmed.startsWith('/*') || 
                             currentTrimmed.startsWith('*') || 
                             currentTrimmed.startsWith('<!--');

    if (!isAlreadyComment && currentTrimmed.length > 0) {
      const isEnglishProseSentence = /^(Note:|Warning:|Important:|Remember:|Tip:|Output:|Usage:|To run:|Run with:|Run in:|Requirements:|Prerequisites:|Explanation:|Step\s*\d+:|Instructions:|You can run|Make sure to|Please note|Install using|This script|In order to|First install|Expected output)/i.test(currentTrimmed);
      if (isEnglishProseSentence) {
        if (isHashLang) {
          line = `# ${currentTrimmed}`;
        } else if (isSqlLang) {
          line = `-- ${currentTrimmed}`;
        } else if (isHtmlLang) {
          line = `<!-- ${currentTrimmed} -->`;
        } else {
          line = `// ${currentTrimmed}`;
        }
      }
    }

    cleaned.push(line);
  }

  // Remove empty lines at start and end
  while (cleaned.length > 0 && !cleaned[0].trim()) {
    cleaned.shift();
  }
  while (cleaned.length > 0 && !cleaned[cleaned.length - 1].trim()) {
    cleaned.pop();
  }

  return cleaned.join('\n');
}

// Sanitize prose text OUTSIDE code blocks
function sanitizeProse(text: string): string {
  return text
    // Remove intrusive system architecture notes and zero-leakage tags in the middle of response
    .replace(/(?:\*\*)?(?:System Architecture Note:?|System Architecture Notice:?|Architecture Note:?)(?:\*\*)?[^\n]*(?:Orion Technologies|Shaikh M\. Abrar|zero-knowledge|zero-leakage|disk vault)[^\n]*/gi, '')
    .replace(/ZERO-LEAKAGE DISK VAULT/gi, '')
    .replace(/(?:\*\*)?System Attribution:?(?:\*\*)?[^\n]*/gi, '')
    .replace(/Engineered by Orion Technologies[^\n]*/gi, '')
    // Replace raw markdown hashtags at beginning of lines with clean bold section titles
    .replace(/^(?:#{1,6}\s*)([^\n]+)/gm, '**$1**')
    .replace(/###\s*/g, '')
    // Fix cases where a lone digit appears on a line followed immediately by text (e.g., "1\nCrop Selection...")
    .replace(/^(\d{1,2})\n+([A-Za-z])/gm, '$1. $2')
    // Ensure inline numbered points have proper spacing
    .replace(/([^\n])\s+(\d{1,2}\.\s+[A-Za-z0-9*])/g, '$1\n\n$2')
    .replace(/(:\s*)(\d{1,2}\.\s+)/g, '$1\n\n$2');
}

type ParsedSegment = 
  | { type: 'code'; language: string; code: string }
  | { type: 'prose'; text: string };

export const FormattedResponse: React.FC<FormattedResponseProps> = ({ content, isUser }) => {
  if (isUser) {
    return <div className="whitespace-pre-wrap font-normal leading-relaxed">{content}</div>;
  }

  // Segment content by code blocks FIRST so code is NEVER mangled by prose regexes
  const segments: ParsedSegment[] = [];
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\r?\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'prose',
        text: sanitizeProse(content.substring(lastIndex, match.index)),
      });
    }
    segments.push({
      type: 'code',
      language: match[1]?.trim() || 'code',
      code: match[2],
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    segments.push({
      type: 'prose',
      text: sanitizeProse(content.substring(lastIndex)),
    });
  }

  const elements: React.ReactNode[] = [];

  segments.forEach((seg, segIdx) => {
    if (seg.type === 'code') {
      const pureCode = cleanPureExecutableCode(seg.code, seg.language);
      elements.push(
        <CodeBlockView 
          key={`code-seg-${segIdx}`} 
          code={pureCode} 
          language={seg.language} 
        />
      );
      return;
    }

    // Prose Segment Parsing
    const lines = seg.text.split('\n');
    let lineIdx = 0;

    while (lineIdx < lines.length) {
      const rawLine = lines[lineIdx];
      const trimmed = rawLine.trim();

      // Skip empty lines
      if (!trimmed) {
        lineIdx++;
        continue;
      }

      // Markdown Table Detection (lines with |)
      if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.includes('|')) {
        const tableLines: string[] = [];
        while (lineIdx < lines.length && lines[lineIdx].trim().startsWith('|') && lines[lineIdx].trim().endsWith('|')) {
          tableLines.push(lines[lineIdx].trim());
          lineIdx++;
        }
        elements.push(
          <TableView key={`table-${elements.length}`} lines={tableLines} />
        );
        continue;
      }

      // Numbered List Group (Gemini Style: seamless indented list)
      const isNumbered = /^(\d{1,2}\.|\(\d{1,2}\)|\d{1,2}\))\s+(.*)/s.test(trimmed);
      if (isNumbered) {
        const listItems: Array<{ num: string; text: string }> = [];
        while (lineIdx < lines.length) {
          const currTrim = lines[lineIdx].trim();
          const numMatch = currTrim.match(/^(\d{1,2}\.|\(\d{1,2}\)|\d{1,2}\))\s+(.*)/s);
          if (numMatch) {
            listItems.push({
              num: numMatch[1],
              text: numMatch[2],
            });
            lineIdx++;
          } else if (!currTrim) {
            let peekIdx = lineIdx + 1;
            while (peekIdx < lines.length && !lines[peekIdx].trim()) {
              peekIdx++;
            }
            if (peekIdx < lines.length && /^(\d{1,2}\.|\(\d{1,2}\)|\d{1,2}\))\s+(.*)/s.test(lines[peekIdx].trim())) {
              lineIdx = peekIdx;
            } else {
              break;
            }
          } else {
            if (listItems.length > 0 && (lines[lineIdx].startsWith('   ') || lines[lineIdx].startsWith('\t'))) {
              listItems[listItems.length - 1].text += ' ' + currTrim;
              lineIdx++;
            } else {
              break;
            }
          }
        }

        elements.push(
          <ol key={`ol-${elements.length}`} className="my-3 space-y-2.5 list-none">
            {listItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[14.5px] leading-relaxed text-slate-800">
                <span className="font-semibold text-slate-900 shrink-0 select-none text-[14.5px]">
                  {item.num.endsWith('.') ? item.num : `${item.num}.`}
                </span>
                <div className="flex-1">
                  {renderInlineMarkdown(item.text)}
                </div>
              </li>
            ))}
          </ol>
        );
        continue;
      }

      // Bullet List Group (Gemini Style)
      const isBullet = /^(\-|\*|•)\s+(.*)/s.test(trimmed);
      if (isBullet) {
        const bulletItems: string[] = [];
        while (lineIdx < lines.length) {
          const currTrim = lines[lineIdx].trim();
          const bMatch = currTrim.match(/^(\-|\*|•)\s+(.*)/s);
          if (bMatch) {
            bulletItems.push(bMatch[2]);
            lineIdx++;
          } else if (!currTrim) {
            let peekIdx = lineIdx + 1;
            while (peekIdx < lines.length && !lines[peekIdx].trim()) {
              peekIdx++;
            }
            if (peekIdx < lines.length && /^(\-|\*|•)\s+(.*)/s.test(lines[peekIdx].trim())) {
              lineIdx = peekIdx;
            } else {
              break;
            }
          } else {
            break;
          }
        }

        elements.push(
          <ul key={`ul-${elements.length}`} className="my-3 space-y-2 list-none">
            {bulletItems.map((bText, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[14.5px] leading-relaxed text-slate-800">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0 select-none"></span>
                <div className="flex-1">
                  {renderInlineMarkdown(bText)}
                </div>
              </li>
            ))}
          </ul>
        );
        continue;
      }

      // Standalone Bold Heading (e.g. **Section Title**)
      if (trimmed.startsWith('**') && trimmed.endsWith('**') && !trimmed.slice(2, -2).includes('**')) {
        const heading = trimmed.slice(2, -2).trim();
        elements.push(
          <h4 key={`h-${elements.length}`} className="text-[15px] sm:text-base font-bold text-slate-950 mt-4 mb-2 first:mt-0 tracking-tight">
            {heading}
          </h4>
        );
        lineIdx++;
        continue;
      }

      // Advisory / Disclaimer Callout Box
      const lowerTrimmed = trimmed.toLowerCase();
      const isAdvisory = 
        lowerTrimmed.includes('professional advisory note') ||
        lowerTrimmed.includes('medical advisory disclaimer') ||
        lowerTrimmed.includes('clinical & regulatory advisory');

      if (isAdvisory) {
        const cleanNote = trimmed
          .replace(/^\*+|\*+$/g, '')
          .replace(/^\*\*+|\*\*+$/g, '')
          .trim();

        elements.push(
          <div 
            key={`advisory-${elements.length}`}
            className="my-3.5 p-3 rounded-lg bg-slate-50 border-l-3 border-amber-500 text-xs text-slate-700 leading-relaxed flex items-start gap-2.5"
          >
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold text-slate-900 block mb-0.5">Advisory Note</span>
              {renderInlineMarkdown(cleanNote)}
            </div>
          </div>
        );
        lineIdx++;
        continue;
      }

      // Regular Flowing Paragraph
      const paragraphLines: string[] = [];
      while (lineIdx < lines.length) {
        const curr = lines[lineIdx].trim();
        if (!curr) break;
        if (
          curr.startsWith('|') || 
          /^(\d{1,2}\.|\(\d{1,2}\)|\d{1,2}\))\s+/.test(curr) || 
          /^(\-|\*|•)\s+/.test(curr) || 
          (curr.startsWith('**') && curr.endsWith('**') && !curr.slice(2, -2).includes('**'))
        ) {
          break;
        }
        paragraphLines.push(curr);
        lineIdx++;
      }

      if (paragraphLines.length > 0) {
        const paraText = paragraphLines.join(' ');
        elements.push(
          <p key={`p-${elements.length}`} className="text-[14.5px] leading-relaxed text-slate-800 mb-3 last:mb-0">
            {renderInlineMarkdown(paraText)}
          </p>
        );
      }
    }
  });

  return (
    <div className="space-y-1 text-slate-900 font-normal">
      {elements}
    </div>
  );
};

// Gemini-style sleek Code Block with verified pure code, top bar & instant Copy button
const CodeBlockView: React.FC<{ code: string; language: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  // Directly copy ONLY the pure, right, working code
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = code;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const lineCount = code.split('\n').length;
  const displayLang = (language || 'code').toUpperCase();

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-slate-800 bg-[#0f141c] text-slate-100 shadow-sm text-xs font-mono">
      <div className="bg-[#181f2b] px-4 py-2 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-semibold text-slate-200 text-[11px] tracking-wider">
            {displayLang}
          </span>
          <span className="text-[10px] text-slate-400 font-sans border-l border-slate-700 pl-2">
            {lineCount} {lineCount === 1 ? 'line' : 'lines'} • Ready to Run
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[11px] font-medium text-slate-300 hover:text-white px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 transition-colors cursor-pointer border border-slate-700/60"
          title="Copy pure working code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copied Clean Code</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 text-slate-400" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto leading-relaxed text-slate-200 selection:bg-indigo-900 selection:text-white">
        <code>{code}</code>
      </pre>
    </div>
  );
};

// Markdown Table Renderer
const TableView: React.FC<{ lines: string[] }> = ({ lines }) => {
  if (lines.length < 2) return null;

  const parseRow = (row: string) =>
    row
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim());

  const headerCells = parseRow(lines[0]);
  const isSeparator = /^[\s|:-]+$/.test(lines[1]);
  const bodyRows = (isSeparator ? lines.slice(2) : lines.slice(1)).map(parseRow);

  return (
    <div className="my-4 overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-left text-xs text-slate-800">
        <thead className="bg-slate-100/70 text-slate-900 border-b border-slate-200 font-semibold">
          <tr>
            {headerCells.map((cell, idx) => (
              <th key={idx} className="px-3.5 py-2">
                {renderInlineMarkdown(cell)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200/80 bg-white">
          {bodyRows.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-slate-50/60 transition-colors">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-3.5 py-2">
                  {renderInlineMarkdown(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// High-speed Inline Markdown Parser for bold, inline code, italics, links
function renderInlineMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  // Split by bold (**...**), inline code (`...`), italics (*...*)
  const tokens: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      tokens.push(
        <strong key={match.index} className="font-semibold text-slate-950">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      tokens.push(
        <code key={match.index} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[12.5px] border border-slate-200">
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      tokens.push(
        <em key={match.index} className="italic text-slate-800">
          {token.slice(1, -1)}
        </em>
      );
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    tokens.push(text.substring(lastIndex));
  }

  return tokens.length > 0 ? tokens : text;
}
