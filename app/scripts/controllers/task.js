'use strict';

angular.module('altamiraUiApp')
  .controller('TaskCtrl', function ($scope, Task) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    Task.get({}, function(resp) {
      console.log(resp);
    }, function(err) {
      console.log(err);
    });
  });
