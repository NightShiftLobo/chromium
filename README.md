# NightShift Lobo Chromium Themes

Tagline: **Precision Dark. Engineered Focus.**

This repository contains production-ready Chromium/Chrome extensions (Manifest V3):

- `nightshift-lobo-eclipse` (dark, ultra low light)
- `nightshift-lobo-shadow` (dark, balanced night)
- `nightshift-lobo-obsidian` (dark, high depth)
- `nightshift-lobo-dawn` (light, low glare daytime)
- `nightshift-lobo-dawn-web-contrast` (optional Dawn-only website readability companion)

All extensions use the NightShift Lobo logo as the extension icon.

## Folder Structure

```text
nightshift-lobo-eclipse/
  manifest.json
  icon.png
nightshift-lobo-shadow/
  manifest.json
  icon.png
nightshift-lobo-obsidian/
  manifest.json
  icon.png
nightshift-lobo-dawn/
  manifest.json
  icon.png
nightshift-lobo-dawn-web-contrast/
  manifest.json
  content.js
  content.css
  icon.png
```

## Manual Installation (Themes)

1. Open Chromium or Chrome.
2. Navigate to `chrome://extensions`.
3. Enable **Developer mode** (top-right).
4. Click **Load unpacked**.
5. Select one theme folder (for example: `nightshift-lobo-eclipse`).
6. The selected theme is applied immediately.

## Dawn Website Readability Add-on (Optional)

Use this add-on only with `nightshift-lobo-dawn`.

1. Open `chrome://extensions`.
2. Click **Load unpacked**.
3. Select `nightshift-lobo-dawn-web-contrast`.
4. Keep it enabled for Dawn sessions.
5. Disable it when switching to dark themes.

Behavior of `nightshift-lobo-dawn-web-contrast`:

- Softens harsh bright/white page backgrounds using the Dawn palette.
- Retones bright neutral panels/controls for lower glare.
- Preserves readability by using light text automatically on dark labels/buttons.

## Reload After Updates

If you modify any extension files:

1. Open `chrome://extensions`.
2. Click **Reload** on the updated extension card.
3. Refresh affected website tabs.

## Switch Between Flavours

1. Return to `chrome://extensions`.
2. Disable or remove the currently installed theme.
3. Click **Load unpacked** again.
4. Select a different flavour folder.

## Reset to Default Theme

1. Open `chrome://settings/appearance`.
2. Click **Reset to default** under Theme.
