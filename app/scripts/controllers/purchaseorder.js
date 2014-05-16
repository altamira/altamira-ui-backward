'use strict';

var PurchaseOrderModalCtrl = function ($scope, $modalInstance, $log, title, purchaseOrder) {

  var states = ['AC', 'AL', 'AM', 'AP',  'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'];

  // Configura o escopo que será acessado pela modal.
  $scope.modal = {
    title : title,
    purchaseOrder : purchaseOrder,
    states : states
  };

  $scope.ok = function () {
    $modalInstance.close(purchaseOrder);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};

var ReportPurchaseOrderModalCtrl = function ($scope, $modalInstance, $log, title, purchaseOrder) {

  PDFJS.getDocument('images/EmentaJavaOOP.pdf').then(function(pdf) {
    // Using promise to fetch the page
    // Rendering all pages starting from first
    var viewer = document.getElementById('viewer');
    var pageNumber = 1;
    renderPage(viewer, pdf, pageNumber++, function pageRenderingComplete() {
      if (pageNumber > pdf.numPages) {
        return; // All pages rendered
      }
      // Continue rendering of the next page
      renderPage(viewer, pdf, pageNumber++, pageRenderingComplete);
    });
  });

  function renderPage(div, pdf, pageNumber, callback) {
    pdf.getPage(pageNumber).then(function(page) {
      var naturalWidth = page.getViewport(1).width;
      var newWidth = div.offsetWidth - 40;

      var scale = newWidth / naturalWidth;
      var viewport = page.getViewport(scale);

      var pageDisplayWidth = viewport.width;
      var pageDisplayHeight = viewport.height;

      var pageDivHolder = document.createElement('div');
      pageDivHolder.className = 'pdfpage';
      pageDivHolder.style.width = pageDisplayWidth + 'px';
      pageDivHolder.style.height = pageDisplayHeight + 'px';
      div.appendChild(pageDivHolder);

      // Prepare canvas using PDF page dimensions
      var canvas = document.createElement('canvas');
      var context = canvas.getContext('2d');
      canvas.width = pageDisplayWidth;
      canvas.height = pageDisplayHeight;
      pageDivHolder.appendChild(canvas);

      // Render PDF page into canvas context
      var renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      page.render(renderContext).promise.then(callback);

      // Prepare and populate form elements layer
      //var formDiv = document.createElement('div');
      //pageDivHolder.appendChild(formDiv);

      //setupForm(formDiv, page, viewport);
    });
  }

  // Configura o escopo que será acessado pela modal.
  $scope.modal = {
    title : title,
    purchaseOrder : purchaseOrder
  };

  $scope.ok = function () {
    $modalInstance.close(purchaseOrder);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};

var ReportPurchaseOrderModalCtrl2 = function ($scope, $modalInstance, $log, title, purchaseOrder) {
  $scope.ok = function () {
    $modalInstance.close(purchaseOrder);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};

angular.module('altamiraUiApp')
  .controller('PurchaseorderCtrl', function ($scope, $modal, $log, PurchaseOrder) {

    PurchaseOrder.getAll().then(function (purchaseOrders) {
      $scope.purchaseOrders = purchaseOrders;
    });

    $scope.editPurchaseOrder = function(purchaseOrder) {
      var title = 'Pedido de Compra';

      var modalInstance = $modal.open({
        templateUrl: 'purchaseOrderModal.html',
        controller: PurchaseOrderModalCtrl,
        resolve: {
          title : function () {
            return title;
          },
          purchaseOrder : function () {
            return angular.copy(purchaseOrder); // A edição será realizada sempre em cima de uma cópia.
          }
        }
      });

      modalInstance.result.then(function (purchaseOrder) {
        $log.info('Pedido após edição: ' + JSON.stringify(purchaseOrder));
      });
    };

    $scope.reportPurchaseOrder = function(purchaseOrder) {
      var title = 'Relatório de Pedido de Compra';

      var modalInstance = $modal.open({
        templateUrl: 'reportPurchaseOrderModal.html',
        controller: ReportPurchaseOrderModalCtrl,
        resolve: {
          title : function () {
            return title;
          },
          purchaseOrder : function () {
            return angular.copy(purchaseOrder); // A edição será realizada sempre em cima de uma cópia.
          }
        }
      });

      modalInstance.result.then(function (purchaseOrder) {
        $log.info('Pedido após edição: ' + JSON.stringify(purchaseOrder));
      });
    };

    $scope.reportPurchaseOrder2 = function(purchaseOrder) {
      var title = 'Relatório de Pedido de Compra';

      var modalInstance = $modal.open({
        templateUrl: 'reportPurchaseOrderModal2.html',
        controller: ReportPurchaseOrderModalCtrl2,
        resolve: {
          title : function () {
            return title;
          },
          purchaseOrder : function () {
            return angular.copy(purchaseOrder); // A edição será realizada sempre em cima de uma cópia.
          }
        }
      });

      modalInstance.result.then(function (purchaseOrder) {
        $log.info('Pedido após edição: ' + JSON.stringify(purchaseOrder));
      });
    };
  });
