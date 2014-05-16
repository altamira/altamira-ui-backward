'use strict';

describe('Filter: lamination', function () {

  // load the filter's module
  beforeEach(module('altamiraUiApp'));

  // initialize a new instance of the filter before each test
  var lamination;
  beforeEach(inject(function ($filter) {
    lamination = $filter('lamination');
  }));

  it('should return the input prefixed with "lamination filter:"', function () {
    var text = 'angularjs';
    expect(lamination(text)).toBe('lamination filter: ' + text);
  });

});
