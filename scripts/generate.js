const { readFile } = require('fs').promises;
const { join } = require('path');
const { Type, Schema, load } = require('js-yaml');
const tinycolor = require('tinycolor2');

/**
 * @typedef {Object} TokenColor - Textmate token color.
 * @prop {string} [name] - Optional name.
 * @prop {string[]} scope - Array of scopes.
 * @prop {Record<'foreground'|'background'|'fontStyle',string|undefined>} settings - Textmate token settings.
 *       Note: fontStyle is a space-separated list of any of `italic`, `bold`, `underline`.
 */

/**
 * @typedef {Object} Theme - Parsed theme object.
 * @prop {Record<'base'|'ansi'|'brightOther'|'other', string[]>} netlify - Netlify color variables.
 * @prop {Record<string, string|null|undefined>} colors - VSCode color mapping.
 * @prop {TokenColor[]} tokenColors - Textmate token colors.
 */

/**
 * @typedef {(yamlContent: string, yamlObj: Theme) => Theme} ThemeTransform
 */

const withAlphaType = new Type('!alpha', {
  kind: 'sequence',
  construct: ([hexRGB, alpha]) => hexRGB + alpha,
  represent: ([hexRGB, alpha]) => hexRGB + alpha,
});

const schema = Schema.create([withAlphaType]);

/**
 * Light variant transform.
 * @type {ThemeTransform}
 */

const transformLight = (yamlContent, yamlObj) => {
  const lightColors = yamlObj.netlify.light;
  const darkColors = yamlObj.netlify.dark;

  return load(
    yamlContent.replace(/#[0-9A-F]{6}/g, color =>
      darkColors.includes(color)
        ? lightColors[darkColors.indexOf(color)]
        : color
    ),
    { schema }
  );
};

module.exports = async () => {
  const yamlFile = await readFile(
    join(__dirname, '..', 'src', 'netlify.yml'),
    'utf-8'
  );

  /** @type {Theme} */
  const dark = load(yamlFile, { schema });

  // Remove nulls and other falsey values from colors
  for (const key of Object.keys(dark.colors)) {
    if (!dark.colors[key]) {
      delete dark.colors[key];
    }
  }

  return {
    dark,
    light: transformLight(yamlFile, dark),
  };
};
