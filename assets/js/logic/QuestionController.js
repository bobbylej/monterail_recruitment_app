WebModule.controller('QuestionController', ['$scope', '$rootScope', '$http', '$sessionStorage', '$routeParams', 'questionService', 'dateService',
	function($scope, $rootScope, $http, $sessionStorage, $routeParams, questionService, dateService) {

	$rootScope.navbarUrl = '/templates/navbar/navbar-question.html';
	$rootScope.view = 'question';
	$('body').removeClass('question-list').addClass('question-single');

	if(!$rootScope.question) {
	  questionService.getQuestion( $routeParams.id, (err, question) => {
			$rootScope.question = question;
		});
	}

	$scope.voteDiff = (object) => {
		if(object && object.votes) {
			return object.votes.upvotes.length - object.votes.downvotes.length;
		}
		return 0;
	}

	$scope.dateDiff = (date) => {
		if(date) {
			return dateService.inWords(dateService.dateDifference(new Date(), new Date(date)));
		}
	}

	$scope.wasUserVote = (object, objectName) => {
		return questionService.wasUserVote(object, objectName, $sessionStorage.user, (err, wasVote) => {
			return wasVote;
		});
	}

	$scope.voteQuestion = (vote) => {
		questionService.voteQuestion({
			question: $rootScope.question,
			user: $sessionStorage.user,
			value: vote
		});
	}

	$scope.voteAnswer = (answer, vote) => {
		questionService.voteAnswer({
			answer: answer,
			user: $sessionStorage.user,
			value: vote
		});
	}

	$scope.voteComment = (comment, vote) => {
		questionService.voteComment({
			comment: comment,
			user: $sessionStorage.user,
			value: vote
		});
	}

	$scope.createAnswer = (answer) => {
		questionService.createAnswer({
			question: $rootScope.question.id,
			content: answer.content,
			user: $sessionStorage.user.name
		})

		$('.give-answer').fadeIn();
		$('.form-slide.form-answer').slideUp();
	}

	$scope.createComment = (answer, comment) => {
		questionService.createComment({
			answer: answer.id,
			content: comment.content,
			user: $sessionStorage.user.name
		})

		$('.give-comment').fadeIn();
		$('.form-slide.form-comment').slideUp();
	}

	function addVoteQuestion(vote) {
		if($rootScope.question.id === vote.question) {
			if(vote.value === '+') {
				$rootScope.question.votes.upvotes.push(vote);
			}
			else if(vote.value === '-') {
				$rootScope.question.votes.downvotes.push(vote);
			}
		}
	}

	function addVoteAnswer(vote) {
		$rootScope.question.answers.forEach((answer) => {
			if(answer.id === vote.answer) {
				if(vote.value === '+') {
					answer.votes.upvotes.push(vote);
				}
				else if(vote.value === '-') {
					answer.votes.downvotes.push(vote);
				}
			}
		})
	}

	function addVoteComment(vote) {
		$rootScope.question.answers.forEach((answer) => {
			answer.comments.forEach((comment) => {
				if(comment.id === vote.comment) {
					if(vote.value === '+') {
						comment.votes.upvotes.push(vote);
					}
					else if(vote.value === '-') {
						comment.votes.downvotes.push(vote);
					}
				}
			})
		})
	}

	function addAnswerQuestion(answer) {
		if($rootScope.question.id === answer.question) {
			if(!$rootScope.question.answers) question.answers = [];
			$rootScope.question.answers.push(answer);
			return;
		}
	}

	function addCommentQuestion(comment) {
		$rootScope.question.answers.forEach((answer) => {
			if(answer.id === comment.answer) {
				if(!answer.comments) answer.comments = [];
				answer.comments.push(comment);
				return;
			}
		})
	}

	// Pusher events
	var channel = pusher.subscribe(`question${$routeParams.id}`);
	channel.bind('voteQuestion', function(data) {
		addVoteQuestion(data.vote);
	});
	channel.bind('voteAnswer', function(data) {
		addVoteAnswer(data.vote);
	});
	channel.bind('voteComment', function(data) {
		addVoteComment(data.vote);
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
		pusher.unsubscribe(`question${$routeParams.id}`);
	});

	// jQuery events
	// show answer form
	$('.give-answer').click(function() {
		$(this).fadeOut();
		$(this).parents('.question-container').find('.form-slide').slideDown();
	})

	$scope.$on('$includeContentLoaded', function(event) {
		// show comment form
		$('.give-comment').click(function() {
			$(this).fadeOut();
			$(this).parents('.answer').find('.form-slide').slideDown();
		})
	});

}]);
