import {
  BuiltinThemeProvider,
  ThemeService,
} from '@theia/core/lib/browser/theming';
import { nls } from '@theia/core/lib/common/nls';
import type { Theme, ThemeType } from '@theia/core/lib/common/theme';

export namespace ArduinoThemes {
  export const light: Theme = {
    id: 'arduino-theme',
    type: 'light',
    label: 'Light (Arduino)',
    editorTheme: 'arduino-theme',
  };
  export const dark: Theme = {
    id: 'arduino-theme-dark',
    type: 'dark',
    label: 'Dark (Arduino)',
    editorTheme: 'arduino-theme-dark',
  };
}

const officialThemeIds = new Set(
  [
    ArduinoThemes.light,
    ArduinoThemes.dark,
    BuiltinThemeProvider.hcTheme,
    // TODO: add the HC light theme after Theia 1.36
  ].map(({ id }) => id)
);
export function isOfficialTheme(theme: Theme | string): boolean {
  const themeId = typeof theme === 'string' ? theme : theme.id;
  return officialThemeIds.has(themeId);
}

export function themeLabelForSettings(theme: Theme): string {
  switch (theme.id) {
    case ArduinoThemes.light.id:
      return nls.localize('arduino/theme/light', 'Light');
    case ArduinoThemes.dark.id:
      return nls.localize('arduino/theme/dark', 'Dark');
    case BuiltinThemeProvider.hcTheme.id:
      return nls.localize('arduino/theme/hc', 'High Contrast');
    default:
      return nls.localize(
        'arduino/theme/unofficialTheme',
        'Unofficial - {0}',
        theme.label
      );
  }
}

export function compatibleBuiltInTheme(theme: Theme): Theme {
  switch (theme.type) {
    case 'light':
      return ArduinoThemes.light;
    case 'dark':
      return ArduinoThemes.dark;
    case 'hc':
      return BuiltinThemeProvider.hcTheme;
    default: {
      console.warn(
        `Unhandled theme type: ${theme.type}. Theme ID: ${theme.id}, label: ${theme.label}`
      );
      return ArduinoThemes.light;
    }
  }
}

// For tests without DI
interface ThemeProvider {
  themes(): Theme[];
  currentTheme(): Theme;
}

/**
 * Returns with a list of built-in themes officially supported by IDE2 (https://github.com/arduino/arduino-ide/issues/1283).
 * If the `currentTheme` is not a built-in one, it will be appended to the array. Built-in themes come first (in light, dark, HC dark order), followed by any contributed one.
 */
export function userConfigurableThemes(service: ThemeService): Theme[];
export function userConfigurableThemes(provider: ThemeProvider): Theme[];
export function userConfigurableThemes(
  serviceOrProvider: ThemeService | ThemeProvider
): Theme[] {
  const provider =
    serviceOrProvider instanceof ThemeService
      ? {
          currentTheme: () => serviceOrProvider.getCurrentTheme(),
          themes: () => serviceOrProvider.getThemes(),
        }
      : serviceOrProvider;
  const currentTheme = provider.currentTheme();
  return provider
    .themes()
    .filter((theme) => isOfficialTheme(theme) || currentTheme.id === theme.id)
    .sort((left, right) => {
      const leftBuiltIn = isOfficialTheme(left);
      const rightBuiltIn = isOfficialTheme(right);
      if (leftBuiltIn === rightBuiltIn) {
        return themeTypeComparator(left, right);
      }
      return leftBuiltIn ? -1 : 1;
    });
}

const themeTypeOrder: Record<ThemeType, number> = {
  light: 0,
  dark: 1,
  hc: 2,
};
const themeTypeComparator = (left: Theme, right: Theme) =>
  themeTypeOrder[left.type] - themeTypeOrder[right.type];
