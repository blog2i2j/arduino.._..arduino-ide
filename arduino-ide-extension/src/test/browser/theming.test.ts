import { enableJSDOM } from '@theia/core/lib/browser/test/jsdom';
const disableJSDOM = enableJSDOM();

import { BuiltinThemeProvider } from '@theia/core/lib/browser/theming';
import { Theme } from '@theia/core/lib/common/theme';
import { expect } from 'chai';
import {
  ArduinoThemes,
  isOfficialTheme,
  userConfigurableThemes,
} from '../../browser/theia/core/theming';

disableJSDOM();

const testTheme: Theme = {
  id: 'testTheme',
  label: 'Test Theme',
  type: 'light',
};
const anotherTestTheme: Theme = {
  id: 'anotherTestTheme',
  label: 'Another Test Theme',
  type: 'dark',
};

describe('theming', () => {
  describe('userConfigurableThemes', () => {
    it('if the current theme is a built-in theme, the result does not contain any contributed theme', () => {
      const actual = userConfigurableThemes({
        themes: () => [
          ArduinoThemes.dark,
          ArduinoThemes.light,
          testTheme,
          BuiltinThemeProvider.hcTheme,
          anotherTestTheme,
        ],
        currentTheme: () => BuiltinThemeProvider.hcTheme,
      });
      expect(actual.length).to.be.equal(3);
      expect(actual[0].id).to.be.equal(ArduinoThemes.light.id);
      expect(actual[1].id).to.be.equal(ArduinoThemes.dark.id);
      expect(actual[2].id).to.be.equal(BuiltinThemeProvider.hcTheme.id);
    });

    it('if the currently selected theme is a contributed one, it is the last element in the array', () => {
      const actual = userConfigurableThemes({
        themes: () => [
          BuiltinThemeProvider.hcTheme,
          ArduinoThemes.dark,
          ArduinoThemes.light,
          testTheme,
          anotherTestTheme,
        ],
        currentTheme: () => testTheme,
      });
      expect(actual.length).to.be.equal(4);
      expect(actual[0].id).to.be.equal(ArduinoThemes.light.id);
      expect(actual[1].id).to.be.equal(ArduinoThemes.dark.id);
      expect(actual[2].id).to.be.equal(BuiltinThemeProvider.hcTheme.id);
      expect(actual[3].id).to.be.equal(testTheme.id);
    });
  });

  describe('isBuiltInTheme', () => {
    (
      [
        [BuiltinThemeProvider.lightTheme, false],
        [BuiltinThemeProvider.darkTheme, false],
        [BuiltinThemeProvider.hcTheme, true],
        [ArduinoThemes.light, true],
        [ArduinoThemes.dark, true],
        [testTheme, false],
      ] as [Theme, boolean][]
    ).map(([theme, expected]) =>
      it(`should${expected ? '' : ' not'} treat '${
        theme.id
      }' theme as built-in`, () =>
        expect(isOfficialTheme(theme)).to.be.equal(expected))
    );
  });
});
