/**
 * Generate filtered pedalImageMap.ts with only approved images
 */

const fs = require('fs');
const path = require('path');

// Original 479 approved pedals
const originalApproved = [
  "5150-overdrive", "aguilar-filter-twin", "aguilar-tone-hammer", "alexander-history-lesson-v3",
  "alexander-sky5000", "alexander-space-race", "analogman-bicomp", "analogman-chorus",
  "analogman-king-of-tone", "analogman-prince-of-tone", "analogman-sunface", "anasounds-element",
  "barber-gain-changer", "becos-stella", "behringer-fm600", "benson-preamp", "biyang-rv10",
  "black-arts-pharaoh", "blackstar-lt-reverb", "bogner-ecstasy-blue", "bogner-ecstasy-red",
  "bogner-uberschall", "bondi-sick-as", "boss-ac3", "boss-aw3", "boss-bd2", "boss-bd2w",
  "boss-bf3", "boss-ce1-chorus-ensemble", "boss-ce2w-chorus", "boss-ce2w", "boss-ch1",
  "boss-cp1x", "boss-cs3-compressor", "boss-cs3", "boss-da2", "boss-dc2w", "boss-dd200",
  "boss-dd3-japan", "boss-dd5", "boss-dd500", "boss-dd7", "boss-dd8", "boss-dm2w-delay",
  "boss-dm2w", "boss-ds1", "boss-ds1w", "boss-ds2", "boss-eq200", "boss-es5", "boss-es8",
  "boss-fb2", "boss-ft2", "boss-fz1w", "boss-ge7", "boss-ir200", "boss-lm2", "boss-md2",
  "boss-mt2-metal-zone", "boss-mt2", "boss-mt2w-waza", "boss-mt2w", "boss-ns2",
  "boss-oc2-octave", "boss-oc3", "boss-oc5", "boss-od1x", "boss-od3", "boss-ph1r",
  "boss-ps3-pitch-shifter", "boss-ps3", "boss-ps5", "boss-ps6", "boss-pw3", "boss-rv-500",
  "boss-rv2", "boss-rv3", "boss-rv6", "boss-sd1", "boss-sd1w", "boss-st2", "boss-sy1-synth",
  "boss-sy1", "boss-sy200-synth", "boss-sy200", "boss-tr2", "boss-tu3", "boss-tu3w",
  "boss-vb2w", "boss-waza-rv200", "boss-whammy-ricochet-clone", "bsp-treble-booster",
  "cali76-bass", "caroline-meteore", "caroline-shigeharu", "caroline-somersault-synth",
  "caroline-somersault", "catalinbread-belle-epoch-deluxe", "catalinbread-belle-epoch",
  "catalinbread-galileo", "catalinbread-topanga", "ceriatone-centura", "chase-bliss-cxm1978",
  "chase-bliss-thermae", "chase-bliss-tonal-recall", "chase-bliss-warped-vinyl",
  "colorsound-overdriver", "cooper-fx-outward", "dallas-arbiter-fuzz-face-silicon",
  "danelectro-reel-echo", "darkglass-hyper-luminal", "darkglass-vintage-ultra-v2",
  "dba-apocalypse", "death-by-audio-rooms", "death-by-audio-supersonic-fuzz-gun",
  "death-by-audio-supersonic", "deco-saturator", "diamond-compressor", "diezel-herbert",
  "diezel-vh4", "digitech-drop", "digitech-obscura", "digitech-polara", "digitech-ricochet",
  "digitech-whammy-dt", "digitech-whammy-iv", "dod-250-overdrive", "dod-280",
  "dod-440-envelope-filter", "dod-fx40b", "donner-noise-killer", "donner-ultimate-comp",
  "donner-verb-square", "donner-yellow-fall", "dunlop-echoplex-delay", "dunlop-ffm1",
  "dunlop-ffm2", "dunlop-ffm3", "dunlop-jhf1", "earthquaker-acapulco-gold",
  "earthquaker-afterneath-v3", "earthquaker-aqueduct", "earthquaker-arpanoid",
  "earthquaker-arrows", "earthquaker-avalanche-run-v2", "earthquaker-bit-commander",
  "earthquaker-data-corrupter", "earthquaker-data-corruptor", "earthquaker-disaster-transport-sr",
  "earthquaker-dispatch-master", "earthquaker-ghost-echo", "earthquaker-grand-orbiter",
  "earthquaker-hoof", "earthquaker-hummingbird", "earthquaker-life-pedal",
  "earthquaker-organizer-v2", "earthquaker-plumes", "earthquaker-pyramids",
  "earthquaker-sea-machine", "earthquaker-space-spiral", "earthquaker-spatial-delivery",
  "earthquaker-special-cranker", "earthquaker-tentacle", "earthquaker-tone-job",
  "earthquaker-tone-reaper", "earthquaker-warden-v2", "echoplex-ep3", "effectrode-pc-2a",
  "ehx-b9", "ehx-bad-stone", "ehx-bass-clone", "ehx-big-muff-civil-war", "ehx-big-muff-op-amp",
  "ehx-big-muff-rams-head", "ehx-canyon", "ehx-cathedral", "ehx-deluxe-memory-boy",
  "ehx-eddy", "ehx-electric-mistress", "ehx-freeze", "ehx-holy-grail-max", "ehx-holy-grail-nano",
  "ehx-key9", "ehx-lester-g", "ehx-lester-k", "ehx-lpb1", "ehx-mel9", "ehx-memory-man-deluxe",
  "ehx-micro-pog", "ehx-micro-qtron", "ehx-nano-pog", "ehx-nano-small-stone", "ehx-oceans-11",
  "ehx-oceans-12", "ehx-op-amp-big-muff", "ehx-pitch-fork", "ehx-pitchfork", "ehx-platform",
  "ehx-pog2", "ehx-pulsar", "ehx-qtron-plus", "ehx-rams-head-big-muff", "ehx-superego-plus",
  "ehx-synth9", "empress-buffer-plus", "empress-compressor-mkii", "empress-compressor",
  "empress-echosystem", "empress-paraeq", "empress-reverb", "eventide-blackhole",
  "eventide-pitchfactor", "eventide-space", "fairfield-accountant", "fender-full-moon",
  "fender-marine-layer", "fender-pugilist", "fender-the-bends", "fender-tre-verb",
  "fishman-aura", "flint-strymon", "fortin-zuul", "foxgear-fenix", "foxpedal-defector",
  "free-the-tone-ambi-space", "friedman-be-od-deluxe", "friedman-be-od", "friedman-dirty-shirley",
  "friedman-smallbox", "fulltone-clyde-wah", "fulltone-clyde", "fulltone-fulldrive2",
  "fulltone-ocd", "gamechanger-light", "gamechanger-plasma", "greer-lightspeed",
  "hamstead-zenith", "hardwire-rv7", "hologram-microcosm-synth", "hologram-microcosm",
  "hotone-omni-ac", "hungry-robot-wardenclyffe", "ibanez-admini", "ibanez-ts808-original",
  "ibanez-ts808", "ibanez-ts9", "ibanez-ts9dx", "ibanez-tsmini", "isp-decimator-g-string-ii",
  "isp-decimator-ii", "jhs-3-series-chorus", "jhs-3-series-delay", "jhs-3-series-distortion",
  "jhs-3-series-phaser", "jhs-3-series-reverb", "jhs-3-series-screamer", "jhs-angry-charlie",
  "jhs-angry-driver", "jhs-bonsai", "jhs-double-barrel", "jhs-emperor", "jhs-kodiak",
  "jhs-milkman", "jhs-moonshine", "jhs-morning-glory", "jhs-muffuletta", "jhs-packrat",
  "jhs-prestige", "jhs-pulp-n-peel-v4", "jhs-spring-tank", "jhs-unicorn", "jhs-whitey-tighty",
  "joyo-aquarius", "joyo-d-seed", "joyo-ironman-acooustic", "keeley-caverns-v2",
  "keeley-compressor-mini", "keeley-compressor-plus", "keeley-d-and-m-drive", "keeley-dynatrem",
  "keeley-eccos", "keeley-fuzz-bender", "keeley-katana", "keeley-mag-echo", "keeley-phaser",
  "keeley-red-dirt", "klon-centaur-silver", "line6-dl4-mkii", "line6-dl4", "line6-hx-stomp-xl",
  "line6-hx-stomp", "line6-mm4", "lovetone-doppelganger", "lovetone-meatball", "lr-baggs-align",
  "mad-professor-electric-blue", "mad-professor-forest-green", "mad-professor-sweet-honey",
  "malekko-ekko-616", "malekko-scrutator", "matthews-cosmonaut", "maxon-od808", "maxon-od9",
  "meris-enzo", "meris-mercury7", "meris-ottobit", "meris-polymoon", "montreal-count-to-5",
  "mooer-envelope", "mooer-graphic-g", "mooer-noise-killer", "mooer-yellow-comp", "moog-mf101",
  "morley-bad-horsie-2", "morley-classic-wah", "morley-volume-plus", "mosky-spring-reverb",
  "mutron-3", "mutron-iii", "mxr-bass-octave-deluxe", "mxr-carbon-copy-bright",
  "mxr-carbon-copy-deluxe", "mxr-carbon-copy", "mxr-dynacomp-deluxe", "mxr-dynacomp",
  "mxr-echoplex-delay", "mxr-envelope-filter", "mxr-evh-phase90", "mxr-m104-distortion-plus",
  "mxr-m108s", "mxr-m109s", "mxr-m116-fullbore-metal", "mxr-m117r-flanger", "mxr-m133-micro-amp",
  "mxr-m133", "mxr-m152-micro-flanger", "mxr-m234-chorus", "mxr-m293-booster-mini", "mxr-m300",
  "mxr-m75-super-badass", "mxr-m77-badass-od", "mxr-m80-bass-di", "mxr-m83-chorus", "mxr-phase90",
  "mxr-phase95", "mxr-script-dyna-comp", "mxr-script-phase-90", "mxr-smart-gate", "mxr-sugar-drive",
  "mxr-timmy", "mxr-uni-vibe", "nativeaudio-ghost-ridge", "neo-instruments-ventilator",
  "neunaber-immerse", "nux-atlantic", "nux-solid-studio", "nux-time-core-deluxe",
  "old-blood-dark-star-v2", "old-blood-visitor", "one-control-crocodile", "one-control-purple-humper",
  "orange-getaway-driver", "orange-two-stroke", "paul-cochrane-timmy", "peterson-strobostomp-hd",
  "pigtronix-quantum-time", "pladask-tåken", "proco-lil-rat", "proco-rat2", "prs-horsemeat",
  "radial-j48", "red-panda-particle-2", "red-panda-raster-2", "red-panda-tensor", "revv-g2",
  "revv-g3", "revv-g4", "revv-g8", "rocktron-hush", "roland-jet-phaser-ap7", "ross-compressor",
  "ryra-klone", "sansamp-bass-di", "seymour-duncan-vapor-trail", "sola-sound-tonebender-mk2",
  "soundblox-pitch", "source-audio-atlas", "source-audio-c4", "source-audio-gemini",
  "source-audio-nemesis", "source-audio-orbital", "source-audio-true-spring", "source-audio-ventris",
  "strobostomp-hd", "strymon-bigsky", "strymon-blusky", "strymon-compadre", "strymon-dig",
  "strymon-el-capistan", "strymon-flint", "strymon-iridium", "strymon-lex", "strymon-mobius",
  "strymon-ola", "strymon-timeline", "strymon-volante", "suhr-koko", "suhr-riot", "surfy-surfybear",
  "tc-afterglow", "tc-blood-moon", "tc-brainwaves", "tc-cinders", "tc-corona-mini", "tc-dark-matter",
  "tc-drip", "tc-flashback-2", "tc-flashback-mini", "tc-flashback-x4", "tc-helix-phaser",
  "tc-hypergravity", "tc-pipeline", "tc-rusty-fuzz", "tc-shaker", "tc-spark-booster", "tc-spark-mini",
  "tc-sub-n-up", "tc-subnup-mini", "tc-subnup", "tc-vortex-flanger", "tone-city-comp-engine",
  "ua-dream-65", "ua-ruby-63", "ua-woodrow-55", "universal-audio-golden", "universal-audio-la2a",
  "universal-audio-starlight", "univox-super-fuzz", "univox-univibe", "valeton-coral-verb",
  "vertex-steel-string", "visual-sound-v2-rt", "vox-v845", "vox-v847", "walrus-385", "walrus-acs1",
  "walrus-ages", "walrus-deep-six-v3", "walrus-descent", "walrus-fathom", "walrus-julia",
  "walrus-julianna", "walrus-lillian", "walrus-monument", "walrus-polychrome", "walrus-slo",
  "walrus-slotva", "walrus-voyager", "wampler-clarksdale", "wampler-dracarys", "wampler-ego-compressor",
  "wampler-eq", "wampler-faux-tape-echo-v2", "wampler-mini-ego", "wampler-reflection",
  "wampler-tumnus-deluxe", "wampler-tumnus", "way-huge-aqua-puss", "way-huge-blue-hippo",
  "way-huge-supa-puss", "wmd-protostar", "wren-and-cuff-tall-font-russian", "wren-and-cuff-tall-font",
  "xotic-ac-booster", "xotic-rc-booster", "xotic-xw1", "zoom-ms70cdr-delay", "zoom-ms70cdr",
  "zvex-fuzz-factory-7", "zvex-fuzz-factory", "zvex-instant-lofi-junky", "zvex-lo-fi-junky",
  "zvex-sho", "zvex-super-hard-on"
];

// 38 newly approved pedals from refetch
const newlyApproved = [
  "behringer-vd400", "boss-ph3", "boss-rt20", "boss-rv5", "boss-slicer", "caline-snake-bite",
  "caroline-megabyte", "catalinbread-naga-viper", "chase-bliss-blooper", "chase-bliss-condor",
  "colorsound-power-boost", "dallas-arbiter-fuzz-face-germanium", "dba-reverberation-machine",
  "death-by-audio-echo-master", "death-by-audio-fuzz-war", "dod-fx13-gonkulator", "ehx-c9",
  "ehx-memory-man-550tt", "ehx-silencer", "ehx-small-stone", "greer-southland", "lovepedal-eternity",
  "mooer-pitchbox", "mxr-carbon-copy-mini", "mxr-m78-badass-distortion", "neunaber-iconoclast",
  "neunaber-wet", "source-audio-lunar", "source-audio-spectrum", "source-audio-vertigo",
  "strymon-nightsky", "subdecay-prometheus-dlx", "suhr-riot-mini", "tc-alter-ego-2", "tc-mojomojo",
  "walrus-luminary-v2", "xvive-golden-brownie", "zvex-woolly-mammoth"
];

// Combine all approved pedals
const allApproved = new Set([...originalApproved, ...newlyApproved]);
console.log(`Total approved pedals: ${allApproved.size}`);

// Check which approved pedals have images on disk
const imagesDir = path.join(__dirname, '../public/images/pedals');
const existingImages = new Set();

if (fs.existsSync(imagesDir)) {
  fs.readdirSync(imagesDir).forEach(file => {
    const name = file.replace(/\.(jpg|png|jpeg|webp)$/i, '');
    existingImages.add(name);
  });
}

console.log(`Found ${existingImages.size} images on disk`);

// Build filtered map
const filteredMap = {};
let count = 0;

allApproved.forEach(id => {
  if (existingImages.has(id)) {
    // Determine extension
    let ext = 'jpg';
    if (fs.existsSync(path.join(imagesDir, `${id}.png`))) {
      ext = 'png';
    }
    filteredMap[id] = {
      large: `/images/pedals/${id}.${ext}`,
      small: `/images/pedals/${id}.${ext}`
    };
    count++;
  } else {
    console.log(`Warning: No image found for approved pedal: ${id}`);
  }
});

console.log(`Filtered to ${count} pedals with images`);

// Generate TypeScript file
const output = `/**
 * Pedal Image Map - APPROVED IMAGES ONLY
 * 
 * Generated: ${new Date().toISOString()}
 * Total approved pedals with images: ${count}
 */

// Image data type
interface PedalImageData {
  large?: string;
  small?: string;
  full?: string;
}

// Approved pedal images
const PEDAL_IMAGES: Record<string, PedalImageData | null> = ${JSON.stringify(filteredMap, null, 2)};

/**
 * Get the image URL for a pedal
 * @param pedalId - The pedal's unique ID
 * @param size - 'small', 'large', or 'full'
 * @returns The image URL or null if not found
 */
export function getPedalImageUrl(
  pedalId: string, 
  size: 'small' | 'large' | 'full' = 'large'
): string | null {
  const imageData = PEDAL_IMAGES[pedalId];
  if (!imageData) return null;
  
  return imageData[size] || imageData.large || imageData.small || null;
}

/**
 * Check if a pedal has an image
 */
export function hasPedalImage(pedalId: string): boolean {
  return PEDAL_IMAGES[pedalId] !== undefined && PEDAL_IMAGES[pedalId] !== null;
}

/**
 * Get count of available images
 */
export function getImageCount(): number {
  return ${count};
}

export default PEDAL_IMAGES;
`;

fs.writeFileSync(path.join(__dirname, '../src/data/pedalImageMap.ts'), output);
console.log('✅ Generated pedalImageMap.ts with approved images only');

