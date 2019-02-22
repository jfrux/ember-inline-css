/* eslint-env node */
'use strict';

let fs = require('fs');
let path = require('path');
let CSS_PREFIX = '<style>';
let CSS_SUFFIX = '</style>';

function escapeRegExp(string) {
  return string.replace(/[-.*+?^${}()|\/[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function CSSInjector(options) {
  Object.assign(this, options);
}

CSSInjector.prototype = {
  write: function(outputPath) {
    let inputHTML = fs.readFileSync(path.join(this.rootPath, 'index.html'), 'utf-8');

    this.filePathsToInject.forEach((p) => {
      if (inputHTML.indexOf(p) === -1) { return; }
      let escapedPath = escapeRegExp(p);
      let regExpPattern = `<link.*href=["|']?[\/]?${escapedPath}["|']>`;
      let regex = new RegExp(regExpPattern);
      inputHTML = inputHTML.replace(regex, () => {
        const filePath = path.join(this.rootPath, p);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        return this.wrapCSS(fileContent);
      });
    });

    fs.writeFileSync(outputPath, inputHTML, 'utf-8');
  },

  wrapCSS: function(css) {
    return CSS_PREFIX + css + CSS_SUFFIX;
  }
};

module.exports = CSSInjector;
