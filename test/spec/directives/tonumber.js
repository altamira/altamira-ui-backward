'use strict';

describe('Directive: toNumber', function () {

  // load the directive's module
  beforeEach(module('altamiraUiApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<to-number></to-number>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the toNumber directive');
  }));
});
