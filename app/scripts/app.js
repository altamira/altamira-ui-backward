'use strict';

angular.module('altamiraUiApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ui.bootstrap',
  'restangular'
])
  .config(function ($routeProvider, $httpProvider, RestangularProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'CarouselDemoCtrl'
      })
      .when('/task', {
        templateUrl: 'views/task.html',
        controller: 'TaskCtrl'
      })
      .when('/request', {
        templateUrl: 'views/request.html',
        controller: 'RequestCtrl'
      })
      .when('/quotation', {
        templateUrl: 'views/quotation.html',
        controller: 'QuotationCtrl'
      })
      .when('/purchaseplanning', {
        templateUrl: 'views/purchaseplanning.html',
        controller: 'PurchaseplanningCtrl'
      })
      .when('/purchaseorder', {
        templateUrl: 'views/purchaseorder.html',
        controller: 'PurchaseorderCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });

    // Adiciona um interceptor responsável pelo tratamento das respostas http.
    var httpInterceptor = function ($q, $rootScope, $log) {
      return {
        request: function(config) {

          $rootScope.$broadcast('http:start');

          return config || $q.when(config);
        },
        response: function (resp) {
          $rootScope.$broadcast('http:stop');

          if (resp.data.error) {
            $log.error('Detectado um erro no servidor: ' + resp.data.error + '. Message: ' + resp.data.message);

            $rootScope.$broadcast('server:error', { code : resp.data.error, message : resp.data.message });

            return $q.reject(resp);
          }

          return resp || $q.when(resp);
        },
        responseError : function(rejection) {
          $rootScope.$broadcast('http:stop');

          switch(rejection.status) {
            case 401:
              $log.error('Detectada a necessidade de autenticação');

              $rootScope.$broadcast('auth:loginRequired');
              break;
            case 403:
              $log.error('Detectado o acesso a um recurso sem autorização');

              $rootScope.$broadcast('auth:forbidden');
              break;
            case 404:
              $log.error('Detectado o acesso a um recurso não encontrado no servidor');

              $rootScope.$broadcast('page:notFound', { code : rejection.status, message : 'Página ou recurso não encontrado. URL: ' + rejection.config.url });
              break;
            case 500:
              $log.error('Detectado um erro interno no servidor');

              $rootScope.$broadcast('server:error', { code : rejection.status, message : rejection.data });
              break;
            default:
              $log.error('Detectado um erro de conexão com o servidor: Status: ' + rejection.status + '. URL: ' + rejection.config.url);

              $rootScope.$broadcast('connection:error', { code : rejection.status, message : 'Erro de conexão. URL: ' + rejection.config.url});
          }

          return $q.reject(rejection);
        }
      };
    };
    $httpProvider.interceptors.push(httpInterceptor);

    // Configurações do CORS.
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];

    // Configuração do framework Restangular.
    RestangularProvider.setBaseUrl('/data/rest');
  });
