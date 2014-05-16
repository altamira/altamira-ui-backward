'use strict';

var SupplierQuotationController = function ($scope, $modalInstance, $log, title, quote) {
  var stockTotal = 0;
  _.each(quote.stocks, function(stock) {
    stockTotal += stock.weight;
  });

  $scope.modal = {
    title : title,
    quote : quote,
    stockTotal : stockTotal,
    weightToPurchase : null
  };

  $scope.ok = function () {
    $modalInstance.close();
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};

var ConfirmSendPurchasePlanningModalController = function ($scope, $modalInstance, title) {
  $scope.title = title;

  $scope.ok = function () {
    $modalInstance.close();
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};

var ApprovePurchasePlanningModalController = function ($scope, $modalInstance, title) {
  $scope.modal = {
    title : title
  };

  $scope.ok = function () {
    $modalInstance.close();
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};

angular.module('altamiraUiApp')
  .controller('PurchaseplanningCtrl', function ($rootScope, $scope, $modal, $log, $timeout, Supplier, PurchasePlanning) {

    // Cria a lista de alertas a serem exibidos ao usuário.
    $scope.alerts = [];

    // Recupera as fornecedores.
    Supplier.getAll().then(function (suppliers) {
      // Ordena os fornecedores.
      $scope.suppliers = _.sortBy(suppliers.data, function(supplier) {
        return supplier.name;
      });
    });

    $scope.getCurrentePurchasePlanning = function () {
      // Recupera o planejamento de compra atual.
      PurchasePlanning.getCurrentPurchasePlanning().then(function (purchasePlanning) {
        $scope.purchasePlanning = purchasePlanning.data;

        // Configura o subtítulo a ser usado na página.
        $rootScope.subtitle = 'Planejamento de Compra de Aço #' + $scope.purchasePlanning.id;

        // Percorre a lista de requisições de compra criando ítens para os fornecedores que não tiveram cotação.
        _.each($scope.purchasePlanning.items, function (item) {

          // Cria uma propriedade no ítem para o preço mais baixo.
          item.cheapestPrice = null;

          // Percorre a lista de fornecedores para criar uma cotação caso ela não exista.
          _.each($scope.suppliers, function (supplier) {
            var quote = _.find(item.quotes, function(quote) {
              if (!_.isNull(quote.supplier) || !_.isUndefinded(quote.supplier)) {
                return quote.supplier.id === supplier.id;
              }
            });

            if (_.isUndefined(quote)) {
              quote = { id : null, standard : null, price : null, weight : null, stocks : [], supplier : supplier };

              item.quotes.push(quote);
            }

            if (item.cheapestPrice === null || (quote.price !== null && quote.price < item.cheapestPrice)) {
              item.cheapestPrice = quote.price;
            }
          });

          // Ordena as cotações por fornecedor.
          item.quotes = _.sortBy(item.quotes, function(quote) {
            if (!_.isNull(quote.supplier) || !_.isUndefinded(quote.supplier)) {
              return quote.supplier.name;
            }
          });
        });

        $log.info($scope.purchasePlanning);
      });
    };
    $scope.getCurrentePurchasePlanning();

    $scope.sendPurchasePlanning = function () {
      var modalInstance = $modal.open({
          templateUrl: 'confirmSendPurchasePlanning.html',
          controller: ConfirmSendPurchasePlanningModalController,
          resolve: {
            title : function () {
              return 'Confirmação Encerramento';
            }
          }
        });

      modalInstance.result.then(function () {
        // Exibe modal de encerramento do planejamento de compra...
        var modalInstanceProgress = $modal.open({
            templateUrl: 'progressSendPurchasePlanningModal.html',
            keyboard : false,
            backdrop : 'static'
          });

        PurchasePlanning.closeCurrentPurchasePlanning().then(function () {
          $scope.alerts.push({ msg : 'Planejamento encerrado com sucesso!', type : 'success'});

          $timeout(function() { if (!_.isEmpty($scope.alerts)) { $scope.alerts.splice(0, 1); }}, 5000);
        }).finally(function () {
          // Fecha a modal de envio após o retorno.
          modalInstanceProgress.close('');

          // Realiza uma nova consulta para recuperar o próximo planejamento de compra.
          $scope.closeCurrentPurchasePlanning();
        });
      }, function () {
      });
    };

    $scope.approvePurchasePlanning = function () {
      var modalInstance = $modal.open({
          templateUrl: 'approvePurchasePlanning.html',
          controller: ApprovePurchasePlanningModalController,
          resolve: {
            title : function () {
              return 'Aprovação Planejamento';
            }
          }
        });

      modalInstance.result.then(function () {
        // Exibe modal de aprovando do planejamento de compra...
        var modalInstanceProgress = $modal.open({
            templateUrl: 'progressApprovePlanningModal.html',
            keyboard : false,
            backdrop : 'static'
          });

        $timeout(function() { modalInstanceProgress.close(''); $scope.alerts.push({ msg : 'Planejamento encerrado com sucesso!', type : 'success'}); }, 3000);
        $timeout(function() { if (!_.isEmpty($scope.alerts)) { $scope.alerts.splice(0, 1); }}, 5000);
      }, function () {
      });
    };

    $scope.editSupplierQuotation = function (requestItem, quote) {
      if (_.isNull(quote.standard)) {
        return;
      }

      var quoteToEdit = angular.copy(quote);

      var modalInstance = $modal.open({
          templateUrl: 'editSupplierQuotationModal.html',
          controller: SupplierQuotationController,
          resolve: {
            title : function () {
              return 'Cotação - Peso Compra';
            },
            quote : function () {
              return quoteToEdit;
            }
          }
        });

      modalInstance.result.then(function () {
        // Transfere as alterações para o elemento e configura seu identificador caso ainda não possua.
        angular.copy(quoteToEdit, quote);
        quote.id = quote.id || 0;

        // Cria uma cópia do planejamento de compra, remove o preço mais baixo e envia para o servidor.
        var purchasePlanningToSave = angular.copy($scope.purchasePlanning);
        _.each(purchasePlanningToSave.items, function (item) {
          delete item.cheapestPrice;

          // Remove as cotações que não foram editadas.
          item.quotes = _.reject(item.quotes, function (quote) {
            return quote.id === null;
          });
        });

        // Envia as alterações para o servidor.
        PurchasePlanning.save(purchasePlanningToSave).catch(function () {
          $scope.getCurrentePurchasePlanning();
        });
      }, function (value) {
      });
    };

    $scope.closeAlert = function(index) {
      $scope.alerts.splice(index, 1);
    };
  });
