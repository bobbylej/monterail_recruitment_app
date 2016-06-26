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

	function addQuestion(question) {
		if($rootScope.type === 'all' || $rootScope.type === 'my' && $rootScope.user.name === question.name) {
			if($rootScope.sort === 'recent') {
				$rootScope.questions.unshift(question);
			}
			else if($rootScope.sort === 'hot') {
				if($rootScope.questions[$rootScope.questions.length-1].hot >= question.hot) {
					// don't add
				}
				else if($rootScope.questions[0].hot <= question.hot) {
					$rootScope.questions.unshift(question);
				}
				else {
					for(let i=1; i<$rootScope.questions.length-1; i++) {
						if($rootScope.questions[i].hot <= question.hot) {
							$rootScope.questions.splice(i, 0, question);
							break;
						}
					}
				}
			}
		}
	}

	function addAnswerQuestion(answer) {
		$rootScope.questions.forEach((question) => {
			if(question.id === answer.question) {
				if(!question.answers) question.answers = [];
				question.answers.push(answer);
				return;
			}
		})
	}

	function addCommentQuestion(comment) {
		$rootScope.questions.forEach((question) => {
			question.answers.forEach((answer) => {
				if(answer.id === comment.answer) {
					if(!answer.comments) answer.comments = [];
					answer.comments.push(answer);
					return;
				}
			})
		})
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
		let question = questionService.getQuestion(data.question.id, (err, question) => {
			addQuestion(question);
		});
	});
	channel.bind('answer', function(data) {
		let answer = data.answer;
		addAnswerQuestion(answer);
	});
	channel.bind('comment', function(data) {
		let comment = data.comment;
		addCommentQuestion(comment);
	});

	$scope.$on('$routeChangeStart', function(next, current) {
		pusher.unsubscribe(`questions`);
	});

}]);
