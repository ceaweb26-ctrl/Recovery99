import React, { useState, useMemo } from 'react';
import { Search, Smartphone, X, Cpu, Zap, CheckCircle2, ChevronRight, Globe, Layers, Filter } from 'lucide-react';
import { GLOBAL_MODELS_DB, GlobalPhoneModel } from '../data/globalModels';
import { BrandConfig } from '../types/recovery';

interface GlobalModelSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModel: (model: GlobalPhoneModel) => void;
}

export const GlobalModelSelectorModal: React.FC<GlobalModelSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectModel,
}) => {
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('Tutti');

  const brandsList = useMemo(() => {
    const list = ['Tutti', 'Samsung', 'Xiaomi', 'Apple', 'Google', 'OnePlus', 'OPPO', 'Huawei', 'Motorola', 'Sony', 'Universale'];
    return list;
  }, []);

  const filteredModels = useMemo(() => {
    return GLOBAL_MODELS_DB.filter((model) => {
      const matchBrand = selectedBrand === 'Tutti' || model.brand.toLowerCase() === selectedBrand.toLowerCase();
      const q = search.toLowerCase();
      const matchSearch =
        model.modelName.toLowerCase().includes(q) ||
        model.brand.toLowerCase().includes(q) ||
        model.marketCode.toLowerCase().includes(q) ||
        model.processor.toLowerCase().includes(q) ||
        model.protocol.toLowerCase().includes(q);

      return matchBrand && matchSearch;
    });
  }, [search, selectedBrand]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 font-sans animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/70 border border-cyan-800/50 text-cyan-400">
              <Globe className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-neutral-100">
                  Database Modelli Mondiali Smartphone
                </h2>
                <span className="text-xs bg-cyan-950/80 text-cyan-300 border border-cyan-800/50 px-2 py-0.5 rounded-full font-mono">
                  {GLOBAL_MODELS_DB.length} Profili Hardware
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Seleziona qualsiasi dispositivo per caricare automaticamente pinout, baud rate e vettore di carving
              </p>
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

        {/* Search & Brand Filter Bar */}
        <div className="p-4 bg-neutral-950/60 border-b border-neutral-800 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cerca modello (es: S24 Ultra, Xiaomi 14, iPhone 15, Pixel 8, SM-S928B, Snapdragon 8)..."
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl pl-10 pr-4 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-cyan-500"
              autoFocus
            />
          </div>

          {/* Quick Brand Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {brandsList.map((brand) => (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedBrand === brand
                    ? 'bg-cyan-500 text-neutral-950 font-bold shadow-sm shadow-cyan-500/20'
                    : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 border border-neutral-800'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>

        {/* Models List Grid */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredModels.map((model) => (
              <div
                key={model.id}
                onClick={() => {
                  onSelectModel(model);
                  onClose();
                }}
                className="bg-neutral-950/80 border border-neutral-800 hover:border-cyan-500/60 p-4 rounded-xl transition-all cursor-pointer group flex flex-col justify-between space-y-3 hover:bg-neutral-900/60 shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-neutral-100 group-hover:text-cyan-400 transition-colors">
                        {model.modelName}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">
                        {model.year}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-400 font-mono mt-0.5">
                      {model.marketCode} · {model.brand}
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-cyan-400 shrink-0 group-hover:bg-cyan-950 transition-colors">
                    <Smartphone className="w-4 h-4" />
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-neutral-400">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="text-neutral-300 truncate">{model.processor}</span>
                  </div>
                  <div className="text-[11px] text-neutral-500 font-mono truncate">
                    Protocollo: <span className="text-neutral-300">{model.protocol}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-900 flex items-center justify-between text-xs">
                  <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded">
                    Memoria: {model.storageType}
                  </span>
                  <span className="text-xs font-semibold text-cyan-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    <span>Configura e Avvia</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredModels.length === 0 && (
            <div className="p-12 text-center text-xs text-neutral-500 space-y-2">
              <Smartphone className="w-8 h-8 mx-auto opacity-40 text-neutral-400" />
              <p>Nessun modello trovato per "{search}". Prova a cercare per marca (es: Samsung, Xiaomi, Apple) o processore.</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <div>
            Totale modelli disponibili: <strong className="text-neutral-200">{filteredModels.length}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg transition-colors cursor-pointer"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
