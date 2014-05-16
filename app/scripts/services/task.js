'use strict';

angular.module('altamiraUiApp')
  .factory('Task', function ($http, $resource) {
    /**var url = 'http://189.61.232.133:8080/engine-rest/task?callback=JSON_CALLBACK&assignee=esli.gomes'

    return {
      get : function(parameters) {
        console.log('Obtendo tarefas...');

        $http({ method: 'GET', url: url })
          .success(function(data, status) {
            // Data
            console.log(data);
          })
          .error(function(data, status) {
            alert(data || "Request failed");
            alert(status);
          });
        }
    };**/

    return $resource('http://localhost\\:8080/altamira-bpm/rest/quotation', { taskId: '@id' });
  });
