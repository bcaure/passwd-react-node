/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
/*global angular */

function MainController($http) {

	'use strict';
	var vm = this;
	vm.isConnected = false; // used to show login form
	vm.isCreating = false; // used to show creation form
	
	// READ
	function show() {
		$http.defaults.headers.common = {'user': vm.formData.user, 'password': vm.formData.password};
		$http.get('/passwd/PasswdRest.php/passwords')
			.success(function (data) {
				console.log("Connection OK");
				data.forEach(function (p) {
					if ((p.url.length <= 7 || p.url.substring(0, 7) !== 'http://') &&
							(p.url.length <= 8 || p.url.substring(0, 8) !== 'https://') &&
							(p.url.length <= 2 || p.url.substring(0, 2) !== '//')) {
						p.url = 'https://' + p.url;
					}
				});
				vm.passwords = data;
				vm.isConnected = true;
			})
			.error(function (data) {
				vm.errorMsg = data;
				console.log(data);
			});
	}

	// CREATE
	function toggleCreate() {
		vm.isCreating = !vm.isCreating;
	}
	function create() {
		$http.defaults.headers.common = {'user': vm.formData.user, 'password': vm.formData.password};
		$http.post('/passwd/PasswdRest.php/passwords', vm.newPassword)
			.success(function (data) {
				console.log(data);
				var clone = vm.newPassword.constructor(), attr;
				for (attr in vm.newPassword) {
					if (vm.newPassword.hasOwnProperty(attr)) {
						clone[attr] = vm.newPassword[attr];
						vm.newPassword[attr] = null;
					}
				}
				vm.passwords.splice(0, 0, clone);
				vm.isCreating = false;
			})
			.error(function (data) {
				console.log('Error: ' + data);
				vm.errorMsg = data;
			});
	}

	// UPDATE
	function update(p) {
		$http.defaults.headers.put = {'user': vm.formData.user, 'password': vm.formData.password};
		$http.put('/passwd/PasswdRest.php/passwords/' + encodeURIComponent(p.label), p)
			.success(function (data) {
				console.log(data);
				p.url = data.url;
				p.login = data.login;
				p.password = data.password;
				p.isEditing = false;
			})
			.error(function (data) {
				vm.errorMsg = data;
				console.log('Error: ' + data);
			});
	}
	
	// toggle on edit flag on input, reset all other rows edit flag
	function toggleEdit(password) {
		var savedFlag = password.isEditing;
		vm.passwords.forEach(function (p) {
			p.isEditing = false;
		});
		password.isEditing = !savedFlag;
	}

	// DELETE
	function deleteRow(p) {
		$http.defaults.headers.common = {'user': vm.formData.user, 'password': vm.formData.password};
		// Dont use $http.delete because JSLint call it a "reserved word"
		$http['delete']('/passwd/PasswdRest.php/passwords/' + encodeURIComponent(p.label), '')
			.success(function (data) {
				var i;
				for (i = 0; i < vm.passwords.length; i++) {
					if (vm.passwords[i].label === p.label) {
						break;
					}
				}
				vm.passwords.splice(i, 1);
			})
			.error(function (data) {
				vm.errorMsg = data;
				console.log('Error: ' + data);
			});
	}

	// BINDINGS
	vm.show = show;
	vm.toggleCreate = toggleCreate;
	vm.create = create;
	vm.update = update;
	vm.toggleEdit = toggleEdit;
	vm.deleteRow = deleteRow;
	
}

(function () {
    'use strict';
    angular.module('passwd', []).controller('MainController', MainController);
}());