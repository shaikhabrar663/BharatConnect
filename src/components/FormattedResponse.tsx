import React from 'react';
import { ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';

interface FormattedResponseProps {
  content: string;
  isUser: boolean;
}

export const FormattedResponse: React.FC<FormattedResponseProps> = ({ content, isUser }) => {
  if (isUser) {
    return <div className="whitespace-pre-wrap">{content}</div>;
  }

  // Pre-process: Strip any markdown hashtags, enforce clean bold titles,
  // and ensure any inline numbered pointers (1. 2. 3.) are split onto their own lines!
  const sanitized = content
    .replace(/^(?:#{1,6}\s*)([^\n]+)/gm, '**$1**')
    .replace(/###\s*/g, '')
    // Separate inline numbered points (e.g. "...metrics. 2. Implementation..." -> "...metrics.\n\n2. Implementation...")
    .replace(/([^\n])\s+(\d{1,2}\.\s+[A-Za-z0-9*])/g, '$1\n\n$2')
    .replace(/(:\s*)(\d{1,2}\.\s+)/g, '$1\n\n$2')
    .replace(/([^\n])\s+(\(\d{1,2}\)\s+[A-Za-z0-9*])/g, '$1\n\n$2')
    .replace(/([^\n])\s+(\d{1,2}\)\s+[A-Za-z0-9*])/g, '$1\n\n$2');

  // Split content into blocks (paragraphs, lists, code blocks, advisories, numbered cards)
  const lines = sanitized.split('\n');
  const blocks: React.ReactNode[] = [];
  let currentParagraph: string[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let blockKey = 0;

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join('\n').trim();
      if (text) {
        // Check if this paragraph is an advisory / disclaimer note
        const isAdvisory = 
          text.toLowerCase().startsWith('**professional advisory note') ||
          text.toLowerCase().startsWith('*medical advisory disclaimer') ||
          text.toLowerCase().startsWith('**medical advisory disclaimer') ||
          text.toLowerCase().startsWith('*disclaimer') ||
          text.toLowerCase().startsWith('**disclaimer');

        const isArchitectureNote = 
          text.toLowerCase().startsWith('**system architecture note') ||
          text.toLowerCase().includes('engineered by orion technologies');

        if (isAdvisory) {
          const cleanedAdvisory = text
            .replace(/^\*+|\*+$/g, '')
            .replace(/^\*\*+|\*\*+$/g, '')
            .replace(/^Medical Advisory Disclaimer:?/i, 'Professional Clinical Advisory:')
            .trim();

          blocks.push(
            <div 
              key={`advisory-${blockKey++}`} 
              className="my-3 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/90 text-amber-950 text-xs leading-relaxed shadow-2xs"
            >
              <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1 tracking-tight uppercase text-[10px]">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                <span>Clinical & Regulatory Advisory Note</span>
              </div>
              <div className="text-amber-900">
                {renderInlineMarkdown(cleanedAdvisory)}
              </div>
            </div>
          );
        } else if (isArchitectureNote) {
          blocks.push(
            <div 
              key={`arch-${blockKey++}`}
              className="my-3 p-3 rounded-xl bg-slate-900 text-slate-100 text-xs border border-slate-800 shadow-xs flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                <span className="font-semibold text-slate-200">{renderInlineMarkdown(text)}</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800 shrink-0">
                ZERO-LEAKAGE DISK VAULT
              </span>
            </div>
          );
        } else if (text.startsWith('**') && text.endsWith('**') && !text.slice(2, -2).includes('**')) {
          // Standalone bold heading
          const headingText = text.slice(2, -2).trim();
          blocks.push(
            <div key={`heading-${blockKey++}`} className="mt-4 mb-2 first:mt-0">
              <h4 className="text-sm font-bold text-slate-950 tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-3.5 rounded-full bg-orange-500"></span>
                <span>{headingText}</span>
              </h4>
            </div>
          );
        } else {
          blocks.push(
            <p key={`p-${blockKey++}`} className="mb-2.5 last:mb-0 leading-relaxed text-slate-800">
              {renderInlineMarkdown(text)}
            </p>
          );
        }
      }
      currentParagraph = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Handle code blocks
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        inCodeBlock = false;
        blocks.push(
          <div key={`code-${blockKey++}`} className="my-3 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-100 font-mono text-xs shadow-md">
            <div className="bg-slate-900 px-3.5 py-1.5 border-b border-slate-800 text-[11px] text-slate-400 flex justify-between items-center">
              <span className="font-medium text-slate-300">Code Specification</span>
              <span className="text-[10px] text-slate-500">Local Verified Buffer</span>
            </div>
            <pre className="p-3.5 overflow-x-auto">
              <code>{codeBuffer.join('\n')}</code>
            </pre>
          </div>
        );
        codeBuffer = [];
      } else {
        flushParagraph();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Check for distinct numbered point line: e.g. "1. Scope Definition: ...", "2. Implementation: ...", "(1) ..."
    const trimmedLine = line.trim();
    const numberedMatch = trimmedLine.match(/^(\d{1,2}\.|\(\d{1,2}\)|\d{1,2}\))\s+(.*)/s);

    if (numberedMatch) {
      flushParagraph();
      const rawPrefix = numberedMatch[1];
      const pointerText = numberedMatch[2];
      const cleanNum = rawPrefix.replace(/[^\d]/g, '');

      blocks.push(
        <div 
          key={`pointer-${blockKey++}`} 
          className="my-2.5 flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-orange-300/80 transition-all group"
        >
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-2xs group-hover:from-orange-600 group-hover:to-orange-500 transition-colors">
            {cleanNum || rawPrefix}
          </div>
          <div className="flex-1 text-slate-800 text-sm leading-relaxed">
            {renderInlineMarkdown(pointerText)}
          </div>
        </div>
      );
      continue;
    }

    // Check for bullet list item: e.g. "- ...", "* ..."
    const bulletMatch = trimmedLine.match(/^(\-|\*)\s+(.*)/s);
    if (bulletMatch) {
      flushParagraph();
      const bulletText = bulletMatch[2];
      blocks.push(
        <div key={`bullet-${blockKey++}`} className="my-1.5 flex items-start gap-2.5 pl-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0"></div>
          <div className="flex-1 text-slate-800 text-sm leading-relaxed">
            {renderInlineMarkdown(bulletText)}
          </div>
        </div>
      );
      continue;
    }

    // Handle blank lines separating paragraphs
    if (!trimmedLine) {
      flushParagraph();
      continue;
    }

    currentParagraph.push(line);
  }

  flushParagraph();

  return <div className="space-y-1 text-sm">{blocks}</div>;
};

// Simple inline parser for bold, italics, code, and bullet points
function renderInlineMarkdown(text: string): React.ReactNode {
  return parseInlineStyles(text);
}

function parseInlineStyles(str: string): React.ReactNode {
  // Parse **bold** and `code`
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(str)) !== null) {
    if (match.index > lastIndex) {
      parts.push(str.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} className="font-bold text-slate-950">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code key={match.index} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[12px] border border-slate-200">
          {token.slice(1, -1)}
        </code>
      );
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < str.length) {
    parts.push(str.substring(lastIndex));
  }

  return parts.length > 0 ? parts : str;
}

