WebModule.controller('UserController', ['$scope', '$rootScope', '$http', '$sessionStorage', 'userService', 'dateService', 'questionService',
	function($scope, $rootScope, $http, $sessionStorage, userService, dateService, questionService) {

	$rootScope.defaultAvatar = DEFAULT_AVATAR;

	$rootScope.openUserModal = (user) => {
    userService.openUserModal(user);
		userService.getUsersInSamePeriod($rootScope.userModal, (err, users) => {
			$rootScope.userModal.usersInPeriod = users;
		})
		userService.getUserQuestions(user, (err, questions) => {
			let info = {
				peers: [],
				discussion: 0,
				findings: 0,
				questions: questions.length,

			}
			questions.forEach((question) => {
				question.info = questionService.countQuestionInfo(question);
				question.info.peers.forEach((peer) => {
					if(info.peers.indexOf(peer) === -1) {
	          info.peers.push(peer);
	        }
				});
				info.discussion += question.info.discussion;
				if(info.discussion > 0) {
					info.findings++;
				}
			})
			$rootScope.userModal.info = info;
			$rootScope.userModal.questions = questions;
			$rootScope.userModal.hottestAnswer = questionService.getTheHottestAnswer(questions);
			$rootScope.userModal.activityLevel = userService.countActivity($rootScope.userModal);
		})
  }

	$scope.closeModal = () => {
		userService.closeUserModal();
	}

	$scope.logout = function() {
		if($sessionStorage.user) {
			$http.put(`/user/logout`, {
				name: $sessionStorage.user.name
			});
		}
		delete $sessionStorage.user;
		$rootScope.user = undefined;
		$scope.closeModal();
	}

	$scope.dateDifference = (date) => {
		return dateService.dateDifference(new Date(), new Date(date));
	}

	$scope.voteDiff = (object) => {
		if(object && object.votes) {
			return object.votes.upvotes.length - object.votes.downvotes.length;
		}
		return 0;
	}

}]);
