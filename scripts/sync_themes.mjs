import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const chromiumRoot = path.resolve(__dirname, "..");
const palettePath = path.resolve(chromiumRoot, "../palette/palette.source.json");

const palette = JSON.parse(readFileSync(palettePath, "utf8"));

const tintPresets = {
  dark: {
    buttons: [0.58, 0.02, 0.08],
    frame: [0.58, 0.02, 0.04],
    frame_inactive: [0.58, 0.01, 0.08]
  },
  light: {
    buttons: [0.6, 0.02, 0.94],
    frame: [0.6, 0.01, 0.96],
    frame_inactive: [0.6, 0.01, 0.92]
  }
};

function hexToRgb(hex) {
  const normalized = hex.replace(/^#/, "");
  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16)
  ];
}

function buildColorMap(scheme, colors) {
  const isDark = scheme === "dark";
  const shared = {
    toolbar: colors.bg_1,
    toolbar_text: colors.fg_primary,
    toolbar_button_icon: colors.fg_secondary,
    tab_background_text: colors.fg_muted,
    tab_text: colors.fg_secondary,
    tab_selected: colors.bg_2,
    tab_selected_text: colors.fg_primary,
    bookmark_text: colors.fg_primary,
    omnibox_background: colors.bg_2,
    omnibox_text: colors.fg_primary,
    omnibox_border: colors.border,
    button_background: isDark ? colors.bg_3 : colors.bg_2,
    ntp_background: colors.bg_0,
    ntp_text: colors.fg_primary,
    ntp_link: colors.blue,
    ntp_header: colors.fg_primary,
    ntp_section: colors.bg_1,
    ntp_section_text: colors.fg_primary,
    ntp_section_link: colors.blue,
    toolbar_field: colors.bg_2,
    toolbar_field_text: colors.fg_primary,
    toolbar_field_border: colors.border,
    toolbar_field_focus: colors.bg_2,
    toolbar_field_text_focus: colors.fg_primary,
    toolbar_field_border_focus: colors.cursor,
    toolbar_field_separator: isDark ? colors.bg_3 : colors.bg_2,
    omnibox_results_bg: colors.bg_1,
    omnibox_results_text: colors.fg_primary,
    omnibox_results_url: colors.blue,
    omnibox_results_selected_bg: colors.selection,
    omnibox_results_selected_text: colors.fg_primary,
    omnibox_results_selected_url: colors.blue,
    popup: colors.bg_1,
    popup_text: colors.fg_primary,
    popup_border: colors.border,
    popup_highlight: colors.selection,
    popup_highlight_text: colors.fg_primary,
    side_panel_background: colors.bg_1,
    side_panel_foreground: colors.fg_primary,
    side_panel_border: colors.border,
    bookmark_bar: colors.bg_1,
    toolbar_top_separator: isDark ? colors.bg_3 : colors.bg_2,
    toolbar_bottom_separator: isDark ? colors.bg_3 : colors.bg_2,
    tab_separator: isDark ? colors.bg_3 : colors.bg_2,
    tab_line: colors.cursor,
    tab_loading: colors.blue,
    tab_group_frame: colors.border,
    tab_group_text: colors.fg_primary,
    tab_group_frame_inactive: isDark ? colors.bg_3 : colors.bg_2,
    tab_group_text_inactive: colors.fg_muted,
    tab_alert_audio: colors.blue,
    tab_alert_recording: colors.blue,
    tab_alert_pip_playing: colors.blue
  };

  if (isDark) {
    return {
      frame: colors.bg_0,
      frame_inactive: colors.bg_1,
      frame_incognito: colors.bg_1,
      ...shared,
      frame_incognito_inactive: colors.bg_0
    };
  }

  return {
    frame: colors.bg_1,
    frame_inactive: colors.bg_2,
    ...shared,
    tab_selected: colors.bg_0,
    omnibox_background: colors.bg_0,
    toolbar_field: colors.bg_0,
    toolbar_field_focus: colors.bg_0,
    popup_highlight: colors.selection,
    button_background: colors.bg_2
  };
}

function buildTheme(flavourName) {
  const flavour = palette.flavours[flavourName];
  const colors = flavour.colors;
  const scheme = flavour.type;
  const themeColors = buildColorMap(scheme, colors);

  return {
    colors: Object.fromEntries(
      Object.entries(themeColors).map(([key, hex]) => [key, hexToRgb(hex)])
    ),
    tints: tintPresets[scheme],
    properties: {
      color_scheme: scheme
    }
  };
}

for (const flavourName of Object.keys(palette.flavours)) {
  const manifestPath = path.resolve(chromiumRoot, `nightshift-lobo-${flavourName}/manifest.json`);
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

  manifest.theme = buildTheme(flavourName);

  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}
