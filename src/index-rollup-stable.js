/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2016-2018 Mickael Jeanroy
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

'use strict';

const _ = require('lodash');
const LicensePlugin = require('./license-plugin.js');

module.exports = (options = {}) => {
  // Rollup <= 0.48 used `sourceMap` in camelcase, so this plugin used
  // this convention at the beginning.
  // Now, the `sourcemap` key should be used, but legacy version should still
  // be able to use the `sourceMap` key.
  const newOptions = _.omitBy(options, (value, key) => (
    key === 'sourceMap'
  ));

  // If the old `sourceMap` key is used, set it to `sourcemap` key.
  if (!_.hasIn(newOptions, 'sourcemap') && _.hasIn(options, 'sourceMap')) {
    console.warn(`[${LicensePlugin.NAME}] sourceMap has been deprecated, please use sourcemap instead.`);
    newOptions.sourcemap = options.sourceMap;
  }

  const plugin = new LicensePlugin(newOptions);

  return {
    /**
     * Name of the plugin, used automatically by rollup.
     * @type {string}
     */
    name: plugin.name,

    /**
     * Function called by rollup when a JS file is loaded: it is used to scan
     * third-party dependencies.
     *
     * @param {string} id JS file path.
     * @return {void}
     */
    load(id) {
      plugin.scanDependency(id);
    },

    /**
     * Function called by rollup when the final bundle is generated: it is used
     * to prepend the banner file on the generated bundle.
     *
     * @param {string} code Bundle content.
     * @param {Object} chunk The chunk being generated.
     * @param {Object} outputOptions The options for the generated output.
     * @return {void}
     */
    renderChunk(code, chunk, outputOptions = {}) {
      return plugin.prependBanner(code, outputOptions.sourcemap !== false);
    },

    /**
     * Function called by rollup when the final bundle will be written on disk: it
     * is used to generate a file containing a summary of all third-party dependencies
     * with license information.
     *
     * @return {void}
     */
    generateBundle() {
      plugin.exportThirdParties();
    },
  };
};