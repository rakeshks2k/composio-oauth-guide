'use client';

import { useState } from 'react';
import { Check, Copy, Terminal, Code2 } from 'lucide-react';

interface CodeEditorBlockProps {
  cliCode: string;
  tsCode: string;
  appName: string;
}

function highlightCliLine(line: string): React.ReactNode {
  if (line.trim().startsWith('#')) {
    return <span className="syntax-comment">{line}</span>;
  }

  // Tokenize CLI command
  const parts: React.ReactNode[] = [];
  let remaining = line;

  // Check for composio command
  if (remaining.includes('composio')) {
    const idx = remaining.indexOf('composio');
    if (idx > 0) parts.push(remaining.slice(0, idx));
    parts.push(<span key="cmd" className="syntax-cli-cmd font-medium">composio</span>);
    remaining = remaining.slice(idx + 8);
  }

  // Subcommands
  if (remaining.includes('auth add-config')) {
    const idx = remaining.indexOf('auth add-config');
    parts.push(remaining.slice(0, idx));
    parts.push(<span key="sub1" className="syntax-cli-sub font-medium">auth add-config</span>);
    remaining = remaining.slice(idx + 15);
  } else if (remaining.includes('add ')) {
    const idx = remaining.indexOf('add ');
    parts.push(remaining.slice(0, idx));
    parts.push(<span key="sub2" className="syntax-cli-sub font-medium">add</span>);
    remaining = remaining.slice(idx + 3);
  }

  // Handle flags and arguments
  const tokens = remaining.split(/(\s+|--[a-z-]+|"<[^>]+>"|\\)/g);
  tokens.forEach((token, i) => {
    if (!token) return;
    if (token.startsWith('--')) {
      parts.push(<span key={i} className="syntax-cli-flag">{token}</span>);
    } else if (token.startsWith('"<') && token.endsWith('>"')) {
      parts.push(<span key={i} className="syntax-cli-placeholder">{token}</span>);
    } else if (token === '\\') {
      parts.push(<span key={i} className="text-[#6e7681] font-bold">{token}</span>);
    } else if (token.trim() && !token.startsWith('-') && !token.startsWith('"')) {
      parts.push(<span key={i} className="syntax-prop">{token}</span>);
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

  // Tokenize TypeScript code
  const tokens = line.split(/(\b(?:import|from|const|await|new|export|default)\b|\b(?:Composio|process|console)\b|\b(?:connectedAccounts|initiate|authConfigs|create|log)\b|"(?:[^"\\]|\\.)*"|\b(?:appName|redirectUrl|authScheme|credentials|clientId|clientSecret|apiKey)\b|[{}();,:])/g);

  return (
    <>
      {tokens.map((token, i) => {
        if (!token) return null;

        if (/^(import|from|const|await|new|export|default)$/.test(token)) {
          return <span key={i} className="syntax-keyword">{token}</span>;
        }
        if (/^(Composio|process|console)$/.test(token)) {
          return <span key={i} className="syntax-type">{token}</span>;
        }
        if (/^(connectedAccounts|initiate|authConfigs|create|log)$/.test(token)) {
          return <span key={i} className="syntax-fn">{token}</span>;
        }
        if (/^(appName|redirectUrl|authScheme|credentials|clientId|clientSecret|apiKey)$/.test(token)) {
          return <span key={i} className="syntax-prop">{token}</span>;
        }
        if (token.startsWith('"') && token.endsWith('"')) {
          return <span key={i} className="syntax-string">{token}</span>;
        }
        if (/^[{}();,:]$/.test(token)) {
          return <span key={i} className="syntax-punct">{token}</span>;
        }
        return <span key={i} className="text-[#e6edf3]">{token}</span>;
      })}
    </>
  );
}

export function CodeEditorBlock({ cliCode, tsCode, appName }: CodeEditorBlockProps) {
  const [activeTab, setActiveTab] = useState<'cli' | 'typescript'>('cli');
  const [copied, setCopied] = useState(false);

  const activeCode = activeTab === 'cli' ? cliCode : tsCode;
  const lines = activeCode.split('\n');

  function copyCode() {
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="rounded-lg border border-[#2b2f38] bg-[#121316] overflow-hidden shadow-sm font-mono text-[12.5px]">
      {/* Code Editor Title Bar */}
      <div className="h-9 px-3.5 flex items-center justify-between border-b border-[#252830] bg-[#16181d] select-none">
        <div className="flex items-center gap-3">
          {/* macOS Editor Traffic Lights */}
          <div className="flex items-center gap-1.5 pr-2 border-r border-[#2a2d36]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]/75" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]/75" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]/75" />
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('cli')}
              className={`h-6 px-2.5 rounded text-[11px] font-medium flex items-center gap-1.5 transition-colors ${
                activeTab === 'cli'
                  ? 'bg-[#222631] text-[#79c0ff] border border-[#333a4c]'
                  : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#1a1d24]'
              }`}
            >
              <Terminal className="w-3 h-3 text-[#51a2ff]" />
              <span>CLI ({appName})</span>
            </button>

            <button
              onClick={() => setActiveTab('typescript')}
              className={`h-6 px-2.5 rounded text-[11px] font-medium flex items-center gap-1.5 transition-colors ${
                activeTab === 'typescript'
                  ? 'bg-[#222631] text-[#79c0ff] border border-[#333a4c]'
                  : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#1a1d24]'
              }`}
            >
              <Code2 className="w-3 h-3 text-[#3178c6]" />
              <span>TypeScript SDK</span>
            </button>
          </div>
        </div>

        {/* Right side: language pill & copy button */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-mono tracking-wider text-[#6e7681] px-1.5 py-0.5 rounded bg-[#1e222a] border border-[#2b303c]">
            {activeTab === 'cli' ? 'bash' : 'ts'}
          </span>

          <button
            onClick={copyCode}
            className="h-6 px-2 rounded text-[11px] font-sans flex items-center gap-1 text-[#8b949e] hover:text-white hover:bg-[#222631] border border-transparent hover:border-[#333a4c] transition-colors"
            title="Copy snippet"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-[#7ee787]" />
                <span className="text-[#7ee787]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Editor Body with Gutter & Syntax Highlighted Lines */}
      <div className="p-3 sm:p-4 overflow-x-auto text-[12.5px] leading-[1.65] bg-[#0d0e11]">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-[#16181f]/70 transition-colors">
                <td className="syntax-line-num select-none align-top w-8">
                  {idx + 1}
                </td>
                <td className="whitespace-pre pl-2 align-top font-mono">
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
