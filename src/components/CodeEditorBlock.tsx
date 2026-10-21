'use client';

import { useState } from 'react';
import { Check, Copy, Terminal, Code2 } from 'lucide-react';
import { clsx } from 'clsx';

interface CodeEditorBlockProps {
  cliCode: string;
  tsCode: string;
  appName: string;
}

function highlightCliLine(line: string): React.ReactNode {
  if (line.trim().startsWith('#')) {
    return <span className="syntax-comment">{line}</span>;
  }

  const parts: React.ReactNode[] = [];
  let remaining = line;

  if (remaining.includes('composio')) {
    const idx = remaining.indexOf('composio');
    if (idx > 0) parts.push(remaining.slice(0, idx));
    parts.push(<span key="cmd" className="syntax-cli-cmd">composio</span>);
    remaining = remaining.slice(idx + 8);
  }

  if (remaining.includes('auth add-config')) {
    const idx = remaining.indexOf('auth add-config');
    parts.push(remaining.slice(0, idx));
    parts.push(<span key="sub1" className="syntax-cli-sub">auth add-config</span>);
    remaining = remaining.slice(idx + 15);
  } else if (remaining.includes('add ')) {
    const idx = remaining.indexOf('add ');
    parts.push(remaining.slice(0, idx));
    parts.push(<span key="sub2" className="syntax-cli-sub">add</span>);
    remaining = remaining.slice(idx + 3);
  }

  const tokens = remaining.split(/(\s+|--[a-z-]+|"<[^>]+>"|\\)/g);
  tokens.forEach((token, i) => {
    if (!token) return;
    if (token.startsWith('--')) {
      parts.push(<span key={i} className="syntax-cli-flag">{token}</span>);
    } else if (token.startsWith('"<') && token.endsWith('>"')) {
      parts.push(<span key={i} className="syntax-cli-placeholder">{token}</span>);
    } else if (token === '\\') {
      parts.push(<span key={i} className="text-[#737373]">{token}</span>);
    } else if (token.trim() && !token.startsWith('-') && !token.startsWith('"')) {
      parts.push(<span key={i} className="syntax-string">{token}</span>);
    } else {
      parts.push(token);
    }
  });

  return <>{parts}</>;
}

function highlightTsLine(line: string): React.ReactNode {
  if (line.trim().startsWith('//')) {
    return <span className="syntax-comment">{line}</span>;
  }

  const tokens = line.split(/(\b(?:import|from|const|await|new|export|default)\b|\b(?:Composio)\b|\b(?:process|console)\b|\b(?:connectedAccounts|initiate|authConfigs|create|log)\b|"(?:[^"\\]|\\.)*"|\b(?:appName|redirectUrl|authScheme|credentials|clientId|clientSecret|apiKey)\b|[{}();,:])/g);

  return (
    <>
      {tokens.map((token, i) => {
        if (!token) return null;

        if (/^(import|from|const|await|new|export|default)$/.test(token)) {
          return <span key={i} className="syntax-keyword">{token}</span>;
        }
        if (token === 'Composio') {
          return <span key={i} className="syntax-type">{token}</span>;
        }
        if (/^(process|console)$/.test(token)) {
          return <span key={i} className="text-white">{token}</span>;
        }
        if (/^(connectedAccounts|initiate|authConfigs|create|log)$/.test(token)) {
          return <span key={i} className="syntax-property">{token}</span>;
        }
        if (/^(appName|redirectUrl|authScheme|credentials|clientId|clientSecret|apiKey)$/.test(token)) {
          return <span key={i} className="syntax-property">{token}</span>;
        }
        if (token.startsWith('"') && token.endsWith('"')) {
          return <span key={i} className="syntax-string">{token}</span>;
        }
        return token;
      })}
    </>
  );
}

export function CodeEditorBlock({
  cliCode,
  tsCode,
  appName,
}: CodeEditorBlockProps) {
  const [activeTab, setActiveTab] = useState<'cli' | 'typescript'>('cli');
  const [copied, setCopied] = useState(false);

  const currentCode = activeTab === 'cli' ? cliCode : tsCode;
  const lines = currentCode.split('\n');

  function copyCode() {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="rounded-lg border border-[#262626] bg-[#111111] overflow-hidden">
      {/* Editor Tab Bar */}
      <div className="h-9 px-3 bg-[#161616] border-b border-[#262626] flex items-center justify-between select-none">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('cli')}
            className={clsx(
              'h-6 px-2.5 rounded text-[11px] font-mono flex items-center gap-1.5 transition-colors border',
              activeTab === 'cli'
                ? 'bg-[#1e1e1e] border-[#2c2c2c] text-white font-medium'
                : 'text-[#737373] hover:text-[#a1a1a1] border-transparent'
            )}
          >
            <Terminal className="w-3 h-3 text-[#737373]" />
            <span>CLI ({appName})</span>
          </button>

          <button
            onClick={() => setActiveTab('typescript')}
            className={clsx(
              'h-6 px-2.5 rounded text-[11px] font-mono flex items-center gap-1.5 transition-colors border',
              activeTab === 'typescript'
                ? 'bg-[#1e1e1e] border-[#2c2c2c] text-white font-medium'
                : 'text-[#737373] hover:text-[#a1a1a1] border-transparent'
            )}
          >
            <Code2 className="w-3 h-3 text-[#737373]" />
            <span>TypeScript SDK</span>
          </button>
        </div>

        {/* Right side: language tag & copy button */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#666666]">
            {activeTab === 'cli' ? 'bash' : 'ts'}
          </span>

          <button
            onClick={copyCode}
            className="h-6 px-2 rounded text-[11px] font-sans flex items-center gap-1 text-[#737373] hover:text-white hover:bg-[#1a1a1a] transition-colors"
            title="Copy code snippet"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-[#51a2ff]" />
                <span className="text-[#51a2ff]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-[#737373]" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Editor Body with Gutter */}
      <div className="p-3.5 sm:p-4 overflow-x-auto text-[12px] leading-[1.65] bg-[#111111]">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-[#161616] transition-colors">
                <td className="syntax-line-num select-none align-top w-7 text-right pr-3 text-[#444444] font-mono text-[11px]">
                  {idx + 1}
                </td>
                <td className="whitespace-pre align-top font-mono">
                  {activeTab === 'cli' ? highlightCliLine(line) : highlightTsLine(line)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
