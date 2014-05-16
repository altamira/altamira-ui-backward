'use strict';

var ModalInstanceCtrl = function ($scope, $modalInstance, $log, DateUtil, title, item, treatments, thicknesses, widths, lengths) {
  // Adiciona uma propriedade para controlar o formato do material (Bobina ou Chapa).
  item.cut = item.material.length === 0 ? 'B' : 'C';

  // Adiciona a opção de outra escolha às listas.
  var thicknessesOptions = [];
  _.each(thicknesses, function (thickness) {
    thicknessesOptions.push({ desc : thickness.toFixed(2), value : thickness });
  });
  thicknessesOptions.push({ desc : 'Outra...', value :  '--' });

  item.otherThickness = item.material.thickness;
  if(!_.contains(thicknesses, item.material.thickness)) {
    item.material.thickness = thicknessesOptions[thicknessesOptions.length - 1].value;
  }

  // Uma vez construída a lista de espessuras, reatribuí à variável que será exibida.
  thicknesses = thicknessesOptions;

  widths = angular.copy(widths);
  widths.push('Outra...');

  item.otherWidth = item.material.width;
  if(!_.contains(widths, item.material.width)) {
    item.material.width = widths[widths.length - 1];
  }

  lengths = angular.copy(lengths);
  lengths.push('Outro...');

  item.otherLength = item.material.length;
  if(!_.contains(lengths, item.material.length)) {
    item.material.length = lengths[lengths.length - 1];
  }

  // Converte o valor para o tipo Date usado na modal.
  item.arrival = new Date(item.arrival);

  var minDate = new Date();
  minDate.setHours(0,0,0,0);

  // Configura o escopo que será acessado pelo template (view).
  $scope.modal = {
    title : title,
    item : item,
    treatments : treatments,
    thicknesses : thicknesses,
    widths : widths,
    lengths : lengths,
    showOtherThickness : item.material.thickness === thicknesses[thicknesses.length - 1].value,
    showOtherWidth : item.material.width === widths[widths.length - 1],
    showOtherLength : item.material.length === lengths[lengths.length - 1],
    opened : false,
    minDate : minDate
  };

  $scope.openCalendar = function($event) {
    $event.preventDefault();
    $event.stopPropagation();

    $scope.modal.opened = true;
  };

  $scope.ok = function () {
    // Tradução do valor para casos de escolha da uma opção alternativa.
    if (_.isNaN(parseFloat(item.material.thickness))) {
      item.material.thickness = item.otherThickness;
    }
    delete item.otherThickness;

    if (_.isNaN(parseFloat(item.material.width))) {
      item.material.width = item.otherWidth;
    }
    delete item.otherWidth;

    if (_.isNaN(parseFloat(item.material.length))) {
      item.material.length = item.otherLength;
    }
    delete item.otherLength;

    // Remove a propriedade auxiliar usada para controlar o tipo de material.
    delete item.cut;

    // Trunc no dia da data escolhida.
    item.arrival.setHours(0, 0, 0, 0);

    // Transforma a data para o formato trocado com o servidor.
    item.arrival = item.arrival.getTime();

    // Retorna fornecendo o ítem.
    $modalInstance.close(item);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

  $scope.changedThickness = function () {
    $scope.modal.showOtherThickness = _.isNaN(parseFloat($scope.modal.item.material.thickness));
  };

  $scope.changedWidth = function () {
    $scope.modal.showOtherWidth = _.isNaN(parseFloat($scope.modal.item.material.width));
  };

  $scope.changedLength = function () {
    $scope.modal.showOtherLength = _.isNaN(parseFloat($scope.modal.item.material.length));
  };

  $scope.changedCut = function () {
    if ($scope.modal.item.cut === 'B') {
      $scope.modal.item.material.length = 0;
    }
  };
};

var ConfirmRemoveItemModalController = function ($scope, $modalInstance, title, item) {
  $scope.title = title;

  $scope.ok = function () {
    $modalInstance.close(item);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};

var ConfirmSendRequestModalController = function ($scope, $modalInstance, title) {
  $scope.title = title;

  $scope.ok = function () {
    $modalInstance.close();
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};

angular.module('altamiraUiApp')
  .controller('RequestCtrl', function ($filter, $rootScope, $scope, $modal, $log, $timeout, Restangular, DateUtil, Request, Material) {

    // Cria a lista de alertas a serem exibidos ao usuário.
    $scope.alerts = [];

    $scope.getCurrentRequest = function () {
      Request.getCurrentRequest().then(function(request) {

        $scope.request = request;

        // Configura o subtítulo a ser usado na página.
        $rootScope.subtitle = 'Requisição de Compra de Aço #' + $scope.request.id;

        // Correção no caso de um array null ao invés de vazio.
        if (_.isNull($scope.request.items)) {
          $scope.request.requestItem = [];
        }
      });
    };
    $scope.getCurrentRequest();

    $scope.editRequest = function(item) {
      var title = 'Ítem Requisição';

      if (_.isUndefined(item)) {
        item = createDefaultRequestItem();

        title = 'Novo ' + title;
      }

      var modalInstance = $modal.open({
        templateUrl: 'myModalContent.html',
        controller: ModalInstanceCtrl,
        resolve: {
          DateUtil : function () {
            return DateUtil;
          },
          title : function () {
            return title;
          },
          item : function () {
            return angular.copy(item); // A edição será realizada sempre em cima de uma cópia.
          },
          treatments : function () {
            return Request.getTreatments();
          },
          thicknesses : function () {
            return Request.getThicknesses();
          },
          widths : function () {
            return Request.getWidths();
          },
          lengths : function () {
            return Request.getLengths();
          }
        }
      });

      modalInstance.result.then(function (editedItem) {
        // Cria o material. Para isso é necessário que o mesmo esteja sempre com o identificador igual à "0".
        editedItem.material.id = 0;
        Material.save(editedItem.material).then(function(dataMaterial) {
          // Verifica se existe na requisição um ítem com o material escolhido e na data escolhida.
          if (editedItem.id === 0 && _.find($scope.request.items, function (requestItem) {
              return requestItem.material.id === dataMaterial.id && requestItem.arrival === editedItem.arrival;
            })){

            $scope.alerts.push({ msg : 'Não foi possível adicionar o ítem. Já existe um material para a data escolhida!', type : 'danger'});

            $timeout(function() { if (!_.isEmpty($scope.alerts)) { $scope.alerts.splice(0, 1); }}, 5000);
          } else {
            // Configura o material após uma inserção com sucesso.
            editedItem.material = Restangular.stripRestangular(dataMaterial);

            // Transfere as alterações para o objeto que será original.
            angular.copy(editedItem, item);

            // Ser for um novo ítem adicioná-o ao final da lista antes de enviar. Se for uma edição os dados já foram atualizados localmente.
            if (item.id === 0) {
              $scope.request.all('items').post(item).then(function (data) {
                $log.info(data);

                $scope.getCurrentRequest();
              });
            } else {
              $log.info(editedItem);
              $scope.request.all('items').customPUT(item, item.id).then(function (data) {
                $log.info(data);

                $scope.getCurrentRequest();
              });
            }
          }
        });
      }, function () {
      });
    };

    function createDefaultRequestItem() {
      return {
        id : 0,
        weight : null,
        arrival : new Date().getTime(),
        material : {
          id : 0,
          treatment : 'PR',
          lamination : 'FQ',
          thickness : 0.65,
          width : 80,
          length : 0
        }
      };
    }

    $scope.removeRequest = function (item) {
      var modalInstance = $modal.open({
          templateUrl: 'confirmRemoveItemModal.html',
          controller: ConfirmRemoveItemModalController,
          resolve: {
            title : function () {
              return 'Confirmação Remoção';
            },
            item : function () {
              return item;
            }
          }
        });

      modalInstance.result.then(function (item) {
        $scope.request.items = _.reject($scope.request.items, function (itemRequest) {
          return itemRequest.id === item.id;
        });

        Request.save($scope.request).finally(function() {
          $scope.getCurrentRequest();
        });
      }, function () {
      });
    };

    $scope.sendRequest = function () {
      var modalInstance = $modal.open({
          templateUrl: 'confirmSendRequestModal.html',
          controller: ConfirmSendRequestModalController,
          resolve: {
            title : function () {
              return 'Confirmação Envio';
            }
          }
        });

      modalInstance.result.then(function () {
        // Exibe modal de envio da requisição...
        var modalInstanceProgress = $modal.open({
            templateUrl: 'progressSendRequestModal.html',
            keyboard : false,
            backdrop : 'static'
          });

        Request.sendCurrentRequest().then(function () {
          $scope.alerts.push({ msg : 'Requisição enviada com sucesso!', type : 'success'});

          $timeout(function() { if (!_.isEmpty($scope.alerts)) { $scope.alerts.splice(0, 1); }}, 5000);
        }).finally(function() {
          // Fecha a modal de envio após o retorno.
          modalInstanceProgress.close('');

          // Realiza uma nova consulta para recuperar a próxima requisição.
          $scope.getCurrentRequest();
        });
      }, function () {
      });
    };

    $scope.closeAlert = function(index) {
      $scope.alerts.splice(index, 1);
    };
  });
