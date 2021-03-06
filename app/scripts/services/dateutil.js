'use strict';

angular.module('altamiraUiApp')
  .factory('DateUtil', function () {
    var defaultFormat = 'YYYY-MM-DD';

    // Public API...
    return {
      parse: function (dateToParse) {
        return moment(dateToParse, defaultFormat).toDate();
      },
      format : function(dateToFormat) {
        return moment(dateToFormat).format(defaultFormat);
      }
    };
  });
