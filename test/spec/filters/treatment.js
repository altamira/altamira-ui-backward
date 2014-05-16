'use strict';

describe('Filter: treatment', function () {

  // load the filter's module
  beforeEach(module('altamiraUiApp'));

  // initialize a new instance of the filter before each test
  var treatment;
  beforeEach(inject(function ($filter) {
    treatment = $filter('treatment');
  }));

  it('should return the input prefixed with "treatment filter:"', function () {
    var text = 'angularjs';
    expect(treatment(text)).toBe('treatment filter: ' + text);
  });

});
