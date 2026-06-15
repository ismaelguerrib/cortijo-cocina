export type VegetableBackgroundItem = {
  readonly src: string;
  readonly top: string;
  readonly left: string;
  readonly size: string;
  readonly opacity: number;
  readonly duration: string;
  readonly delay: string;
  readonly driftX: string;
  readonly driftY: string;
  readonly rotation: string;
};

const VEGETABLE_FILENAMES = [
  'Avocado Opened.png',
  'Batat.png',
  'Broccoli.png',
  'Carrot.png',
  'Cauiliflower.png',
  'Chili Pepper .png',
  'Corn.png',
  'Cucumber.png',
  'Eggplant.png',
  'Garlic.png',
  'Green Cabbage.png',
  'Green Onions.png',
  'Green Sweet Pepper.png',
  'Jalapeno.png',
  'Onion.png',
  'Potato.png',
  'Radish.png',
  'Red Sweet Pepper.png',
  'Tomato.png',
  'Yellow Sweet Pepper.png'
] as const;

const TOP_POSITIONS = [
  '8%',
  '16%',
  '24%',
  '32%',
  '40%',
  '48%',
  '56%',
  '64%',
  '72%',
  '80%',
  '12%',
  '20%',
  '28%',
  '36%',
  '44%',
  '52%',
  '60%',
  '68%',
  '76%',
  '84%'
] as const;

const LEFT_POSITIONS = [
  '8%',
  '24%',
  '40%',
  '56%',
  '72%',
  '88%',
  '14%',
  '30%',
  '46%',
  '62%',
  '78%',
  '10%',
  '26%',
  '42%',
  '58%',
  '74%',
  '90%',
  '18%',
  '34%',
  '50%'
] as const;

const SIZES = ['76px', '92px', '108px', '124px', '140px'] as const;
const OPACITIES = [0.2, 0.22, 0.24, 0.27, 0.3] as const;
const DURATIONS = ['22s', '26s', '30s', '34s', '38s'] as const;
const DELAYS = ['-3s', '-7s', '-11s', '-15s', '-19s'] as const;
const DRIFT_X = ['-28px', '-16px', '18px', '26px', '34px'] as const;
const DRIFT_Y = ['-18px', '-10px', '12px', '20px', '28px'] as const;
const ROTATIONS = ['-8deg', '-4deg', '0deg', '5deg', '9deg'] as const;

export const VEGETABLE_BACKGROUND_ITEMS: readonly VegetableBackgroundItem[] =
  VEGETABLE_FILENAMES.map((filename, index) => ({
    src: `/vegetables-images/${encodeURIComponent(filename)}`,
    top: TOP_POSITIONS[index],
    left: LEFT_POSITIONS[index],
    size: SIZES[index % SIZES.length],
    opacity: OPACITIES[index % OPACITIES.length],
    duration: DURATIONS[index % DURATIONS.length],
    delay: DELAYS[index % DELAYS.length],
    driftX: DRIFT_X[index % DRIFT_X.length],
    driftY: DRIFT_Y[index % DRIFT_Y.length],
    rotation: ROTATIONS[index % ROTATIONS.length]
  }));
