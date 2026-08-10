/**
 * Map Thai province display names (thai-address-database) →
 * WooCommerce ISO 3166-2:TH state codes required by Store API shipping.
 */
const THAI_PROVINCE_TO_WOO_STATE = {
  กรุงเทพมหานคร: 'TH-10',
  สมุทรปราการ: 'TH-11',
  นนทบุรี: 'TH-12',
  ปทุมธานี: 'TH-13',
  พระนครศรีอยุธยา: 'TH-14',
  อ่างทอง: 'TH-15',
  ลพบุรี: 'TH-16',
  สิงห์บุรี: 'TH-17',
  ชัยนาท: 'TH-18',
  สระบุรี: 'TH-19',
  ชลบุรี: 'TH-20',
  ระยอง: 'TH-21',
  จันทบุรี: 'TH-22',
  ตราด: 'TH-23',
  ฉะเชิงเทรา: 'TH-24',
  ปราจีนบุรี: 'TH-25',
  นครนายก: 'TH-26',
  สระแก้ว: 'TH-27',
  นครราชสีมา: 'TH-30',
  บุรีรัมย์: 'TH-31',
  สุรินทร์: 'TH-32',
  ศรีสะเกษ: 'TH-33',
  อุบลราชธานี: 'TH-34',
  ยโสธร: 'TH-35',
  ชัยภูมิ: 'TH-36',
  อำนาจเจริญ: 'TH-37',
  บึงกาฬ: 'TH-38',
  หนองบัวลำภู: 'TH-39',
  ขอนแก่น: 'TH-40',
  อุดรธานี: 'TH-41',
  เลย: 'TH-42',
  หนองคาย: 'TH-43',
  มหาสารคาม: 'TH-44',
  ร้อยเอ็ด: 'TH-45',
  กาฬสินธุ์: 'TH-46',
  สกลนคร: 'TH-47',
  นครพนม: 'TH-48',
  มุกดาหาร: 'TH-49',
  เชียงใหม่: 'TH-50',
  ลำพูน: 'TH-51',
  ลำปาง: 'TH-52',
  อุตรดิตถ์: 'TH-53',
  แพร่: 'TH-54',
  น่าน: 'TH-55',
  พะเยา: 'TH-56',
  เชียงราย: 'TH-57',
  แม่ฮ่องสอน: 'TH-58',
  นครสวรรค์: 'TH-60',
  อุทัยธานี: 'TH-61',
  กำแพงเพชร: 'TH-62',
  ตาก: 'TH-63',
  สุโขทัย: 'TH-64',
  พิษณุโลก: 'TH-65',
  พิจิตร: 'TH-66',
  เพชรบูรณ์: 'TH-67',
  ราชบุรี: 'TH-70',
  กาญจนบุรี: 'TH-71',
  สุพรรณบุรี: 'TH-72',
  นครปฐม: 'TH-73',
  สมุทรสาคร: 'TH-74',
  สมุทรสงคราม: 'TH-75',
  เพชรบุรี: 'TH-76',
  ประจวบคีรีขันธ์: 'TH-77',
  นครศรีธรรมราช: 'TH-80',
  กระบี่: 'TH-81',
  พังงา: 'TH-82',
  ภูเก็ต: 'TH-83',
  สุราษฎร์ธานี: 'TH-84',
  ระนอง: 'TH-85',
  ชุมพร: 'TH-86',
  สงขลา: 'TH-90',
  สตูล: 'TH-91',
  ตรัง: 'TH-92',
  พัทลุง: 'TH-93',
  ปัตตานี: 'TH-94',
  ยะลา: 'TH-95',
  นราธิวาส: 'TH-96',
};

const ENGLISH_NAME_TO_CODE = {
  bangkok: 'TH-10',
  'samut prakan': 'TH-11',
  nonthaburi: 'TH-12',
  'pathum thani': 'TH-13',
  ayutthaya: 'TH-14',
  'ang thong': 'TH-15',
  lopburi: 'TH-16',
  'sing buri': 'TH-17',
  'chai nat': 'TH-18',
  saraburi: 'TH-19',
  chonburi: 'TH-20',
  rayong: 'TH-21',
  chanthaburi: 'TH-22',
  trat: 'TH-23',
  chachoengsao: 'TH-24',
  'prachin buri': 'TH-25',
  'nakhon nayok': 'TH-26',
  'sa kaeo': 'TH-27',
  'nakhon ratchasima': 'TH-30',
  'buri ram': 'TH-31',
  surin: 'TH-32',
  sisaket: 'TH-33',
  'ubon ratchathani': 'TH-34',
  yasothon: 'TH-35',
  chaiyaphum: 'TH-36',
  'amnat charoen': 'TH-37',
  'bueng kan': 'TH-38',
  'nong bua lam phu': 'TH-39',
  'khon kaen': 'TH-40',
  'udon thani': 'TH-41',
  loei: 'TH-42',
  'nong khai': 'TH-43',
  'maha sarakham': 'TH-44',
  'roi et': 'TH-45',
  kalasin: 'TH-46',
  'sakon nakhon': 'TH-47',
  'nakhon phanom': 'TH-48',
  mukdahan: 'TH-49',
  'chiang mai': 'TH-50',
  lamphun: 'TH-51',
  lampang: 'TH-52',
  uttaradit: 'TH-53',
  phrae: 'TH-54',
  nan: 'TH-55',
  phayao: 'TH-56',
  'chiang rai': 'TH-57',
  'mae hong son': 'TH-58',
  'nakhon sawan': 'TH-60',
  'uthai thani': 'TH-61',
  'kamphaeng phet': 'TH-62',
  tak: 'TH-63',
  sukhothai: 'TH-64',
  phitsanulok: 'TH-65',
  phichit: 'TH-66',
  phetchabun: 'TH-67',
  ratchaburi: 'TH-70',
  kanchanaburi: 'TH-71',
  'suphan buri': 'TH-72',
  'nakhon pathom': 'TH-73',
  'samut sakhon': 'TH-74',
  'samut songkhram': 'TH-75',
  phetchaburi: 'TH-76',
  'prachuap khiri khan': 'TH-77',
  'nakhon si thammarat': 'TH-80',
  krabi: 'TH-81',
  'phang nga': 'TH-82',
  phuket: 'TH-83',
  'surat thani': 'TH-84',
  ranong: 'TH-85',
  chumphon: 'TH-86',
  songkhla: 'TH-90',
  satun: 'TH-91',
  trang: 'TH-92',
  phatthalung: 'TH-93',
  pattani: 'TH-94',
  yala: 'TH-95',
  narathiwat: 'TH-96',
};

function normalizeProvinceKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/**
 * Resolve a Thai province label (or already-coded TH-xx) to Woo state code.
 * @returns {string} e.g. "TH-10" or "" if unknown
 */
export function resolveThaiWooStateCode(province) {
  const raw = String(province || '').trim();
  if (!raw) return '';
  if (/^TH-\d{2}$/i.test(raw)) return raw.toUpperCase();
  if (THAI_PROVINCE_TO_WOO_STATE[raw]) return THAI_PROVINCE_TO_WOO_STATE[raw];

  const english = ENGLISH_NAME_TO_CODE[normalizeProvinceKey(raw)];
  if (english) return english;

  return '';
}

/** Reverse map Woo TH-xx → Thai province label used by the address selector. */
export function resolveThaiProvinceFromWooState(stateCode) {
  const code = String(stateCode || '').trim().toUpperCase();
  if (!code) return '';
  const entry = Object.entries(THAI_PROVINCE_TO_WOO_STATE).find(
    ([, value]) => value === code,
  );
  return entry?.[0] || '';
}

export function listThaiWooStateCodes() {
  return { ...THAI_PROVINCE_TO_WOO_STATE };
}
