import dayjs from 'dayjs/esm';
import { ITINERARY_NEW_PAGE } from '~/lib/itinerary-utils';

export function splitItemsByPages(items) {
  const pages = [[]];
  let currentPage = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type === ITINERARY_NEW_PAGE) {
      currentPage++;
      pages[currentPage] = [];
      continue;
    }

    pages[currentPage].push(item);
  }

  return pages;
}

export const OVERVIEW_YEARS_COUNT = 6;

export function getCalendarStartDate(config) {
  if (config.isDecadeEnabled) {
    return dayjs.utc({ year: config.decadeStartYear || config.year, month: 0, day: 1 });
  }

  return dayjs.utc({ year: config.year, month: config.month, day: 1 });
}

export function getCalendarMonthCount(config) {
  return config.isDecadeEnabled ? OVERVIEW_YEARS_COUNT * 12 : config.monthCount;
}

export function getRenderedMonthCount(config) {
  return config.isPreview ? 1 : getCalendarMonthCount(config);
}

export function isRenderedMonth(date, config) {
  const startDate = getCalendarStartDate(config);
  const endDate = startDate.add(getRenderedMonthCount(config), 'months');
  return !date.isBefore(startDate, 'month') && date.isBefore(endDate, 'month');
}

export function isYearInCalendarRange(date, config) {
  const yearStart = date.startOf('year');
  const yearEnd = date.endOf('year');
  const calendarStart = getCalendarStartDate(config);
  const calendarEnd = calendarStart.add(getCalendarMonthCount(config), 'months');
  return yearStart.isBefore(calendarEnd, 'month') && !yearEnd.isBefore(calendarStart, 'month');
}

const renderedRanges = new WeakMap();
const calendarRanges = new WeakMap();

function getRange(cache, config, monthCount) {
  if (!cache.has(config)) {
    const startDate = getCalendarStartDate(config);
    cache.set(config, {
      first: startDate.startOf('week'),
      last: startDate
        .add(monthCount - 1, 'months')
        .endOf('month')
        .endOf('week'),
    });
  }

  return cache.get(config);
}

function isInRange(date, { first, last }) {
  return !date.isBefore(first, 'day') && !date.isAfter(last, 'day');
}

export function isRendered(date, config) {
  return isInRange(date, getRange(renderedRanges, config, getRenderedMonthCount(config)));
}

export function isInCalendarRange(date, config) {
  return isInRange(date, getRange(calendarRanges, config, getCalendarMonthCount(config)));
}
