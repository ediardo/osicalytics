(function() {
  'use strict';

  angular
    .module('osicApp', ['ui.bootstrap', 'ngTable', 'angularMoment', 'ngRoute'])
    .constant('config', {
      appName: 'OSICAlytics',
      appVersion: '0.9.1',
      apiTunnelUrl: '/api_tunnel.php?q=',
      apiStackalyticsUrl: 'http://stackalytics.com/api/1.0'
    })
    .config(function($sceDelegateProvider) {
      $sceDelegateProvider.resourceUrlWhitelist([
        'self',
        'http://stackalytics.com/**'
      ]);
    });


})();
