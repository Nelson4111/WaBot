export const BLOODLINE_CHANGE_COST = 50
export const BLOODLINE_CONFIRMATION_TIMEOUT = 60000
export const CHARACTER_GENDERS = Object.freeze({
  pria: 'Pria',
  laki: 'Pria',
  'laki-laki': 'Pria',
  wanita: 'Wanita',
  perempuan: 'Wanita',
  lainnya: 'Lainnya',
  lain: 'Lainnya',
  nonbinary: 'Non-biner',
  'non-biner': 'Non-biner'
})

// Jumlah Bloodline: 110; rarity dihitung dari total buff efektif.
export const BLOODLINES = Object.freeze({
  human: Object.freeze({ name: 'Human', emoji: '🧑', description: 'Adaptif dan tekun; memperoleh EXP 5% lebih banyak dari adventure, dungeon, mining, dan fishing.', buffs: Object.freeze({ xp: 0.05 }) }),
  elf: Object.freeze({ name: 'Elf', emoji: '🧝', description: 'Pemburu laut ulung; peluang mendapatkan ikan tier lebih tinggi naik 8%.', buffs: Object.freeze({ fishingRarity: 0.08 }) }),
  darkElf: Object.freeze({ name: 'Dark Elf', emoji: '🧝🏿', description: 'Elf dari kegelapan; peluang menemukan loot langka di dungeon meningkat.', buffs: Object.freeze({ dungeonRareDrop: 0.1 }) }),
  orc: Object.freeze({ name: 'Orc', emoji: '👹', description: 'Petarung tangguh; damage ke musuh dungeon meningkat 10%.', buffs: Object.freeze({ dungeonDamage: 0.1 }) }),
  halfOrc: Object.freeze({ name: 'Half-Orc', emoji: '👺', description: 'Perpaduan manusia dan orc; memiliki daya tahan dan kekuatan tinggi.', buffs: Object.freeze({ damage: 0.07, defense: 0.05 }) }),
  dwarf: Object.freeze({ name: 'Dwarf', emoji: '🧔', description: 'Penambang ahli; hasil ore mining meningkat 10%.', buffs: Object.freeze({ miningYield: 0.1 }) }),
  gnome: Object.freeze({ name: 'Gnome', emoji: '🧙', description: 'Makhluk kecil yang cerdik; peluang menemukan item tambahan meningkat.', buffs: Object.freeze({ bonusLoot: 0.08 }) }),
  halfling: Object.freeze({ name: 'Halfling', emoji: '🧑‍🌾', description: 'Sederhana namun beruntung; peluang mendapatkan reward tambahan meningkat.', buffs: Object.freeze({ luck: 0.1 }) }),
  goblin: Object.freeze({ name: 'Goblin', emoji: '👺', description: 'Licik dan gesit; memperoleh lebih banyak gold dari aktivitas.', buffs: Object.freeze({ gold: 0.08 }) }),
  demon: Object.freeze({ name: 'Demon', emoji: '😈', description: 'Petualang penuh daya; EXP dari adventure meningkat 10%.', buffs: Object.freeze({ adventureXp: 0.1 }) }),
  devil: Object.freeze({ name: 'Devil', emoji: '👿', description: 'Penguasa kekuatan gelap; damage meningkat dan critical chance bertambah.', buffs: Object.freeze({ damage: 0.08, critical: 0.05 }) }),
  angel: Object.freeze({ name: 'Angel', emoji: '👼', description: 'Makhluk suci; memperoleh peningkatan healing dan defense.', buffs: Object.freeze({ healing: 0.1, defense: 0.05 }) }),
  archangel: Object.freeze({ name: 'Archangel', emoji: '😇', description: 'Malaikat tingkat tinggi; bonus healing dan critical meningkat.', buffs: Object.freeze({ healing: 0.15, critical: 0.05 }) }),
  god: Object.freeze({ name: 'God', emoji: '⚡', description: 'Entitas ilahi; memperoleh bonus EXP dan keberuntungan.', buffs: Object.freeze({ xp: 0.12, luck: 0.1 }) }),
  goddess: Object.freeze({ name: 'Goddess', emoji: '👸', description: 'Entitas ilahi yang membawa berkah; reward dan healing meningkat.', buffs: Object.freeze({ reward: 0.1, healing: 0.1 }) }),
  demigod: Object.freeze({ name: 'Demigod', emoji: '🌟', description: 'Keturunan dewa; memiliki peningkatan damage dan EXP.', buffs: Object.freeze({ damage: 0.08, xp: 0.08 }) }),
  giant: Object.freeze({ name: 'Giant', emoji: '🧌', description: 'Makhluk raksasa; serangan fisik dan kapasitas HP meningkat.', buffs: Object.freeze({ damage: 0.1, hp: 0.1 }) }),
  ogre: Object.freeze({ name: 'Ogre', emoji: '👹', description: 'Makhluk besar dengan kekuatan brutal; damage meningkat 12%.', buffs: Object.freeze({ damage: 0.12 }) }),
  troll: Object.freeze({ name: 'Troll', emoji: '🧌', description: 'Makhluk regeneratif; memperoleh bonus healing dan HP.', buffs: Object.freeze({ healing: 0.12, hp: 0.08 }) }),
  skeleton: Object.freeze({ name: 'Skeleton', emoji: '💀', description: 'Undead tanpa rasa sakit; memiliki ketahanan dungeon yang tinggi.', buffs: Object.freeze({ dungeonDefense: 0.1 }) }),
  zombie: Object.freeze({ name: 'Zombie', emoji: '🧟', description: 'Undead yang sulit tumbang; memperoleh regenerasi HP tambahan.', buffs: Object.freeze({ regeneration: 0.12 }) }),
  ghost: Object.freeze({ name: 'Ghost', emoji: '👻', description: 'Roh pengembara; memiliki peluang menghindari serangan dan menemukan loot tersembunyi.', buffs: Object.freeze({ dodge: 0.08, hiddenLoot: 0.08 }) }),
  wraith: Object.freeze({ name: 'Wraith', emoji: '👻', description: 'Roh tanpa tubuh; memiliki peluang tinggi menghindari serangan.', buffs: Object.freeze({ dodge: 0.1 }) }),
  vampire: Object.freeze({ name: 'Vampire', emoji: '🧛', description: 'Predator malam; sebagian damage yang diberikan memulihkan HP.', buffs: Object.freeze({ lifesteal: 0.08 }) }),
  witch: Object.freeze({ name: 'Witch', emoji: '🧙‍♀️', description: 'Pengguna ilmu sihir; magic damage meningkat dan peluang mendapatkan item langka bertambah.', buffs: Object.freeze({ magicDamage: 0.1, rareDrop: 0.05 }) }),
  wizard: Object.freeze({ name: 'Wizard', emoji: '🧙‍♂️', description: 'Penyihir penguasa mantra; memperoleh bonus magic damage dan skill EXP.', buffs: Object.freeze({ magicDamage: 0.12, skillXp: 0.05 }) }),
  necromancer: Object.freeze({ name: 'Necromancer', emoji: '☠️', description: 'Pengguna sihir kematian; memperoleh bonus dungeon damage dan magic damage.', buffs: Object.freeze({ dungeonDamage: 0.08, magicDamage: 0.08 }) }),
  lich: Object.freeze({ name: 'Lich', emoji: '💀', description: 'Penguasa undead; memperoleh bonus magic damage dan dungeon EXP.', buffs: Object.freeze({ magicDamage: 0.1, dungeonXp: 0.08 }) }),
  slime: Object.freeze({ name: 'Slime', emoji: '🟢', description: 'Makhluk lentur; memiliki pertahanan tinggi terhadap serangan fisik.', buffs: Object.freeze({ defense: 0.08 }) }),
  dragon: Object.freeze({ name: 'Dragon', emoji: '🐉', description: 'Makhluk legendaris; damage dan peluang mendapatkan loot langka meningkat.', buffs: Object.freeze({ damage: 0.12, rareDrop: 0.08 }) }),
  wyvern: Object.freeze({ name: 'Wyvern', emoji: '🐲', description: 'Naga bersayap; memiliki keunggulan dalam adventure dan eksplorasi.', buffs: Object.freeze({ adventureXp: 0.08, exploration: 0.08 }) }),
  phoenix: Object.freeze({ name: 'Phoenix', emoji: '🔥', description: 'Burung api abadi; memiliki regenerasi dan peluang bangkit dari kekalahan.', buffs: Object.freeze({ regeneration: 0.1 }) }),
  griffin: Object.freeze({ name: 'Griffin', emoji: '🦅', description: 'Penjaga langit; memperoleh bonus eksplorasi dan critical chance.', buffs: Object.freeze({ exploration: 0.1, critical: 0.05 }) }),
  kitsune: Object.freeze({ name: 'Kitsune', emoji: '🦊', description: 'Rubah mistis; sangat beruntung dan memiliki peluang mendapatkan reward tambahan.', buffs: Object.freeze({ luck: 0.12, bonusLoot: 0.05 }) }),
  werewolf: Object.freeze({ name: 'Werewolf', emoji: '🐺', description: 'Pemburu malam; damage meningkat saat melakukan aktivitas dungeon.', buffs: Object.freeze({ dungeonDamage: 0.12 }) }),
  beastman: Object.freeze({ name: 'Beastman', emoji: '🐾', description: 'Keturunan manusia dan beast; memiliki keseimbangan kekuatan dan kecepatan.', buffs: Object.freeze({ damage: 0.06, defense: 0.06 }) }),
  catfolk: Object.freeze({ name: 'Catfolk', emoji: '🐱', description: 'Gesit dan penuh keberuntungan; peluang dodge dan fishing rarity meningkat.', buffs: Object.freeze({ dodge: 0.07, fishingRarity: 0.05 }) }),
  wolfkin: Object.freeze({ name: 'Wolfkin', emoji: '🐺', description: 'Pemburu berkelompok; memperoleh bonus damage dan adventure EXP.', buffs: Object.freeze({ damage: 0.06, adventureXp: 0.06 }) }),
  foxfolk: Object.freeze({ name: 'Foxfolk', emoji: '🦊', description: 'Licik dan gesit; memiliki keberuntungan tinggi dalam mendapatkan reward.', buffs: Object.freeze({ luck: 0.1, dodge: 0.06 }) }),
  merfolk: Object.freeze({ name: 'Merfolk', emoji: '🧜', description: 'Penghuni laut; memperoleh hasil fishing dan peluang ikan langka lebih tinggi.', buffs: Object.freeze({ fishingYield: 0.12, fishingRarity: 0.08 }) }),
  mermaid: Object.freeze({ name: 'Mermaid', emoji: '🧜‍♀️', description: 'Penghuni laut; memiliki kemampuan fishing dan peluang ikan langka yang tinggi.', buffs: Object.freeze({ fishingYield: 0.1, fishingRarity: 0.1 }) }),
  siren: Object.freeze({ name: 'Siren', emoji: '🧜‍♀️', description: 'Makhluk laut mistis; sangat ahli dalam menemukan ikan langka.', buffs: Object.freeze({ fishingRarity: 0.15 }) }),
  fairy: Object.freeze({ name: 'Fairy', emoji: '🧚', description: 'Makhluk kecil penuh sihir; meningkatkan luck dan reward aktivitas.', buffs: Object.freeze({ luck: 0.08, reward: 0.08 }) }),
  dryad: Object.freeze({ name: 'Dryad', emoji: '🌳', description: 'Penjaga alam; memperoleh hasil farming lebih banyak.', buffs: Object.freeze({ farmingYield: 0.12 }) }),
  treant: Object.freeze({ name: 'Treant', emoji: '🌲', description: 'Makhluk pohon kuno; memiliki defense dan hasil farming tinggi.', buffs: Object.freeze({ defense: 0.1, farmingYield: 0.08 }) }),
  robot: Object.freeze({ name: 'Robot', emoji: '🤖', description: 'Makhluk mekanis; memiliki defense tinggi dan hasil mining meningkat.', buffs: Object.freeze({ defense: 0.1, miningYield: 0.1 }) }),
  cyborg: Object.freeze({ name: 'Cyborg', emoji: '🦿', description: 'Perpaduan manusia dan mesin; damage serta defense meningkat.', buffs: Object.freeze({ damage: 0.07, defense: 0.07 }) }),
  alien: Object.freeze({ name: 'Alien', emoji: '👽', description: 'Makhluk luar angkasa; memperoleh bonus EXP dan peluang menemukan item unik.', buffs: Object.freeze({ xp: 0.08, rareDrop: 0.06 }) }),
  mutant: Object.freeze({ name: 'Mutant', emoji: '🧬', description: 'Makhluk hasil mutasi; memiliki kekuatan fisik dan regenerasi tinggi.', buffs: Object.freeze({ damage: 0.08, regeneration: 0.06 }) }),
  yokai: Object.freeze({ name: 'Yokai', emoji: '👹', description: 'Makhluk supranatural; memiliki keberuntungan dan kemampuan menghindari serangan.', buffs: Object.freeze({ luck: 0.08, dodge: 0.08 }) }),
  oni: Object.freeze({ name: 'Oni', emoji: '👹', description: 'Raksasa iblis yang kuat; damage fisik meningkat secara signifikan.', buffs: Object.freeze({ damage: 0.12 }) }),
  valkyrie: Object.freeze({ name: 'Valkyrie', emoji: '⚔️', description: 'Prajurit surgawi; memperoleh bonus damage dan critical chance.', buffs: Object.freeze({ damage: 0.08, critical: 0.08 }) }),
  reaper: Object.freeze({ name: 'Reaper', emoji: '☠️', description: 'Penguasa kematian; memiliki bonus damage terhadap musuh dungeon.', buffs: Object.freeze({ dungeonDamage: 0.12 }) }),
  doll: Object.freeze({ name: 'Doll', emoji: '🪆', description: 'Makhluk boneka hidup; memiliki keberuntungan dan defense yang unik.', buffs: Object.freeze({ luck: 0.08, defense: 0.06 }) }),
  puppet: Object.freeze({ name: 'Puppet', emoji: '🎎', description: 'Boneka yang hidup melalui kekuatan misterius; peluang dodge meningkat.', buffs: Object.freeze({ dodge: 0.1 }) }),
  spirit: Object.freeze({ name: 'Spirit', emoji: '👻', description: 'Makhluk roh; memiliki peluang menghindari serangan dan bonus magic damage.', buffs: Object.freeze({ dodge: 0.08, magicDamage: 0.08 }) }),
  clone: Object.freeze({ name: 'Clone', emoji: '👤', description: 'Makhluk hasil duplikasi; memperoleh bonus EXP dan peluang mendapatkan reward tambahan.', buffs: Object.freeze({ xp: 0.08, reward: 0.05 }) }),
  mummy: Object.freeze({ name: 'Mummy', emoji: '🧟', description: 'Undead kuno yang tangguh; memiliki defense dan ketahanan dungeon tinggi.', buffs: Object.freeze({ defense: 0.1, dungeonDefense: 0.08 }) }),
  centaur: Object.freeze({ name: 'Centaur', emoji: '🐎', description: 'Makhluk setengah manusia dan kuda; memiliki kecepatan dan damage tinggi.', buffs: Object.freeze({ damage: 0.07, dodge: 0.06 }) }),
  minotaur: Object.freeze({ name: 'Minotaur', emoji: '🐂', description: 'Makhluk bertubuh kuat; memiliki damage fisik dan HP tinggi.', buffs: Object.freeze({ damage: 0.1, hp: 0.08 }) }),
  harpy: Object.freeze({ name: 'Harpy', emoji: '🦅', description: 'Makhluk bersayap yang gesit; memiliki peluang dodge dan bonus eksplorasi.', buffs: Object.freeze({ dodge: 0.1, exploration: 0.08 }) }),
  banshee: Object.freeze({ name: 'Banshee', emoji: '👻', description: 'Roh pembawa jeritan maut; magic damage dan peluang dodge meningkat.', buffs: Object.freeze({ magicDamage: 0.1, dodge: 0.08 }) }),
  gargoyle: Object.freeze({ name: 'Gargoyle', emoji: '🗿', description: 'Makhluk batu penjaga; memiliki defense yang sangat kuat.', buffs: Object.freeze({ defense: 0.15 }) }),
  mimic: Object.freeze({ name: 'Mimic', emoji: '📦', description: 'Makhluk penyamar; memiliki keberuntungan tinggi dalam menemukan loot.', buffs: Object.freeze({ luck: 0.12, bonusLoot: 0.08 }) }),
  homunculus: Object.freeze({ name: 'Homunculus', emoji: '🧪', description: 'Makhluk buatan alkimia; memperoleh bonus EXP dan magic damage.', buffs: Object.freeze({ xp: 0.07, magicDamage: 0.07 }) }),
  werebear: Object.freeze({ name: 'Werebear', emoji: '🐻', description: 'Makhluk beruang yang kuat; memiliki HP dan damage tinggi.', buffs: Object.freeze({ hp: 0.1, damage: 0.08 }) }),
  merrow: Object.freeze({ name: 'Merrow', emoji: '🌊', description: 'Makhluk laut misterius; memiliki bonus fishing dan underwater loot.', buffs: Object.freeze({ fishingYield: 0.1, hiddenLoot: 0.08 }) }),
  imp: Object.freeze({ name: 'Imp', emoji: '👿', description: 'Demon kecil yang licik; memiliki luck dan magic damage yang tinggi.', buffs: Object.freeze({ luck: 0.08, magicDamage: 0.06 }) }),
  djinn: Object.freeze({ name: 'Djinn', emoji: '🧞', description: 'Makhluk mistis yang hidup dalam energi gaib; memiliki magic damage dan luck tinggi.', buffs: Object.freeze({ magicDamage: 0.1, luck: 0.1 }) }),
  genie: Object.freeze({ name: 'Genie', emoji: '🧞‍♂️', description: 'Makhluk pemberi keajaiban; peluang memperoleh reward tambahan meningkat.', buffs: Object.freeze({ reward: 0.12, luck: 0.08 }) }),
  mothman: Object.freeze({ name: 'Mothman', emoji: '🦋', description: 'Makhluk malam misterius; memiliki dodge dan exploration tinggi.', buffs: Object.freeze({ dodge: 0.1, exploration: 0.08 }) }),
  scarecrow: Object.freeze({ name: 'Scarecrow', emoji: '🎃', description: 'Makhluk jerami hidup; memiliki keberuntungan dan defense yang unik.', buffs: Object.freeze({ luck: 0.1, defense: 0.05 }) }),
  undine: Object.freeze({ name: 'Undine', emoji: '💧', description: 'Roh air yang menguasai perairan dan memiliki kemampuan memancing tinggi.', buffs: Object.freeze({ fishingYield: 0.1, fishingRarity: 0.08 }) }),
  satyr: Object.freeze({ name: 'Satyr', emoji: '🐐', description: 'Makhluk hutan yang lincah dan beruntung saat menjelajah.', buffs: Object.freeze({ exploration: 0.1, luck: 0.08 }) }),
  basilisk: Object.freeze({ name: 'Basilisk', emoji: '🐍', description: 'Monster reptil berbahaya dengan kekuatan serangan yang mematikan.', buffs: Object.freeze({ damage: 0.1, critical: 0.06 }) }),
  kelpie: Object.freeze({ name: 'Kelpie', emoji: '🐎', description: 'Makhluk air berbentuk kuda yang unggul dalam perjalanan dan aktivitas air.', buffs: Object.freeze({ exploration: 0.1, fishingYield: 0.08 }) }),
  golem: Object.freeze({ name: 'Golem', emoji: '🗿', description: 'Makhluk yang terbuat dari material keras dengan pertahanan sangat tinggi.', buffs: Object.freeze({ defense: 0.15 }) }),
  ifrit: Object.freeze({ name: 'Ifrit', emoji: '🔥', description: 'Makhluk api dengan kekuatan sihir dan damage dungeon yang tinggi.', buffs: Object.freeze({ magicDamage: 0.1, damage: 0.08 }) }),
  nixie: Object.freeze({ name: 'Nixie', emoji: '💧', description: 'Roh air yang lincah; peluang mendapatkan ikan tier tinggi dan pertahanan dungeon meningkat.', buffs: Object.freeze({ fishingRarity: 0.12, dodge: 0.08 }) }),
  succubus: Object.freeze({ name: 'Succubus', emoji: '😈', description: 'Demon wanita yang memanfaatkan pesona; damage dungeon dan hasil mining meningkat.', buffs: Object.freeze({ magicDamage: 0.08, luck: 0.1 }) }),
  incubus: Object.freeze({ name: 'Incubus', emoji: '😈', description: 'Demon pria dengan kekuatan pesona dan serangan supernatural; damage dungeon meningkat.', buffs: Object.freeze({ damage: 0.08, magicDamage: 0.08 }) }),
  devilLord: Object.freeze({ name: 'Devil Lord', emoji: '👿', description: 'Penguasa para devil dengan kekuatan tempur dan dungeon yang sangat tinggi.', buffs: Object.freeze({ damage: 0.12, dungeonDamage: 0.08 }) }),
  fallenAngel: Object.freeze({ name: 'Fallen Angel', emoji: '🪽', description: 'Malaikat yang jatuh dari langit dan memperoleh kekuatan gelap.', buffs: Object.freeze({ damage: 0.08, magicDamage: 0.1 }) }),
  nymph: Object.freeze({ name: 'Nymph', emoji: '🌸', description: 'Roh alam yang membawa keberuntungan dan meningkatkan hasil panen.', buffs: Object.freeze({ farmingYield: 0.1, luck: 0.08 }) }),
  shadow: Object.freeze({ name: 'Shadow', emoji: '🌑', description: 'Makhluk bayangan yang sulit terlihat; serangan dungeon dan peluang menghindar meningkat.', buffs: Object.freeze({ dodge: 0.12, dungeonDamage: 0.08 }) }),
  minion: Object.freeze({ name: 'Minion', emoji: '👾', description: 'Makhluk kecil yang patuh; EXP dan hasil mining meningkat.', buffs: Object.freeze({ xp: 0.08, miningYield: 0.08 }) }),
  merman: Object.freeze({ name: 'Merman', emoji: '🧜‍♂️', description: 'Penghuni laut pria yang ahli menemukan ikan langka.', buffs: Object.freeze({ fishingYield: 0.1, fishingRarity: 0.1 }) }),
  cyclops: Object.freeze({ name: 'Cyclops', emoji: '👁️', description: 'Raksasa bermata satu dengan damage dungeon besar dan pertahanan kuat.', buffs: Object.freeze({ damage: 0.12, dungeonDefense: 0.08 }) }),
  skeletonKing: Object.freeze({ name: 'Skeleton King', emoji: '💀', description: 'Raja undead yang kuat di dungeon, baik menyerang maupun bertahan.', buffs: Object.freeze({ dungeonDamage: 0.12, dungeonDefense: 0.1 }) }),
  werecat: Object.freeze({ name: 'Werecat', emoji: '🐈‍', description: 'Manusia kucing yang lincah; meningkatkan peluang menghindar dan damage dungeon.', buffs: Object.freeze({ dodge: 0.1, critical: 0.08 }) }),
  goblinOverseer: Object.freeze({ name: 'Goblin Overlord', emoji: '👺', description: 'Penguasa bangsa goblin yang licik; menghasilkan lebih banyak ore dan memberi damage dungeon lebih besar.', buffs: Object.freeze({ miningYield: 0.12, dungeonDamage: 0.1 }) }),
  elfSovereign: Object.freeze({ name: 'Elf Sovereign', emoji: '🧝‍♂️', description: 'Penguasa bangsa elf yang menghasilkan lebih banyak ore dan memberi damage dungeon lebih besar.', buffs: Object.freeze({ miningYield: 0.12, dungeonDamage: 0.08 }) }),
  dwarfHighChief: Object.freeze({ name: 'Dwarf High Chief', emoji: '⛏️', description: 'Pemimpin tertinggi bangsa dwarf yang sangat ahli dalam mining dan memiliki pertahanan kuat.', buffs: Object.freeze({ miningYield: 0.15, dungeonDefense: 0.08 }) }),
  orcChieftain: Object.freeze({ name: 'Orc Chieftain', emoji: '👹', description: 'Pemimpin bangsa orc dengan kekuatan fisik dan kemampuan tempur yang brutal.', buffs: Object.freeze({ dungeonDamage: 0.12, dungeonDefense: 0.1 }) }),
  humanEmperor: Object.freeze({ name: 'Human Emperor', emoji: '👑', description: 'Penguasa kekaisaran manusia yang unggul dalam perkembangan EXP dan hasil ore.', buffs: Object.freeze({ xp: 0.1, miningYield: 0.1 }) }),
  winion: Object.freeze({ name: 'Winion', emoji: '🪽', description: 'Makhluk unik dengan kekuatan yang sulit ditebak; memiliki keberuntungan dan kemampuan berkembang yang tinggi.', buffs: Object.freeze({ miningYield: 0.12, xp: 0.08 }) }),
  drider: Object.freeze({ name: 'Drider', emoji: '🕷️', description: 'Makhluk setengah humanoid dan laba-laba yang ahli membuat jaring serta bergerak di tempat gelap.', buffs: Object.freeze({ dungeonDefense: 0.15, miningYield: 0.08 }) }),
  aarakocra: Object.freeze({ name: 'Aarakocra', emoji: '🦅', description: 'Bangsa humanoid bersayap yang unggul dalam perkembangan EXP dan menghindari damage dungeon.', buffs: Object.freeze({ xp: 0.12, dungeonDefense: 0.1 }) }),
  gnoll: Object.freeze({ name: 'Gnoll', emoji: '🐺', description: 'Makhluk humanoid hyena yang brutal; damage dungeon dan hasil ore meningkat.', buffs: Object.freeze({ dungeonDamage: 0.15, miningYield: 0.08 }) }),
  aasimar: Object.freeze({ name: 'Aasimar', emoji: '✨', description: 'Keturunan humanoid dengan darah celestial yang memiliki kekuatan suci.', buffs: Object.freeze({ dungeonDefense: 0.12, dungeonDamage: 0.1 }) }),
  tiefling: Object.freeze({ name: 'Tiefling', emoji: '😈', description: 'Keturunan humanoid dengan darah infernal yang memiliki kekuatan gelap dan ketahanan terhadap api.', buffs: Object.freeze({ dungeonDamage: 0.12, dungeonDefense: 0.1 }) }),
  terminator: Object.freeze({ name: 'Terminator', emoji: '🤖', description: 'Mesin tempur humanoid dengan tubuh mekanis yang dirancang untuk bertahan dan menghancurkan target.', buffs: Object.freeze({ dungeonDamage: 0.15, dungeonDefense: 0.12 }) }),
  memo: Object.freeze({ name: 'Memo', emoji: '📝', description: 'Makhluk aneh yang keberadaannya seperti catatan hidup dari kenangan yang tidak diketahui.', buffs: Object.freeze({ xp: 0.15, miningYield: 0.1 }) }),
  avatar: Object.freeze({ name: 'Avatar', emoji: '🌌', description: 'Wujud yang menjadi perantara kekuatan besar dan mampu menggunakan energi luar biasa.', buffs: Object.freeze({ dungeonDamage: 0.15, xp: 0.1 }) }),
  firbolg: Object.freeze({ name: 'Firbolg', emoji: '🌲', description: 'Bangsa humanoid raksasa yang memiliki hubungan kuat dengan alam dan hutan.', buffs: Object.freeze({ miningYield: 0.12, dungeonDefense: 0.1 }) }),
  tabaxi: Object.freeze({ name: 'Tabaxi', emoji: '🐈', description: 'Bangsa humanoid kucing yang lincah, cepat, dan memiliki rasa ingin tahu tinggi.', buffs: Object.freeze({ dungeonDefense: 0.15, miningYield: 0.1 }) }),
  kenku: Object.freeze({ name: 'Kenku', emoji: '🐦', description: 'Bangsa humanoid burung yang mampu meniru suara dan bergerak dengan sangat gesit.', buffs: Object.freeze({ dungeonDefense: 0.12, miningYield: 0.1 }) }),
  sylph: Object.freeze({ name: 'Sylph', emoji: '🌬️', description: 'Makhluk roh udara yang memiliki tubuh ringan dan mampu bergerak secepat angin.', buffs: Object.freeze({ dungeonDefense: 0.15, xp: 0.1 }) }),
  undead: Object.freeze({ name: 'Undead', emoji: '💀', description: 'Makhluk yang telah melewati kematian dan kembali bergerak dengan kekuatan kehidupan yang berbeda.', buffs: Object.freeze({ dungeonDefense: 0.12, dungeonDamage: 0.08 }) }),
  parasite: Object.freeze({ name: 'Parasite', emoji: '🦠', description: 'Organisme yang hidup dengan menempel pada inang dan mampu memanfaatkan tubuh inangnya untuk berkembang.', buffs: Object.freeze({ dungeonDamage: 0.15, dungeonDefense: 0.1 }) })
})

export const BLOODLINE_STORIES = Object.freeze([
  'Avelia merasakan dua aura bertemu di udara. Sebuah cahaya menyentuhmu, dan garis keturunan barumu mulai terungkap.',
  'Dengan senyum kecil, Avelia mengangkat tangannya. Energi kuno menyelimuti tubuhmu dan membangunkan bloodline yang baru.',
  'Avelia melihat simbol bercahaya muncul di hadapanmu. Saat simbol itu menyatu denganmu, kekuatan bloodline barumu terasa nyata.',
  'Angin berputar di sekitar kalian. Avelia menuntun energi itu masuk ke dalam dirimu hingga wujud bloodline-mu berubah.',
  'Avelia menggenggam tanganmu saat cahaya menyala terang. Ketika sinarnya mereda, sebuah bloodline baru telah menjadi bagian darimu.',
  'Avelia menatap tubuhmu yang perlahan diselimuti cahaya. Energi dari masa lalu mengalir melalui darahmu dan membangunkan bloodline yang tersembunyi.',
  'Sebuah lingkaran sihir muncul di bawah kakimu. Avelia berdiri di sisimu saat energi kuno memilihmu sebagai pewaris bloodline baru.',
  'Avelia mendengar suara samar dari kejauhan. Saat suara itu menghilang, aura baru mulai mengalir deras di dalam tubuhmu.',
  'Cahaya keemasan berputar mengelilingimu. Avelia tersenyum ketika merasakan sebuah garis keturunan lama akhirnya terbangun kembali.',
  'Avelia mengangkat telapak tangannya dan sebuah kristal muncul di udara. Ketika kristal itu pecah, kekuatannya mengalir langsung ke dalam darahmu.',
  'Tanah di bawah kakimu bergetar pelan. Avelia menyadari bahwa sesuatu dari leluhurmu sedang menjawab panggilan bloodline.',
  'Sebuah bayangan asing muncul di belakangmu. Avelia mengamatinya dengan tenang sebelum bayangan itu menyatu dengan tubuhmu.',
  'Avelia menyentuh dahimu dengan lembut. Dalam sekejap, kilasan masa lalu muncul di benakmu dan sebuah bloodline baru terbangun.',
  'Udara mendadak terasa berat. Avelia merasakan kekuatan besar berkumpul di sekitarmu sebelum energi itu menetap di dalam tubuhmu.',
  'Sebuah tanda misterius muncul di kulitmu. Avelia mengenalinya sebagai simbol pewaris dan menyaksikan bloodline barumu bangkit.',
  'Avelia berdiri di depanmu ketika cahaya putih memenuhi ruangan. Saat cahaya itu menghilang, auramu telah berubah sepenuhnya.',
  'Suara gemuruh terdengar dari kejauhan. Avelia menatapmu dan menyadari bahwa darah leluhurmu baru saja menjawab panggilan zaman.',
  'Avelia membuka sebuah segel kuno. Energi yang tersimpan di dalamnya mengalir kepadamu dan membangkitkan bloodline yang selama ini tertidur.',
  'Api kecil muncul di telapak tanganmu tanpa sengaja. Avelia tersenyum ketika menyadari bahwa bloodline baru sedang menunjukkan wujud pertamanya.',
  'Kabut tipis menyelimuti tubuhmu. Avelia membimbingmu melewati kabut itu hingga kekuatan baru menetap di dalam darahmu.',
  'Avelia melihat cahaya biru berdenyut mengikuti detak jantungmu. Setiap denyut membawa sedikit lebih banyak kekuatan bloodline ke seluruh tubuhmu.',
  'Sebuah suara kuno berbisik dari dalam dirimu. Avelia mendengarnya dan menyadari bahwa leluhurmu sedang mewariskan kekuatan mereka kepadamu.',
  'Avelia mengarahkan energinya ke arahmu. Dua kekuatan bertemu di udara sebelum meledak menjadi cahaya yang membangunkan bloodline barumu.',
  'Langit di atas kalian berubah warna untuk sesaat. Avelia menatap ke atas sebelum kembali melihatmu yang kini membawa aura berbeda.',
  'Sebuah batu bercahaya melayang di hadapanmu. Avelia membiarkannya mendekat hingga energi di dalamnya menyatu dengan garis keturunanmu.',
  'Avelia merasakan perubahan kecil dalam auramu. Dalam beberapa detik, perubahan itu berkembang menjadi kekuatan bloodline yang sepenuhnya baru.',
  'Cahaya merah menyala dari dalam tubuhmu. Avelia tetap berada di sisimu hingga energi tersebut stabil dan menjadi bagian dari darahmu.',
  'Avelia menggambar sebuah simbol di udara. Simbol itu perlahan turun dan menyentuh dadamu, membuka pintu menuju bloodline yang belum pernah kau kenal.',
  'Tanpa peringatan, seluruh suara di sekitar kalian menghilang. Avelia kemudian mendengar satu detak jantung tambahan dari dalam tubuhmu.',
  'Avelia melihat garis cahaya menjalar dari tanganmu hingga ke seluruh tubuh. Setiap garis membawa jejak kekuatan leluhur yang baru terbangun.',
  'Sebuah lingkaran cahaya terbentuk di sekelilingmu. Avelia mengucapkan mantra kuno hingga lingkaran itu menghilang bersama lahirnya bloodline baru.',
  'Avelia menatap matamu yang berubah sesaat. Ia tahu bahwa sesuatu yang jauh lebih tua dari dirimu kini telah hidup kembali dalam darahmu.',
  'Energi liar berputar tanpa kendali di sekitarmu. Avelia menenangkan arus tersebut hingga akhirnya berubah menjadi aura bloodline yang stabil.',
  'Sebuah lonceng misterius terdengar sekali. Avelia tersenyum karena suara itu menandakan bahwa garis keturunan baru telah memilih pewarisnya.',
  'Avelia meletakkan tangannya di atas bahumu. Kehangatan menyebar ke seluruh tubuhmu sebelum kekuatan baru muncul dari dalam darahmu.',
  'Cahaya ungu muncul dari tanah dan mengelilingimu. Avelia membiarkan energi itu bekerja hingga jejak bloodline baru terlihat jelas dalam auramu.',
  'Avelia menemukan simbol kuno di udara tepat di atas kepalamu. Saat simbol itu jatuh, kekuatannya menyatu dengan darah dan jiwamu.',
  'Sebuah denyutan energi terasa dari dalam dadamu. Avelia menyadari bahwa bloodline yang tertidur selama beberapa generasi akhirnya menemukanmu.',
  'Avelia memejamkan mata dan merasakan banyak aura leluhur berkumpul. Salah satunya kemudian mendekat dan memilihmu sebagai penerusnya.',
  'Bintang-bintang seolah berhenti bergerak ketika energi bloodline muncul. Avelia berdiri di sampingmu saat kekuatan baru perlahan menetap.',
  'Sebuah retakan cahaya terbuka di udara. Avelia mengarahkannya kepadamu hingga energi dari balik retakan tersebut menjadi bagian dari garis keturunanmu.',
  'Avelia melihat tubuhmu memancarkan dua warna aura yang berbeda. Keduanya perlahan menyatu dan membentuk bloodline yang belum pernah kau miliki.',
  'Angin berhenti bergerak di sekelilingmu. Dalam keheningan itu, Avelia mendengar suara leluhur yang menyebut namamu sebagai pewaris berikutnya.',
  'Avelia mengangkat sebuah relik kuno ke arahmu. Relik itu bergetar hebat sebelum pecah dan melepaskan kekuatan bloodline ke dalam tubuhmu.',
  'Cahaya tipis muncul dari ujung jarimu lalu menyebar ke seluruh tubuh. Avelia menyaksikan perubahan itu dengan senyum penuh keyakinan.',
  'Sebuah aura asing menyelimuti tubuhmu dan perlahan menjadi semakin kuat. Avelia membimbing energi tersebut sampai akhirnya menjadi bloodline milikmu.',
  'Avelia berdiri dalam lingkaran cahaya bersamamu. Ketika lingkaran itu menghilang, darahmu telah membawa kekuatan yang berbeda dari sebelumnya.',
  'Sebuah simbol bercahaya muncul di telapak tanganmu. Avelia menyentuh simbol tersebut dan membantumu membuka kekuatan yang tersembunyi di dalamnya.',
  'Energi kuno mengalir seperti sungai cahaya menuju tubuhmu. Avelia menjaga alirannya tetap stabil hingga bloodline baru sepenuhnya terbangun.',
  'Avelia menatap aura barumu untuk beberapa saat. Dengan senyum kecil, ia berkata bahwa perjalananmu baru saja dimulai bersama bloodline yang baru lahir.'
])

export const BLOODLINE_BUFF_GROUPS = Object.freeze({
  xp: Object.freeze(['xp', 'adventureXp', 'dungeonXp', 'skillXp']),
  dungeonDamage: Object.freeze(['dungeonDamage', 'damage', 'magicDamage', 'critical', 'lifesteal', 'holyDamage', 'darkDamage', 'elementalDamage', 'magic', 'hunting']),
  dungeonDefense: Object.freeze(['dungeonDefense', 'defense', 'hp', 'regeneration', 'dodge', 'healing', 'evasion', 'agility', 'trap', 'resistance', 'fireResistance', 'stealth']),
  miningYield: Object.freeze(['miningYield', 'bonusLoot', 'luck', 'gold', 'reward', 'rareDrop', 'dungeonRareDrop', 'hiddenLoot', 'exploration', 'gathering', 'memory']),
  fishingRarity: Object.freeze(['fishingRarity', 'fishingYield']),
  farmingYield: Object.freeze(['farmingYield'])
})

export const BLOODLINE_BUFF_LABELS = Object.freeze({
  xp: 'EXP dari adventure, dungeon, mining, fishing, dan panen',
  dungeonDamage: 'damage yang diberikan di dungeon',
  dungeonDefense: 'pengurangan damage yang diterima di dungeon',
  miningYield: 'jumlah ore hasil mining',
  fishingRarity: 'bonus peluang pada roll fishing untuk tier ikan lebih tinggi',
  farmingYield: 'jumlah hasil panen',
  dungeonDamageTaken: 'damage tambahan yang diterima di dungeon',
  xpPenalty: 'EXP yang diperoleh lebih sedikit',
  miningYieldPenalty: 'jumlah ore hasil mining lebih sedikit',
  fishingRarityPenalty: 'peluang mendapatkan ikan tier tinggi lebih rendah',
  farmingYieldPenalty: 'jumlah hasil panen lebih sedikit'
})

export const BLOODLINE_RARITY_TIERS = Object.freeze({
  SECRET: Object.freeze({ stars: '★★★★★★★', emoji: '🔮' }),
  MYTHIC: Object.freeze({ stars: '★★★★★★☆', emoji: '🌌' }),
  LEGENDARY: Object.freeze({ stars: '★★★★★☆☆', emoji: '👑' }),
  EPIC: Object.freeze({ stars: '★★★★☆☆☆', emoji: '💎' }),
  RARE: Object.freeze({ stars: '★★★☆☆☆☆', emoji: '✨' }),
  UNCOMMON: Object.freeze({ stars: '★★☆☆☆☆☆', emoji: '💙' }),
  COMMON: Object.freeze({ stars: '★☆☆☆☆☆☆', emoji: '🤍' }),
  TRASH: Object.freeze({ stars: '☆☆☆☆☆☆☆', emoji: '🗑️' })
})

export const CHARACTER_OUTFIT_SLOTS = Object.freeze([
  Object.freeze({ id: 'head', label: 'Kepala', emoji: '🧢', aliases: ['kepala', 'head', 'topi'] }),
  Object.freeze({ id: 'top', label: 'Atasan', emoji: '👕', aliases: ['atasan', 'baju', 'top'] }),
  Object.freeze({ id: 'bottom', label: 'Bawahan', emoji: '👖', aliases: ['bawahan', 'celana', 'bottom'] }),
  Object.freeze({ id: 'feet', label: 'Kaki', emoji: '👟', aliases: ['kaki', 'sepatu', 'feet'] }),
  Object.freeze({ id: 'accessories', label: 'Aksesori', emoji: '✨', aliases: ['aksesori', 'aksesoris', 'accessory', 'accessories'] })
])

export const CHARACTER_DEFAULT_OUTFIT = Object.freeze({
  head: '-',
  top: 'Adventurer Tunic',
  bottom: 'Adventurer Pants',
  feet: 'Traveler Boots',
  accessories: Object.freeze([])
})

export const MALL_FASHION_SLOTS = Object.freeze({
  topi_kolektor: 'head',
  topi_bucket: 'head',
  topi_snapback: 'head',
  kupluk: 'head',
  hoodie_avelia: 'top',
  kaos_basic: 'top',
  kaos_grafis: 'top',
  kemeja_kasual: 'top',
  kemeja_formal: 'top',
  jaket_denim: 'top',
  jaket_bomber: 'top',
  jaket_kulit: 'top',
  sweater: 'top',
  cardigan: 'top',
  hoodie_oversize: 'top',
  dress_kasual: 'top',
  dress_formal: 'top',
  rok_kasual: 'bottom',
  celana_jeans: 'bottom',
  celana_kargo: 'bottom',
  celana_formal: 'bottom',
  celana_pendek: 'bottom',
  sneakers_urban: 'feet',
  sepatu_kasual: 'feet',
  sepatu_formal: 'feet',
  boots: 'feet',
  sandal_urban: 'feet',
  kaus_kaki: 'feet',
  syal: 'accessories',
  sarung_tangan: 'accessories',
  kacamata_hitam: 'accessories',
  kacamata_fashion: 'accessories',
  kalung_simple: 'accessories',
  gelang_fashion: 'accessories',
  cincin_fashion: 'accessories',
  anting_fashion: 'accessories',
  tas_ransel: 'accessories',
  tas_sling: 'accessories',
  tas_tote: 'accessories',
  dompet_kulit: 'accessories',
  ikat_pinggang: 'accessories',
  jam_tangan: 'accessories',
  jam_digital: 'accessories',
  jam_klasik: 'accessories',
  parfum_kasual: 'accessories',
  parfum_premium: 'accessories',
  masker_fashion: 'accessories',
  piyama: 'top',
  set_olahraga: 'top'
})

export function getBloodline(rpg = {}) {
  const key = normalizeBloodlineKey(rpg.bloodline || 'human')
  if (key === 'naga') return { id: 'dragon', ...BLOODLINES.dragon }
  const entry = Object.entries(BLOODLINES).find(([id, bloodline]) =>
    normalizeBloodlineKey(id) === key || normalizeBloodlineKey(bloodline.name) === key
  )
  return entry ? { id: entry[0], ...entry[1] } : { id: 'human', ...BLOODLINES.human }
}

export function getBloodlineBuff(rpg, buff) {
  const bloodline = getBloodline(rpg)
  const keys = BLOODLINE_BUFF_GROUPS[buff] || [buff]
  return Math.min(0.3, keys.reduce((total, key) => total + (Number(bloodline.buffs[key]) || 0), 0))
}

export function getBloodlineDrawback(rpg = {}) {
  const bloodline = getBloodline(rpg)
  const strengths = Object.keys(BLOODLINE_BUFF_GROUPS)
    .map(key => [key, getBloodlineBuff(rpg, key)])
    .sort((a, b) => b[1] - a[1])
  const [specialty, strength] = strengths[0] || ['xp', 0]
  const drawback = {
    dungeonDamageTaken: 0,
    xpPenalty: 0,
    miningYieldPenalty: 0,
    fishingRarityPenalty: 0,
    farmingYieldPenalty: 0
  }

  if (strength > 0) {
    const amount = Math.min(0.08, Math.max(0.02, strength * 0.3))
    if (specialty === 'dungeonDamage') drawback.xpPenalty = amount
    else if (specialty === 'dungeonDefense') drawback.miningYieldPenalty = amount
    else if (specialty === 'fishingRarity') drawback.farmingYieldPenalty = amount
    else if (specialty === 'farmingYield') drawback.fishingRarityPenalty = amount
    else drawback.dungeonDamageTaken = amount
  }

  return Object.freeze(drawback)
}

export function reviveBloodline(rpg = {}, maxHP = Number(rpg.maxDarah) || 100) {
  if (getBloodline(rpg).id !== 'phoenix') return 0
  const health = Math.max(1, Math.floor(Number(maxHP) * 0.1))
  rpg.darah = health
  rpg.bloodlineRevives = (Number(rpg.bloodlineRevives) || 0) + 1
  return health
}

export function applyBloodlineBuff(rpg, buff, amount) {
  const xpPenalty = buff === 'xp' ? getBloodlineDrawback(rpg).xpPenalty : 0
  return Math.floor((Number(amount) || 0) * (1 + getBloodlineBuff(rpg, buff) - xpPenalty))
}

export function applyBloodlineYield(rpg, buff, amount) {
  const drawbackKey = {
    miningYield: 'miningYieldPenalty',
    farmingYield: 'farmingYieldPenalty'
  }[buff]
  const drawback = drawbackKey ? getBloodlineDrawback(rpg)[drawbackKey] : 0
  const exactAmount = Math.max(0, Number(amount) || 0) * (1 + getBloodlineBuff(rpg, buff) - drawback)
  const wholeAmount = Math.floor(exactAmount)
  return wholeAmount + (Math.random() < exactAmount - wholeAmount ? 1 : 0)
}

export function normalizeBloodlineKey(value) {
  return String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

export function getBloodlineEffects(rpg) {
  const effects = Object.entries(BLOODLINE_BUFF_GROUPS)
    .map(([key]) => ({ key, amount: getBloodlineBuff(rpg, key) }))
    .filter(effect => effect.amount > 0)
  const drawback = getBloodlineDrawback(rpg)
  for (const [key, amount] of Object.entries(drawback)) {
    if (amount > 0) effects.push({ key, amount, negative: true })
  }
  return effects
}

export function getBloodlineRarity(rpg) {
  const totalBuff = Object.keys(BLOODLINE_BUFF_GROUPS)
    .reduce((total, key) => total + getBloodlineBuff(rpg, key), 0)
  if (totalBuff >= 0.38) return 'SECRET'
  if (totalBuff >= 0.32) return 'MYTHIC'
  if (totalBuff >= 0.26) return 'LEGENDARY'
  if (totalBuff >= 0.2) return 'EPIC'
  if (totalBuff >= 0.14) return 'RARE'
  if (totalBuff >= 0.08) return 'UNCOMMON'
  if (totalBuff > 0) return 'COMMON'
  return 'TRASH'
}

export function describeBloodlineRarity(rpg) {
  const rarity = getBloodlineRarity(rpg)
  const tier = BLOODLINE_RARITY_TIERS[rarity]
  return `⭐ *TIER BLOODLINE*\n> ↳ ${tier.stars}\n> ↳ ${rarity} ${tier.emoji}`
}

export function describeBloodlineEffects(rpg) {
  return getBloodlineEffects(rpg)
    .map(({ key, amount, negative }) => {
      const sign = negative && key === 'dungeonDamageTaken' ? '+' : negative ? '−' : '+'
      const warning = negative && key === 'dungeonDamageTaken' ? '⚠️ ' : ''
      return `> ↳ ${warning}${sign}${(amount * 100).toFixed(0)}% ${BLOODLINE_BUFF_LABELS[key]}`
    })
    .concat(getBloodline(rpg).id === 'phoenix'
      ? ['> ↳ ♻️ Kebangkitan tanpa batas saat mati: kembali dengan 10% HP.']
      : [])
    .join('\n')
}

export function getBloodlineDescription(rpg) {
  return describeBloodlineEffects(rpg)
}

export function getDefaultArmorOutfit(armorLevel, armorName) {
  const level = Math.max(0, Math.floor(Number(armorLevel) || 0))
  if (!level) return { ...CHARACTER_DEFAULT_OUTFIT, accessories: [] }
  const armor = (armorName || `Armor Lv.${level}`).replace(/\s+\(Lv\.\d+\)$/, '')
  const material = armor.endsWith(' Armor') ? armor.slice(0, -' Armor'.length) : armor
  return {
    head: `${material} Helmet`,
    top: armor,
    bottom: `${material} Pants`,
    feet: `${material} Boots`,
    accessories: []
  }
}
