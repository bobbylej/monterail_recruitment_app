WebModule.controller('NavbarController', ['$scope', '$rootScope', '$http', '$sessionStorage', 'questionService', 'dateService',
  function($scope, $rootScope, $http, $sessionStorage, questionService, dateService) {

  timeDifference();

  $scope.changeQuestionsType = (type) => {
    $rootScope.type = type;
    $rootScope.skip = 0;
    questionService.searchQuestions({
			search: $rootScope.search,
			sort: $rootScope.sort,
			type: $rootScope.type,
			limit: $rootScope.limit,
			skip: $rootScope.skip,
			user: $sessionStorage.user
  		}, false, (err, questions) => {
  		$rootScope.questions = questions;
			$rootScope.skip += $rootScope.limit;
  	});
    questionService.countAllQuestions({
      search: $rootScope.search,
			type: $rootScope.type,
			user: $sessionStorage.user
    }, (err, data) => {
  		$rootScope.questionsAmount = data.amount;
  	});
  }

  $scope.changeQuestionsSort = (sort) => {
    $rootScope.sort = sort;
    questionService.searchQuestions({
			search: $rootScope.search,
			sort: $rootScope.sort,
			type: $rootScope.type,
			limit: $rootScope.limit,
			skip: $rootScope.skip,
			user: $sessionStorage.user
		}, true, (err, questions) => {
  		$rootScope.questions = questions;
  	});
  }

  $scope.changeSearch = (search) => {
    $rootScope.search = search;
    $rootScope.skip = 0;
    questionService.searchQuestions({
			search: $rootScope.search,
			sort: $rootScope.sort,
			type: $rootScope.type,
			limit: $rootScope.limit,
			skip: $rootScope.skip,
			user: $sessionStorage.user
		}, false, (err, questions) => {
  		$rootScope.questions = questions;
			$rootScope.skip += $rootScope.limit;
  	});
    questionService.countAllQuestions((err, data) => {
  		$rootScope.questionsAmount = data.amount;
  	});
  }

	$scope.createQuestion = (question) => {
    $scope.closeModal();
		questionService.createQuestion({
			name: question.name,
			content: question.content,
			user: $sessionStorage.user.name
		})
	}

  $scope.backClick = () => {
    switch($rootScope.view) {
      case 'questions':
        if($rootScope.user) {
          $rootScope.openUserModal($rootScope.user);
        }
        else {
          $scope.openLoginModal();
        }
        break;
      case 'question':
    		window.location = `/#/question`;
        break;
    }
  }

  $scope.openQuestionModal = () => {
    if($sessionStorage.user) {
      $('#modal-question').addClass('show');
      $('#modal-blanket').fadeIn();
    }
    else {
      $scope.openLoginModal();
    }
  }

  $scope.closeModal = () => {
    $('#modal-question').removeClass('show');
    $('#modal-blanket').fadeOut();
  }

  $scope.openLoginModal = () => {
    $('#navbar .user-navbar').addClass('show');
    $('#modal-blanket').fadeIn();
  }

	function timeDifference() {
    if($rootScope.question) {
      let date = $rootScope.question.updatedAt;
      $scope.$apply(() => {
        $scope.lastTime = dateService.dateDifference(new Date(), new Date(date));
      })
    }
    setTimeout(() => {
      timeDifference();
    }, 3000);
	}

  $scope.$on('$includeContentLoaded', function(event) {
    $('input[type="radio"]').each(function() {
      $(this).radio();
    });
	});

}]);
