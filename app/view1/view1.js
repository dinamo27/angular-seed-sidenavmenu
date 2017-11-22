'use strict';

angular.module('myApp.view1', ['ngRoute'])
	.directive('myEnter', function () {
		return function (scope, element, attrs) {
			element.bind("keydown keypress", function (event) {
				if (event.which === 13) {
					scope.$apply(function () {
						scope.$eval(attrs.myEnter);
					});

					event.preventDefault();
				}
			});
		};
	})
	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.when('/view1', {
			templateUrl: 'view1/view1.html',
			controller: 'View1Ctrl'
		});
	}])

	.controller('View1Ctrl', ['$scope', '$timeout', '$http', '$mdSidenav', '$mdDialog', 'prop', function ($scope, $timeout, $http, $mdSidenav, $mdDialog, prop) {
		'use strict';
		let propertiesFile = {};
		prop.getData().then(function (response) {
			propertiesFile = response.data;
		});

		$scope.imagePath = 'img/msc_cruises.gif';
		$scope.selected = [];
		$scope.limitOptions = [5, 10, 15];
		$scope.labelClientInfo = 'Insert name or card or email';

		$scope.query = {
			order: 'cardnr',
			limit: 5,
			page: 1
		};

		$scope.submit = function (info) {
			$scope.loading = true;
			if ($scope.resultForm.$valid) {

				var req = {
					method: 'POST',
					crossDomain: true,
					dataType: 'jsonp',
					url: propertiesFile.test.quickSearchUrl,
					headers: {
						'Content-Type': 'application/json; charset=UTF-8'
					},
					data: {
						type: $scope.info.type,
						clientInfoSurname: $scope.info.clientInfoSurname,
						clientInfo: $scope.info.clientInfo
					}
				}

				$http(req).then(function (out) {
					$scope.loading = false;
					let size = out.data.length;
					if (size == 0) {
						$scope.cardResults = "noResults";
					}
					else {
						$scope.cardResults = "listResults";
						$scope.customers = out.data;
						$scope.totalCustomers = out.data.length;
					}
				}, function () {
					alert("Fail");
				});


			} else {
				alert('Form is invalid');
				$scope.loading = false;
			}
		}

		$scope.setValidationPattern = function () {
			$scope.minLenght = undefined;
			$scope.info.clientInfoSurname = undefined;
			$scope.info.clientInfo = undefined;
			$scope.resultForm.$setPristine();
			$scope.resultForm.$setUntouched();
			$scope.resultForm.$valid = true;
			$scope.resultForm.$invalid = false;
			$scope.resultForm.clientInfoSurname.$setPristine();
			$scope.resultForm.clientInfoSurname.$setUntouched();
			$scope.resultForm.clientInfoSurname.$valid = true;
			$scope.resultForm.clientInfoSurname.$invalid = false;
			$scope.resultForm.clientInfo.$setPristine();
			$scope.resultForm.clientInfo.$setUntouched();
			$scope.resultForm.clientInfo.$valid = true;
			$scope.resultForm.clientInfo.$invalid = false;

			if ($scope.info.type == 'card') {
				$scope.labelClientInfo = 'Card';
				$scope.validationPattern = /^\d+$/;
			} else if ($scope.info.type == 'email') {
				$scope.labelClientInfo = 'Email';
				$scope.validationPattern = /^.+@.+\..+$/;
			} else if ($scope.info.type == 'name') {
				$scope.labelClientInfo = 'Name';
				$scope.validationPattern = /^[a-zA-Z\s]*$/;
				$scope.minLenght = 3;
			}
		}

		$scope.tipoCardFunc = function (punti) {
			let tipoCard = "Welcom";
			if (punti >= 10000)
				tipoCard = "Black";
			else if (punti >= 4300)
				tipoCard = "Gold";
			else if (punti >= 2200)
				tipoCard = "Silver";
			else if (punti >= 1)
				tipoCard = "Classic";
			return tipoCard;
		}

		function DialogController($scope, $mdDialog, customer) {
			$scope.customer = customer;
			$scope.customer.bonusTotali = $scope.customer.bonus + $scope.customer.bonusRevenue;
			$scope.customer.anagrafica.completeAddress = $scope.customer.anagrafica.indirizzoRes +
				'(' +
				$scope.customer.anagrafica.zipCodeRes +
				')';
			$scope.queryCruise = {
				limit: 10,
				page: 1
			};

			$scope.limitOptions = [5, 10, 15];

			//call list crociere
			var req = {
				method: 'POST',
				crossDomain: true,
				dataType: 'jsonp',
				url: propertiesFile.test.listCrociereUrl,
				headers: {
					'Content-Type': 'application/json; charset=UTF-8'
				},
				data: {
					cardNr: $scope.customer.cardnr
				}
			}

			$http(req).then(function (out) {
				$scope.cardResults = "listResults";
				$scope.cruises = out.data;
				$scope.totalCruises = out.data.length;

			}, function () {
				alert("Fail");
			});

			$scope.hide = function () {
				$mdDialog.hide();
			};
			$scope.cancel = function () {
				$mdDialog.cancel();
			};
		}

		$scope.showTabDialog = function (ev, customer) {
			$mdDialog.show({
				controller: DialogController,
				templateUrl: propertiesFile.test.dialogUrl,
				parent: angular.element(document.body),
				locals: { customer: customer },
				targetEvent: ev,
				clickOutsideToClose: true
			})
				.then(function (answer) {
					console.log('then dialog');
				}, function () {
					console.log('You cancelled the dialog');
				});
		};

	}]);