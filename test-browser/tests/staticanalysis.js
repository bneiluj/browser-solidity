'use strict'
var contractHelper = require('../helpers/contracts')
var init = require('../helpers/init')
var sauce = require('./sauce')
var dom = require('../helpers/dom')

var sources = {
  'sources': {
    'Untitled': `
contract test1 { address test = tx.origin; }
contract test2 {}
contract TooMuchGas {
  uint x;
  function() { x++; }
}`
  }
}

module.exports = {
  before: function (browser, done) {
    init(browser, done)
  },
  '@sources': function () {
    return sources
  },
  'Static Analysis': function (browser) {
    runTests(browser)
  },
  tearDown: sauce
}

function runTests (browser) {
  browser
    .waitForElementVisible('.newFile', 10000)
  contractHelper.testContracts(browser, sources.sources.Untitled, ['TooMuchGas', 'test1', 'test2'], function () {
    browser
      .click('.staticanalysisView')
      .click('#staticanalysisView button')
      .waitForElementPresent('#staticanalysisresult .warning', 2000, true, function () {
        dom.listSelectorContains(['Untitled:1:34: use of tx.origin',
          'Fallback function of contract TooMuchGas requires too much gas'],
          '#staticanalysisresult .warning span',
          browser, function () {
            browser.end()
          }
        )
      })
  })
}
