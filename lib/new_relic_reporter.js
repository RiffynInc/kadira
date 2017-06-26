var util = Npm.require('util');

var NewRelic = Npm.require('newrelic');

var ignoredMetrics = { system: [ "startTime", "endTime" ] };

function recordCustomMetric(metricType, name, value) {
  var tag = util.format('Custom/%s/%s', metricType, name);
  if (name && (value > -1)) {
    // console.log('Kadira: New Relic recording metric %s  %s=%s', tag, name, value);
    NewRelic.recordMetric(tag, value);
    return;
  }

  // console.log('Kadira: New Relic NOT recording metric %s  %s=%s', tag, name, value);
};


function recordGroupedMetrics(metricType, groupName, data) {
  data = data || [ ];

  data.forEach(function(info) {
    if (info[groupName]) {
      for (var m in info[groupName]) {
        var metrics = info[groupName][m];
        for (var k in metrics) {
          var name = util.format('%s.%s', m, k);
          recordCustomMetric(metricType, name, metrics[k]);
        }
      }
    }
  });
};

function recordGroupedRequests(metricType, data) {
  data = data || [ ];

  data.forEach(function(info) {
    if (info.name) {
      for (var k in info.metrics) {
        var name = util.format('%s.%s', info.name, k);
        recordCustomMetric(metricType, name, info.metrics[k]);
      }
    }
  });
};

NewRelicReporter = function(appid) {
  this.appid = appid;
};

NewRelicReporter.prototype.report = function(data) {
  var self = this;

  data = data || { };

  if (data.systemMetrics) {
    self._sendSystemMetrics(data.systemMetrics);
  }

  if (data.methodMetrics) {
    self._sendMethodMetrics(data.methodMetrics);
  }

  if (data.methodRequests) {
    self._sendMethodRequests(data.methodRequests);
  }

  if (data.pubMetrics) {
    self._sendPubMetrics(data.pubMetrics);
  }

  if (data.pubRequests) {
    self._sendPubRequests(data.pubRequests);
  }

  // TODO(ramr): handle data.errors - map to NewRelic error reporting

};

NewRelicReporter.prototype.reportCustomMetric = function(metricType, name,
                                                         value) {
  recordCustomMetric(metricType, name, value);
};

NewRelicReporter.prototype._sendSystemMetrics = function(data) {
  data = data || [ ];

  // TODO(ramr): Currently unable to map this to NewRelic system reporting.
  //             Would be ideal if we could do that.
  data.forEach(function(metrics) {
    for (var k in metrics) {
      if (-1 === ignoredMetrics.system.indexOf(k)) {
        recordCustomMetric('SystemMetrics', k, metrics[k]);
      }
    }
  });
};

NewRelicReporter.prototype._sendMethodMetrics = function(data) {
  recordGroupedMetrics('MethodMetrics', 'methods', data);
};

NewRelicReporter.prototype._sendMethodRequests = function(data) {
  recordGroupedRequests('MethodRequests', data);
};

NewRelicReporter.prototype._sendPubMetrics = function(data) {
  recordGroupedMetrics('PubMetrics', 'pubs', data);
};

NewRelicReporter.prototype._sendPubRequests = function(data) {
  recordGroupedMetrics('PubRequests', 'pubs', data);
};
