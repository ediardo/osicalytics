(function() {
  'use strict';

  angular
    .module('osicApp')
    .directive('loading', function() {
      return {
        link: function(scope, element, attrs) {
          scope.$watch('loading', function (val) {
            if (val) {
              element.addClass('-show-overlay');
            } else {
              element.removeClass('-show-overlay');
            }
          });
        }
      }
    });

})();
