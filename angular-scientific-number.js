(function() {
  'use strict';
  
  var app = angular.module('ngScientificNumber', []);

  app.filter('scientificFilter', function() {

    return function(input, digits, displayZero, displayZeroAs) {
      //console.log(digits);
      var defaultDigits = 2;
      digits = (digits === undefined) ? defaultDigits : digits;
      if (isNumeric(input)) {
        displayZero = (displayZero === undefined) ? true : (displayZero == 'true');
        var nr = Number(input);
        if (nr === 0) {
          if (displayZeroAs !== undefined ) {
            return displayZeroAs;
          }
          if (displayZero) {
            return Number(input).toExponential(digits);
          } else {
            return '';
          }
        }
        //digits = (digits == '') ? undefined : digits;
        return Number(input).toExponential(digits);
      } else {
        return input;
      }

      function isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
      }
    }
  });

  app.directive('scientificNumber', function() {

    return {
      restrict: 'A',
      scope: {
        scientificNumber: '@',
        digits: '@',
        displayZero: '@',
        displayZeroAs: '@',
      },
      controller: DirectiveController,
      controllerAs: 'vm',
      bindToController: true, //required in 1.3+ with controllerAs
      //templateUrl: 'angular-scientific-number.html',
	  template: '<span title="{{vm.scientificNumber | scientificFilter:vm.titleDigits:true}}">{{ vm.scientificNumber | scientificFilter:vm.digits:vm.displayZero:vm.displayZeroAs }}</span>',
    };

  });

  //DirectiveController.$inject = ['$scope'];

  function DirectiveController() {
    var defaultDigits = 2;
    var titleExtraDigits = 3;
    var displayZeroDefault = true;
    var displayZeroAsDefault = '-';

    var vm = this;
    vm.titleDigits = Number(((vm.digits === undefined) ? defaultDigits : vm.digits)) + titleExtraDigits;
    //vm.digits = (vm._digits === undefined) ? defaultDigits : vm._digits;
    //vm.displayZeroAs = (vm._displayZeroAs === undefined) ? displayZeroAsDefault : vm._displayZeroAs;
    //vm.displayZero = (vm._displayZero === undefined) ? displayZeroDefault : vm._displayZero;
    //vm.originalNumber = vm._number;

    function init() {
      //console.log(vm);

      /*
      if(vm._displayZeroAs !== undefined){
        vm.displayZero = false;
      }
      */
      /*
      console.log(vm._number);
      if (Number(vm._number) === 0 && (!vm.displayZero || vm.displayZero == 'false')) {
        console.log('bla');
        vm.number = vm.displayZeroAs;
      } else {
        vm.number = vm._number;
      }
      */
    }

    init();
  }
  
  app.directive("scientificNumberNoZero", function() {
    var directive = {
      restrict: 'A',
      scope: {
        scientificNumber: '@scientificNumberNoZero',
        digits: '@',
      },
      controller: function() {
        var defaultDigits = 2;
        var titleExtraDigits = 3;
        var vm = this;
        vm.displayZero = 'false';
        vm.displayZeroAs = '';
        vm.titleDigits = Number(((vm.digits === undefined) ? defaultDigits : vm.digits)) + titleExtraDigits;
      },
      controllerAs: 'vm',
      bindToController: true, //required in 1.3+ with controllerAs
      templateUrl: 'scientificNumber.html',
    };
    
    return directive;
  });

  app.directive("scientificInput", function() {
    // <input type="text" ng-model="vm.scientificNumber" scientific-input>

    return {
      require: 'ngModel',
      link: function(scope, element, attrs, ngModelController) {
        ngModelController.$parsers.push(function(data) {
          //convert data from view format to model format
          return Number(data).toExponential(); //converted
        });

        ngModelController.$formatters.push(function(data) {
          //convert data from model format to view format
          return Number(data).toExponential(); //converted
        });
      }
    };
  });
  
  app.directive("scientificNumberInput", function() {
    var directive = {           
      restrict: 'EA',
      scope: {
        data: '=ngModel',
      },
      controller: function($scope) {
        var vm = this;
        
        function init() {
          $scope.$watch(
            function watchFoo(scope) {
              // Return the "result" of the watch expression.
              return( vm.data );
            }, 
            function(newValue, oldValue) {
              var value = Number(newValue).toExponential();
              //console.log('changed! ' + newValue + ' -> ' +value);
              if(vm.data !== value) {
                vm.data = value;
              }
              // angular copy will preserve the reference of $scope.someVar
              // so it will not trigger another digest 
			  // angular.copy(value, vm.data);
            }
          );
        }
        
        init();
      },
      controllerAs: 'vm',
      bindToController: true, //required in 1.3+ with controllerAs
      
      //template: '<input type="text" ng-model="vm.data" ng-blur="vm.onBlur(vm.data)">',
      template: '<input type="text" ng-model="vm.data" ng-model-options="{ updateOn: \'blur\' }">',
    };
    
    return directive;
  });
  
  //---------------------------------------------------------------------------
  // ns-scientific-input
  //---------------------------------------------------------------------------
  app.directive('nsScientificInput', [/*'$filter', '$locale',*/ function(/*$filter, $locale*/) {
	// inspired by https://github.com/aguirrel/ng-currency	  
    return {
      restrict: 'A',
      require: 'ngModel',
      scope: false,
      link: function(scope, element, attrs, ngModel) {
        if (attrs.ngScientificInput === 'false') return;      
        
        function convertToExponential(number) {
          return Number(number).toExponential();
        }
      
        element.on("blur", function() {
          ngModel.$commitViewValue();
          reformatViewValue();
        });
		
		function isNumber(n) {
			return !isNaN(parseFloat(n)) && isFinite(n);
        }
        
        function reformatViewValue() {          
          var viewValue = ngModel.$$rawModelValue;        
          if(viewValue && viewValue !== '' && isNumber(viewValue)) {
            viewValue = convertToExponential(viewValue);
          } 
          ngModel.$setViewValue(viewValue);
          ngModel.$render();
        }
        
        ngModel.$parsers.push(function(viewValue) {
          if(viewValue) {
			var retval = Number(viewValue);
            if(isNumber(retval)) {
            	return retval;
            } else {
            	return viewValue;
			}
          } else {
            return viewValue;
          }          
        });
        
        ngModel.$formatters.unshift(function(value) {        
          if(value) {
            return convertToExponential(value);
          } else {
            return value;
          }
        });
                
      }
    }
  }]);

})();
