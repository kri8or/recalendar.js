import { Link, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import dayjs from 'dayjs/esm';
import PropTypes from 'prop-types';
import React from 'react';

import { getPageSizeInPoints } from '~/lib/device-utils';
import { getHorizontalSidebarOffset } from '~/lib/sidebar-utils';
import PdfConfig from '~/pdf/config';
import { decadeLink, yearOverviewLink } from '~/pdf/lib/links';
import { sidebarPadding } from '~/pdf/styles';
import { getCalendarStartDate, isYearInCalendarRange, OVERVIEW_YEARS_COUNT } from '~/pdf/utils';

const PAGE_VERTICAL_MARGIN = 5;
const PAGE_TITLE_HEIGHT = 34;
// react-pdf breaks to a new page earlier than pure arithmetic suggests,
// so reserve some extra room to keep the decade on a single page.
const PAGE_BREAK_SAFETY_MARGIN = 20;
const ROW_GAP = 6;
// 18pt title box plus its 2pt bottom margin.
const YEAR_TITLE_HEIGHT = 20;
const SQUARE_BORDER = 1;
const CELL_BORDER = 0.5;
const MONTH_GRID_COLUMNS = 3;
const MONTH_GRID_ROWS = 4;

class DecadePage extends React.Component {
  constructor(props) {
    super(props);

    const { config } = props;
    const [pageWidth, pageHeight] = getPageSizeInPoints(config);
    const { paddingTop, paddingBottom, ...horizontalPadding } = sidebarPadding(config);
    const availableWidth = pageWidth - getHorizontalSidebarOffset(config);
    const reservedHeight = paddingTop + paddingBottom + PAGE_VERTICAL_MARGIN * 2;
    const availableHeight = pageHeight - reservedHeight - PAGE_TITLE_HEIGHT - PAGE_BREAK_SAFETY_MARGIN;

    this.side = 0;
    this.columns = 1;
    for (let candidate = 1; candidate <= OVERVIEW_YEARS_COUNT; candidate++) {
      const rows = Math.ceil(OVERVIEW_YEARS_COUNT / candidate);
      // Every square carries ROW_GAP horizontally and every grid row carries
      // YEAR_TITLE_HEIGHT + ROW_GAP vertically - both budgets must hold.
      const candidateSide = Math.floor(
        Math.min(
          (availableWidth - candidate * ROW_GAP) / candidate,
          (availableHeight - rows * (YEAR_TITLE_HEIGHT + ROW_GAP)) / rows,
        ),
      );
      if (candidateSide >= this.side) {
        this.side = candidateSide;
        this.columns = candidate;
      }
    }

    // The square's 1pt border is included in its size, so cells divide the inner area.
    this.innerSide = this.side - SQUARE_BORDER * 2;
    const cellWidth = Math.floor(this.innerSide / MONTH_GRID_COLUMNS);
    const cellHeight = Math.floor(this.innerSide / MONTH_GRID_ROWS);
    this.cellFontSize = Math.min(cellWidth, cellHeight) * 0.3;

    this.styles = StyleSheet.create({
      page: {
        ...horizontalPadding,
        paddingTop: paddingTop + PAGE_VERTICAL_MARGIN,
        paddingBottom: paddingBottom + PAGE_VERTICAL_MARGIN,
      },
      title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'black',
        textDecoration: 'none',
        textAlign: 'center',
        marginBottom: 4,
      },
      gridRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: ROW_GAP,
      },
      year: {
        marginLeft: ROW_GAP / 2,
        marginRight: ROW_GAP / 2,
      },
      yearTitle: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 2,
        height: YEAR_TITLE_HEIGHT,
      },
      yearTitleText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: 'black',
        textDecoration: 'none',
      },
      square: {
        width: this.side,
        height: this.side,
        flexDirection: 'column',
        border: `${SQUARE_BORDER} solid #555`,
      },
      cellRow: {
        flexDirection: 'row',
      },
      cell: {
        width: cellWidth,
        height: cellHeight,
        border: `${CELL_BORDER} solid #BBB`,
        justifyContent: 'center',
        alignItems: 'center',
      },
      cellText: {
        fontSize: this.cellFontSize,
        color: 'black',
        textDecoration: 'none',
      },
    });
  }

  getStartYear() {
    return getCalendarStartDate(this.props.config).year();
  }

  renderMonthCell(year, month, isInCalendar) {
    const monthName = dayjs.utc({ year, month, day: 1 }).format('MMM');
    const monthText = <Text style={this.styles.cellText}>{monthName}</Text>;

    if (!isInCalendar) {
      return (
        <View key={month} style={this.styles.cell}>
          {monthText}
        </View>
      );
    }

    return (
      <Link key={month} src={'#' + yearOverviewLink(dayjs.utc({ year, month: 0, day: 1 }))} style={this.styles.cell}>
        {monthText}
      </Link>
    );
  }

  renderMonthCells(year, isInCalendar) {
    const cells = [];
    for (let row = 0; row < MONTH_GRID_ROWS; row++) {
      const rowCells = [];
      for (let column = 0; column < MONTH_GRID_COLUMNS; column++) {
        rowCells.push(this.renderMonthCell(year, row * MONTH_GRID_COLUMNS + column, isInCalendar));
      }

      cells.push(
        <View key={row} style={this.styles.cellRow}>
          {rowCells}
        </View>,
      );
    }

    return cells;
  }

  renderYear(year) {
    const { config } = this.props;
    const yearDate = dayjs.utc({ year, month: 0, day: 1 });
    const isInCalendar = isYearInCalendarRange(yearDate, config);

    return (
      <View key={year} style={this.styles.year} wrap={false}>
        {isInCalendar ? (
          <Link src={'#' + yearOverviewLink(yearDate)} style={this.styles.yearTitle}>
            <Text style={this.styles.yearTitleText}>{year}</Text>
          </Link>
        ) : (
          <View style={this.styles.yearTitle}>
            <Text style={this.styles.yearTitleText}>{year}</Text>
          </View>
        )}
        <View style={this.styles.square}>{this.renderMonthCells(year, isInCalendar)}</View>
      </View>
    );
  }

  renderYears() {
    const startYear = this.getStartYear();
    const years = [];
    for (let offset = 0; offset < OVERVIEW_YEARS_COUNT; offset += this.columns) {
      const yearSquares = [];
      for (let column = 0; column < this.columns && offset + column < OVERVIEW_YEARS_COUNT; column++) {
        yearSquares.push(this.renderYear(startYear + offset + column));
      }

      years.push(
        <View key={offset} style={this.styles.gridRow} wrap={false}>
          {yearSquares}
        </View>,
      );
    }

    return years;
  }

  renderTitle() {
    const startYear = this.getStartYear();
    return (
      <Link src={'#' + yearOverviewLink(dayjs.utc({ year: startYear, month: 0, day: 1 }))} style={this.styles.title}>
        {startYear + ' - ' + (startYear + OVERVIEW_YEARS_COUNT - 1)}
      </Link>
    );
  }

  render() {
    const { config } = this.props;
    return (
      <Page size={getPageSizeInPoints(config)} style={this.styles.page}>
        <View id={decadeLink()}>{this.renderTitle()}</View>
        {this.renderYears()}
      </Page>
    );
  }
}

DecadePage.propTypes = {
  config: PropTypes.instanceOf(PdfConfig).isRequired,
};

export default DecadePage;
