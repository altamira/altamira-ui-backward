'use strict';

angular.module('altamiraUiApp')
  .factory('Material', function (Restangular) {
    var Material = Restangular.all('material');

    // Public API...
    return {
      save: function (newMaterial) {
        return Material.post(newMaterial);
      }
    };
  });
