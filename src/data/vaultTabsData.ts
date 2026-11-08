import { DocumentAttachment, generateSampleDocumentSvg } from './attachmentSamples';

export type VaultTabId =
  | 'cards'
  | 'bank'
  | 'id'
  | 'note'
  | 'login'
  | 'ins'
  | 'veh'
  | 'bill';

export interface VaultProfile {
  id: string;
  name: string;
  relation: string;
  color: string;
}

export interface BankAccountItem {
  id: string;
  pid: string;
  bank: string;
  holder: string;
  kind: 'Savings' | 'Current' | 'Salary' | 'NRE/NRO';
  acno: string;
  ifsc: string;
  branch: string;
  upi: string;
  phone: string;
  custid: string;
  notes: string;
  attachments?: DocumentAttachment[];
}

export interface GovIdItem {
  id: string;
  pid: string;
  idtype: 'Aadhaar' | 'PAN' | 'Passport' | 'Driving licence' | 'Voter ID' | 'Other';
  holder: string;
  idno: string;
  dob: string;
  expiry: string;
  notes: string;
  attachments?: DocumentAttachment[];
}

export interface SecureNoteItem {
  id: string;
  pid: string;
  title: string;
  body: string;
  tags: string;
  updatedAt: string;
}

export interface InsurancePolicyItem {
  id: string;
  pid: string;
  provider: string;
  itype: 'Health' | 'Life' | 'Motor' | 'Travel' | 'Home';
  policy: string;
  holder: string;
  sumInsured: number;
  premium: number;
  start: string;
  renew: string;
  nominee: string;
  notes: string;
  attachments?: DocumentAttachment[];
}

export interface VehicleDocItem {
  id: string;
  pid: string;
  maker: string;
  vtype: 'Car' | 'Bike' | 'Scooter' | 'EV';
  reg: string;
  chassisLast5: string;
  insExp: string;
  pucExp: string;
  fastagBank: string;
  notes: string;
  attachments?: DocumentAttachment[];
}

export interface UtilityBillItem {
  id: string;
  pid: string;
  vendor: string;
  bno: string;
  amount: number;
  paidAmt: number;
  bdate: string;
  due: string;
  status: 'Unpaid' | 'Partial' | 'Paid';
  notes: string;
  attachments?: DocumentAttachment[];
}

export interface RecycleBinEntry {
  id: string;
  tab: VaultTabId;
  title: string;
  subtitle: string;
  deletedAt: number;
}

export const INITIAL_PROFILES: VaultProfile[] = [
  { id: 'all', name: 'All Profiles', relation: 'Entire Family', color: '#4f46e5' },
  { id: 'p-self', name: 'Aarav', relation: 'Primary', color: '#2563eb' },
  { id: 'p-spouse', name: 'Meera', relation: 'Spouse', color: '#0d9488' },
  { id: 'p-parents', name: 'Parents', relation: 'Family', color: '#d97706' },
];

export const INITIAL_BANK_ACCOUNTS: BankAccountItem[] = [
  {
    id: 'ba-1',
    pid: 'p-self',
    bank: 'HDFC',
    holder: 'AARAV SHARMA',
    kind: 'Salary',
    acno: '50100482910482',
    ifsc: 'HDFC0000240',
    branch: 'Nariman Point, Mumbai',
    upi: 'aarav.sharma@okhdfcbank',
    phone: '9820112233',
    custid: '88412091',
    notes: 'Imperia Salary Account · Zero balance requirement · Free NEFT/RTGS.',
  },
  {
    id: 'ba-2',
    pid: 'p-self',
    bank: 'SBI',
    holder: 'AARAV SHARMA',
    kind: 'Savings',
    acno: '30918274610',
    ifsc: 'SBIN0000300',
    branch: 'Fort Main Branch, Mumbai',
    upi: 'aarav.sbi@oksbi',
    phone: '9820112233',
    custid: '910482711',
    notes: 'Linked to PPF, Sovereign Gold Bonds, and ASBA IPO mandate.',
  },
  {
    id: 'ba-3',
    pid: 'p-spouse',
    bank: 'ICICI',
    holder: 'MEERA SHARMA',
    kind: 'Savings',
    acno: '000401582910',
    ifsc: 'ICIC0000004',
    branch: 'Bandra Kurla Complex',
    upi: 'meera.sharma@icici',
    phone: '9820998877',
    custid: '55401928',
    notes: 'Wealth Management family banking account.',
  },
];

export const INITIAL_GOV_IDS: GovIdItem[] = [
  {
    id: 'id-1',
    pid: 'p-self',
    idtype: 'Passport',
    holder: 'AARAV SHARMA',
    idno: 'Z4829104',
    dob: '1992-04-18',
    expiry: '2034-08-11',
    notes: 'Issued at RPO Mumbai · US B1/B2 Visa valid until 2033.',
    attachments: [
      {
        id: 'att-pass-scan',
        name: 'Passport Z4829104 Scan.svg',
        category: 'id_scan',
        dataUrl: generateSampleDocumentSvg('Republic of India Passport', 'AARAV SHARMA · RPO Mumbai', 'Z4829104', 'VALID TO 2034'),
        fileSizeKb: 3.2,
        uploadedAt: '2026-08-10',
        notes: 'Bio-page certified scan with biometric symbol.',
      },
    ],
  },
  {
    id: 'id-2',
    pid: 'p-self',
    idtype: 'PAN',
    holder: 'AARAV SHARMA',
    idno: 'ABCDE1234F',
    dob: '1992-04-18',
    expiry: '',
    notes: 'Aadhaar-linked active PAN.',
    attachments: [
      {
        id: 'att-pan-scan',
        name: 'e-PAN Card ABCDE1234F.svg',
        category: 'id_scan',
        dataUrl: generateSampleDocumentSvg('Income Tax Department e-PAN', 'AARAV SHARMA · Linked with Aadhaar', 'ABCDE1234F', 'PERMANENT'),
        fileSizeKb: 3.1,
        uploadedAt: '2026-07-02',
        notes: 'Digital e-PAN issued by NSDL/UTIITSL.',
      },
    ],
  },
  {
    id: 'id-3',
    pid: 'p-self',
    idtype: 'Aadhaar',
    holder: 'AARAV SHARMA',
    idno: '491820498812',
    dob: '1992-04-18',
    expiry: '',
    notes: 'Biometrics locked via mAadhaar app by default.',
  },
  {
    id: 'id-4',
    pid: 'p-spouse',
    idtype: 'Driving licence',
    holder: 'MEERA SHARMA',
    idno: 'MH0120180049182',
    dob: '1994-09-12',
    expiry: '2026-12-15',
    notes: 'LMV-NT · Renew online via Parivahan before Dec 2026.',
  },
];

export const INITIAL_NOTES: SecureNoteItem[] = [
  {
    id: 'nt-1',
    pid: 'p-self',
    title: 'Home Wi-Fi, NAS & Locker Combinations',
    body: 'Bank Locker #42 (HDFC Nariman Point) Key stored in home safe.\nSynology NAS Admin Recovery Key: 9941-8820-DELTA-OMEGA.\nHome Fiber PPPoE VLAN: 100.',
    tags: 'home, locker, recovery',
    updatedAt: '2026-11-02',
  },
  {
    id: 'nt-2',
    pid: 'p-parents',
    title: 'Parents Emergency Medical & Blood Group',
    body: 'Father: O+ve (Apollo Hospital UHID: AP-992810, Dr. Deshmukh Cardiology).\nMother: B+ve (Kokilaben UHID: KH-441029).\nCashless TPA Desk: Star Health / HDFC Ergo.',
    tags: 'medical, parents, emergency',
    updatedAt: '2026-10-24',
  },
];

export const INITIAL_INSURANCE: InsurancePolicyItem[] = [
  {
    id: 'ins-1',
    pid: 'p-self',
    provider: 'HDFC ERGO Optima Secure',
    itype: 'Health',
    policy: '2819004918203900',
    holder: 'Aarav & Meera Sharma',
    sumInsured: 5000000,
    premium: 28450,
    start: '2026-01-15',
    renew: '2027-01-14',
    nominee: 'Meera Sharma',
    notes: '4X Secure benefit + zero co-pay + consumables covered.',
    attachments: [
      {
        id: 'att-ins-policy',
        name: 'Optima Secure Policy Schedule.svg',
        category: 'policy_doc',
        dataUrl: generateSampleDocumentSvg('HDFC ERGO Optima Secure Policy', '₹50,00,000 Sum Insured · Floater', 'POL-28190049', 'ACTIVE'),
        fileSizeKb: 3.5,
        uploadedAt: '2026-01-15',
        notes: 'Cashless card & TPA network guide.',
      },
    ],
  },
  {
    id: 'ins-2',
    pid: 'p-self',
    provider: 'ICICI Prudential iProtect Smart',
    itype: 'Life',
    policy: 'T94810294',
    holder: 'Aarav Sharma',
    sumInsured: 30000000,
    premium: 34200,
    start: '2022-06-01',
    renew: '2027-06-01',
    nominee: 'Meera Sharma',
    notes: 'Pure term cover till age 65 · Paid annually.',
  },
  {
    id: 'ins-3',
    pid: 'p-parents',
    provider: 'Niva Bupa Senior First',
    itype: 'Health',
    policy: 'NB-88491029',
    holder: 'Rajesh & Sunita Sharma',
    sumInsured: 2000000,
    premium: 46800,
    start: '2026-03-10',
    renew: '2027-03-09',
    nominee: 'Aarav Sharma',
    notes: '80D tax deduction certificate saved in tax folder.',
  },
];

export const INITIAL_VEHICLES: VehicleDocItem[] = [
  {
    id: 'veh-1',
    pid: 'p-self',
    maker: 'Hyundai IONIQ 5',
    vtype: 'EV',
    reg: 'MH 01 EV 4092',
    chassisLast5: '88412',
    insExp: '2027-04-18',
    pucExp: '2027-04-18',
    fastagBank: 'ICICI FASTag',
    notes: 'Zero-dep return-to-invoice cover with battery protection add-on.',
    attachments: [
      {
        id: 'att-rc-ioniq',
        name: 'RC Smart Card MH01EV4092.svg',
        category: 'rc_book',
        dataUrl: generateSampleDocumentSvg('Parivahan Vehicle RC Smart Card', 'Hyundai IONIQ 5 Long Range EV', 'MH 01 EV 4092', 'REGISTERED'),
        fileSizeKb: 3.4,
        uploadedAt: '2026-04-18',
        notes: 'RTO Tardeo Mumbai registration smart card copy.',
      },
    ],
  },
  {
    id: 'veh-2',
    pid: 'p-spouse',
    maker: 'Honda City ZX CVT',
    vtype: 'Car',
    reg: 'MH 02 FK 7731',
    chassisLast5: '31904',
    insExp: '2026-12-04',
    pucExp: '2026-11-28',
    fastagBank: 'HDFC FASTag',
    notes: 'PUC renewal due this month · Service at Arya Honda Worli.',
  },
];

export const INITIAL_UTILITY_BILLS: UtilityBillItem[] = [
  {
    id: 'ub-1',
    pid: 'p-self',
    vendor: 'HDFC Infinia Oct Statement Bill',
    bno: 'STMT-2026-10-8892',
    amount: 148500,
    paidAmt: 50000,
    bdate: '2026-10-28',
    due: '2026-11-18',
    status: 'Partial',
    notes: 'Part payment of ₹50,000 made via NEFT · ₹98,500 remaining.',
  },
  {
    id: 'ub-2',
    pid: 'p-self',
    vendor: 'Adani Electricity Mumbai',
    bno: 'CA-102948192',
    amount: 6420,
    paidAmt: 0,
    bdate: '2026-11-01',
    due: '2026-11-16',
    status: 'Unpaid',
    notes: 'Pay via Amazon Pay ICICI or Amex GyFTR voucher.',
  },
  {
    id: 'ub-3',
    pid: 'p-self',
    vendor: 'Airtel Black Fiber + Family Postpaid',
    bno: 'AB-8839104',
    amount: 2122,
    paidAmt: 2122,
    bdate: '2026-10-25',
    due: '2026-11-10',
    status: 'Paid',
    notes: 'Paid via Airtel Axis / SBI Cashback.',
  },
];

export const INITIAL_BIN_ITEMS: RecycleBinEntry[] = [
  {
    id: 'bin-1',
    tab: 'cards',
    title: 'Citibank Rewards Visa •••• 4019',
    subtitle: 'Migrated to Axis Bank · Deleted 6 days ago (24 days left in bin)',
    deletedAt: Date.now() - 6 * 86400000,
  },
];
