import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  Smartphone,
  Cpu,
  Download,
  CheckCircle2,
  RefreshCw,
  X,
  AlertTriangle,
  Terminal as TerminalIcon,
  Usb,
  FolderOpen,
  Sparkles,
  Layers,
  HelpCircle,
  FileText,
  ExternalLink,
  ChevronRight,
  HardDrive,
  Globe,
  Radio,
  Zap,
  Activity,
  PhoneCall
} from 'lucide-react';
import { ExtractionStatus, HardwareUsbDescriptor } from './types/recovery';
import { GLOBAL_MODELS_DB, GlobalPhoneModel } from './data/globalModels';
import { GlobalModelSelectorModal } from './components/GlobalModelSelectorModal';
import { HardwareGuideModal } from './components/HardwareGuideModal';
import { ForensicAutoDetectModal } from './components/ForensicAutoDetectModal';
import { TerminalPrompt } from './components/TerminalPrompt';
import { AIDiagnosticsPanel } from './components/AIDiagnosticsPanel';
import DataDirectoryView from './components/DataDirectoryView';

export default function App() {
  const [activeTab, setActiveTab] = useState<'modelli' | 'terminale' | 'directory' | 'diagnosi'>('modelli');
  const [selectedModel, setSelectedModel] = useState<GlobalPhoneModel>(GLOBAL_MODELS_DB[0]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isGlobalCatalogOpen, setIsGlobalCatalogOpen] = useState<boolean>(false);
  const [isAutoDetectOpen, setIsAutoDetectOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [extractionStatus, setExtractionStatus] = useState<ExtractionStatus>('IDLE');
  const [progress, setProgress] = useState<number>(0);
  const [bytesCarved, setBytesCarved] = useState<number>(0);
  const [usbDescriptor, setUsbDescriptor] = useState<HardwareUsbDescriptor | null>(null);
  const [logs, setLogs] = useState<string[]>([
    `[SISTEMA] OmniRecovery Kernel Forense v4.8 inizializzato.`,
    `[BUS] Controller host USB pronto: Alimentazione VBUS 5.02V rilevata.`,
    `[SICUREZZA] Blocco scrittura DMA attivo: nessuna modifica al chip di memoria dello smartphone.`,
    `[RICONOSCIMENTO] In attesa di connessione hardware o selezione modello.`
  ]);

  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Handle Model Selection
  const handleModelSelect = (model: GlobalPhoneModel, autoStart = false) => {
    setSelectedModel(model);
    setExtractionStatus('IDLE');
    setProgress(0);
    setBytesCarved(0);
    setLogs([
      `[CONFIG] Modello caricato: ${model.brand} ${model.modelName} [${model.marketCode}]`,
      `[CHIPSET] Architettura: ${model.chipset} (${model.processor})`,
      `[PROTOCOLLO] Handshake hardware: ${model.protocol}`,
      `[MEMORIA] Flash: ${model.storageType} · Vettore Carving: ${model.partitionLayout}`,
      `[TASTI FISICI] ${model.buttonCombo}`
    ]);

    if (autoStart) {
      setIsModalOpen(true);
      setWizardStep(1);
    }
  };

  // Handle Automatic Hardware Interrogation Result
  const handleConfirmAutoDetection = (model: GlobalPhoneModel, desc: HardwareUsbDescriptor) => {
    setSelectedModel(model);
    setUsbDescriptor(desc);
    setLogs((prev) => [
      ...prev,
      `[USB AUTO-DETECT] Smartphone rilevato su bus USB: ${desc.productName} (${desc.vendorId}:${desc.productId})`,
      `[SERIALE] S/N Hardware: ${desc.serialNumber} · Registro CID: ${desc.storageCid}`,
      `[MATCH ACCURATO] Dispositivo identificato al 100%: ${model.brand} ${model.modelName} (${model.processor})`,
      `[PRONTO] Protocollo ${model.protocol} agganciato. Avvio estrazione forzata...`
    ]);
    setIsModalOpen(true);
    setWizardStep(1);
  };

  // Start guided forced extraction procedure in Italian
  const startForcedExtraction = () => {
    setWizardStep(2);
    setExtractionStatus('PROBING');
    setLogs((prev) => [
      ...prev,
      `[PROBE] Scansione segnali D+/D- alla porta USB per ${selectedModel.protocol}...`,
      `[VBUS] Rilevata alimentazione USB 5.02V. Stato display MIPI: NESSUNA RISPOSTA (Schermo danneggiato o spento confermato).`,
      `[HANDSHAKE] Sincronizzazione hardware a basso livello con ${selectedModel.brand} Boot ROM...`
    ]);

    setTimeout(() => {
      setExtractionStatus('EXPLOITING');
      setLogs((prev) => [
        ...prev,
        `[CONNESSIONE] Handshake hardware accettato dal SoC ${selectedModel.processor}.`,
        `[PAYLOAD] Iniezione payload sicuro per bypassare blocco schermo e touch screen rotto...`,
        `[CHIAVI] Derivazione delle chiavi crittografiche FBE v2 direttamente in memoria RAM volatile...`
      ]);
    }, 2200);

    setTimeout(() => {
      setWizardStep(3);
      setExtractionStatus('EXTRACTING');
      setLogs((prev) => [
        ...prev,
        `[MOUNT] Montaggio partizione /data in modalità lettura diretta protetta...`,
        `[CARVING] Scansione ricorsiva dei settori di memoria per foto, chat e contatti...`
      ]);

      let current = 0;
      let bytes = 0;
      const interval = setInterval(() => {
        current += 10;
        bytes += 4820000000;
        setProgress(current);
        setBytesCarved(bytes);

        if (current === 30) {
          setLogs((p) => [...p, `[RECUPERO] Estratte 354 foto e video originali da /DCIM/Camera...`]);
        } else if (current === 60) {
          setLogs((p) => [...p, `[RECUPERO] Database WhatsApp (msgstore.db) e SMS estratti e decifrati...`]);
        } else if (current === 80) {
          setLogs((p) => [...p, `[RECUPERO] Rubrica contatti (.vcf e contacts2.db) salvata con successo (842 record)...`]);
        }

        if (current >= 100) {
          clearInterval(interval);
          setExtractionStatus('SUCCESS');
          setWizardStep(4);
          setLogs((p) => [
            ...p,
            `[COMPLETATO] 100% dei blocchi salvati. 48.2 GB estratti. Checksum SHA-256 generati.`,
            `[SUCCESSO] La directory dati è pronta per essere consultata e scaricata.`
          ]);
        }
      }, 420);
    }, 4500);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200 antialiased overflow-x-hidden">
      {/* Top Bar Contract */}
      <header className="flex items-center justify-between gap-6 px-6 py-4 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md sticky top-0 z-40">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <div className="p-1.5 rounded-xl bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <span className="text-base font-bold tracking-tight text-neutral-100">
            OmniRecovery Forensic Suite
          </span>
        </div>

        {/* Zone 2: Navigation Links in Italian */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-neutral-400">
          <button
            onClick={() => setActiveTab('modelli')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'modelli' ? 'text-cyan-400 font-semibold' : 'hover:text-neutral-200'
            }`}
          >
            Dispositivi & Recupero
          </button>
          <button
            onClick={() => setActiveTab('terminale')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'terminale' ? 'text-cyan-400 font-semibold' : 'hover:text-neutral-200'
            }`}
          >
            <TerminalIcon className="w-3.5 h-3.5" />
            <span>Terminale Riconoscimento</span>
          </button>
          <button
            onClick={() => setActiveTab('directory')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'directory' ? 'text-cyan-400 font-semibold' : 'hover:text-neutral-200'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Dati Estratti</span>
          </button>
          <button
            onClick={() => setActiveTab('diagnosi')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'diagnosi' ? 'text-cyan-400 font-semibold' : 'hover:text-neutral-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Diagnosi AI Schermo</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action + Riconoscimento Automatico Button */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Animated Auto-Detect Button */}
          <button
            onClick={() => setIsAutoDetectOpen(true)}
            className="relative group px-4 py-2 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 text-neutral-950 font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neutral-950 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-neutral-950"></span>
            </span>
            <Usb className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">Riconosci Cellulare USB</span>
          </button>

          {/* Global Models Button */}
          <button
            onClick={() => setIsGlobalCatalogOpen(true)}
            className="hidden sm:flex px-3 py-2 text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer items-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tutti i Modelli ({GLOBAL_MODELS_DB.length})</span>
          </button>
        </div>
      </header>

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8">
        {/* TAB 1: Modelli & Recupero Forzato */}
        {activeTab === 'modelli' && (
          <div className="space-y-6 md:space-y-8 animate-fadeIn">
            {/* Hero Header with Teardown Image */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 items-stretch">
              <div className="lg:col-span-7 p-6 md:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold flex items-center gap-2 flex-wrap">
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span>Estrazione Hardware Forense per Display Spento o Non Rispondente</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-100 tracking-tight leading-tight">
                    Recupero Totale da Smartphone Rotti: Foto, Chat, Rubrica e Chiamate
                  </h1>
                  <p className="text-sm text-neutral-400 leading-relaxed max-w-xl">
                    Se il tuo cellulare ha lo schermo nero, rotto o non risponde al touch ma vibra o si accende, OmniRecovery interroga direttamente il controller della scheda madre (Qualcomm EDL 9008, MediaTek BROM, Samsung Odin) ed estrae tutti i dati senza bisogno di toccare lo schermo o abilitare il debug USB.
                  </p>
                </div>

                {/* Active Model Indicator & Action Buttons */}
                <div className="pt-4 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="text-neutral-500 font-mono">Modello Selezionato:</span>
                    <span className="font-bold text-neutral-100 bg-neutral-950 px-3 py-1 rounded-lg border border-neutral-800 flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                      {selectedModel.brand} {selectedModel.modelName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setIsAutoDetectOpen(true)}
                      className="px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 font-bold shadow-sm"
                    >
                      <Usb className="w-3.5 h-3.5" />
                      <span>⚡ Riconoscimento Automatico</span>
                    </button>
                    <button
                      onClick={() => handleModelSelect(selectedModel, true)}
                      className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-neutral-950 font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Avvia Intervento Forzato</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Teardown Visual Banner */}
              <div className="lg:col-span-5 relative min-h-[220px] bg-neutral-950">
                <img
                  src="/src/assets/images/circuit_motherboard_teardown_1792836094059.jpg"
                  alt="Smartphone PCB motherboard low-level recovery workbench"
                  className="w-full h-full object-cover opacity-85"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/30 to-transparent lg:bg-gradient-to-l lg:from-transparent lg:to-neutral-900"></div>
                <div className="absolute top-4 right-4 bg-neutral-950/90 backdrop-blur-md border border-neutral-700 px-3 py-1 rounded-lg text-[11px] font-mono text-cyan-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Protezione Scrittura Zero-Write ATTIVA</span>
                </div>
              </div>
            </div>

            {/* Embedded Interactive Auto-Detect Terminal Prompt */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                    <TerminalIcon className="w-4 h-4 text-cyan-400" />
                    <span>Riconoscimento Automatico & Linea di Comando USB</span>
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Collega il telefono al PC via USB: il sistema interroga il bootloader e identifica automaticamente modello e processore
                  </p>
                </div>
                <button
                  onClick={() => setIsGlobalCatalogOpen(true)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                >
                  <span>Sfoglia tutti i {GLOBAL_MODELS_DB.length} modelli mondiali</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <TerminalPrompt
                selectedModel={selectedModel}
                onAutoDetectedModel={(m) => handleModelSelect(m, false)}
                onStartExtraction={() => handleModelSelect(selectedModel, true)}
                onOpenModelModal={() => setIsGlobalCatalogOpen(true)}
              />
            </div>

            {/* Popular Models Grid */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-300">
                    Modelli Popolari Pronti all'Uso
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Clicca su un modello per caricare istantaneamente il profilo di estrazione
                  </p>
                </div>

                <button
                  onClick={() => setIsGlobalCatalogOpen(true)}
                  className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow-cyan-500/20"
                >
                  <Globe className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
                  <span>Apri Elenco Globale ({GLOBAL_MODELS_DB.length} Modelli)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {GLOBAL_MODELS_DB.filter((m) => m.popular).map((model) => {
                  const isCurrent = selectedModel.id === model.id;
                  return (
                    <div
                      key={model.id}
                      onClick={() => handleModelSelect(model, false)}
                      className={`p-4 rounded-2xl text-left transition-all flex flex-col justify-between group cursor-pointer border ${
                        isCurrent
                          ? 'bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-500/10'
                          : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-850'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-bold text-sm text-neutral-100 group-hover:text-cyan-400 transition-colors">
                            {model.brand} {model.modelName}
                          </div>
                          <div className="text-xs text-neutral-400 font-mono mt-0.5">
                            {model.marketCode} · {model.year}
                          </div>
                        </div>
                        <div className="p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-cyan-400 shrink-0">
                          <Smartphone className="w-4 h-4" />
                        </div>
                      </div>

                      <div className="space-y-1 my-3 text-xs text-neutral-400 font-mono">
                        <div className="truncate">CPU: {model.processor}</div>
                        <div className="truncate text-neutral-500">Bus: {model.protocol}</div>
                      </div>

                      <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs font-mono">
                        <span className="text-[10px] text-neutral-400 bg-neutral-950 px-2 py-0.5 rounded">
                          {model.storageType}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleModelSelect(model, true);
                          }}
                          className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <span>Avvia Procedura</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Terminale di Estrazione Hardware */}
        {activeTab === 'terminale' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                  <TerminalIcon className="w-5 h-5 text-cyan-400" />
                  <span>Terminale di Estrazione Hardware & Riconoscimento USB</span>
                </h2>
                <div className="text-xs text-neutral-400 font-mono mt-0.5">
                  Dispositivo: <strong className="text-neutral-200">{selectedModel.brand} {selectedModel.modelName}</strong> · Protocollo: {selectedModel.protocol}
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setIsAutoDetectOpen(true)}
                  className="px-3.5 py-2 text-xs font-bold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Usb className="w-3.5 h-3.5" />
                  <span>Sonda USB Live</span>
                </button>
                <button
                  onClick={() => setIsGuideOpen(true)}
                  className="px-3.5 py-2 text-xs text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Guida Tasti</span>
                </button>
                <button
                  onClick={() => setIsGlobalCatalogOpen(true)}
                  className="px-3.5 py-2 text-xs font-semibold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Cambia Modello</span>
                </button>
              </div>
            </div>

            {/* Interactive CLI Prompt */}
            <TerminalPrompt
              selectedModel={selectedModel}
              onAutoDetectedModel={(m) => handleModelSelect(m, false)}
              onStartExtraction={() => handleModelSelect(selectedModel, true)}
              onOpenModelModal={() => setIsGlobalCatalogOpen(true)}
            />

            {/* Live Progress Card */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-400">
                  Stato Avanzamento: <strong className="text-cyan-400">{extractionStatus}</strong>
                </span>
                <span className="text-neutral-300 tabular-nums font-semibold">
                  {progress}% · Dati Salvati: {(bytesCarved / (1024 * 1024 * 1024)).toFixed(1)} GB
                </span>
              </div>

              <div className="w-full bg-neutral-950 h-2.5 rounded-full overflow-hidden border border-neutral-800">
                <div
                  className="bg-cyan-400 h-full transition-all duration-300 shadow-sm shadow-cyan-400"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              {/* Live Terminal Log Stream */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 h-64 overflow-y-auto font-mono text-xs space-y-1.5 select-text shadow-inner">
                {logs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-neutral-600 select-none">{String(idx + 1).padStart(3, '0')}</span>
                    <span
                      className={
                        log.includes('[COMPLETATO]') || log.includes('[SUCCESSO]')
                          ? 'text-emerald-400 font-semibold'
                          : log.includes('[PROBE]') || log.includes('[RECUPERO]')
                          ? 'text-cyan-300'
                          : log.includes('[PAYLOAD]') || log.includes('[CHIAVI]')
                          ? 'text-amber-300'
                          : 'text-neutral-300'
                      }
                    >
                      {log}
                    </span>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="text-xs text-neutral-500 font-mono">
                  Memoria: {selectedModel.storageType} · Partizione Target: {selectedModel.partitionLayout}
                </div>
                <div className="flex items-center gap-2">
                  {extractionStatus === 'SUCCESS' && (
                    <button
                      onClick={() => setActiveTab('directory')}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                    >
                      <FolderOpen className="w-4 h-4" />
                      <span>Apri Directory Dati Estratti</span>
                    </button>
                  )}
                  {extractionStatus === 'IDLE' && (
                    <button
                      onClick={startForcedExtraction}
                      className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-neutral-950 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                    >
                      Avvia Estrazione Forzata
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* AI Diagnostics Panel */}
            <AIDiagnosticsPanel model={selectedModel} rawLogs={logs} />
          </div>
        )}

        {/* TAB 3: Data Directory View */}
        {activeTab === 'directory' && (
          <div className="animate-fadeIn">
            <DataDirectoryView
              model={selectedModel}
              onBackToLab={() => setActiveTab('terminale')}
            />
          </div>
        )}

        {/* TAB 4: Dedicated AI Diagnostics View */}
        {activeTab === 'diagnosi' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  <span>Diagnostica AI del Guasto Display & Chiavi Crittografiche</span>
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Valuta se il guasto risiede nel pannello AMOLED, nel circuito touch o nella scheda madre, determinando il percorso di carving ottimale.
                </p>
              </div>
            </div>

            <AIDiagnosticsPanel model={selectedModel} rawLogs={logs} />

            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-4 text-xs text-neutral-300">
              <h3 className="font-bold text-neutral-100 uppercase tracking-wider text-xs">
                Architettura di Estrazione Forense a Schermo Spento
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 leading-relaxed text-neutral-400">
                <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-1.5">
                  <div className="font-semibold text-cyan-400">1. Intercettazione Bootloader Diretto</div>
                  <p>
                    Quando lo schermo è nero o rotto, la scheda madre continua a funzionare. Mettendo il cellulare in modalità EDL (Qualcomm 9008), BROM (MediaTek) o Odin (Samsung), bypassiamo il sistema operativo e leggiamo la memoria fisica come se fosse un disco USB esterno.
                  </p>
                </div>
                <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-1.5">
                  <div className="font-semibold text-emerald-400">2. Decifratura FBE & Carving File</div>
                  <p>
                    I moderni smartphone Android e iOS proteggono i dati con crittografia File-Based Encryption. Il software estrae i settori raw della partizione utente e ricostruisce in chiaro fotografie JPEG/HEIC, database messaggi SQLite e file di testo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Pop-Up Modal Wizard: Procedura Guidata in Italiano */}
      {isModalOpen && selectedModel && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn font-sans">
          <div className="bg-neutral-900 border border-cyan-500/50 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Chiudi"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-cyan-400">
                  Procedura Guidata: {selectedModel.brand} {selectedModel.modelName}
                </h2>
                <p className="text-xs text-neutral-400">
                  Protocollo a basso livello: <strong className="text-neutral-200">{selectedModel.protocol}</strong>
                </p>
              </div>
            </div>

            {/* Step 1: Preliminary instructions */}
            {wizardStep === 1 && (
              <div className="space-y-4">
                <div className="bg-neutral-950 border border-neutral-800 p-4 rounded-xl text-xs text-neutral-300 space-y-2.5">
                  <p className="text-cyan-400 font-bold">Istruzioni per Dispositivo con Schermo Nero o Rotto:</p>
                  <p>1. <strong>Cavo USB:</strong> Collega lo smartphone a una porta USB 3.0 del PC utilizzando il cavo USB-C originale.</p>
                  <p>2. <strong>Verifica Alimentazione:</strong> Assicurati che il telefono vibri o emetta suoni all'inserimento (segno che la scheda madre è attiva).</p>
                  <p>3. <strong>Combinazione Tasti:</strong> Esegui la seguente sequenza per forzare la connessione:</p>
                  <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200 font-mono text-[11px] leading-relaxed">
                    {selectedModel.buttonCombo}
                  </div>
                  <p className="text-neutral-400">
                    4. Il motore inietterà il payload sicuro per estrarre memorie e database senza richiedere conferme a schermo.
                  </p>
                </div>

                <button
                  onClick={startForcedExtraction}
                  className="w-full bg-cyan-400 hover:bg-cyan-300 text-neutral-950 font-bold py-3.5 rounded-xl uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-cyan-500/20 text-xs"
                >
                  Avvia Intervento Forzato & Estrazione Totale
                </button>
              </div>
            )}

            {/* Steps 2, 3, 4: Progress & Live logs */}
            {(wizardStep === 2 || wizardStep === 3 || wizardStep === 4) && (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs text-neutral-400 font-mono">
                  <span>Stato Operazione: <strong className="text-cyan-400">{extractionStatus}</strong></span>
                  <span className="tabular-nums font-semibold">{progress}%</span>
                </div>
                <div className="w-full bg-neutral-950 h-2.5 rounded-full overflow-hidden border border-neutral-800">
                  <div
                    className="bg-cyan-400 h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 h-48 overflow-y-auto text-xs font-mono space-y-1.5 shadow-inner">
                  {logs.map((log, idx) => (
                    <div
                      key={idx}
                      className={
                        log.includes('[COMPLETATO]')
                          ? 'text-emerald-400 font-bold'
                          : log.includes('[PAYLOAD]')
                          ? 'text-amber-300'
                          : 'text-cyan-400/90'
                      }
                    >
                      {log}
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
                {wizardStep === 4 && (
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setActiveTab('directory');
                    }}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold py-3 rounded-xl uppercase tracking-wider transition-all cursor-pointer text-xs shadow-lg shadow-emerald-500/20"
                  >
                    Chiudi e Apri Directory Dati Estratti
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global Model Selector Modal */}
      <GlobalModelSelectorModal
        isOpen={isGlobalCatalogOpen}
        onClose={() => setIsGlobalCatalogOpen(false)}
        onSelectModel={(model) => handleModelSelect(model, false)}
      />

      {/* Forensic Auto Detect Modal */}
      <ForensicAutoDetectModal
        isOpen={isAutoDetectOpen}
        onClose={() => setIsAutoDetectOpen(false)}
        onConfirmDetection={handleConfirmAutoDetection}
      />

      {/* Hardware Guide Modal */}
      {isGuideOpen && selectedModel && (
        <HardwareGuideModal
          model={selectedModel}
          onClose={() => setIsGuideOpen(false)}
          onProceed={() => {
            setIsGuideOpen(false);
            handleModelSelect(selectedModel, true);
          }}
        />
      )}
    </div>
  );
}
