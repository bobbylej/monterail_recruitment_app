WebModule.controller('AuthController', ['$scope', '$rootScope', '$http', '$sessionStorage', function($scope, $rootScope, $http, $sessionStorage) {

	OAuth.initialize(OAUTH_KEY);
	$rootScope.user = $sessionStorage.user;

	setTimeout(
		() => {
			if(!$rootScope.user) {
				$('#navbar .user-navbar').addClass('show');
				$('#modal-blanket').fadeIn();
			}
		}, 1000
	)


	$scope.loginLocal = function () {
    $http.post('/user/login', {
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
				$scope.errorLogin = 'Ivalid login or password';
				return;
      }

			$scope.errorLogin = 'Error';
			return;
    })
  };

	$scope.loginFacebook = function() {
		OAuth.popup('facebook')
	    .done(function(result) {
				result.me()
			    .done(function (response) {
						var dataUser = {
							uid: response.id,
							name: response.name,
							avatar: response.avatar,
							provider: 'facebook'
						};

						$http.post('/user/loginFacebook', {
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

							$scope.errorLogin = 'Error';
							return;
						})
			    })
			    .fail(function (err) {
			        //handle error with err
			    });
	    })
	    .fail(function (err) {
	      $scope.errorLogin = err;
		});
	}

	$scope.logout = function() {
		if($sessionStorage.user) {
			$http.post(`/user/logout`, {
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
				$scope.errorSignup = 'That login has already been taken, please try again.';
			}
			else if (response.status == 500) {
				$scope.errorSignup = response.data.originalError;
				return;
			}

		})
	}

}]);
