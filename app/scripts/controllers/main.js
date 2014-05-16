'use strict';

var showErrorServerModalController = function ($scope, $modalInstance, title, error) {
  $scope.title = title;
  $scope.error = error;

  $scope.ok = function () {
    $modalInstance.close();
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};

angular.module('altamiraUiApp')
  .controller('CarouselDemoCtrl', function ($rootScope, $scope) {

    // Configura o subtítulo a ser usado na página.
    $rootScope.subtitle = 'Home';

	  $scope.interval = 5000;
    var slides = $scope.slides = [];

	  slides.push({
      image: 'images/deposito01.jpg',
      caption : 'Porta Paletes Convencional e Mesanino'
	  });

	  slides.push({
      image: 'images/deposito02.jpg',
      caption : 'Mesanino Metálico'
	  });

	  slides.push({
      image: 'images/deposito03.jpg',
      caption : 'Porta Paletes com Túnel'
	  });

	  slides.push({
      image: 'images/deposito04.jpg',
      caption : 'Porta Paletes com Piso Intermediário para Cargas Manuais'
	  });
  })
  .controller('NavbarWrapperCtrl', function ($scope, $cookieStore, $location, $modal, $log, $timeout, Auth) {
    var handleError = function(evt, error) {
      var modalInstance = $modal.open({
          templateUrl: 'showErrorServerModal.html',
          controller: showErrorServerModalController,
          resolve: {
            title : function () {
              return 'Erro na aplicação';
            },
            error : function () {
              return error;
            }
          }
        });

      modalInstance.result.then(function (request) {
        $log.debug(request);
      }, function () {
        $log.debug('Modal cancelada: ' + new Date());
      });
    };

    // Tratamento dos eventos de início e fim de requisições http.
    $scope.$on('http:start', function(evt, error) {
      $scope.httpIndicator = true;

      $timeout(function() {
        $scope.httpIndicator = false;
      }, 10000);
    });

    $scope.$on('http:stop', function(evt, error) {
      $scope.httpIndicator = false;
    });

    // Eventos gerados em respostas com erro.
    $scope.$on('page:notFound', handleError);
    $scope.$on('server:error', handleError);
    $scope.$on('connection:error', handleError);

	  $scope.collapse = true;

	  $scope.logged = Auth.isLogged();
	  $scope.email = '';
	  $scope.password = '';

	  $scope.login = function () {
      Auth.login($scope.email, $scope.password);

      $scope.logged = Auth.isLogged();

      $location.path('/request');
	  };

    $scope.logout = function () {
      Auth.logout();

      $scope.logged = Auth.isLogged();

      $location.path('/');
    };
  });
