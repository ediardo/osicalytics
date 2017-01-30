(function() {
  'use strict';

  angular
    .module('osicApp')
    .directive('objTitle', function() {
      return {
        retrict: 'A',
        scope: {
            objTitle: '=',
            objUrl: '=',
            objType: '='
        },
        replace: 'true',
        template: '<span class="label label-info object-title "><a href="{{ objUrl }}" target="_blank" title="Open link in a new tab">{{ objTitle }}</a></span>',
        link: function(scope, element, attrs) {
          if (scope.objTitle.length > 70) {
            scope.objTitle = scope.objTitle.substring(0, 69) + '...';
          }
          if (scope.objType == 'commit') {
            scope.objUrl = "https://review.openstack.org/#q," + scope.objUrl;
          }
        }
      }
    });

})();
