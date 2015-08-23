var _ = require('lodash');
var Package = require('../Package');
var diff = require('objectdiff').diff;
var options = {
  docsToTrackFn: function(docs) {}
};

var generations = [];
var previousTrackedDocs;

module.exports = new Package('trackDocLogger')

.factory('trackDocLoggerOptions', function() {
  return options;
})

.eventHandler('processorEnd', function() {
  return function(event, processor, docs) {
    trackedDocs = options.docsToTrackFn(docs);
    if ( trackedDocs ) {
     if ( !_.isEqual(trackedDocs, previousTrackedDocs) ) {
        trackedDocs = _.cloneDeep(trackedDocs);
        generations.push({ processor: processor.name, docs: trackedDocs });
        previousTrackedDocs = trackedDocs;
     }
    }
  };
})

.eventHandler('generationEnd', function(log) {
  return function() {
    log.info('trackDocLogger settings:', options);
    log.info('trackDocLogger tracked changes:', generations);
  }
});