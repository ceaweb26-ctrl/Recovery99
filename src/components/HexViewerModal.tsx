import React, { useState } from 'react';
import { X, Copy, Check, FileCode, ShieldCheck } from 'lucide-react';
import { RecoveredFile } from '../types/recovery';

interface HexViewerModalProps {
  file: RecoveredFile | null;
  onClose: () => void;
}

export const HexViewerModal: React.FC<HexViewerModalProps> = ({ file, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [selectedOffset, setSelectedOffset] = useState<number | null>(null);

  if (!file) return null;

  // Generate realistic hex rows based on file type and name
  const generateHexRows = () => {
    let magicBytes: number[] = [0x53, 0x51, 0x4C, 0x69, 0x74, 0x65, 0x20, 0x66, 0x6F, 0x72, 0x6D, 0x61, 0x74, 0x20, 0x33, 0x00];
    if (file.name.endsWith('.jpg')) {
      magicBytes = [0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48];
    } else if (file.name.endsWith('.json')) {
      magicBytes = [0x7B, 0x0A, 0x20, 0x20, 0x22, 0x76, 0x65, 0x72, 0x73, 0x69, 0x6F, 0x6E, 0x22, 0x3A, 0x20, 0x33];
    } else if (file.name.endsWith('.vcf')) {
      magicBytes = [0x42, 0x45, 0x47, 0x49, 0x4E, 0x3A, 0x56, 0x43, 0x41, 0x52, 0x44, 0x0D, 0x0A, 0x56, 0x45, 0x52];
    } else if (file.category === 'partitions') {
      magicBytes = [0xF2, 0xF5, 0x20, 0x20, 0x00, 0x00, 0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
    }

    const rows: { offset: string; hex: string[]; ascii: string }[] = [];
    const seed = file.name.length;

    for (let r = 0; r < 20; r++) {
      const offsetNum = r * 16;
      const offset = offsetNum.toString(16).padStart(8, '0').toUpperCase();
      const hex: string[] = [];
      let ascii = '';

      for (let b = 0; b < 16; b++) {
        let val: number;
        if (r === 0 && b < magicBytes.length) {
          val = magicBytes[b];
        } else {
          val = (seed * 17 + r * 31 + b * 13 + (r % 3) * 47) % 256;
        }
        hex.push(val.toString(16).padStart(2, '0').toUpperCase());
        ascii += val >= 32 && val <= 126 ? String.fromCharCode(val) : '.';
      }

      rows.push({ offset, hex, ascii });
    }
    return rows;
  };

  const rows = generateHexRows();

  const handleCopy = () => {
    const text = rows.map(r => `${r.offset}: ${r.hex.join(' ')}  |${r.ascii}|`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 border border-neutral-700 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-mono">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-800/50 text-cyan-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                {file.name}
                <span className="text-xs text-neutral-400 font-normal">
                  ({file.sizeFormatted})
                </span>
              </div>
              <div className="text-xs text-neutral-500 truncate max-w-lg">
                Physical Sector Map: {file.metadata.recoveredPartition}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Hex'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SHA-256 and Integrity Banner */}
        <div className="px-4 py-2.5 bg-neutral-950/70 border-b border-neutral-800 text-xs text-neutral-400 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-neutral-500">SHA-256:</span>
            <span className="text-neutral-300 select-all font-mono text-[11px] break-all">{file.sha256}</span>
          </div>
          <div className="text-cyan-400 font-medium">
            State: {file.metadata.encryptionStatus}
          </div>
        </div>

        {/* Hex Table Body */}
        <div className="p-4 overflow-y-auto flex-1 bg-neutral-950 font-mono text-xs select-text">
          <div className="grid grid-cols-[100px_1fr_180px] gap-4 pb-2 border-b border-neutral-800 text-neutral-500 font-semibold text-[11px]">
            <div>OFFSET</div>
            <div>HEX BYTES (00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F)</div>
            <div>ASCII DECODING</div>
          </div>

          <div className="divide-y divide-neutral-900/60 pt-2 space-y-1">
            {rows.map((row, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedOffset(idx * 16)}
                className={`grid grid-cols-[100px_1fr_180px] gap-4 py-1 px-1 rounded transition-colors cursor-pointer ${
                  selectedOffset === idx * 16 ? 'bg-cyan-950/40 text-cyan-200' : 'hover:bg-neutral-900/60'
                }`}
              >
                <div className="text-neutral-500 tabular-nums">{row.offset}</div>
                <div className="flex gap-2 tabular-nums">
                  <span className="text-cyan-400/90 tracking-wider">
                    {row.hex.slice(0, 8).join(' ')}
                  </span>
                  <span className="text-neutral-600">|</span>
                  <span className="text-emerald-400/90 tracking-wider">
                    {row.hex.slice(8, 16).join(' ')}
                  </span>
                </div>
                <div className="text-neutral-400 tracking-wider font-mono bg-neutral-900/40 px-1 rounded">
                  {row.ascii}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
          <div>
            Carved sector range: <span className="text-neutral-300 font-mono">0x00000000 - 0x00000140 (320 bytes sampled)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs font-sans transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
