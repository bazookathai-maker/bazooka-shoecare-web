import dbRaw from 'thai-address-database/database/db.json';

function preprocess(data) {
  const lookup = [];
  const words = [];
  const expanded = [];
  let useLookup = false;

  if (data.lookup && data.words) {
    useLookup = true;
    lookup.push(...data.lookup.split('|'));
    words.push(...data.words.split('|'));
    data = data.data;
  }

  const t = (text) => {
    function repl(m) {
      const ch = m.charCodeAt(0);
      return words[ch < 97 ? ch - 65 : 26 + ch - 97];
    }

    if (!useLookup) return text;
    if (typeof text === 'number') text = lookup[text];
    return text.replace(/[A-Z]/gi, repl);
  };

  if (!data[0].length) return data;

  data.forEach((provinces) => {
    let i = 1;
    if (provinces.length === 3) i = 2;

    provinces[i].forEach((amphoes) => {
      amphoes[i].forEach((districts) => {
        const zipcodes = districts[i] instanceof Array ? districts[i] : [districts[i]];
        zipcodes.forEach((zipcode) => {
          expanded.push({
            subdistrict: t(districts[0]),
            district: t(amphoes[0]),
            province: t(provinces[0]),
            postalCode: String(zipcode),
          });
        });
      });
    });
  });

  return expanded;
}

const addressRecords = preprocess(dbRaw);

const provinces = [...new Set(addressRecords.map((record) => record.province))].sort(
  (a, b) => a.localeCompare(b, 'th'),
);

const districtsByProvince = new Map();
const subdistrictsByProvinceDistrict = new Map();
const postcodeByKey = new Map();

addressRecords.forEach((record) => {
  if (!districtsByProvince.has(record.province)) {
    districtsByProvince.set(record.province, new Set());
  }
  districtsByProvince.get(record.province).add(record.district);

  const districtKey = `${record.province}|${record.district}`;
  if (!subdistrictsByProvinceDistrict.has(districtKey)) {
    subdistrictsByProvinceDistrict.set(districtKey, new Set());
  }
  subdistrictsByProvinceDistrict.get(districtKey).add(record.subdistrict);

  postcodeByKey.set(
    `${record.province}|${record.district}|${record.subdistrict}`,
    record.postalCode,
  );
});

function toSortedList(set) {
  return [...set].sort((a, b) => a.localeCompare(b, 'th'));
}

function filterOptions(options, query, limit = 80) {
  const trimmed = query.trim();
  if (!trimmed) return options.slice(0, limit);

  return options
    .filter((option) => option.includes(trimmed))
    .slice(0, limit);
}

export function getAllProvinces() {
  return provinces;
}

export function searchProvinces(query, limit = 80) {
  return filterOptions(provinces, query, limit);
}

export function getDistrictsByProvince(province) {
  if (!province || !districtsByProvince.has(province)) return [];
  return toSortedList(districtsByProvince.get(province));
}

export function searchDistricts(province, query, limit = 80) {
  return filterOptions(getDistrictsByProvince(province), query, limit);
}

export function getSubdistrictsByDistrict(province, district) {
  const key = `${province}|${district}`;
  if (!province || !district || !subdistrictsByProvinceDistrict.has(key)) return [];
  return toSortedList(subdistrictsByProvinceDistrict.get(key));
}

export function searchSubdistricts(province, district, query, limit = 80) {
  return filterOptions(getSubdistrictsByDistrict(province, district), query, limit);
}

export function getPostcodeBySubdistrict(province, district, subdistrict) {
  return postcodeByKey.get(`${province}|${district}|${subdistrict}`) ?? '';
}

export function normalizeOptionalField(value) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : '-';
}

export function formatStreetValue(street) {
  const trimmed = street?.trim();
  if (!trimmed) return '-';
  return trimmed.startsWith('ถนน') ? trimmed : `ถนน${trimmed}`;
}

export function formatFullAddress(form) {
  return [
    normalizeOptionalField(form.addressLine),
    formatStreetValue(form.street),
    normalizeOptionalField(form.subdistrict),
    normalizeOptionalField(form.district),
    normalizeOptionalField(form.province),
    normalizeOptionalField(form.postalCode),
    normalizeOptionalField(form.addressNote),
  ].join(', ');
}

export function buildCheckoutAddressPayload(form) {
  const address = {
    addressLine: normalizeOptionalField(form.addressLine),
    street: formatStreetValue(form.street),
    subdistrict: normalizeOptionalField(form.subdistrict),
    district: normalizeOptionalField(form.district),
    province: normalizeOptionalField(form.province),
    postalCode: normalizeOptionalField(form.postalCode),
    addressNote: normalizeOptionalField(form.addressNote),
    fullAddress: formatFullAddress(form),
  };

  return {
    customer: {
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
    },
    address,
    note: normalizeOptionalField(form.note),
  };
}

export const thaiAddressMeta = {
  provinceCount: provinces.length,
  recordCount: addressRecords.length,
};
