import { Document, StyleSheet } from '@react-pdf/renderer';
import PropTypes from 'prop-types';
import React from 'react';

import PdfConfig from '~/pdf/config';
import { NOTO_SANS_CJK } from '~/pdf/lib/fonts';
import DayPage from '~/pdf/pages/day';
import DecadePage from '~/pdf/pages/decade';
import LastPage from '~/pdf/pages/last';
import MonthOverviewPage from '~/pdf/pages/month-overview';
import WeekOverviewPage from '~/pdf/pages/week-overview';
import WeekRetrospectivePage from '~/pdf/pages/week-retrospective';
import YearNotesPage from '~/pdf/pages/year-notes';
import YearOverviewPage from '~/pdf/pages/year-overview';
import { getCalendarMonthCount, getCalendarStartDate, getRenderedMonthCount } from '~/pdf/utils';

class RecalendarPdf extends React.Component {
  styles = StyleSheet.create({
    document: {
      fontFamily: [this.props.config.fontFamily, NOTO_SANS_CJK],
    },
    page: {
      flexDirection: 'row',
      backgroundColor: '#E4E4E4',
    },
  });

  renderWeek(startOfWeek) {
    const { config } = this.props;

    const weekPages = [];
    let currentDate = startOfWeek.clone();
    const endOfWeek = startOfWeek.add(1, 'weeks');
    while (currentDate.isBefore(endOfWeek)) {
      if (config.isMonthOverviewEnabled && currentDate.date() === 1) {
        weekPages.push(
          <MonthOverviewPage key={'month-overview-' + currentDate.unix()} date={currentDate} config={config} />,
        );
      }
      const key = 'day-' + currentDate.unix();
      weekPages.push(<DayPage key={key} date={currentDate} config={config} />);
      currentDate = currentDate.add(1, 'days');
    }
    return (
      <React.Fragment key={'week-' + startOfWeek.unix()}>
        {config.isWeekOverviewEnabled && <WeekOverviewPage date={startOfWeek} config={config} />}
        {weekPages}
        {config.isWeekRetrospectiveEnabled && <WeekRetrospectivePage date={startOfWeek} config={config} />}
      </React.Fragment>
    );
  }

  renderYearPages(startDate, endDate) {
    const { config } = this.props;
    const pageList = [];

    let currentDate = startDate;
    while (currentDate.isBefore(endDate)) {
      const nextYear = currentDate.startOf('year').add(1, 'year');
      const yearEnd = nextYear.isBefore(endDate) ? nextYear : endDate;

      pageList.push(
        <YearOverviewPage
          key={'year-overview-' + currentDate.year()}
          startDate={currentDate}
          endDate={yearEnd}
          config={config}
        />,
      );
      if (config.isYearNotesEnabled) {
        pageList.push(<YearNotesPage key={'year-notes-' + currentDate.year()} date={currentDate} config={config} />);
      }

      currentDate = yearEnd;
    }

    return pageList;
  }

  renderCalendar() {
    const { config } = this.props;
    const pageList = [];
    const calendarStart = getCalendarStartDate(config);
    const calendarEnd = calendarStart.add(getCalendarMonthCount(config), 'months');
    const renderedEndDate = calendarStart.add(getRenderedMonthCount(config), 'months');

    if (config.isDecadeEnabled) {
      pageList.push(<DecadePage key="decade" config={config} />);
    }
    pageList.push(...this.renderYearPages(calendarStart, calendarEnd));

    let currentDate = calendarStart.startOf('week');
    while (currentDate.isBefore(renderedEndDate)) {
      pageList.push(this.renderWeek(currentDate));
      currentDate = currentDate.add(1, 'weeks');
    }

    pageList.push(<LastPage key="last" config={config} />);

    return pageList;
  }

  render() {
    return <Document style={this.styles.document}>{this.renderCalendar()}</Document>;
  }
}

RecalendarPdf.propTypes = {
  config: PropTypes.instanceOf(PdfConfig).isRequired,
};

export default RecalendarPdf;
