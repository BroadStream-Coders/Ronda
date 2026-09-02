export const COURSE_SLOTS = 20;
export const COURSES_PER_ROW = 4;

const COURSE = { width: 438, height: 142, gap: 12 };
const BOX = { width: 1880, height: 850 };

export function coursePosition(index: number, total: number) {
  const rows = Math.ceil(total / COURSES_PER_ROW);
  const row = Math.floor(index / COURSES_PER_ROW);
  const column = index % COURSES_PER_ROW;
  const inRow = Math.min(COURSES_PER_ROW, total - row * COURSES_PER_ROW);

  const rowWidth = inRow * COURSE.width + (inRow - 1) * COURSE.gap;
  const left = (BOX.width - rowWidth) / 2;
  const x =
    left + column * (COURSE.width + COURSE.gap) + COURSE.width / 2 -
    BOX.width / 2;

  const totalHeight = rows * COURSE.height + (rows - 1) * COURSE.gap;
  const top = (BOX.height - totalHeight) / 2;
  const down = top + row * (COURSE.height + COURSE.gap) + COURSE.height / 2;

  return { x, y: BOX.height / 2 - down };
}
