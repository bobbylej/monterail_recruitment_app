WebModule.controller('QuestionsController', ['$scope', '$rootScope', '$http', '$sessionStorage', 'questionService',
	function($scope, $rootScope, $http, $sessionStorage, questionService) {

	$rootScope.navbarUrl = '/templates/navbar/navbar-questions.html';
	$rootScope.view = 'questions';
	$('body').removeClass('question-single').addClass('question-list');

	$rootScope.sort = 'recent';
	$rootScope.type = 'all';
	$rootScope.limit = 3;
	$rootScope.skip = 0;

	$scope.activitiesSize = getActivitiesSize();

	questionService.countAllQuestions({
		search: $rootScope.search,
		type: $rootScope.type,
		user: $sessionStorage.user
	},(err, data) => {
		$rootScope.questionsAmount = data.amount;
	});

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

	$scope.openQuestion = (question) => {
		$rootScope.question = question;
		console.log($rootScope.question);
		window.location = `/#/question/${question.id}`;
	}

	$scope.loadMore = () => {
		questionService.searchQuestions({
			search: $rootScope.search,
			sort: $rootScope.sort,
			type: $rootScope.type,
			limit: $rootScope.limit,
			skip: $rootScope.skip,
			user: $sessionStorage.user
		}, false, (err, questions) => {
			console.log(questions, $rootScope.skip);
			$rootScope.questions = $rootScope.questions.concat(questions);
			$rootScope.skip += $rootScope.limit;
		});
	}

	$scope.getActivities = (question, max) => {
		let list = [];
		let more = 0;
		let iterator = max;
		if(question.answers && question.answers.length) {
			question.answers.forEach((answer) => {
				more++;
				if(iterator > 0) {
					answer.type = "answer";
					list.push(answer)
					iterator--;
				}
			})
			question.answers.forEach((answer) => {
				if(answer.comments && answer.comments.length) {
					answer.comments.forEach((comment) => {
						more++;
						if(iterator > 0) {
							comment.type = "comment";
							list.push(comment)
							iterator--;
						}
					})
				}
			})
		}
		more -= list.length;
		return {
			list,
			more
		}
	}

	function getActivitiesSize() {
		let width = $(window).width();
		let size = 4;
		if(width >= 800) {
			size = 4;
		}
		else if(width >= 675 && width < 800) {
			size = 3;
		}
		else if(width >= 600 && width < 675) {
			size = 2;
		}
		else {
			size = 1;
		}
		return size;
	}

	$(window).resize(() => {
		$scope.$apply(() => {
      $scope.activitiesSize = getActivitiesSize();
    })
	})

	var channel = pusher.subscribe('questions');
	channel.bind('create', function(data) {
		if($rootScope === 'recent') {
			$rootScope.questions.unshift(data.question);
		}
	});

	$scope.$on('$routeChangeStart', function(next, current) {
		pusher.unsubscribe(`questions`);
	});

}]);
