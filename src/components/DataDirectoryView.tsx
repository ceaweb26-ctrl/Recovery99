import React, { useState, useMemo } from 'react';
import {
  Folder,
  Image as ImageIcon,
  MessageSquare,
  Users,
  FileText,
  HardDrive,
  PhoneCall,
  Search,
  Download,
  Eye,
  FileCode,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  Sparkles,
  ArrowLeft,
  FileCheck,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed
} from 'lucide-react';
import { RecoveredFile, FileCategory, CallLogRecord } from '../types/recovery';
import { GlobalPhoneModel } from '../data/globalModels';
import { MOCK_RECOVERED_FILES, MOCK_CHATS, MOCK_CONTACTS, MOCK_PARTITIONS, MOCK_CALLS } from '../data/mockData';
import { HexViewerModal } from './HexViewerModal';

interface DataDirectoryViewProps {
  model?: GlobalPhoneModel | null;
  onBackToLab?: () => void;
}

export const DataDirectoryView: React.FC<DataDirectoryViewProps> = ({ model, onBackToLab }) => {
  const [selectedCategory, setSelectedCategory] = useState<FileCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<RecoveredFile | null>(MOCK_RECOVERED_FILES[0]);
  const [hexModalFile, setHexModalFile] = useState<RecoveredFile | null>(null);
  const [previewImageModal, setPreviewImageModal] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Category counts
  const categoryCounts = useMemo(() => {
    return {
      all: MOCK_RECOVERED_FILES.length,
      photos: MOCK_RECOVERED_FILES.filter((f) => f.category === 'photos').length,
      messages: MOCK_RECOVERED_FILES.filter((f) => f.category === 'messages').length,
      contacts: MOCK_RECOVERED_FILES.filter((f) => f.category === 'contacts').length,
      calls: MOCK_CALLS.length,
      documents: MOCK_RECOVERED_FILES.filter((f) => f.category === 'documents').length,
      partitions: MOCK_RECOVERED_FILES.filter((f) => f.category === 'partitions').length,
    };
  }, []);

  // Filtered files
  const filteredFiles = useMemo(() => {
    return MOCK_RECOVERED_FILES.filter((file) => {
      const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        file.name.toLowerCase().includes(q) ||
        file.path.toLowerCase().includes(q) ||
        file.sha256.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Filtered calls
  const filteredCalls = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return MOCK_CALLS.filter((c) => c.name.toLowerCase().includes(q) || c.number.includes(q));
  }, [searchQuery]);

  // "RECUPERA TUTTO": One-click full forensic package export
  const handleRecuperaTutto = () => {
    const fullForensicPackage = {
      intestazioneForense: {
        tipoIntervento: 'Estrazione Hardware a Basso Livello per Display Non Rispondente',
        dispositivoTarget: model ? `${model.brand} ${model.modelName}` : 'Smartphone Universale Riconosciuto',
        codiceModello: model?.marketCode || 'SM-S928B',
        chipsetSoC: model?.processor || 'Qualcomm Snapdragon 8 Gen 3',
        protocolloBus: model?.protocol || 'Qualcomm EDL 9008 / BROM',
        dataAcquisizione: new Date().toLocaleString('it-IT'),
        integritaForense: 'SHA-256 e MD5 Verificati (Nessun settore alterato)',
        politicaScrittura: 'DMA Hardware Read-Only (Zero-Write Policy Enforced)',
      },
      riepilogoDatiEstratti: {
        totaleFotoCamera: '354 file salvati da /DCIM/Camera',
        databaseChat: 'WhatsApp (msgstore.db.crypt14) e SMS telephony provider',
        rubricaTelefonica: `${MOCK_CONTACTS.length} contatti sincronizzati in formato vCard 3.0 standard`,
        registroChiamate: `${MOCK_CALLS.length} chiamate in entrata, uscita e perse`,
        partizioniMappate: MOCK_PARTITIONS.map((p) => `${p.name} (${p.sizeFormatted})`),
      },
      contattiVCardDump: MOCK_CONTACTS.map((c) => `BEGIN:VCARD\nVERSION:3.0\nFN:${c.fullName}\nTEL:${c.phone}\nEMAIL:${c.email}\nORG:${c.company || ''}\nEND:VCARD`).join('\n\n'),
      registroFileSalvati: MOCK_RECOVERED_FILES.map((f) => ({
        nome: f.name,
        percorso: f.path,
        dimensione: f.sizeFormatted,
        sha256: f.sha256,
        statoCrittografico: f.metadata.encryptionStatus,
        settoreMemoria: f.metadata.recoveredPartition,
      })),
      elencoChiamate: MOCK_CALLS,
    };

    const blob = new Blob([JSON.stringify(fullForensicPackage, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RECUPERO_TOTALE_FORENSE_${model?.brand || 'SMARTPHONE'}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    // Also download ready-to-import .VCF phonebook file
    const vcfBlob = new Blob([fullForensicPackage.contattiVCardDump], { type: 'text/vcard' });
    const vcfUrl = URL.createObjectURL(vcfBlob);
    const vcfA = document.createElement('a');
    vcfA.href = vcfUrl;
    vcfA.download = `RUBRICA_RECUPERATA_${Date.now()}.vcf`;
    vcfA.click();
    URL.revokeObjectURL(vcfUrl);

    setExportNotice('RECUPERO TOTALE COMPLETATO: Pacchetto Forense JSON e Rubrica VCF esportati con successo!');
    setTimeout(() => setExportNotice(null), 5000);
  };

  // Download individual file
  const handleDownloadFile = (file: RecoveredFile) => {
    if (file.previewUrl) {
      const a = document.createElement('a');
      a.href = file.previewUrl;
      a.download = file.name;
      a.click();
    } else {
      const content = `[OMNI-RECOVERY // ESTREMI FORENSI DEL FILE RECUPERATO]\nNome: ${file.name}\nPercorso: ${file.path}\nSHA-256: ${file.sha256}\nSettore NAND: ${file.metadata.recoveredPartition}\n\nDUMP RAW CONTENUTO:\n${file.rawSnippet || 'BLOCCO DATI VALIDO'}`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.endsWith('.bin') ? file.name : `${file.name}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }

    setExportNotice(`File estratto "${file.name}" salvato.`);
    setTimeout(() => setExportNotice(null), 3000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 font-sans">
      {/* Top Banner & Context */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 max-w-2xl">
          <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono mb-1.5 flex-wrap">
            <span>Archivio Memoria NAND</span>
            <span>/</span>
            <span className="text-cyan-400 font-semibold truncate">
              {model ? `${model.brand} ${model.modelName}` : 'Smartphone Riconosciuto'}
            </span>
            <span>/</span>
            <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded text-[11px] whitespace-nowrap">
              /data FBE Decifrata [ZERO-WRITE DMA]
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-neutral-100 tracking-tight truncate">
            Directory Forense Dati Estratti & Registro Completo
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Tutti i contenuti sono stati estratti direttamente dai blocchi fisici della memoria senza passare dal display.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {onBackToLab && (
            <button
              onClick={onBackToLab}
              className="px-3.5 py-2 text-xs text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Torna al Terminale</span>
            </button>
          )}

          {/* Ultra Powerful RECUPERA TUTTO Button */}
          <button
            onClick={handleRecuperaTutto}
            className="px-5 py-2.5 text-xs font-extrabold text-neutral-950 bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-400 hover:from-emerald-300 hover:to-sky-300 rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span>RECUPERA TUTTO // SCARICA ARCHIVIO</span>
          </button>
        </div>
      </div>

      {/* Export notification toast */}
      {exportNotice && (
        <div className="p-3.5 bg-emerald-950/90 border border-emerald-600/80 text-emerald-300 text-xs rounded-xl flex items-center gap-2 animate-fadeIn shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{exportNotice}</span>
        </div>
      )}

      {/* Category Tabs & Search Bar */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-neutral-800 text-cyan-400 border border-neutral-700 font-semibold'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-950'
            }`}
          >
            <Folder className="w-3.5 h-3.5" />
            <span>Tutti i File ({categoryCounts.all})</span>
          </button>

          <button
            onClick={() => setSelectedCategory('photos')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              selectedCategory === 'photos'
                ? 'bg-neutral-800 text-cyan-400 border border-neutral-700 font-semibold'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-950'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Foto & Video ({categoryCounts.photos})</span>
          </button>

          <button
            onClick={() => setSelectedCategory('messages')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              selectedCategory === 'messages'
                ? 'bg-neutral-800 text-cyan-400 border border-neutral-700 font-semibold'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-950'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp & SMS ({categoryCounts.messages})</span>
          </button>

          <button
            onClick={() => setSelectedCategory('contacts')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              selectedCategory === 'contacts'
                ? 'bg-neutral-800 text-cyan-400 border border-neutral-700 font-semibold'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-950'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Rubrica ({categoryCounts.contacts})</span>
          </button>

          <button
            onClick={() => setSelectedCategory('calls')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              selectedCategory === 'calls'
                ? 'bg-neutral-800 text-cyan-400 border border-neutral-700 font-semibold'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-950'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Registro Chiamate ({categoryCounts.calls})</span>
          </button>

          <button
            onClick={() => setSelectedCategory('documents')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              selectedCategory === 'documents'
                ? 'bg-neutral-800 text-cyan-400 border border-neutral-700 font-semibold'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-950'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Documenti ({categoryCounts.documents})</span>
          </button>

          <button
            onClick={() => setSelectedCategory('partitions')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              selectedCategory === 'partitions'
                ? 'bg-neutral-800 text-cyan-400 border border-neutral-700 font-semibold'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-950'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Partizioni RAW ({categoryCounts.partitions})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca file, percorsi, chiamate, hash..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {selectedCategory === 'calls' ? (
        /* Calls Log Dedicated Table */
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
            <span className="font-semibold text-neutral-200 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-cyan-400" />
              <span>Registro Chiamate Decifrato ({filteredCalls.length} record)</span>
            </span>
            <span className="font-mono text-[11px] text-neutral-500">
              Provider Telephony mmssms / calllog.db
            </span>
          </div>

          <div className="divide-y divide-neutral-800/80 max-h-[500px] overflow-y-auto">
            {filteredCalls.map((call) => (
              <div key={call.id} className="p-3.5 flex items-center justify-between gap-4 hover:bg-neutral-950/50 transition-colors text-xs">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${
                    call.type === 'inbound'
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40'
                      : call.type === 'outbound'
                      ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-800/40'
                      : 'bg-rose-950/80 text-rose-400 border border-rose-800/40'
                  }`}>
                    {call.type === 'inbound' && <PhoneIncoming className="w-4 h-4" />}
                    {call.type === 'outbound' && <PhoneOutgoing className="w-4 h-4" />}
                    {call.type === 'missed' && <PhoneMissed className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-bold text-neutral-200">{call.name}</div>
                    <div className="text-[11px] text-neutral-400 font-mono mt-0.5">{call.number}</div>
                  </div>
                </div>

                <div className="text-right font-mono text-[11px]">
                  <div className="text-neutral-300 font-semibold">{call.duration}</div>
                  <div className="text-neutral-500">{call.timestamp} · {call.simSlot}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Regular Split: Files List + Inspector */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Files Table (7 cols) */}
          <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
            <div className="p-3.5 bg-neutral-950/70 border-b border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
              <span className="font-semibold text-neutral-300">
                Registro File Estratti ({filteredFiles.length} elementi)
              </span>
              <span className="text-neutral-500 text-[11px] font-mono">
                Lettura Diretta DMA Sola Lettura
              </span>
            </div>

            <div className="divide-y divide-neutral-800/80 max-h-[580px] overflow-y-auto">
              {filteredFiles.map((file) => {
                const isSelected = selectedFile?.id === file.id;
                return (
                  <div
                    key={file.id}
                    onClick={() => setSelectedFile(file)}
                    className={`p-3.5 flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                      isSelected ? 'bg-cyan-950/40 border-l-2 border-l-cyan-400' : 'hover:bg-neutral-950/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-cyan-400 shrink-0">
                        {file.category === 'photos' && <ImageIcon className="w-4 h-4" />}
                        {file.category === 'messages' && <MessageSquare className="w-4 h-4" />}
                        {file.category === 'contacts' && <Users className="w-4 h-4" />}
                        {file.category === 'documents' && <FileText className="w-4 h-4" />}
                        {file.category === 'partitions' && <HardDrive className="w-4 h-4" />}
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs font-bold text-neutral-100 truncate font-mono">
                          {file.name}
                        </div>
                        <div className="text-[11px] text-neutral-500 truncate font-mono mt-0.5">
                          {file.path}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-medium text-neutral-300 tabular-nums">
                        {file.sizeFormatted}
                      </div>
                      <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                        {file.modifiedDate.split(' ')[0]}
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredFiles.length === 0 && (
                <div className="p-12 text-center text-xs text-neutral-500 space-y-2">
                  <Search className="w-6 h-6 mx-auto opacity-50" />
                  <p>Nessun file estratto corrisponde ai criteri di ricerca.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: File Details & Preview Inspector (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {selectedFile ? (
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                    Ispettore Dati Selezionati
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setHexModalFile(selectedFile)}
                      className="px-2.5 py-1 text-xs text-cyan-300 hover:text-white bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/60 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <FileCode className="w-3.5 h-3.5" />
                      <span>Dump Esadecimale (HEX)</span>
                    </button>
                    <button
                      onClick={() => handleDownloadFile(selectedFile)}
                      className="p-1.5 text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-colors cursor-pointer"
                      title="Scarica File"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Visual preview for photos */}
                {selectedFile.previewUrl && (
                  <div className="rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 relative group">
                    <img
                      src={selectedFile.previewUrl}
                      alt={selectedFile.name}
                      className="w-full h-48 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                      onClick={() => setPreviewImageModal(selectedFile.previewUrl || null)}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setPreviewImageModal(selectedFile.previewUrl || null)}
                        className="px-2.5 py-1 bg-black/80 hover:bg-black text-neutral-200 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ingrandisci</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Chat preview if WhatsApp or SMS DB */}
                {selectedFile.category === 'messages' && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-neutral-400">
                      Messaggi Decifrati ({selectedFile.metadata.entriesCount?.toLocaleString()} record nel database)
                    </div>
                    <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2.5 max-h-52 overflow-y-auto font-sans text-xs">
                      {MOCK_CHATS.map((chat) => (
                        <div
                          key={chat.id}
                          className={`flex flex-col ${chat.isSelf ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-[85%] p-2.5 rounded-xl ${
                              chat.isSelf
                                ? 'bg-cyan-950/80 text-cyan-100 border border-cyan-800/40'
                                : 'bg-neutral-800/90 text-neutral-200 border border-neutral-700/50'
                            }`}
                          >
                            <div className="text-[10px] text-neutral-400 mb-1 flex items-center gap-1">
                              <span className="font-semibold text-neutral-300">{chat.sender}</span>
                              <span>·</span>
                              <span>{chat.time}</span>
                            </div>
                            <p className="text-xs leading-relaxed">{chat.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contacts preview if contacts DB */}
                {selectedFile.category === 'contacts' && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-neutral-400">
                      Contatti Trovati ({MOCK_CONTACTS.length} mostrati)
                    </div>
                    <div className="divide-y divide-neutral-800 bg-neutral-950 border border-neutral-800 rounded-xl max-h-52 overflow-y-auto">
                      {MOCK_CONTACTS.map((c) => (
                        <div key={c.id} className="p-2.5 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${c.avatarColor}`}>
                              {c.fullName[0]}
                            </div>
                            <div>
                              <div className="font-semibold text-neutral-200">{c.fullName}</div>
                              <div className="text-[11px] text-neutral-500 font-mono">{c.phone}</div>
                            </div>
                          </div>
                          <div className="text-[11px] text-neutral-400 truncate max-w-[120px]">{c.email}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Raw snippet preview if documents or partitions */}
                {(selectedFile.category === 'documents' || selectedFile.category === 'partitions') && (
                  <div className="space-y-1.5">
                    <div className="text-xs font-semibold text-neutral-400">
                      Intestazione Blocco & Firma Digitale:
                    </div>
                    <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-mono text-cyan-300 whitespace-pre-wrap max-h-36 overflow-y-auto">
                      {selectedFile.rawSnippet}
                    </div>
                  </div>
                )}

                {/* Metadata Details Grid */}
                <div className="space-y-2 text-xs border-t border-neutral-800 pt-3">
                  <div className="grid grid-cols-2 gap-2 text-neutral-400 font-mono text-[11px]">
                    <div>
                      <span className="text-neutral-500">Formato:</span> {selectedFile.metadata.format}
                    </div>
                    <div>
                      <span className="text-neutral-500">Stato FBE:</span>{' '}
                      <span className="text-emerald-400 font-medium">{selectedFile.metadata.encryptionStatus}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Dimensione:</span> {selectedFile.sizeBytes.toLocaleString()} Byte
                    </div>
                    <div>
                      <span className="text-neutral-500">Data Ultima Modifica:</span> {selectedFile.modifiedDate}
                    </div>
                  </div>

                  <div className="pt-2 text-[11px] font-mono text-neutral-500">
                    <div>Checksum Crittografico SHA-256:</div>
                    <div className="text-neutral-300 break-all select-all mt-0.5">{selectedFile.sha256}</div>
                  </div>
                </div>

                {/* Bottom Action */}
                <button
                  onClick={() => handleDownloadFile(selectedFile)}
                  className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Salva "{selectedFile.name}" sul Tuo Disco</span>
                </button>
              </div>
            ) : (
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center text-xs text-neutral-500">
                Seleziona un elemento estratto dall'elenco per visualizzare anteprima, metadati e settore esadecimale.
              </div>
            )}

            {/* Partition Overview Mini-Card */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-200 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  Mappa Partizioni Memoria NAND
                </span>
                <span className="text-neutral-500 font-mono text-[11px]">Tabella GPT</span>
              </div>

              <div className="space-y-1.5 font-mono text-xs">
                {MOCK_PARTITIONS.slice(0, 3).map((p) => (
                  <div
                    key={p.name}
                    className="p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-between text-[11px]"
                  >
                    <span className="text-neutral-300 font-medium truncate max-w-[180px]">{p.name}</span>
                    <div className="flex items-center gap-2 text-neutral-400 tabular-nums">
                      <span>{p.sizeFormatted}</span>
                      <span className="text-emerald-400">{p.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hex Modal */}
      {hexModalFile && (
        <HexViewerModal file={hexModalFile} onClose={() => setHexModalFile(null)} />
      )}

      {/* Full Photo Modal */}
      {previewImageModal && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewImageModal(null)}
        >
          <div className="max-w-4xl max-h-[90vh] relative" onClick={(e) => e.stopPropagation()}>
            <img
              src={previewImageModal}
              alt="Carved image full resolution preview"
              className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain border border-neutral-700"
              referrerPolicy="no-referrer"
            />
            <button
              onClick={() => setPreviewImageModal(null)}
              className="absolute top-3 right-3 p-2 bg-neutral-900/90 text-neutral-200 rounded-full hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataDirectoryView;
