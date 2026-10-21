# Northstar

A small, private web app for two people to track savings jars and weekly weight goals.

- **Ian** and **Caca** each get their own page and currency.
- Multiple savings jars per person, each with its own target and progress.
- Dated contributions plus weekly, biweekly, or monthly recurring deposits.
- One active weight goal per person, weekly weigh-ins, and 3-month / 6-month / 1-year trend charts.
- Two themes, mobile-first layout, and an installable PWA shell.
- All data stays in this browser. There are no accounts and no server.

## Quick start

### Open it locally

You can open `index.html` directly in a browser. Everything except PWA installation and offline caching works from `file://`.

For the full experience, serve the folder over local HTTP:

```powershell
powershell -ExecutionPolicy Bypass -File .\serve.ps1
```

Then open <http://localhost:8080/>.

The script uses port `8080` by default:

```powershell
powershell -ExecutionPolicy Bypass -File .\serve.ps1 -Port 8081
```

### Put it on a phone

Upload these files to any static host — GitHub Pages, Netlify, Vercel, Cloudflare Pages, or your own web space:

```text
index.html
styles.css
app.js
manifest.webmanifest
sw.js
icon.svg
icon-180.png
icon-192.png
icon-512.png
icon-maskable-512.png
```

There is no build step and no package install. Use HTTPS if you want the service worker and install prompt to work.

**iPhone / iPad:** open the site in Safari, tap **Share**, then **Add to Home Screen**.

**Android:** open the site in Chrome, open the menu, then **Install app** or **Add to Home screen**.

The app also works as a normal mobile website without installing it.

## First use

1. Open **Settings** and confirm each person's currency and weight unit.
2. Create one or more savings jars for each person.
3. Add contributions, or create a recurring rule from inside a jar.
4. Set a starting weight, goal weight, and start date.
5. Log a weigh-in once a week. The chart fills in as you add entries.

Use the **Ian / Caca** switch at the top to move between people. The Northstar logo returns to the last person you were viewing.

## How recurring deposits work

- Frequencies are weekly, every two weeks, or monthly.
- A rule has a start date and an optional end date.
- If a rule starts in the past, all missed deposits are added when you save it or reopen the app.
- Missed deposits catch up automatically the next time the app is opened.
- Past entries stay editable. Editing one auto-created entry only changes that entry, not the rule.
- Deleting an auto-created entry does not make the rule recreate it.
- Editing a rule changes future generation only. Existing contributions stay as they are.
- Pausing a rule skips the missed period. Resuming starts from the next scheduled occurrence.
- If a jar reaches its target, contributions can keep going. Progress is capped visually at 100%.

## Weights and units

- Each person chooses **kg** or **lb** in Settings.
- Weights are stored internally in kilograms, so switching units changes the display only.
- One active weight goal per person. Removing the goal also removes that person's weigh-in history.
- Weigh-ins are dated and sorted; a second entry on the same date updates the existing one.
- The chart ranges are last 3 months, 6 months, and 12 months.
- The target line and starting weight are included in the chart scale.

## Currencies

Ian defaults to **USD** and Caca to **IDR**. Both can be changed in Settings, and each person's totals stay in their own currency — there is no cross-currency household total.

**Changing a currency changes the symbol and number formatting only. It does not convert existing amounts.** If you switch Ian from USD to EUR, a `$1,000` jar becomes `€1,000`; it does not become `€920`.

## Backups and privacy

- Data is stored in `localStorage` under the key `northstar.data.v1`.
- No app data is sent to a server.
- Clearing browser/site data deletes the app's data. Export a backup first.
- **Export JSON** downloads a complete snapshot: jars, contributions, rules, goals, weigh-ins, theme, and last person.
- **Import JSON** validates the file, asks for confirmation, then replaces everything currently stored.
- Backups are portable between browsers and devices.

Data is per browser and per device. Opening the app on another phone does not sync it automatically; move data with an exported JSON file.

## Customizing

The two people are intentionally fixed as Ian and Caca. Useful places to edit:

- `app.js` → `defaultData()` for default names, currencies, and units.
- `app.js` → `JAR_COLORS` and `JAR_COLOR_NAMES` for jar colors.
- `styles.css` → `:root` and `[data-theme="dark"]` for the palette.
- `index.html` → `<title>` and the brand text.

Keep the two person IDs (`ian`, `caca`) consistent if you rename labels.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | App shell, dialogs, and forms |
| `styles.css` | Mobile-first layout, themes, charts, bottom sheets |
| `app.js` | Storage, routing, recurring rules, charts, CRUD, import/export |
| `manifest.webmanifest` | PWA metadata and icons |
| `sw.js` | Offline app-shell cache |
| `icon*.png` / `icon.svg` | Home-screen and browser icons |
| `serve.ps1` | Optional local PowerShell static server |

## Notes

- Written in plain HTML, CSS, and JavaScript. No framework, no build step, no external assets.
- Targets current Chrome and Safari; verified in Chrome's mobile viewport.
- The service worker only registers over `http://` or `https://`, not `file://`.
- After changing app files while testing locally, do a hard refresh if an older service worker is still active.
- The in-app version label is a static reminder, not an updater.
