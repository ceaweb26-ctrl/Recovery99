export type ChipsetType = 'QUALCOMM' | 'MEDIATEK' | 'EXYNOS' | 'APPLE' | 'TENSOR' | 'UNIVERSAL';

export interface BrandConfig {
  id: string;
  name: string;
  chipset: ChipsetType;
  protocol: string;
  edl_pid?: string;
  vid_pid?: string;
  buttonCombo: string;
  testpointNotes: string;
  baudRate: string;
  carvingProfile: string;
}

export type ExtractionStatus = 'IDLE' | 'PROBING' | 'EXPLOITING' | 'EXTRACTING' | 'SUCCESS' | 'ERROR';

export interface DiagnosticLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'PROBE' | 'EXPLOIT' | 'EXTRACT' | 'SUCCESS' | 'WARN' | 'AI';
  message: string;
}

export interface PartitionInfo {
  name: string;
  sectorStart: string;
  sizeBytes: number;
  sizeFormatted: string;
  filesystem: string;
  carvedItems: number;
  status: 'Ready' | 'Carving' | 'Mounted' | 'Secured';
}

export type FileCategory = 'photos' | 'messages' | 'contacts' | 'calls' | 'documents' | 'partitions';

export interface RecoveredFile {
  id: string;
  name: string;
  category: FileCategory;
  path: string;
  sizeFormatted: string;
  sizeBytes: number;
  modifiedDate: string;
  sha256: string;
  previewUrl?: string;
  rawSnippet?: string;
  metadata: {
    format: string;
    resolution?: string;
    sender?: string;
    entriesCount?: number;
    encryptionStatus: 'Decrypted' | 'Cleartext' | 'FBE-Unwrapped';
    recoveredPartition: string;
  };
}

export interface ChatMessage {
  id: string;
  sender: string;
  isSelf: boolean;
  time: string;
  text: string;
  media?: string;
}

export interface ContactRecord {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  company?: string;
  notes?: string;
  avatarColor: string;
}

export interface CallLogRecord {
  id: string;
  name: string;
  number: string;
  type: 'inbound' | 'outbound' | 'missed';
  duration: string;
  timestamp: string;
  simSlot: string;
}

export interface HardwareUsbDescriptor {
  vendorId: string;
  productId: string;
  deviceClass: string;
  manufacturerName: string;
  productName: string;
  serialNumber: string;
  negotiatedSpeed: string;
  vbusVoltage: string;
  dPlusSignal: string;
  dMinusSignal: string;
  handshakeState: string;
  storageCid: string;
  chipRev: string;
}
