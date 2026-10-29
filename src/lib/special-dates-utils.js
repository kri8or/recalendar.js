import dayjs from 'dayjs/esm';

export const HOLIDAY_DAY_TYPE = 'holiday';
export const EVENT_DAY_TYPE = 'event';

export function isHoliday({ type }) {
  return type === HOLIDAY_DAY_TYPE;
}
export function isEvent({ type }) {
  return type === EVENT_DAY_TYPE;
}

// Special dates are stored either as a recurring "MM-DD" key that matches the
// same day in every year, or as a year-specific "YYYY-MM-DD" key that matches
// only that single day (used for holidays whose date moves between years).
export const DATE_FORMAT = 'MM-DD';
export const YEAR_DATE_FORMAT = 'YYYY-MM-DD';

export function isYearSpecificDate(date) {
  return date.length > DATE_FORMAT.length;
}

export function findByDay(day) {
  const recurringKey = day.format(DATE_FORMAT);
  const yearKey = day.format(YEAR_DATE_FORMAT);
  return ({ date }) => date === recurringKey || date === yearKey;
}

/**
 * Turns per-year holiday lists into calendar entries. Holidays that fall on the
 * same month-day in every requested year become a single recurring entry;
 * anything else (floating dates or holidays missing in some years) becomes one
 * year-specific entry per occurrence.
 *
 * @param holidaysByYear - array of holiday lists, aligned with targetYears
 * @param targetYears - years the holidays were fetched for
 * @returns Entries of { date, holidayName, holiday }
 */
export function buildHolidayEntries(holidaysByYear, targetYears) {
  const holidaysByName = new Map();

  holidaysByYear.forEach((holidays, index) => {
    const year = targetYears[index];
    holidays.forEach((holiday) => {
      const occurrences = holidaysByName.get(holiday.name) ?? [];
      occurrences.push({ year, monthDay: holiday.date.slice(5), holiday });
      holidaysByName.set(holiday.name, occurrences);
    });
  });

  const entries = [];
  for (const [name, occurrences] of holidaysByName) {
    const isDateStable =
      occurrences.length === targetYears.length && new Set(occurrences.map(({ monthDay }) => monthDay)).size === 1;

    if (isDateStable) {
      entries.push({ date: occurrences[0].monthDay, holidayName: name, holiday: occurrences[0].holiday });
      continue;
    }

    for (const { year, monthDay, holiday } of occurrences) {
      entries.push({ date: `${year}-${monthDay}`, holidayName: name, holiday });
    }
  }

  return entries;
}

export function getDedupeKey({ date, holidayName, value }) {
  const name = (holidayName ?? value ?? '').trim().toLowerCase();
  return `${date}|${name}`;
}

export function getSpannedYears({ year, month, monthCount }) {
  const firstDay = dayjs({ year, month, day: 1 }).startOf('week');
  const lastDay = dayjs({ year, month, day: 1 }).add(monthCount, 'months').subtract(1, 'day');
  const years = [];
  for (let current = firstDay.year(); current <= lastDay.year(); current++) {
    years.push(current);
  }
  return years;
}

export function formatYearRange(years) {
  if (years.length === 0) {
    return '';
  }

  return years.length === 1 ? String(years[0]) : `${years[0]}-${years[years.length - 1]}`;
}
