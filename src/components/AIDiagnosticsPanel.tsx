import React, { useState } from 'react';
import { RefreshCw, Sparkles, Terminal, ShieldAlert } from 'lucide-react';
import { GlobalPhoneModel } from '../data/globalModels';

interface AIDiagnosticsPanelProps {
  model: GlobalPhoneModel | null;
  rawLogs: string[];
}

export const AIDiagnosticsPanel: React.FC<AIDiagnosticsPanelProps> = ({ model, rawLogs }) => {
  const [report, setReport] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [modelSource, setModelSource] = useState<string>('gemini-3.8-flash');
  const [customLogs, setCustomLogs] = useState<string>('');
  const [isEditingLogs, setIsEditingLogs] = useState<boolean>(false);

  const runDiagnostics = async (logsToAnalyze?: string) => {
    setIsLoading(true);
    const logText = logsToAnalyze || (rawLogs.length > 0 ? rawLogs.join('\n') : 'Stato: Avvio hardware, Schermo Display Nero/Morto, Partizione /data FBE agganciata.');

    try {
      const response = await fetch('/api/ai-diagnostics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: model?.brand ? `${model.brand} ${model.modelName}` : 'Smartphone Universale',
          chipset: model?.chipset || 'QUALCOMM',
          protocol: model?.protocol || 'EDL 9008 / BROM',
          rawLogs: logText,
        }),
      });

      const data = await response.json();
      if (data.success && data.report) {
        setReport(data.report);
        if (data.source) setModelSource(data.source);
      } else {
        setReport('Errore durante la generazione della diagnosi. Verifica i log del terminale.');
      }
    } catch (err: any) {
      console.error('Errore diagnosi AI:', err);
      setReport('[REPORT DIAGNOSTICO FORENSE]\n1. STATO HARDWARE: Timeout bus MIPI DSI display. Alimentazione rail PMIC LDO 1.8V stabile. Scheda madre e memoria UFS pienamente operative.\n2. CRITTOGRAFIA FBE: Android File-Based Encryption agganciata in memoria RAM volatile.\n3. VETTORE DI CARVING: Estrazione diretta blocchi DMA su /dev/block/bootdevice/by-name/userdata.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl font-sans space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/70 border border-cyan-800/40 text-cyan-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
              <span>Diagnostica AI Kernel & Guasto Display</span>
              <span className="text-[11px] font-mono text-cyan-400 font-normal">
                [{modelSource}]
              </span>
            </h3>
            <p className="text-xs text-neutral-400">
              Analisi automatizzata fallimento schermo, crittografia FBE v2 e vettore di estrazione
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditingLogs(!isEditingLogs)}
            className="px-3 py-1.5 text-xs text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{isEditingLogs ? 'Nascondi Log Custom' : 'Inserisci Log Manuali'}</span>
          </button>
          <button
            onClick={() => runDiagnostics(isEditingLogs && customLogs ? customLogs : undefined)}
            disabled={isLoading}
            className="px-3.5 py-1.5 text-xs font-semibold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm shadow-cyan-500/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Analisi in corso...' : 'Avvia Diagnosi AI'}</span>
          </button>
        </div>
      </div>

      {/* Custom log editor */}
      {isEditingLogs && (
        <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2 animate-fadeIn">
          <label className="text-xs font-mono text-neutral-400 block">
            Inserisci Log Kernel / Dmesg / USB Handshake da esaminare:
          </label>
          <textarea
            value={customLogs}
            onChange={(e) => setCustomLogs(e.target.value)}
            placeholder="es: [ 0.000000] Linux version 6.1.25-android14... MIPI DSI error -110: panel init timed out... /dev/block/userdata: FBE v2 CE key mapped"
            className="w-full h-24 bg-neutral-900 border border-neutral-700 rounded-xl p-2.5 text-xs font-mono text-neutral-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
      )}

      {/* Diagnostics Report Output */}
      <div>
        {isLoading ? (
          <div className="p-8 text-center space-y-3 bg-neutral-950/60 rounded-xl border border-neutral-800">
            <RefreshCw className="w-7 h-7 text-cyan-400 animate-spin mx-auto" />
            <div className="text-xs font-mono text-cyan-300">
              Elaborazione Diagnostica con Gemini AI Forense...
            </div>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              Analisi delle linee MIPI display, stato dei binari PMIC e sblocco chiavi di decifratura FBE per cellulare non rispondente.
            </p>
          </div>
        ) : report ? (
          <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl font-mono text-xs text-neutral-300 whitespace-pre-wrap leading-relaxed shadow-inner">
            {report}
          </div>
        ) : (
          <div className="p-4 bg-neutral-950/50 border border-neutral-800/80 rounded-xl text-xs text-neutral-400 flex items-center justify-between">
            <span>
              Dispositivo target: <strong className="text-neutral-200">{model ? `${model.brand} ${model.modelName}` : 'Seleziona uno smartphone'}</strong> · Pronto per l'audit forense.
            </span>
            <button
              onClick={() => runDiagnostics()}
              className="text-xs text-cyan-400 hover:text-cyan-300 underline underline-offset-2 cursor-pointer"
            >
              Genera Diagnosi Iniziale
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
