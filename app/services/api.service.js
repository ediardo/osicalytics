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
          baseUrl = 'http://stackalytics.com/api/1.0',
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
        return baseUrl + url + '?' + paramsToQuery(params) + '&project_type=all&callback=JSON_CALLBACK';
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
        return $http.jsonp(url).then(function(response) {
          var data = filterData(response.data.stats, 'id', params.metric);
          return prepareData(data, {metric_code: params.metric, company: params.company });
        });
      };

      /*
        Get Details
      */
      service.getDetails = function(params) {
        params.user_id = _members.filter(function(member) {
          if (member.valid_id && !(member.project.includes('Mgmt') || member.group.includes('OSIC'))) {
            return true;
          } else {
            return false;
          }
        }).map(function(member) { return member.launchpad_id; }).join(',');
        console.log(params.user_id.split(',').length);
        var url = buildUrl('/activity', params);
        console.log(url);
        return $http.jsonp(url).then(function(response) {
          return response.data;
        });
      }
      service.getOsicProjects = function(params) {
        var url = '/projects.json';
        return $http.get(url).then(function(response) {
          return response.data.projects;
        })
      };

      service.getOsicGroups = function (params) {
        var url = '/groups.json';
        return $http.get(url).then(function (response) {
          return response.data.groups;
        })
      };

      service.osicModules = function(osicModules){
        _osicModules = osicModules;
      }

      return service;
    });

})();
