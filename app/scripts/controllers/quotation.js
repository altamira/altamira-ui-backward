'use strict';

var SupplierQuotationController = function ($scope, $modalInstance, $log, title, standards, quote) {
  $scope.modal = {
    title : title,
    quote : quote,
    newStock : {},
    isValidNewStock : false,
    standards : standards
  };

  // Controle de validação para inclusão de um novo estoque.
  $scope.$watchCollection('modal.newStock.width', function(newValue, oldValue) {
    $scope.validNewStock();
  });

  $scope.$watchCollection('modal.newStock.length', function(newValue, oldValue) {
    $scope.validNewStock();
  });

  $scope.$watchCollection('modal.newStock.weight', function(newValue, oldValue) {
    $scope.validNewStock();
  });

  $scope.validNewStock = function () {
    var INTEGER_REGEXP = /^\-?\d+$/;
    var FLOAT_REGEXP = /^\-?\d+((\.|\,)\d+)?$/;

    $scope.modal.isValidNewStock = FLOAT_REGEXP.test($scope.modal.newStock.width) &&
                                   FLOAT_REGEXP.test($scope.modal.newStock.length) &&
                                   INTEGER_REGEXP.test($scope.modal.newStock.weight);
  };

  $scope.addStock = function () {
    $scope.modal.newStock.id = 0;
    $scope.modal.quote.stocks.push($scope.modal.newStock);

    $scope.modal.newStock = {};
  };

  $scope.removeStock = function (index) {
    $scope.modal.quote.stocks.splice(index, 1);
  };

  $scope.ok = function () {
    $modalInstance.close();
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};

var ConfirmSendQuotationModalController = function ($scope, $modalInstance, title) {
  $scope.title = title;

  $scope.ok = function () {
    $modalInstance.close();
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};

angular.module('altamiraUiApp')
  .controller('QuotationCtrl', function ($rootScope, $scope, $modal, $log, $timeout, Supplier, Quotation, Standard) {

    // Cria a lista de alertas a serem exibidos ao usuário.
    $scope.alerts = [];

    // Recupera as fornecedores.
    Supplier.getAll().then(function (suppliers) {
      // Ordena os fornecedores.
      $scope.suppliers = _.sortBy(suppliers.data, function(supplier) {
        return supplier.name;
      });
    });

    $scope.getCurrenteQuotation = function () {
      // Recupera a cotação atual.
      Quotation.getCurrentQuotation().then(function (quotation) {
        $scope.quotation = quotation.data;

        // Configura o subtítulo a ser usado na página.
        $rootScope.subtitle = 'Cotação de Compra de Aço #' + $scope.quotation.id;

        // Percorre a lista de cotações criando ítens para os fornecedores que ainda não tem uma cotação.
        _.each($scope.quotation.items, function (item) {

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

        //$log.info($scope.quotation);
      });
    };
    $scope.getCurrenteQuotation();

    // Recupera as normas para cotação.
    Standard.getAll().then(function (standards) {
      $scope.standards = standards.data;
    });

    $scope.sendQuotation = function () {
      var modalInstance = $modal.open({
          templateUrl: 'confirmSendQuotationModal.html',
          controller: ConfirmSendQuotationModalController,
          resolve: {
            title : function () {
              return 'Confirmação Encerramento';
            }
          }
        });

      modalInstance.result.then(function () {
        // Exibe modal de encerramento da cotação...
        var modalInstanceProgress = $modal.open({
            templateUrl: 'progressSendQuotationModal.html',
            keyboard : false,
            backdrop : 'static'
          });

        Quotation.closeCurrentQuotation().then(function () {
          $scope.alerts.push({ msg : 'Cotação encerrada com sucesso!', type : 'success'});

          $timeout(function() { if (!_.isEmpty($scope.alerts)) { $scope.alerts.splice(0, 1); }}, 5000);
        }).finally(function () {
          // Fecha a modal de envio após o retorno.
          modalInstanceProgress.close('');

          // Realiza uma nova consulta para recuperar a próxima cotação.
          $scope.getCurrenteQuotation();
        });
      }, function () {
      });
    };

    $scope.editSupplierQuotation = function (quotationItem, quote) {
      var quoteToEdit = angular.copy(quote);

      var modalInstance = $modal.open({
          templateUrl: 'editSupplierQuotationModal.html',
          controller: SupplierQuotationController,
          resolve: {
            title : function () {
              return 'Cotação';
            },
            standards : function () {
              return $scope.standards;
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

        // Atualiza os preços mais baixos da lista apresentada.
        quotationItem.cheapestPrice = null;
        _.find(quotationItem.quotes, function(quoteTemp) {
          var cheapestPrice = _.isNull(quoteTemp.price) ? quote.price : Math.min(quote.price, quoteTemp.price);

          if (quotationItem.cheapestPrice === null || cheapestPrice < quotationItem.cheapestPrice) {
            quotationItem.cheapestPrice = cheapestPrice;
          }
        });

        // Cria uma cópia da cotação, remove o preço mais baixo e envia para o servidor.
        var quotationToSave = angular.copy($scope.quotation);
        _.each(quotationToSave.items, function (item) {
          delete item.cheapestPrice;

          // Remove as cotações que não foram editadas.
          item.quotes = _.reject(item.quotes, function (quote) {
            return quote.id === null;
          });
        });

        // Envia as alterações para o servidor.
        Quotation.save(quotationToSave).catch(function () {
          $scope.getCurrenteQuotation();
        });
      }, function (value) {

      });
    };

    $scope.closeAlert = function(index) {
      $scope.alerts.splice(index, 1);
    };
  });
