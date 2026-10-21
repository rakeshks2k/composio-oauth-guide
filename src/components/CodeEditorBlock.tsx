'use client';

import { useState } from 'react';
import { Check, Copy, Terminal, Code2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
        return <span key={i} className="text-[#a1a1a1]">{token}</span>;
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
    <div className="rounded-md border border-[#262626] bg-[#121212] overflow-hidden font-mono text-[12.5px]">
      {/* Code Editor Header Bar */}
      <div className="h-9 px-3 flex items-center justify-between border-b border-[#262626] bg-[#141414] select-none">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('cli')}
            className={`relative h-6 px-2.5 rounded text-[11px] font-mono flex items-center gap-1.5 transition-colors ${
              activeTab === 'cli'
                ? 'text-white font-medium'
                : 'text-[#737373] hover:text-[#a1a1a1]'
            }`}
          >
            {activeTab === 'cli' && (
              <motion.div
                layoutId="code-tab-indicator"
                className="absolute inset-0 rounded bg-[#1e1e1e] border border-[#2c2c2c]"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Terminal className="w-3 h-3 text-[#737373]" />
              <span>CLI ({appName})</span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab('typescript')}
            className={`relative h-6 px-2.5 rounded text-[11px] font-mono flex items-center gap-1.5 transition-colors ${
              activeTab === 'typescript'
                ? 'text-white font-medium'
                : 'text-[#737373] hover:text-[#a1a1a1]'
            }`}
          >
            {activeTab === 'typescript' && (
              <motion.div
                layoutId="code-tab-indicator"
                className="absolute inset-0 rounded bg-[#1e1e1e] border border-[#2c2c2c]"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Code2 className="w-3 h-3 text-[#737373]" />
              <span>TypeScript SDK</span>
            </span>
          </button>
        </div>

        {/* Right side: language tag & copy button */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#666666]">
            {activeTab === 'cli' ? 'bash' : 'ts'}
          </span>

          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={copyCode}
            className="h-6 px-2 rounded text-[11px] font-sans flex items-center gap-1 text-[#737373] hover:text-white hover:bg-[#1a1a1a] transition-colors"
            title="Copy code snippet"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-white" />
                <span className="text-white">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-[#737373]" />
                <span>Copy</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Code Editor Body with Gutter */}
      <div className="p-3.5 sm:p-4 overflow-x-auto text-[12px] leading-[1.65] bg-[#111111]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.12 }}
          >
            <table className="w-full border-collapse">
              <tbody>
                {lines.map((line, idx) => (
                  <tr key={idx} className="hover:bg-[#161616] transition-colors">
                    <td className="syntax-line-num select-none align-top w-7">
                      {idx + 1}
                    </td>
                    <td className="whitespace-pre pl-2 align-top font-mono">
                      {activeTab === 'cli' ? highlightCliLine(line) : highlightTsLine(line)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
