/* Sets the CSS variables from config.brand when the app starts.
   tokens.css holds the defaults; this overwrites them with the client's colors. */
import { config } from './index.js';

// Which config.brand keys map to which CSS variable.
// `logo` is deliberately absent — it is a file path, not a color.
const BRAND_TOKENS = {
  primary: '--color-primary',
  accent: '--color-accent',
  text: '--color-text',
};

export function applyBrand() {
  const brand = config.brand;
  if (!brand) return;              // no brand block — keep the tokens.css defaults

  const root = document.documentElement;   // the <html> element, same as :root in CSS

  for (const [key, token] of Object.entries(BRAND_TOKENS)) {
    const value = brand[key];
    if (value) {
      root.style.setProperty(token, value);
    }
  }
}