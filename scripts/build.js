const fs = require('fs');
const path = require('path');
const generate = require('./generate');

const THEME_DIR = path.join(__dirname, '..', 'themes');

if (!fs.existsSync(THEME_DIR)) {
  fs.mkdirSync(THEME_DIR);
}

module.exports = async () => {
  const { dark, light } = await generate();

  return Promise.all([
    fs.promises.writeFile(
      path.join(THEME_DIR, 'netlify-dark.json'),
      JSON.stringify(dark, null, 4)
    ),
    fs.promises.writeFile(
      path.join(THEME_DIR, 'netlify-light.json'),
      JSON.stringify(light, null, 4)
    ),
  ]);
};

if (require.main === module) {
  module.exports();
}
