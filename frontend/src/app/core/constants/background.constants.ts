export type BackgroundItem = {
  readonly key: string;
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

const BACKGROUND_FILENAMES = [
  'amel.png',
  'anouk.png',
  'hima.png',
  'iman-amel.png',
  'sophia.png',
  'nour.png',
  'zakaria-hima.png',
  'zakaria.png',
] as const;
const BACKGROUND_INSTANCES_PER_PHOTO = 8;

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
  '84%',
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
  '50%',
] as const;

const SIZES = ['94px', '112px', '132px', '152px', '172px'] as const;
const OPACITIES = [0.2, 0.22, 0.24, 0.27, 0.3] as const;
const DURATIONS = ['19s', '23s', '27s', '31s', '35s'] as const;
const DELAYS = ['-3s', '-7s', '-11s', '-15s', '-19s'] as const;
const DRIFT_X = ['-28px', '-16px', '18px', '26px', '34px'] as const;
const DRIFT_Y = ['-18px', '-10px', '12px', '20px', '28px'] as const;
const ROTATIONS = ['-8deg', '-4deg', '0deg', '5deg', '9deg'] as const;

export const BACKGROUND_ITEMS: readonly BackgroundItem[] = BACKGROUND_FILENAMES.flatMap(
  (filename, photoIndex) =>
    Array.from({ length: BACKGROUND_INSTANCES_PER_PHOTO }, (_, instanceIndex) => {
      const index = photoIndex * BACKGROUND_INSTANCES_PER_PHOTO + instanceIndex;

      return {
        key: `${filename}-${instanceIndex}`,
        src: `/family-pictures/${encodeURIComponent(filename)}`,
        top: TOP_POSITIONS[index],
        left: LEFT_POSITIONS[index],
        size: SIZES[index % SIZES.length],
        opacity: OPACITIES[index % OPACITIES.length],
        duration: DURATIONS[index % DURATIONS.length],
        delay: DELAYS[index % DELAYS.length],
        driftX: DRIFT_X[index % DRIFT_X.length],
        driftY: DRIFT_Y[index % DRIFT_Y.length],
        rotation: ROTATIONS[index % ROTATIONS.length],
      };
    }),
);
