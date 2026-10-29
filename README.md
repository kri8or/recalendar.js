# Recalendar6

### Highly customizable, multi-year calendar for ReMarkable tablets

Recalendar6 is a fork of [ReCalendar](https://recalendar.me/) - it allows you to generate your own, personalized calendar right in your browser.

## Features

See the features page of your deployment for a full list.

 - Optimized for the [ReMarkable 2 tablet](https://remarkable.com/store/remarkable-2) (should work with version 1 as well) to use the full space available and minimize screen refreshes.
 - **Six years at a glance** - the years overview page shows six years, each as a square with its 12 months. Tap any year to jump to its overview; when enabled, the calendar is generated for all six years with complete months, weeks and day pages.
 - **Holidays for every year** - import national holidays for every year your calendar covers. Fixed-date holidays repeat automatically, while floating ones (Easter, Thanksgiving, etc.) get their exact date for each year.
 - No hacks needed - the generated PDF is a normal file, with links, etc. that you can simply upload normally to your tablet.
 - Heavy use of links to allow quick and easy navigation.
 - Lots of easy configuration options to tailor the calendar to your needs - plus access to the source code for even more advanced customization.
 - Easily switch to any locale supported by dayjs.
 - Add extra pages to all or selected days of the week to suit your needs.
 - Provide a list of special dates (anniversaries, birthdays, etc.) and let Recalendar6 embed them into your personalized calendar - on monthly views, weekly overviews and finally, day entries.
 - Track your habits monthly.
 - Start the "year" on arbitrary month (can be useful for tracking academic years, etc.).

## Quickstart for developers/contributors

[Vite](https://vitejs.dev/) is used for development. Make sure you use `nvm` or a compatible solution to use the correct Node version.

```
nvm use
npm install
npm run dev
```

## Known issues

See [the open issues on GitHub](https://github.com/kri8or/recalendar.js/issues).

## License

[GNU AGPLv3 License](https://github.com/kri8or/recalendar.js/blob/main/LICENSE). In particular, this means that you can do what you want with this code, but *you have to publish your changes with the same license*. Please consider submitting a PR!

Recalendar6 is based on [ReCalendar](https://github.com/klimeryk/recalendar.js/) by [Igor Klimer](https://klimer.eu/) - many thanks for creating and maintaining the original project!
