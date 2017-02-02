(function() {
  'use strict';

  /*
  TODO:
   - Remove unused variables/methods (ediardo)
   - Use D3 to render a pie chart
   - A message showing a "Loading" or something for UX purposes
   */

  angular
    .module('osicApp')
    .factory('myFactory', function($http, $q) {
      var service = {},
          _baseUrl,
          _isTunnelingEnabled,
          _finalUrls = {},
          _release,
          _metricsType,
          _startDate,
          _endDate,
          _metrics = [],
          _members,
          _memberStats,
          _utcOffset = -18000,
          _modules = [],
          _osicModules = [],
          _osicGroups = [];

      service.setAPIUrl = function(url) {
        _baseUrl = url;
      }

      service.getAPIUrl = function() {
        return _baseUrl;
      }

      service.setIsTunnelingEnabled = function(status) {
        _isTunnelingEnabled = status;
      }

      service.getIsTunnelingEnabled = function() {
        return _isTunnelingEnabled;
      }

      service.setMembers = function(members) {
        _members = members;
      }

      /*
        Returns a query string suitable for a GET request
        { foo: 'value1', foo2: 'value2'} -> foo=value1&foo2=value2
      */
      var paramsToQuery = function (params) {
        var query = [];
        angular.forEach(params, function(value, name) {
          if(value !== null && value !== undefined && value !== ''){
            this.push(name + '=' + value);
          }
        }, query);
        return query.join('&');
      };

      /*
        Returns a string with URL pointing to Stackalytics API
      */
      var buildUrl = function(url, params) {
        if (_isTunnelingEnabled) {
          return _baseUrl + url + encodeURIComponent('?' + paramsToQuery(params) + '&project_type=all');
        } else {
          return _baseUrl + url + '?' + paramsToQuery(params) + '&project_type=all';
        }
      };

      /*
        Filter only those users we care about
      */
      var filterData = function(data, byKey) {
        // Get all IDs from our list of users for fitltering
        var memberIds = _members.map(function(member){ return member.launchpad_id;})
        return data.filter(function(obj, idx) {
          if (memberIds.includes(obj[byKey])) {
            return obj;
          }
        });
      };

      /*
        Prepare Data
      */
      var prepareData = function(data, fields) {
        return data.filter(function(obj, idx) {
          angular.forEach(fields, function(value, field) {
            this[field] = value;
          }, obj);
          return obj;
        });
      };

      service.calculateMetrics = function(metrics) {
        var calculatedMetrics = {};
        angular.forEach(metrics, function(metric, idx) {
          var safeMetricCode = metric.metric_code.replace('-', '_');
          if (!(safeMetricCode in calculatedMetrics)) {
            calculatedMetrics[safeMetricCode] = {};
            calculatedMetrics[safeMetricCode]['total'] = 0;
            calculatedMetrics[safeMetricCode]['intel'] = 0;
            calculatedMetrics[safeMetricCode]['rackspace'] = 0;
            calculatedMetrics[safeMetricCode]['members'] = [];
          }
          calculatedMetrics[safeMetricCode]['members'].push(metric);
          calculatedMetrics[safeMetricCode]['total'] += metric.metric;
          if (metric.company == 'intel') {
            calculatedMetrics[safeMetricCode]['intel'] += metric.metric;
          } else if (metric.company == 'rackspace') {
            calculatedMetrics[safeMetricCode]['rackspace'] += metric.metric;
          }

        });

        return calculatedMetrics;
      }


      var setMetric = function(metricType,  metric) {
        _metrics[metricType] = metric;
      }

      /*
        Get Metric
      */
      service.getMetric = function(params) {
        var url = buildUrl('/stats/engineers', params);
        console.log(url);
        return $http({
          method: _isTunnelingEnabled ? 'GET' : 'JSONP',
          url: url
        }).then(function(response) {
          var data = filterData(response.data.stats, 'id', params.metric);
          return prepareData(data, {metric_code: params.metric, company: params.company });
        });
      };

      /*
        Get Details
      */
      service.getDetails = function(params) {
        var url;
        console.log(url);
        params.user_id = _members.filter(function(member) {
          // Discard managers and other people not contributing Upstream
          if (member.valid_id && !(member.project.includes('Mgmt') || member.group.includes('OSIC'))) {
            return true;
          }
          return false;
        }).map(function(member) { return member.launchpad_id; }).join(',');
        url = buildUrl('/activity', params);
        console.log(url);
        return $http({
          method: _isTunnelingEnabled ? 'GET' : 'JSONP',
          url: url
        }).then(function(response) {
          return response.data;
        });
      }
      service.getOsicProjects = function(params) {
        var url = '/projects.json';
        return $http({
          method: 'GET',
          url: url
        }).then(function(response) {
          return response.data.projects;
        })
      };

      service.getOsicGroups = function (params) {
        var url = '/groups.json';
        return $http({
          method: 'GET',
          url: url
        }).then(function (response) {
          return response.data.groups;
        })
      };

      service.osicModules = function(osicModules){
        _osicModules = osicModules;
      }

      /*
       *  Gets a list of OpenStack modules
       */
      service.getModules = function() {
        var url = buildUrl('/modules', {});
        return $http({
          url: url,
          method: _isTunnelingEnabled ? 'GET' : 'JSONP'
        }).then(function(response) {
          return response.data.data;
        });
      }

      /*
       *  Gets a list of OpenStack releases
       */
      service.getReleases = function() {
        var url = buildUrl('/releases', {});
        return $http({
          url: url,
          method: _isTunnelingEnabled ? 'GET' : 'JSONP'
        });
      }

      // Come down to earth!
      return service;
    });

})();
