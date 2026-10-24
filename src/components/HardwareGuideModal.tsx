import React from 'react';
import { X, Cpu, Cable, AlertCircle, Wrench, Zap, CheckCircle2, ShieldAlert } from 'lucide-react';
import { GlobalPhoneModel } from '../data/globalModels';

interface HardwareGuideModalProps {
  model: GlobalPhoneModel | null;
  onClose: () => void;
  onProceed: () => void;
}

export const HardwareGuideModal: React.FC<HardwareGuideModalProps> = ({ model, onClose, onProceed }) => {
  if (!model) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 font-sans animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-700/80 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/70 border border-cyan-800/50 text-cyan-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-neutral-100">
                  Guida Hardware a Basso Livello: {model.brand} {model.modelName}
                </h2>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/60">
                  {model.chipset}
                </span>
              </div>
              <div className="text-xs text-neutral-400 font-mono mt-0.5">
                Codice: {model.marketCode} · Protocollo: {model.protocol}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Chiudi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-neutral-300">
          {/* Hardware Motherboard Pinout Visual */}
          <div className="rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 relative">
            <div className="h-48 w-full relative">
              <img
                src="/src/assets/images/circuit_motherboard_teardown_1792836094059.jpg"
                alt="Smartphone motherboard hardware diagnostic pinout"
                className="w-full h-full object-cover opacity-85"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent"></div>
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider">
                    Mappa Scheda Madre & Testpoint
                  </div>
                  <div className="text-xs text-neutral-300">
                    Controller USB ad alta velocità e piazzole di forzatura hardware
                  </div>
                </div>
                <div className="text-xs font-mono bg-neutral-900/90 border border-neutral-700 px-2.5 py-1 rounded text-neutral-300">
                  {model.vid_pid}
                </div>
              </div>
            </div>
          </div>

          {/* Key Combination */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              1. Combinazione Tasti Fisici (Per Schermi Neri o Non Rispondenti)
            </h3>
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 font-mono text-xs leading-relaxed">
              {model.buttonCombo}
            </div>
            <p className="text-xs text-neutral-400">
              💡 <strong>Consiglio Tecnico:</strong> Poiché lo schermo è spento o danneggiato, presta attenzione alla leggera vibrazione di avvio (feedback aptico) o al suono di connessione periferica sul PC.
            </p>
          </div>

          {/* Testpoint & Deep Force Recovery */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-cyan-400" />
              2. Forzatura Hardware via Testpoint (Se la combinazione tasti fallisce)
            </h3>
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 space-y-2">
              <p className="font-mono text-cyan-300">{model.testpointGuide}</p>
              <div className="text-neutral-400 flex items-center justify-between pt-2 border-t border-neutral-900 font-mono text-[11px]">
                <span>Memoria: <strong className="text-neutral-200">{model.storageType}</strong></span>
                <span>Partizione: <strong className="text-neutral-200">{model.partitionLayout}</strong></span>
              </div>
            </div>
          </div>

          {/* Safety & Anti-Tamper Notice */}
          <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800/80 flex items-start gap-3 text-xs text-neutral-400">
            <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p>
              <strong>Criterio di Sicurezza Forense:</strong> L'estrazione sfrutta l'accesso diretto alla memoria in sola lettura (Zero-Write Policy). Nessun file o dato presente sullo smartphone viene sovrascritto o alterato.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            Annulla
          </button>
          <button
            onClick={onProceed}
            className="px-5 py-2.5 text-xs font-bold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Conferma e Avvia Estrazione Forzata</span>
          </button>
        </div>
      </div>
    </div>
  );
};
