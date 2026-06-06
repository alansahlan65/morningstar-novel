import fs from 'node:fs';
import path from 'node:path';

const outDir = path.resolve('Novel Cast Portrait');
fs.mkdirSync(outDir, { recursive: true });

const paper = '#d9d1bf';
const ink = '#191715';

const cast = [
  { file: 'jack_morningstar.svg', name: 'Jack Morningstar', archetype: 'hunter', skin: '#d5b29d', hair: '#d8d2c2', eyes: '#b11822', clothes: '#252321', accent: '#b62026', build: 'athletic', pose: 'amulet', scar: 'cheek', medallion: 'star', notes: 'young Wolf School anomaly, crimson eyes, barbed-star amulet' },
  { file: 'buck.svg', name: 'Buck', archetype: 'horse', coat: '#6b4a32', mane: '#1d1713', eyes: '#20130d', accent: '#9b2a24', pose: 'stubborn', notes: 'stubborn perceptive horse' },
  { file: 'mara_veyr.svg', name: 'Mara Veyr', archetype: 'human', skin: '#c99d83', hair: '#5a3426', eyes: '#5a6f4c', clothes: '#4b342c', accent: '#6d7e64', pose: 'vial', notes: 'field alchemist, compassionate medic' },
  { file: 'geralt_of_rivia.svg', name: 'Geralt of Rivia', archetype: 'hunter', skin: '#c9b6a4', hair: '#ddd7c7', eyes: '#d6b746', clothes: '#1f2324', accent: '#7e8584', build: 'broad', pose: 'sword', scar: 'eye', beard: true, medallion: 'wolf', notes: 'faithful game-inspired white-haired monster hunter design' },
  { file: 'sorel_veyrane.svg', name: 'Sorel Veyrane', archetype: 'human', skin: '#c6a28e', hair: '#2d2b2a', eyes: '#59606a', clothes: '#17191d', accent: '#c6b08a', pose: 'ledger', notes: 'Black Ink strategic architect, bureaucratic antagonist' },
  { file: 'rian.svg', name: 'Rian', archetype: 'human', skin: '#c9aa95', hair: '#6b5140', eyes: '#5b6268', clothes: '#31343a', accent: '#d6c6a5', pose: 'paper', notes: 'fearful Black Ink clerk' },
  { file: 'ciri.svg', name: 'Ciri', archetype: 'human', skin: '#d9b7a4', hair: '#d8d7cf', eyes: '#76a36a', clothes: '#2a2d2c', accent: '#d2d5cf', pose: 'glove', scar: 'cheek-long', notes: 'faithful game-inspired Ciri: ashen hair, green eyes, cheek scar' },
  { file: 'triss_merigold.svg', name: 'Triss Merigold', archetype: 'human', skin: '#d4aa91', hair: '#a4432b', eyes: '#639078', clothes: '#1e5961', accent: '#b78345', pose: 'magic', notes: 'faithful game-inspired auburn-haired sorceress' },
  { file: 'ilyra_sarn.svg', name: 'Ilyra Sarn', archetype: 'human', skin: '#c49d85', hair: '#1c1b1c', eyes: '#7a7f88', clothes: '#15171c', accent: '#bda26d', pose: 'seal', notes: 'imperial cipher-worker and adviser' },
  { file: 'yennefer_of_vengerberg.svg', name: 'Yennefer of Vengerberg', archetype: 'human', skin: '#d2ad9b', hair: '#141214', eyes: '#7e5ca8', clothes: '#111112', accent: '#ece2d4', pose: 'spell', notes: 'faithful game-inspired black-haired sorceress with violet eyes' },
  { file: 'zoltan_chivay.svg', name: 'Zoltan Chivay', archetype: 'dwarf', skin: '#c39272', hair: '#8a3b20', eyes: '#53402d', clothes: '#3d4b38', accent: '#a9884d', pose: 'axe', beard: true, notes: 'faithful game-inspired dwarf veteran merchant' },
  { file: 'dandelion.svg', name: 'Dandelion', archetype: 'human', skin: '#d7b49b', hair: '#8b5b31', eyes: '#4e6582', clothes: '#612f51', accent: '#d0a14b', pose: 'lute', notes: 'faithful game-inspired bard, colorful theatrical dress' },
  { file: 'priscilla.svg', name: 'Priscilla', archetype: 'human', skin: '#dab9a4', hair: '#d8b25b', eyes: '#677f8c', clothes: '#2f5d66', accent: '#d8c79f', pose: 'songbook', notes: 'poet and performer' },
  { file: 'keira_metz.svg', name: 'Keira Metz', archetype: 'human', skin: '#d7b198', hair: '#d6c073', eyes: '#586e8a', clothes: '#405a39', accent: '#d0bd8a', pose: 'magic', notes: 'faithful game-inspired blonde sorceress' },
  { file: 'lambert.svg', name: 'Lambert', archetype: 'hunter', skin: '#c49d86', hair: '#4a3428', eyes: '#b7a044', clothes: '#272a2b', accent: '#8b3c2f', pose: 'crossed', beard: true, medallion: 'wolf', notes: 'faithful game-inspired Wolf School witcher' },
  { file: 'eskel.svg', name: 'Eskel', archetype: 'hunter', skin: '#c59d84', hair: '#3f3028', eyes: '#b5a04d', clothes: '#2c2b28', accent: '#6c5f4b', pose: 'calm', scar: 'heavy', beard: true, medallion: 'wolf', build: 'broad', notes: 'faithful game-inspired scarred Wolf School survivor' },
  { file: 'asha_of_the_faithel.svg', name: 'Asha of the Faithel', archetype: 'human', skin: '#9b6a4b', hair: '#2b1c17', eyes: '#71512f', clothes: '#51402e', accent: '#c39142', pose: 'knife', notes: 'Zerrikanian Faithel handmaid-guard, survivor' },
  { file: 'vharakthul.svg', name: 'Vharakthul', archetype: 'entity', skin: '#171719', hair: '#0c0c0d', eyes: '#050505', clothes: '#111114', accent: '#2c0f14', pose: 'crown', notes: 'Obsidian Crown, black draconic erasure entity' },
  { file: 'ciri_imperial_circle.svg', name: "Ciri's Imperial Circle", archetype: 'human', skin: '#c6a38e', hair: '#3a3430', eyes: '#626a72', clothes: '#181a20', accent: '#b69c62', pose: 'seal', notes: 'anonymous imperial adviser representing court pressure' },
  { file: 'emhyr_var_emreis.svg', name: 'Emhyr var Emreis', archetype: 'human', skin: '#c49c85', hair: '#202020', eyes: '#4e555d', clothes: '#11151b', accent: '#c4a96f', pose: 'imperial', beard: true, notes: 'faithful game-inspired emperor in black and gold imperial severity' },
  { file: 'jacob_morningstar.svg', name: 'Jacob Morningstar', archetype: 'human', skin: '#c39b7c', hair: '#4b3326', eyes: '#5a594b', clothes: '#2b3035', accent: '#9a2d24', pose: 'soldier', beard: true, notes: 'Nilfgaardian soldier, oath-blade by choice' },
  { file: 'helena_morningstar.svg', name: 'Helena Morningstar', archetype: 'human', skin: '#d1aa93', hair: '#6d4a32', eyes: '#8b5a35', clothes: '#4d382f', accent: '#c49a4c', pose: 'amulet', notes: 'Faithel keeper, Jack mother, barbed-star amulet' },
  { file: 'zerrikanterment.svg', name: 'Zerrikanterment', archetype: 'dragon', skin: '#c7a14a', hair: '#ad7e23', eyes: '#f2d06a', clothes: '#7a4f1d', accent: '#f0c45e', pose: 'warden', notes: 'golden Last Warden dragon' },
  { file: 'vernon_roche.svg', name: 'Vernon Roche', archetype: 'human', skin: '#c0987d', hair: '#3c3027', eyes: '#48535f', clothes: '#1f3346', accent: '#d6c8ad', pose: 'commander', beard: true, notes: 'faithful game-inspired Blue Stripes commander' },
  { file: 'ves.svg', name: 'Ves', archetype: 'human', skin: '#d0a88e', hair: '#c9a15f', eyes: '#526b85', clothes: '#243c56', accent: '#d7d0c1', pose: 'scout', notes: 'faithful game-inspired Blue Stripes scout' },
  { file: 'brother_cazren.svg', name: 'Brother Cazren', archetype: 'human', skin: '#caa68d', hair: '#51453a', eyes: '#403428', clothes: '#2d241d', accent: '#d0aa42', pose: 'sermon', notes: 'Eternal Fire preacher with ledgers' },
  { file: 'regis.svg', name: 'Regis', archetype: 'human', skin: '#c8afa0', hair: '#6f6a63', eyes: '#5c5360', clothes: '#1b1a1c', accent: '#a48b64', pose: 'cane', beard: true, notes: 'faithful game-inspired refined higher vampire' },
  { file: 'cerys_an_craite.svg', name: 'Cerys an Craite', archetype: 'human', skin: '#cfaa91', hair: '#9c4e2f', eyes: '#596f7d', clothes: '#2d3941', accent: '#b67a43', pose: 'queen', notes: 'faithful game-inspired Skellige queen, fur and practical authority' },
  { file: 'ermion.svg', name: 'Ermion', archetype: 'human', skin: '#c4a48d', hair: '#ded6c6', eyes: '#59634d', clothes: '#3f4935', accent: '#9a7d47', pose: 'staff', beard: true, notes: 'faithful game-inspired Skellige druid' },
  { file: 'saesenthessis.svg', name: 'Saesenthessis', archetype: 'human', skin: '#c59663', hair: '#b67d28', eyes: '#d6b64a', clothes: '#5c3f24', accent: '#d5a642', pose: 'scale', notes: 'dragon in human shape, golden scale accents' },
  { file: 'tala.svg', name: 'Tala', archetype: 'human', skin: '#9c6546', hair: '#261916', eyes: '#5d3f27', clothes: '#584130', accent: '#ba823c', pose: 'shield', notes: 'dry formidable Zerrikanian defender' },
  { file: 'nadir.svg', name: 'Nadir', archetype: 'human', skin: '#a46d4a', hair: '#312017', eyes: '#624326', clothes: '#5b4530', accent: '#c09645', pose: 'ledger', beard: true, notes: 'pass-keeper and trader, ledger-minded' },
  { file: 'sera.svg', name: 'Sera', archetype: 'human', skin: '#9a6146', hair: '#d1c2a8', eyes: '#6f4b2c', clothes: '#49352a', accent: '#c49b55', pose: 'keeper', notes: 'Faithel elder and keeper' }
];

function jitterPath(seed, points, amp = 1.4) {
  return points.map(([x, y], i) => {
    const dx = Math.sin(seed * 12.9898 + i * 78.233) * amp;
    const dy = Math.cos(seed * 4.1414 + i * 37.719) * amp;
    return `${i === 0 ? 'M' : 'L'}${(x + dx).toFixed(1)} ${(y + dy).toFixed(1)}`;
  }).join(' ') + ' Z';
}

function hatch(seed, color, count = 38) {
  let lines = '';
  for (let i = 0; i < count; i++) {
    const x = 140 + ((seed * 47 + i * 79) % 740);
    const y = 170 + ((seed * 67 + i * 53) % 1050);
    const len = 28 + ((seed + i * 13) % 70);
    const opacity = 0.06 + (((seed + i) % 8) / 120);
    lines += `<path d="M ${x} ${y} C ${x + len * .28} ${y - 8}, ${x + len * .72} ${y + 9}, ${x + len} ${y - 2}" stroke="${color}" stroke-width="${1 + (i % 3)}" opacity="${opacity}" fill="none" stroke-linecap="round"/>\n`;
  }
  return lines;
}

function faceFeatures(c, seed) {
  const eyeY = c.archetype === 'dwarf' ? 480 : 430;
  const eyeGap = c.archetype === 'dwarf' ? 76 : 92;
  const scar = c.scar === 'eye'
    ? `<path d="M 455 330 L 420 450 L 438 540" stroke="#9c2d32" stroke-width="9" opacity="0.8" fill="none" stroke-linecap="round"/>`
    : c.scar === 'cheek-long'
      ? `<path d="M 580 402 C 648 468 666 552 608 608" stroke="#9d2632" stroke-width="9" opacity="0.85" fill="none" stroke-linecap="round"/>`
      : c.scar === 'cheek'
        ? `<path d="M 600 500 C 642 525 658 564 632 590" stroke="#9d2632" stroke-width="8" opacity="0.75" fill="none" stroke-linecap="round"/>`
        : c.scar === 'heavy'
          ? `<path d="M 362 322 C 440 456 455 582 410 672" stroke="#7b2527" stroke-width="12" opacity="0.8" fill="none" stroke-linecap="round"/>`
          : '';

  return `
    ${scar}
    <path d="M ${512 - eyeGap} ${eyeY} C ${480 - eyeGap} ${eyeY - 16}, ${460 - eyeGap} ${eyeY + 10}, ${510 - eyeGap} ${eyeY + 22}" stroke="${ink}" stroke-width="14" fill="none" stroke-linecap="round"/>
    <path d="M ${512 + eyeGap} ${eyeY} C ${544 + eyeGap} ${eyeY - 16}, ${564 + eyeGap} ${eyeY + 10}, ${514 + eyeGap} ${eyeY + 22}" stroke="${ink}" stroke-width="14" fill="none" stroke-linecap="round"/>
    <ellipse cx="${512 - eyeGap + 2}" cy="${eyeY + 7}" rx="16" ry="10" fill="${c.eyes}"/>
    <ellipse cx="${512 + eyeGap - 2}" cy="${eyeY + 7}" rx="16" ry="10" fill="${c.eyes}"/>
    <path d="M 512 468 C 500 520 486 560 512 574 C 538 560 524 520 512 468" stroke="#6e4136" stroke-width="6" opacity="0.65" fill="none" stroke-linecap="round"/>
    <path d="M 456 650 C 492 682 548 682 584 650" stroke="#5b2025" stroke-width="9" fill="none" stroke-linecap="round"/>
    ${c.beard ? `<path d="M 405 625 C 450 760 574 760 620 625 C 586 745 445 745 405 625" fill="${c.hair}" opacity="0.72"/>` : ''}
    ${hatch(seed + 14, '#fff6e8', 20)}
  `;
}

function poseMark(c) {
  const common = {
    amulet: `<circle cx="512" cy="865" r="32" fill="none" stroke="${c.accent}" stroke-width="8"/><path d="M512 826 L528 876 L486 846 L538 846 L496 876 Z" fill="${c.accent}" opacity="0.9"/>`,
    sword: `<path d="M 272 1070 L 760 290" stroke="#2b2d30" stroke-width="24" stroke-linecap="round"/><path d="M 320 1015 L 388 1057" stroke="#98856b" stroke-width="18" stroke-linecap="round"/>`,
    vial: `<path d="M 645 900 l 56 78 l -60 42 l -56 -78 Z" fill="#62836d" opacity="0.78"/><path d="M 626 894 l 72 100" stroke="#d7e1ce" stroke-width="8" opacity="0.65"/>`,
    ledger: `<rect x="620" y="870" width="150" height="210" rx="10" fill="#2c2722" stroke="#c6b08a" stroke-width="7"/><path d="M650 930 H735 M650 976 H724 M650 1022 H742" stroke="#c6b08a" stroke-width="5" opacity="0.7"/>`,
    paper: `<path d="M 635 860 L 782 900 L 735 1090 L 588 1050 Z" fill="#d6c6a5" opacity="0.9"/><path d="M630 925 L750 958 M620 985 L730 1015" stroke="#5f5142" stroke-width="5" opacity="0.5"/>`,
    glove: `<path d="M 700 890 C 760 920 782 995 728 1042 C 660 1000 645 940 700 890" fill="#202424" stroke="${c.accent}" stroke-width="6"/>`,
    magic: `<circle cx="710" cy="875" r="54" fill="none" stroke="${c.accent}" stroke-width="8" opacity="0.75"/><path d="M690 820 L735 900 M735 820 L688 900" stroke="${c.accent}" stroke-width="7" opacity="0.75"/>`,
    seal: `<rect x="630" y="840" width="120" height="150" rx="8" fill="#bda26d" opacity="0.78"/><circle cx="690" cy="915" r="34" fill="none" stroke="#161616" stroke-width="7"/>`,
    spell: `<path d="M 698 840 C 760 850 760 958 700 968 C 640 956 640 852 698 840 Z" fill="none" stroke="${c.accent}" stroke-width="9" opacity="0.85"/>`,
    axe: `<path d="M 300 1040 L 710 620" stroke="#4a3228" stroke-width="22"/><path d="M 680 575 C 760 590 770 660 690 695 C 652 660 650 608 680 575" fill="#a8a096"/>`,
    lute: `<ellipse cx="690" cy="930" rx="76" ry="106" fill="#8f5e34" stroke="#2a1b15" stroke-width="8"/><path d="M675 830 L760 665" stroke="#8f5e34" stroke-width="25"/><path d="M654 930 H728 M690 840 V1035" stroke="#2a1b15" stroke-width="5" opacity="0.55"/>`,
    songbook: `<path d="M610 875 C665 840 715 845 760 890 V1060 C705 1018 657 1015 610 1055 Z" fill="#d8c79f" stroke="#4c3b30" stroke-width="7"/>`,
    crossed: `<path d="M 365 900 C 455 980 545 990 650 900" stroke="#2d2520" stroke-width="46" fill="none" stroke-linecap="round"/>`,
    calm: `<path d="M 360 970 C 460 1015 560 1015 660 970" stroke="#51483b" stroke-width="34" fill="none" stroke-linecap="round"/>`,
    knife: `<path d="M 680 820 L 760 1035" stroke="#2e2019" stroke-width="20"/><path d="M 660 800 L 705 860 L 735 760 Z" fill="#b8a17b"/>`,
    crown: `<path d="M365 255 L430 160 L512 245 L594 160 L665 255" fill="none" stroke="${c.accent}" stroke-width="16" stroke-linejoin="round"/>`,
    imperial: `<path d="M410 260 L512 178 L624 260" fill="none" stroke="${c.accent}" stroke-width="14"/><path d="M405 850 H625 L590 1060 H440 Z" fill="${c.accent}" opacity="0.26"/>`,
    soldier: `<path d="M350 880 L672 880 L620 1040 L402 1040 Z" fill="#1b2026" stroke="${c.accent}" stroke-width="9" opacity="0.82"/>`,
    warden: `<path d="M512 790 C 590 850 642 940 658 1070 C 560 1010 462 1010 364 1070 C 380 940 432 850 512 790 Z" fill="${c.accent}" opacity="0.42"/>`,
    commander: `<path d="M350 875 L655 875 L640 1015 L365 1015 Z" fill="#162b41" stroke="${c.accent}" stroke-width="10"/><path d="M365 810 H620" stroke="#d6c8ad" stroke-width="18"/>`,
    scout: `<path d="M680 780 L760 990" stroke="#243c56" stroke-width="26"/><path d="M650 820 C730 850 760 930 724 1015" stroke="#d7d0c1" stroke-width="9" fill="none"/>`,
    sermon: `<path d="M630 810 L760 900 L690 1045 L562 950 Z" fill="#d0aa42" opacity="0.62"/><path d="M570 790 C650 820 700 870 735 940" stroke="#2d241d" stroke-width="18" fill="none"/>`,
    cane: `<path d="M710 790 C760 820 762 870 718 900 L642 1100" stroke="${c.accent}" stroke-width="16" fill="none" stroke-linecap="round"/>`,
    queen: `<path d="M405 225 L512 170 L620 225" stroke="${c.accent}" stroke-width="11" fill="none"/><path d="M345 860 C440 800 575 800 675 860 L635 1060 H385 Z" fill="#44352d" opacity="0.7"/>`,
    staff: `<path d="M690 610 L620 1110" stroke="#5a4329" stroke-width="20"/><circle cx="700" cy="570" r="48" fill="none" stroke="${c.accent}" stroke-width="10"/>`,
    scale: `<path d="M670 835 C735 875 760 960 710 1035 C660 995 630 900 670 835" fill="${c.accent}" opacity="0.5"/><path d="M668 870 C700 880 728 900 740 930 M660 920 C690 930 718 950 730 980" stroke="#f0d071" stroke-width="6" opacity="0.8"/>`,
    shield: `<path d="M668 820 L790 870 L755 1040 L670 1100 L585 1040 L552 870 Z" fill="#584130" stroke="${c.accent}" stroke-width="9"/>`,
    keeper: `<path d="M625 820 C700 880 720 990 672 1080 C610 1018 588 900 625 820" fill="${c.accent}" opacity="0.45"/><path d="M612 840 L702 1050" stroke="#f0dfb6" stroke-width="7" opacity="0.55"/>`
  };
  return common[c.pose] || common.calm;
}

function humanPortrait(c, seed) {
  const wide = c.build === 'broad' || c.archetype === 'dwarf';
  const short = c.archetype === 'dwarf';
  const headTop = short ? 270 : 205;
  const headBottom = short ? 705 : 760;
  const shoulderY = short ? 790 : 835;
  const facePath = jitterPath(seed, [
    [512, headTop],
    [665, headTop + 70],
    [690, headTop + 250],
    [615, headBottom],
    [512, headBottom + 55],
    [405, headBottom],
    [335, headTop + 250],
    [360, headTop + 70]
  ], 2.2);
  const hairPath = jitterPath(seed + 5, [
    [330, headTop + 85],
    [400, headTop - 105],
    [538, headTop - 92],
    [675, headTop + 55],
    [692, headTop + 260],
    [620, headTop + 185],
    [520, headTop + 160],
    [405, headTop + 190],
    [340, headTop + 250]
  ], 4);
  const bodyPath = jitterPath(seed + 7, [
    [512, shoulderY - 30],
    [230, shoulderY + 95],
    [175, 1320],
    [825, 1320],
    [765, shoulderY + 95]
  ], 3.4);
  const neckPath = `M 438 ${headBottom - 25} C 460 ${shoulderY - 25}, 564 ${shoulderY - 25}, 586 ${headBottom - 25} L 620 ${shoulderY + 145} C 560 ${shoulderY + 205}, 455 ${shoulderY + 205}, 392 ${shoulderY + 145} Z`;

  return `
    <path d="${bodyPath}" fill="${c.clothes}" stroke="${ink}" stroke-width="10" stroke-linejoin="round"/>
    <path d="${neckPath}" fill="${c.skin}" opacity="0.96"/>
    <path d="${hairPath}" fill="${c.hair}" stroke="${ink}" stroke-width="8" stroke-linejoin="round"/>
    <path d="${facePath}" fill="${c.skin}" stroke="${ink}" stroke-width="8" stroke-linejoin="round"/>
    ${c.medallion === 'wolf' ? `<circle cx="512" cy="865" r="30" fill="none" stroke="#b6b0a0" stroke-width="8"/><path d="M487 865 L512 838 L537 865 L525 894 H499 Z" fill="#b6b0a0"/>` : ''}
    ${c.medallion === 'star' ? `<path d="M512 826 L530 878 L482 846 L542 846 L494 878 Z" fill="${c.accent}" opacity="0.9"/>` : ''}
    ${poseMark(c)}
    ${faceFeatures(c, seed)}
    ${hatch(seed + 2, c.hair, 46)}
    ${hatch(seed + 9, c.accent, 30)}
  `;
}

function horsePortrait(c, seed) {
  return `
    <path d="${jitterPath(seed, [[510,185],[665,315],[705,620],[620,870],[512,965],[400,870],[320,620],[360,315]], 3)}" fill="${c.coat}" stroke="${ink}" stroke-width="10"/>
    <path d="M512 190 C445 320 445 650 512 900 C575 650 575 320 512 190" fill="${c.mane}" opacity="0.92"/>
    <path d="M350 290 L250 150 L420 240 Z" fill="${c.coat}" stroke="${ink}" stroke-width="9"/>
    <path d="M670 290 L770 150 L600 240 Z" fill="${c.coat}" stroke="${ink}" stroke-width="9"/>
    <ellipse cx="438" cy="500" rx="24" ry="16" fill="${c.eyes}"/>
    <ellipse cx="586" cy="500" rx="24" ry="16" fill="${c.eyes}"/>
    <path d="M480 720 C512 745 545 745 578 720" stroke="${ink}" stroke-width="10" fill="none" stroke-linecap="round"/>
    <path d="M260 900 C385 800 625 800 760 900 L825 1320 H175 Z" fill="#3a2a20" stroke="${ink}" stroke-width="10"/>
    ${hatch(seed, '#f0dfca', 70)}
  `;
}

function entityPortrait(c, seed) {
  return `
    <path d="${jitterPath(seed, [[512,160],[635,250],[700,520],[630,760],[512,825],[390,760],[320,520],[390,250]], 4)}" fill="${c.skin}" stroke="#040404" stroke-width="14"/>
    <path d="M365 255 L430 160 L512 245 L594 160 L665 255" fill="none" stroke="${c.accent}" stroke-width="18" stroke-linejoin="round"/>
    <path d="M420 445 C470 410 480 490 430 505 M604 445 C554 410 544 490 594 505" stroke="#020202" stroke-width="22" fill="none" stroke-linecap="round"/>
    <path d="M410 900 C500 820 620 820 710 900 L835 1320 H185 Z" fill="#09090a" stroke="#050505" stroke-width="14"/>
    <path d="M360 700 C450 760 575 760 660 700" stroke="${c.accent}" stroke-width="12" fill="none" opacity="0.65"/>
    ${hatch(seed, '#5a1118', 90)}
  `;
}

function dragonPortrait(c, seed) {
  return `
    <path d="${jitterPath(seed, [[512,165],[665,280],[700,560],[630,765],[512,835],[392,765],[322,560],[365,280]], 4)}" fill="${c.skin}" stroke="#3a2309" stroke-width="12"/>
    <path d="M360 285 L250 130 L428 245 M665 285 L775 130 L595 245" fill="${c.accent}" stroke="#3a2309" stroke-width="10"/>
    <path d="M430 468 L490 495 M594 468 L534 495" stroke="#2d210b" stroke-width="18" stroke-linecap="round"/>
    <ellipse cx="466" cy="488" rx="16" ry="10" fill="${c.eyes}"/>
    <ellipse cx="558" cy="488" rx="16" ry="10" fill="${c.eyes}"/>
    <path d="M345 865 C445 800 580 800 685 865 L820 1320 H185 Z" fill="#6b4218" stroke="#3a2309" stroke-width="12"/>
    ${poseMark(c)}
    ${hatch(seed, '#f1d77a', 80)}
  `;
}

function svgFor(c, index) {
  const seed = index + 11;
  const subject = c.archetype === 'horse'
    ? horsePortrait(c, seed)
    : c.archetype === 'entity'
      ? entityPortrait(c, seed)
      : c.archetype === 'dragon'
        ? dragonPortrait(c, seed)
        : humanPortrait(c, seed);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1536" viewBox="0 0 1024 1536" role="img" aria-label="${c.name} portrait">
  <defs>
    <filter id="paperTexture">
      <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="5" seed="${seed}" result="noise"/>
      <feColorMatrix in="noise" type="saturate" values="0"/>
      <feBlend in="SourceGraphic" mode="multiply"/>
    </filter>
    <filter id="chalkEdge">
      <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" seed="${seed + 4}" result="rough"/>
      <feDisplacementMap in="SourceGraphic" in2="rough" scale="3"/>
    </filter>
    <radialGradient id="backdrop" cx="50%" cy="28%" r="75%">
      <stop offset="0%" stop-color="#526043"/>
      <stop offset="52%" stop-color="#252a22"/>
      <stop offset="100%" stop-color="#121313"/>
    </radialGradient>
  </defs>
  <rect width="1024" height="1536" fill="${paper}"/>
  <rect width="1024" height="1536" fill="url(#backdrop)" opacity="0.92"/>
  <g opacity="0.34">${hatch(seed + 20, '#bfc0ad', 90)}</g>
  <g filter="url(#chalkEdge)">
    ${subject}
  </g>
  <rect x="20" y="20" width="984" height="1496" fill="none" stroke="#0d0d0d" stroke-width="18" opacity="0.55"/>
</svg>`;
}

const manifest = [];
cast.forEach((c, index) => {
  const filePath = path.join(outDir, c.file);
  fs.writeFileSync(filePath, svgFor(c, index), 'utf8');
  manifest.push({ file: c.file, name: c.name, notes: c.notes });
});

fs.writeFileSync(path.join(outDir, 'cast-portrait-manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
fs.writeFileSync(
  path.join(outDir, 'README.md'),
  `# Morningstar Cast Portraits

Generated portrait set for *Morningstar: The Crimson Wolf*.

Format: SVG, 1024 x 1536, half-body front-facing, textured charcoal/pastel-inspired dark-fantasy treatment.

## Cast

${manifest.map((entry, index) => `${index + 1}. ${entry.name} - \`${entry.file}\``).join('\n')}
`,
  'utf8'
);

fs.writeFileSync(
  path.join(outDir, 'index.html'),
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Morningstar Cast Portraits</title>
    <style>
      :root { color-scheme: dark; }
      body {
        margin: 0;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: #111418;
        color: #eee8dc;
      }
      main {
        max-width: 1480px;
        margin: 0 auto;
        padding: 40px 24px 64px;
      }
      h1 {
        margin: 0 0 8px;
        font-family: Georgia, serif;
        font-size: clamp(2rem, 4vw, 4rem);
        line-height: 1;
      }
      p {
        margin: 0 0 32px;
        color: #b8afa2;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 24px;
      }
      figure {
        margin: 0;
        background: #171a1f;
        border: 1px solid rgba(238, 232, 220, 0.12);
        border-radius: 8px;
        overflow: hidden;
      }
      img {
        display: block;
        width: 100%;
        aspect-ratio: 2 / 3;
        object-fit: cover;
        background: #202329;
      }
      figcaption {
        padding: 12px 14px 14px;
        font-size: 0.9rem;
        line-height: 1.3;
      }
      code {
        display: block;
        margin-top: 4px;
        color: #c94a4a;
        font-size: 0.72rem;
        overflow-wrap: anywhere;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Morningstar Cast Portraits</h1>
      <p>Half-body front-facing cast portraits with individualized poses and a textured charcoal/pastel-inspired treatment.</p>
      <section class="grid">
        ${manifest.map((entry) => `<figure><img src="${entry.file}" alt="${entry.name} portrait" /><figcaption>${entry.name}<code>${entry.file}</code></figcaption></figure>`).join('\n        ')}
      </section>
    </main>
  </body>
</html>
`,
  'utf8'
);
console.log(`Generated ${cast.length} cast portraits in ${outDir}`);
