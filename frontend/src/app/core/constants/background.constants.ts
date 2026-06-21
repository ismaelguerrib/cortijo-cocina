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
const BACKGROUND_INSTANCES_PER_PHOTO = 2;

const SIZES = ['10.5svh', '12.5svh', '14.5svh', '16.5svh', '18.5svh'] as const;
const OPACITIES = [0.2, 0.22, 0.24, 0.27, 0.3] as const;
const DURATIONS = ['19s', '23s', '27s', '31s', '35s'] as const;
const DELAYS = ['-3s', '-7s', '-11s', '-15s', '-19s'] as const;
const DRIFT_X = ['-3.2svh', '-2.1svh', '1.8svh', '2.6svh', '3.4svh'] as const;
const DRIFT_Y = ['-2.2svh', '-1.4svh', '1.2svh', '1.9svh', '2.8svh'] as const;
const ROTATIONS = ['-8deg', '-4deg', '0deg', '5deg', '9deg'] as const;
const BACKGROUND_TOP_MIN = 14;
const BACKGROUND_TOP_MAX = 86;
const BACKGROUND_LEFT_MIN = 8;
const BACKGROUND_LEFT_MAX = 92;

const TOTAL_BACKGROUND_ITEMS = BACKGROUND_FILENAMES.length * BACKGROUND_INSTANCES_PER_PHOTO;
const BACKGROUND_COLUMNS = Math.max(4, Math.ceil(Math.sqrt(TOTAL_BACKGROUND_ITEMS * 1.4)));
const BACKGROUND_ROWS = Math.max(2, Math.ceil(TOTAL_BACKGROUND_ITEMS / BACKGROUND_COLUMNS));

const hashString = (value: string): number => {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
};

const seededUnit = (key: string, salt: string): number => hashString(`${key}:${salt}`) / 0xffffffff;

const pickSeededItem = <T>(items: readonly T[], key: string, salt: string): T =>
  items[Math.floor(seededUnit(key, salt) * items.length) % items.length];

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const formatVh = (value: number): string => `${value.toFixed(2)}svh`;
const formatVw = (value: number): string => `${value.toFixed(2)}vw`;

const baseCoordinate = (index: number, itemCount: number, min: number, max: number): number => {
  if (itemCount <= 1) {
    return (min + max) / 2;
  }

  return min + (index * (max - min)) / (itemCount - 1);
};

const createBackgroundPosition = (globalIndex: number, key: string) => {
  const row = Math.floor(globalIndex / BACKGROUND_COLUMNS);
  const column = globalIndex % BACKGROUND_COLUMNS;
  const rowBase = baseCoordinate(row, BACKGROUND_ROWS, BACKGROUND_TOP_MIN, BACKGROUND_TOP_MAX);
  const columnBase = baseCoordinate(
    column,
    BACKGROUND_COLUMNS,
    BACKGROUND_LEFT_MIN,
    BACKGROUND_LEFT_MAX,
  );
  const rowStep =
    BACKGROUND_ROWS > 1 ? (BACKGROUND_TOP_MAX - BACKGROUND_TOP_MIN) / (BACKGROUND_ROWS - 1) : 0;
  const columnStep =
    BACKGROUND_COLUMNS > 1
      ? (BACKGROUND_LEFT_MAX - BACKGROUND_LEFT_MIN) / (BACKGROUND_COLUMNS - 1)
      : 0;
  const topJitter = (seededUnit(key, 'top') - 0.5) * Math.min(10, rowStep * 0.4);
  const leftJitter = (seededUnit(key, 'left') - 0.5) * Math.min(12, columnStep * 0.45);

  return {
    top: formatVh(clamp(rowBase + topJitter, BACKGROUND_TOP_MIN, BACKGROUND_TOP_MAX)),
    left: formatVw(clamp(columnBase + leftJitter, BACKGROUND_LEFT_MIN, BACKGROUND_LEFT_MAX)),
  };
};

export const BACKGROUND_ITEMS: readonly BackgroundItem[] = Array.from(
  { length: TOTAL_BACKGROUND_ITEMS },
  (_, globalIndex) => {
    const photoIndex = globalIndex % BACKGROUND_FILENAMES.length;
    const instanceIndex = Math.floor(globalIndex / BACKGROUND_FILENAMES.length);
    const filename = BACKGROUND_FILENAMES[photoIndex];
    const key = `${filename}-${instanceIndex}`;
    const position = createBackgroundPosition(globalIndex, key);

    return {
      key,
      src: `/family-pictures/${encodeURIComponent(filename)}`,
      top: position.top,
      left: position.left,
      size: pickSeededItem(SIZES, key, 'size'),
      opacity: pickSeededItem(OPACITIES, key, 'opacity'),
      duration: pickSeededItem(DURATIONS, key, 'duration'),
      delay: pickSeededItem(DELAYS, key, 'delay'),
      driftX: pickSeededItem(DRIFT_X, key, 'driftX'),
      driftY: pickSeededItem(DRIFT_Y, key, 'driftY'),
      rotation: pickSeededItem(ROTATIONS, key, 'rotation'),
    };
  },
);
