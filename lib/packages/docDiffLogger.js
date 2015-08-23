var _ = require('lodash');
var Package = require('../Package');
var util = require('util');
var diff = require('objectdiff').diff;
var firstDocs, startDocs, lastDocs;
var firstProcessor, startProcessor, lastProcessor;
var options = {
  start: null,
  end: null
};

module.exports = new Package('docDiffLogger')

.factory('docDiffLoggerOptions', function() {
  return options;
})

.eventHandler('processorStart', function() {
  return function capturePreviousDocs(event, processor, docs) {
    firstProcessor = firstProcessor || processor;
    firstDocs = firstDocs || _.cloneDeep(docs);

    if ( options.start == processor.name ) {
      startProcessor = processor;
      startDocs = _.cloneDeep(docs);
    }
  };
})

.eventHandler('processorEnd', function(log) {
  return function(event, processor, docs) {
    lastProcessor = processor;
    lastDocs = docs;

    if ( options.end === processor.name ) {
      logDiff(log, docs);
    }
  };
})

.eventHandler('generationEnd', function(log) {
  return function() {
    if ( options.start && !startDocs ) {
      throw new Error('docDiffLogger: missing start processor');
    }
    if ( options.end && !endDocs ) {
      throw new Error('docDiffLogger: missing end processor');
    }
    if ( !options.end ) {
      logDiff(log);
    }
  }
});


function logDiff(log, endDocs) {
  var changes = diff(startDocs || firstDocs, endDocs || lastDocs);
  log.info(options);
  log.info(changes);
}