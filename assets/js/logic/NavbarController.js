WebModule.controller('NavbarController', ['$scope', '$rootScope', '$http', '$sessionStorage', 'questionService', 'dateService',
  function($scope, $rootScope, $http, $sessionStorage, questionService, dateService) {

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
    console.log(question);
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
          $('#navbar .user-navbar').addClass('show');
          $('#modal-blanket').fadeIn();
        }
        break;
      case 'question':
    		window.location = `/#/question`;
        break;
    }
  }

  $scope.openQuestionModal = () => {
    $('#modal-question').addClass('show');
    $('#modal-blanket').fadeIn();
  }

  $scope.closeModal = () => {
    $('#modal-question').removeClass('show');
    $('#modal-blanket').fadeOut();
  }

	$scope.timeDifference = () => {
    if($rootScope.question) {
      let date = $rootScope.question.updatedAt;
      $scope.$apply(() => {
        $scope.lastTime = dateService.dateDifference(new Date(), new Date(date));
      })
    }
    setTimeout(() => {
      $scope.timeDifference();
    }, 3000);
	}

  $scope.timeDifference();

  $scope.$on('$includeContentLoaded', function(event) {
    $('input[type="radio"]').each(function() {
      $(this).radio();
    });
	});

  /*
  $('#navbar-arrow-back').click(() => {
    $('#navbar .user-navbar').addClass('show');
    $('#modal-blanket').fadeIn();
  })
  */

  //questionService.generateQuestions();
  //questionService.destroyAll();

}]);
