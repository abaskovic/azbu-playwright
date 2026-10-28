const BRANCHES = [
'Nin', 'Jankomir', 'Buzin', 'Split'
];

const COMPANY_CUSTOMERS = [
  { account: '13332', search: 'maidor d.o.o' },
  { account: '33176', search: 'belupo d.d' },
  { account: '87279', search: 'agri vrt d.o' },
  { account: '977156', search: 'cro-instal o' },
  { account: '550060', search: 'teflon d.o.o' },
  { account: '109211', search: 'jablan j.d.o' },
  { account: '950121', search: 'energo-inžen' },
  { account: '12339351', search: 'rock d.o.o' },
  { account: '75177', search: 'josip, obrt' },
  { account: '6008', search: 'motka d.o.o' },
  { account: '8967302', search: 'eh instalaci' },
  { account: '12428742', search: 'calidum d.o' },
  { account: '12486556', search: 'ćopić mirko' },
  { account: '00002', search: 'čatipović d' },
  { account: '83216', search: 'hervis d.o.o' },
  { account: '11007', search: 'neretva prom' },
  { account: '550239', search: 'merlin compa' },
  { account: '970826', search: 'interijer mv' },
  { account: '973530', search: 'vitos d.o.o' },
  { account: '74197', search: 'ante, obrt z' },
  { account: '550032', search: 'kingtrade d' },
  { account: '963403', search: 'trio i d. o' },
  { account: '12478143', search: 'ada-mar d.o' },
  { account: '070120261', search: 'antoana d.o' },
  { account: '981849', search: 'žvak - žvak' },
];

const PERSON_CUSTOMERS = [
  { account: '63172', search: 'nadija tab' },
  { account: '67190', search: 'božo dod' },
  { account: '40164', search: 'mia bos' },
  { account: '96211', search: 'šime  šim' },
  { account: '67182', search: 'emir  čeh' },
  { account: '97213', search: 'jasmin had' },
  { account: '33136', search: 'emanuel jos' },
  { account: '968087', search: 'hrvoje gud' },
  { account: '33314', search: 'emanuel per' },
  { account: '97208', search: 'josip jur' },
  { account: '77201', search: 'šime  šim' },
  { account: '149924', search: 'niko bla' },
  { account: '108211', search: 'ivan luk' },
  { account: '98217', search: 'milos rad' },
  { account: '67186', search: 'dajana  liv' },
  { account: '104208', search: 'lucija cvj' },
  { account: '106212', search: 'marko sla' },
  { account: '168098', search: 'karlo kar' },
  { account: '135669', search: 'marko sla' },
  { account: '106208', search: 'ante obr' },
  { account: '21119', search: 'ante obr' },
];

const ITEMS = {
  article: 'g25756',
  barcodes: ['n14585', 'a03390'],
};

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function pickBranch() {
  return pick(BRANCHES);
}

function pickItems(min = 2, max = 5) {
  const count = min + Math.floor(Math.random() * (max - min + 1));
  const pool = [...ARTICLES].sort(() => Math.random() - 0.5).slice(0, count);
  const modes = ['code', 'name', 'barcode'];
  return pool.map((item) => ({ ...item, mode: pick(modes) }));
}

function pickCustomer(type) {
  return pick(type === 'company' ? COMPANY_CUSTOMERS : PERSON_CUSTOMERS);
}

const ARTICLES = [
  { article: 'k00030', name: 'Pločica May Murinni Flakes Nero Rocker, R9, retificirana, 60x60 cm, mat, podna/zidna' },
  { article: 'k00030', name: 'Pločica May Murinni Flakes Nero Rocker, R9, retificirana, 60x60 cm, mat, podna/zidna' },
  { article: 'k00030', name: 'Pločica May Murinni Flakes Nero Rocker, R9, retificirana, 60x60 cm, mat, podna/zidna' },
  { article: 'k00030', name: 'Pločica May Murinni Flakes Nero Rocker, R9, retificirana, 60x60 cm, mat, podna/zidna' },
  { article: 'k00030', name: 'Pločica May Murinni Flakes Nero Rocker, R9, retificirana, 60x60 cm, mat, podna/zidna' },
  { article: 'n14585', name: 'Ogledalo sa policom Concepto Basic Pixi, 61 cm' },
  { article: 'g25756', name: 'Antifriz za centralno/solarno Terma Propiterm, 1/10 l' },
  { article: 'a03390', name: 'PP cijev niskošumna Geberit Silent, 75x500 mm' },
  { article: 'k00040', name: 'Pločica May Murinni Canon Grey Matt, R9, retificirana, 60x60 cm, mat, podna/zidna' },
  { article: 'v08003', name: 'PP cijev Vargokal, 32x1000 mm' },
  { article: 'v08005', name: 'PP cijev Vargokal, 32x2000 mm' },
  { article: 'v08534', name: 'PP cijev Vargokal, 32x250 mm' },
  { article: 'v08592', name: 'PP cijev Vargokal, 40x250 mm' },
  { article: 'k01190', name: 'Ljepilo fleksibilno Ceresit CM 17 (C2TE S1), 25 kg' },
  { article: 'k99400', name: 'Pločica May Murinni Canon Grey, retificirana, 60x120 cm, sjaj, podna/zidna' },
  { article: 'v08554', name: 'PP cijev Vargokal, 40x500 mm' },
  { article: 'a03391', name: 'PP cijev niskošumna Geberit Silent, 75x250 mm' },
  { article: 'n13703', name: 'Toaletna školjka viseća Concepto Brilla Rimless, max. 6 L, 53 cm' },
  { article: 'a451180', name: 'Podloška DIN 125 M 6 Zn (6,4x12,0x1,6)' },
  { article: 'g60297', name: 'Cijev Cu za klimu, platinum izolacija, 6,35x0,8 mm (1/4") 50 m' },
  { article: 'v450815', name: 'PP-R cijev Vargoterm, 20 mm (1/2"), 4 m' },
  { article: 'a451225', name: 'Podloška DIN 9021 M 6 Zn (6,4x18,0x1,6)' },
  { article: 'a02024', name: 'Tipla udarna, 6x40' },
  { article: 'g32504', name: 'Cijev Cu za klimu, 6,35 mm (1/4"), 50 m' },
  { article: 'a451231', name: 'Iver vijak 3.5x25' },
  { article: 'g668545', name: 'Klizna matica za C šinu Terma HangGirder M8 23x15x5' },
  { article: 'a451222', name: 'Sigurnosna matica DIN 985 M8 Zn' },
  { article: 'g668549', name: 'Podložna pločica Terma HangGirder M8 8,4X24X2,0' },
  { article: 'a451234', name: 'Iver vijak 4.5x30' },
  { article: 'k00400', name: 'Lajsna četvrtasta za vanjski kut Voxort Square Polish, inox, 10 mm, 2,7 m' },
  { article: 'a03392', name: 'PP cijev niskošumna Geberit Silent, 75x1000 mm' },
  { article: 'a03393', name: 'PP koljeno niskošumno Geberit Silent, 75 mm 90°' },
  { article: 'k03000', name: 'Pločica Atlas Concorde Lims Des, 37,5x75 cm, podna/zidna' },
  { article: 'a451065', name: 'Vreća za otpad/šutu TERMATools, 55x94 cm, do 30 kg, bijela' },
  { article: 'k99672', name: 'Pločica May Murinni Garmin Talco, R9, retificirana, 60x120 cm, mat, podna/zidna' },
  { article: 'k99401', name: 'Pločica May Murinni Wood Almond, R9, 20x120 cm, mat, podna/zidna' },
  { article: 'a03394', name: 'PP koljeno niskošumno Geberit Silent, 75 mm 45°' },
  { article: 'g668642', name: 'Ventilator Terma Air Floor Flow 80, podni, crni' },
  { article: 'g668643', name: 'Ventilator Terma Air Wind Box' },
  { article: 'g668644', name: 'Ventilator Terma Air Cool Cube' },
  { article: 'g668645', name: 'Ventilator Terma Air Anti Buzz, stojeći' },
  { article: 'v04332', name: 'PP-R koljeno Vargoterm, 20 mm' },
  { article: 'a03395', name: 'PP račva niskošumna Geberit Silent, 75x50 mm 45°' },
  { article: 'a451064', name: 'Vreća za otpad/šutu TERMATools, 55x94 cm, do 30 kg, prozirna' },
  { article: 'k20667', name: 'Mozaik pločica May Glass Mosaic Blu, 32, 7x32, 7 cm, mat, zidna, na papiru' },
  { article: 'k20622', name: 'Pločica Marazzi Maison Walnut, 60x60 cm, podna/zidna' },
  { article: 'k20273', name: 'Pločica Marazzi Sistem N Neutro Grigio Medio, 30x60 cm, podna/zidna' },
  { article: 'g07013', name: 'Cu koljeno, 15 mm, ŽŽ' },
  { article: 'v08002', name: 'PP cijev Vargokal, 32x500 mm' },
  { article: 'k25768', name: 'Pločica May Ceramics Polar White, 60x60 cm, sjaj, podna/zidna' },
  { article: 'k282511', name: 'Pločica May Murinni Canon Beige, retificirana, 60x120 cm, sjaj, podna/zidna' },
  { article: 'k00435', name: 'Ljepilo fleksibilno Kerakoll Bioflex Bianco (C2TE), 25 kg' },
];

module.exports = {
  BRANCHES,
  COMPANY_CUSTOMERS,
  PERSON_CUSTOMERS,
  ITEMS,
  ARTICLES,
  pickBranch,
  pickCustomer,
  pickItems,
};
