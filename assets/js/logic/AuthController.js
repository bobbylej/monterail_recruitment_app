WebModule.controller('AuthController', ['$scope', '$rootScope', '$http', '$sessionStorage', function($scope, $rootScope, $http, $sessionStorage) {

	OAuth.initialize(OAUTH_KEY);
	$rootScope.user = $sessionStorage.user;

	if(!$scope.user) {
		$('#navbar .user-navbar').addClass('show');
		$('#modal-blanket').fadeIn();
	}

	$scope.loginLocal = function () {
    $http.put('/user/login', {
			name: $scope.loginForm.name,
			password: $scope.loginForm.password
		})
    .then((response) => {
			$sessionStorage.user = response.data;
			$rootScope.user = response.data;
			$rootScope.openUserModal(response.data);
    })
    .catch((response) => {
      if (response.status === 400 || 404) {
				$scope.error = 'Ivalid login or password';
				return;
      }

			$scope.error = 'Error';
			return;
    })
  };

	$scope.loginFacebook = function() {
		OAuth.popup('facebook')
	    .done(function(result) {
				result.me()
			    .done(function (response) {
						console.log(response);
						var dataUser = {
							uid: response.id,
							name: response.name,
							avatar: response.avatar,
							provider: 'facebook'
						};

						$http.put('/user/loginFacebook', {
							uid: dataUser.uid
						})
						.then(function onSuccess(response) {
							$sessionStorage.user = response.data;
							$rootScope.user = response.data;
							$rootScope.openUserModal(response.data);
						})
						.catch(function onError(response) {
							if (response.status === 400 || 404) {
								$http.post('/user/create', dataUser)
								.then(function onSuccess(response) {
									$sessionStorage.user = response.data;
									$rootScope.user = response.data;
									$rootScope.openUserModal(response.data);
								})
								return;
							}

							$scope.error = 'Error';
							return;
						})
			    })
			    .fail(function (err) {
			        //handle error with err
			    });
	    })
	    .fail(function (err) {
	      $scope.error = err;
		});
	}

	$scope.logout = function() {
		if($sessionStorage.user) {
			$http.put(`/user/logout`, {
				name: $sessionStorage.user.name
			});
		}
		delete $sessionStorage.user;
		$rootScope.user = undefined;
	}

	$scope.signup = function() {
		$http.post('/user/create', {
			name: $scope.signupForm.name,
			password: $scope.signupForm.password,
		})
		.then(function onSuccess(response) {
			$sessionStorage.user = response.data;
			$rootScope.user = response.data;
			$rootScope.openUserModal(response.data);
		})
		.catch(function onError(response) {
			if (response.status == 409) {
				$scope.error = 'That login has already been taken, please try again.';
			}
			else if (response.status == 500) {
				$scope.error = response.data.originalError;
				return;
			}

		})
	}

}]);
