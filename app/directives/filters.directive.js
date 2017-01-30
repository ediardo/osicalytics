(function() {
  'use strict';

  angular
    .module('osicApp')
    .directive('filters', function () {
      return {
        link: function(scope, element, attrs) {
          scope.$watch('filters', function (val) {
            if (val) {
              element.removeAttr('disabled');
            } else {
              element.attr('disabled', 'true');
            }
          });
        }
      }
    });

})();
