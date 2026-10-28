const FIRST_NAMES = ['Ante', 'Ivan', 'Marko', 'Luka', 'Ivo', 'Mate', 'Frane', 'Nikola', 'Damir', 'Zoran', 'Stipe', 'Marin', 'Duje', 'Roko', 'Bruno', 'Josip', 'Petar', 'Tomislav', 'Jure', 'Ivica', 'Ana', 'Ivana', 'Marija', 'Petra', 'Nikolina', 'Katarina', 'Lucija', 'Antonia', 'Martina', 'Iva', 'Jelena'];
const LAST_NAMES = ['Juric', 'Horvat', 'Kovacevic', 'Babic', 'Maric', 'Novak', 'Vukovic', 'Knezevic', 'Markovic', 'Petrovic', 'Matic', 'Tomic', 'Radic', 'Peric', 'Bozic', 'Bilic', 'Vidovic', 'Blazevic', 'Grubisic', 'Skoric'];
const COMPANY_BASE = ['Jadran', 'Dalmacija', 'Mosor', 'Biokovo', 'Neretva', 'Kvarner', 'Velebit', 'Cetina', 'Adria', 'Primorje', 'Marjan', 'Kozjak'];
const COMPANY_ACTIVITY = ['Trgovina', 'Promet', 'Gradnja', 'Turizam', 'Nautika', 'Transport', 'Usluge', 'Inzenjering', 'Ribarstvo', 'Vinarija'];
const COMPANY_SUFFIX = ['d.o.o.', 'j.d.o.o.', 'obrt'];
const BANK_CODES = ['2360000', '2340009', '2402006', '2484008', '2390001', '2407000', '2500009', '2503007'];
const MOBILE_PREFIXES = ['91', '92', '95', '97', '98', '99'];
const MAIL_DOMAINS = ['example.hr', 'test.hr', 'mail.hr'];

const HR_CITIES = [
  { name: 'Makarska', postalCode: '21300', areaCode: '021' },
  { name: 'Split', postalCode: '21000', areaCode: '021' },
  { name: 'Omiš', postalCode: '21310', areaCode: '021' },
  { name: 'Trogir', postalCode: '21220', areaCode: '021' },
  { name: 'Sinj', postalCode: '21230', areaCode: '021' },
  { name: 'Imotski', postalCode: '21260', areaCode: '021' },
  { name: 'Kaštela', postalCode: '21212', areaCode: '021' },
  { name: 'Solin', postalCode: '21210', areaCode: '021' },
  { name: 'Zadar', postalCode: '23000', areaCode: '023' },
  { name: 'Šibenik', postalCode: '22000', areaCode: '022' },
  { name: 'Dubrovnik', postalCode: '20000', areaCode: '020' },
  { name: 'Metković', postalCode: '20350', areaCode: '020' },
];
const HR_STREETS = ['Obala kralja Tomislava', 'Put Duilova', 'Vukovarska ulica', 'Ulica Ante Starčevića', 'Šetalište sv. Petra', 'Ulica kralja Zvonimira', 'Poljička cesta', 'Splitska ulica', 'Jadranska cesta', 'Ulica Franje Tuđmana', 'Obala kneza Domagoja', 'Ulica Stjepana Radića', 'Zrinsko-Frankopanska ulica'];

const FOREIGN = {
  SI: {
    country: 'Slovenija',
    cities: [{ name: 'Ljubljana', postalCode: '1000' }, { name: 'Maribor', postalCode: '2000' }, { name: 'Celje', postalCode: '3000' }],
    streets: ['Slovenska cesta', 'Dunajska cesta', 'Celovska cesta'],
  },
  DE: {
    country: 'Njemačka',
    cities: [{ name: 'Berlin', postalCode: '10115' }, { name: 'Hamburg', postalCode: '20095' }, { name: 'München', postalCode: '80331' }],
    streets: ['Hauptstraße', 'Bahnhofstraße', 'Gartenstraße'],
  },
};

function rnd(n) {
  return Math.floor(Math.random() * n);
}

function pick(list) {
  return list[rnd(list.length)];
}

function digits(count) {
  let out = '';
  for (let i = 0; i < count; i++) out += rnd(10);
  return out;
}

function mod1110Control(value) {
  let a = 10;
  for (const ch of value) {
    a = (a + Number(ch)) % 10;
    if (a === 0) a = 10;
    a = (a * 2) % 11;
  }
  return (11 - a) % 10;
}

function generateOib() {
  const base = digits(10);
  return base + mod1110Control(base);
}

function isValidOib(oib) {
  return /^\d{11}$/.test(oib) && mod1110Control(oib.slice(0, 10)) === Number(oib[10]);
}

function toNumeric(text) {
  let out = '';
  for (const ch of text.toUpperCase()) {
    const code = ch.charCodeAt(0);
    out += code >= 65 && code <= 90 ? String(code - 55) : ch;
  }
  return out;
}

function mod97(numeric) {
  let remainder = 0;
  for (const ch of numeric) remainder = (remainder * 10 + Number(ch)) % 97;
  return remainder;
}

function generateHrIban() {
  const bban = pick(BANK_CODES) + digits(10);
  const check = 98 - mod97(toNumeric(bban + 'HR00'));
  return 'HR' + String(check).padStart(2, '0') + bban;
}

function isValidHrIban(iban) {
  return /^HR\d{19}$/.test(iban) && mod97(toNumeric(iban.slice(4) + iban.slice(0, 4))) === 1;
}

function generateSlovenianVat() {
  const weights = [8, 7, 6, 5, 4, 3, 2];
  for (;;) {
    const base = String(1 + rnd(9)) + digits(6);
    const sum = weights.reduce((acc, w, i) => acc + w * Number(base[i]), 0);
    const control = 11 - (sum % 11);
    if (control === 11) continue;
    return 'SI' + base + (control === 10 ? 0 : control);
  }
}

function generateGermanVat() {
  const base = String(1 + rnd(9)) + digits(7);
  return 'DE' + base + mod1110Control(base);
}

function generateMobile() {
  return '0' + pick(MOBILE_PREFIXES) + digits(6);
}

function generateLandline(areaCode = '021') {
  return areaCode + digits(6);
}

function generateAddress(countryCode = 'HR') {
  if (countryCode === 'HR') {
    const city = pick(HR_CITIES);
    return {
      street: `${pick(HR_STREETS)} ${rnd(150) + 1}`,
      postalCode: city.postalCode,
      city: city.name,
      country: 'Hrvatska',
      countryCode: 'HR',
      areaCode: city.areaCode,
    };
  }
  const config = FOREIGN[countryCode];
  if (!config) throw new Error(`Unsupported country: ${countryCode}`);
  const city = pick(config.cities);
  return {
    street: `${pick(config.streets)} ${rnd(150) + 1}`,
    postalCode: city.postalCode,
    city: city.name,
    country: config.country,
    countryCode,
    areaCode: '',
  };
}

function addressLabel(address) {
  return [address.street, address.countryCode, address.postalCode, address.city].join(' ');
}

function generateContact(areaCode = '021') {
  const firstName = pick(FIRST_NAMES);
  const lastName = pick(LAST_NAMES);
  return {
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    email: `${firstName}.${lastName}${rnd(1000)}@${pick(MAIL_DOMAINS)}`.toLowerCase(),
    mobile: generateMobile(),
    landline: generateLandline(areaCode),
  };
}

function generateCompanyName() {
  return `${pick(COMPANY_BASE)} ${pick(COMPANY_ACTIVITY)} ${pick(COMPANY_SUFFIX)}`;
}

function generateForeignVat(countryCode) {
  const vatNumber = countryCode === 'SI' ? generateSlovenianVat() : countryCode === 'DE' ? generateGermanVat() : null;
  if (!vatNumber) throw new Error(`Unsupported country: ${countryCode}`);
  return { countryCode, vatNumber, address: generateAddress(countryCode) };
}

function generateCustomer({ type = 'person' } = {}) {
  const address = generateAddress('HR');
  const contact = generateContact(address.areaCode);
  const oib = generateOib();
  return {
    type,
    organizationName: type === 'company' ? generateCompanyName() : '',
    ...contact,
    oib,
    iban: generateHrIban(),
    vatNumber: `HR${oib}`,
    address,
  };
}

module.exports = {
  generateCustomer,
  generateContact,
  generateAddress,
  generateForeignVat,
  generateOib,
  generateHrIban,
  addressLabel,
  isValidOib,
  isValidHrIban,
};

if (require.main === module) {
  const type = process.argv[2] === 'company' ? 'company' : 'person';
  const count = Math.max(1, Number(process.argv[3]) || 1);
  const out = Array.from({ length: count }, () => generateCustomer({ type }));
  console.log(JSON.stringify(count === 1 ? out[0] : out, null, 2));
}
