(function () {
    'use strict';

    var mod = angular.module('ns-scientific-number', []);

    mod.filter('scientificFilter', function () {

        return function (input, digits, displayZero, displayZeroAs) {
            //console.log(digits);
            var defaultDigits = 2;
            digits = (digits === undefined) ? defaultDigits : digits;
            if (isNumeric(input)) {
                displayZero = (displayZero === undefined) ? true : (displayZero == 'true');
                var nr = Number(input);
                if (nr === 0) {
                    if (displayZeroAs !== undefined) {
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

    mod.directive('scientificNumber', function () {

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

    mod.directive("scientificNumberNoZero", function () {
        var directive = {
            restrict: 'A',
            scope: {
                scientificNumber: '@scientificNumberNoZero',
                digits: '@',
            },
            controller: function () {
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

    mod.directive("scientificInput", function () {
        // <input type="text" ng-model="vm.scientificNumber" scientific-input>

        return {
            require: 'ngModel',
            link: function (scope, element, attrs, ngModelController) {
                ngModelController.$parsers.push(function (data) {
                    //convert data from view format to model format
                    return Number(data).toExponential(); //converted
                });

                ngModelController.$formatters.push(function (data) {
                    //convert data from model format to view format
                    return Number(data).toExponential(); //converted
                });
            }
        };
    });

    mod.directive("scientificNumberInput", function () {
        var directive = {
            restrict: 'EA',
            scope: {
                data: '=ngModel',
            },
            controller: function ($scope) {
                var vm = this;

                function init() {
                    $scope.$watch(
                        function watchFoo(scope) {
                            // Return the "result" of the watch expression.
                            return ( vm.data );
                        },
                        function (newValue, oldValue) {
                            var value = Number(newValue).toExponential();
                            //console.log('changed! ' + newValue + ' -> ' +value);
                            if (vm.data !== value) {
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
    mod.directive('nsScientificInput', ['$filter', '$locale', 'nsScientificInputConfig', function ($filter, $locale, nsScientificInputConfig) {
        return {
            restrict: 'A',
            require: 'ngModel',
            scope: {
                digits: '@',
            },
            link: function (scope, element, attrs, ngModel) {
                if (attrs.ngScientificInput === 'false') return;

                var globalOptions = nsScientificInputConfig.options;

                // apply cfg
                var config = {
                    digits: globalOptions.digits,
                    extendDigitsAllowed: globalOptions.extendDigitsAllowed,
                    restoreOriginalValueOnFocus: globalOptions.restoreOriginalValueOnFocus,
                };

                var expDigits = config.digits;

                function convertToExponential(number) {
                    if (expDigits) {
                        return Number(number).toExponential(expDigits);
                    } else {
                        return Number(number).toExponential();
                    }
                }

                function convertToExponentialRaw(number) {
                    // return with as many digits as needed to be exact
                    return Number(number).toExponential();
                }

                if (config.restoreOriginalValueOnFocus) {
                    // use like this to restore original entered value
                    element.on("focus", function () {
                        element.val(ngModel.$$rawModelValue);
                    });
                }

                element.on("blur", function () {
                    ngModel.$commitViewValue();
                    reformatViewValue();
                });

                function isNumber(n) {
                    return !isNaN(parseFloat(n)) && isFinite(n);
                }

                function getNumberPrecision(a) {
                    a = (a.toLowerCase() + "").split("e")[0]; // remove e+10 part from end
                    var precision = (Number(a) + "").split(".")[1].length;
                    return precision;

                    /*
                     // supposedly faster, but need some work to accept e-numbers (crashes!)
                     if(!isNumber(a)) {
                     return 0;
                     }
                     var e = 1;
                     while (Math.round(a * e) / e !== a) e *= 10;
                     return Math.log(e) / Math.LN10;
                     */
                }

                function reformatViewValue() {
                    var viewValue = ngModel.$$rawModelValue;

                    if (viewValue && viewValue !== '' && isNumber(viewValue)) {
                        if (expDigits && config.extendDigitsAllowed) {

                            // check if expDigits has to be changed
                            var newViewValue = convertToExponential(viewValue);
                            var newViewValueRaw = convertToExponentialRaw(viewValue);
                            var precisionRaw = getNumberPrecision(newViewValueRaw);

                            if (expDigits && !config.restoreOriginalValueOnFocus) {
                                if (precisionRaw > expDigits) {
                                    expDigits = precisionRaw;
                                } else {
                                    setExpDigits(); // reload from config/attribute
                                }
                                newViewValue = convertToExponential(viewValue);
                            }

                            viewValue = newViewValue;
                            //element.val(viewValue); // works! keeps internally the unchanged value, formats the output!

                        } else {
                            // just format it
                            var newValue = convertToExponential(viewValue);
                            viewValue = newValue;
                        }
                    }
                    if (config.restoreOriginalValueOnFocus) {
                        element.val(viewValue); // works! keeps internally the unchanged value, formats the output!
                    } else {
                        ngModel.$setViewValue(viewValue);
                        ngModel.$render();
                    }
                }

                ngModel.$parsers.push(function (viewValue) {
                    if (viewValue) {
                        var retval = Number(viewValue);
                        if (isNumber(retval)) {
                            return retval;
                        } else {
                            return viewValue;
                        }
                    } else {
                        return viewValue;
                    }

                });

                ngModel.$formatters.unshift(function (value) {
                    if (value) {
                        return convertToExponential(value);
                    } else {
                        return value;
                    }
                });

                function setExpDigits() {
                    if (config.digits) {
                        expDigits = config.digits;
                    }

                    if (scope.digits) {
                        expDigits = Number(scope.digits);
                        if (!isNumber(expDigits)) {
                            expDigits = undefined;
                        }
                    }
                }

                function init() {
                    setExpDigits();
                }

                init();
            }
        }
    }]);

    mod.provider("nsScientificInputConfig", function () {
        this.options = {
            digits: undefined,
            extendDigitsAllowed: true,
            restoreOriginalValueOnFocus: false,
            someOtherThing: 'testing',
        };

        this.setOptions = function (options) {
            if (!angular.isObject(options)) {
                throw new Error("Options should be an object!");
            }
            this.options = angular.extend({}, this.options, options);
        };

        this.$get = function () {
            return {
                options: this.options
            };
        };
    });

    // usage in app.js:
    // app.config(['nsScientificInputConfigProvider', function(nsScientificInputConfigProvider) {
    //    nsScientificInputConfigProvider.setOptions({
    //        digits: 3,
    //        extendDigitsAllowed: true,
    //        restoreOriginalValueOnFocus: false,
    //    });
    // }]);

    // ws edit & push/pull test
    
})();
