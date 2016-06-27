'use strict';

$.fn.inputLabel = function () {
  var _this = this;

  var label = this.parent().find('label[for="' + this.attr('id') + '"]').detach();
  this.wrap('<div class="input-container"/>');
  this.after(label);
  this.on('change keyup paste', function () {
    if (_this.val() != '') {
      label.addClass('invisible');
    } else {
      label.removeClass('invisible');
    }
  });
};

$.fn.radio = function () {
  var _this2 = this;

  var label = this.parent().find('label[for="' + this.attr('id') + '"]').detach();
  this.wrap('<div class="input-radio"/>');
  this.after(label);
  var radio = $('<span class="radio"/>').click(function () {
    _this2.click();
  });
  this.after(radio);
};

'use strict';

var WebModule = angular.module('WebModule', ['ngRoute', 'ngStorage']);

WebModule.config(function ($routeProvider, $locationProvider) {
  $routeProvider.when('/question', {
    templateUrl: '/templates/question/list.html',
    controller: 'QuestionsController'
  }).when('/question/:id', {
    templateUrl: '/templates/question/single.html',
    controller: 'QuestionController'
  }).otherwise({ redirectTo: '/question' });

  /*
  //check browser support
  if(window.history && window.history.pushState) {
    $locationProvider.html5Mode(true);
  }
  */
});

Pusher.logToConsole = false;
var pusher = new Pusher('f5d91269ef4e8b70abac', {
  cluster: 'eu',
  encrypted: true
});

var DEFAULT_AVATAR = '/images/avatar.png';
var OAUTH_KEY = 'x9Rg0yXYXMDkXMQQBDq9Zmw5V08';

'use strict';

WebModule.service('dateService', ['$http', function ($http) {

  var a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
  var b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  function dateDifference(date1, date2) {
    var difference = Math.abs(date1.getTime() - date2.getTime());
    var value = parseInt(difference / (1000 * 60 * 60 * 24));
    var meta = value > 1 ? 'days' : 'day';
    if (value < 1) {
      value = parseInt(difference / (1000 * 60 * 60));
      meta = value > 1 ? 'hours' : 'hour';
    }
    if (value < 1) {
      value = parseInt(difference / (1000 * 60));
      meta = value > 1 ? 'minutes' : 'minute';
    }
    if (value < 1) {
      value = parseInt(difference / 1000);
      meta = value > 1 ? 'seconds' : 'second';
    }

    return {
      value: value,
      meta: meta
    };
  }

  function inWords(date) {
    if (date.meta === 'day' && date.value === 1) return {
      value: 'yesterday',
      meta: ''
    };
    var num = date.value;
    if ((num = num.toString()).length > 9) return date;
    var n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return date;
    var str = '';
    str += n[1] != 0 ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
    str += n[2] != 0 ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
    str += n[3] != 0 ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
    str += n[4] != 0 ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
    str += n[5] != 0 ? (str != '' ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
    return {
      value: str,
      meta: date.meta
    };
  }

  return {
    dateDifference: dateDifference,
    inWords: inWords
  };
}]);

'use strict';

WebModule.service('userService', ['$rootScope', '$http', '$sessionStorage', 'questionService', function ($rootScope, $http, $sessionStorage, questionService) {

  function openUserModal(user) {
    $rootScope.userModal = user;
    $('.modal').removeClass('show');
    $('#modal-user').addClass('show');
    $('#modal-blanket').fadeIn();
  }

  function closeUserModal() {
    $('#modal-user').removeClass('show');
    $('#modal-blanket').fadeOut();
  }

  function getUsersInSamePeriod(user) {
    var callback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

    if (user) {
      var period = '15'; // 5 days before and after regiter user
      $http({
        url: '/user/usersInPeriod?date=' + user.createdAt + '&period=' + period + '&user=' + user.name,
        method: 'GET'
      }).then(function onSuccess(response) {
        var users = response.data;
        callback(undefined, users);
      }).catch(function onError(response) {
        callback(response, undefined);
      });
    }
  }

  function getUserQuestions(user) {
    var callback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

    questionService.searchQuestions({
      type: 'my',
      user: user,
      limit: 0
    }, false, function (err, questions) {
      callback(undefined, questions);
    });
  }

  function countActivity(user) {
    if (user.activity) {
      if (user.activity > 0) {
        return 1;
      } else if (user.activity > 20) {
        return 2;
      } else if (user.activity > 50) {
        return 3;
      }
    } else {
      return 0;
    }
  }

  return {
    openUserModal: openUserModal,
    closeUserModal: closeUserModal,
    getUsersInSamePeriod: getUsersInSamePeriod,
    getUserQuestions: getUserQuestions,
    countActivity: countActivity
  };
}]);

'use strict';

WebModule.service('questionService', ['$rootScope', '$http', '$sessionStorage', function ($rootScope, $http, $sessionStorage) {
  $rootScope.sort = 'recent';
  $rootScope.type = 'all';

  function getQuestion(id) {
    var callback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

    $http({
      url: '/question/get/' + id,
      method: 'GET'
    }).then(function onSuccess(response) {
      var question = response.data;
      question.info = countQuestionInfo(question);
      question.votes = countVotes(question);
      if (question.answers) {
        question.answers.forEach(function (answer) {
          answer.votes = countVotes(answer);
          if (answer.comments) {
            answer.comments.forEach(function (comment) {
              comment.votes = countVotes(comment);
            });
          }
        });
      }
      callback(undefined, question);
    }).catch(function onError(response) {
      callback(response, undefined);
    });
  };

  function searchQuestions() {
    var data = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var savePage = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
    var callback = arguments.length <= 2 || arguments[2] === undefined ? function () {} : arguments[2];

    var search = data.search || '';
    var sort = data.sort;
    var user = data.type === 'my' ? data.user ? data.user.name : undefined : '';
    var limit = data.limit || 3;
    var skip = data.skip || 0;
    if (savePage) {
      limit = skip >= 3 ? skip : 3;
      skip = 0;
    }
    $http({
      url: '/question/search?search=' + search + '&sort=' + sort + '&user=' + user + '&limit=' + limit + '&skip=' + skip,
      method: 'GET'
    }).then(function onSuccess(response) {
      var questions = response.data;
      questions.forEach(function (question) {
        question.info = countQuestionInfo(question);
        question.votes = countVotes(question);
        if (question.answers) {
          question.answers.forEach(function (answer) {
            answer.votes = countVotes(answer);
            if (answer.comments) {
              answer.comments.forEach(function (comment) {
                comment.votes = countVotes(comment);
              });
            }
          });
        }
      });

      callback(undefined, questions);
    }).catch(function onError(response) {
      callback(response, undefined);
    });
  };

  function getTheHottestAnswer(questions) {
    var theHottestAnswer = void 0;
    var hottestValue = 0;
    questions.forEach(function (question) {
      if (question.answers) {
        question.answers.forEach(function (answer) {
          answer.info = countAnswerInfo(answer);
          var answerValue = answer.info.peers.length + answer.info.discussion + voteDifference(answer);
          if (answerValue > hottestValue) {
            theHottestAnswer = answer;
            question.answers = undefined;
            theHottestAnswer.question = question;
            hottestValue = answerValue;
          }
        });
      }
    });
    return theHottestAnswer;
  }

  function voteQuestion(data) {
    var callback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

    wasUserVote(data.question, 'question', data.user, function (err, wasVote) {
      if (!err && !wasVote) {
        $http.post('/votequestion/create', {
          user: data.user.name,
          value: data.value,
          question: data.question.id
        }).then(function onSuccess(response) {
          var vote = response.data;
          callback(undefined, vote);
        }).catch(function onError(response) {
          callback(response, undefined);
        });
      }
    });
  }

  function voteAnswer(data) {
    var callback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

    wasUserVote(data.answer, 'answer', data.user, function (err, wasVote) {
      if (!err && !wasVote) {
        $http.post('/voteanswer/create', {
          user: data.user.name,
          value: data.value,
          answer: data.answer.id
        }).then(function onSuccess(response) {
          var vote = response.data;
          callback(undefined, vote);
        }).catch(function onError(response) {
          callback(response, undefined);
        });
      }
    });
  }

  function voteComment(data) {
    var callback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

    wasUserVote(data.comment, 'comment', data.user, function (err, wasVote) {
      if (!err && !wasVote) {
        $http.post('/votecomment/create', {
          user: data.user.name,
          value: data.value,
          comment: data.comment.id
        }).then(function onSuccess(response) {
          var vote = response.data;
          callback(undefined, vote);
        }).catch(function onError(response) {
          callback(response, undefined);
        });
      }
    });
  }

  function wasUserVote(object, objectName, user) {
    var callback = arguments.length <= 3 || arguments[3] === undefined ? function () {} : arguments[3];

    var wasVote = false;
    if (object && user) {
      if (object.votes) {
        object.votes.upvotes.forEach(function (vote) {
          if (vote.user === user.name) {
            wasVote = true;
            return true;
          }
        });
        object.votes.downvotes.forEach(function (vote) {
          if (vote.user === user.name) {
            wasVote = true;
            return true;
          }
        });
      }
      /*
      if(!wasVote) {
        $http.get(`/vote${objectName}?user=${user.name}&${objectName}=${object.id}`)
        .then(function onSuccess(response) {
          let votes = response.data;
          console.log(votes);
          if(votes.length) {
            return callback(undefined, true);
          }
          return callback(undefined, false);
        })
        .catch(function onError(response) {
          callback(response, undefined);
        });
      }
      */
      else {
          return callback(undefined, wasVote);
        }
    } else {
      return callback(undefined, wasVote);
    }
    return callback(undefined, wasVote);
  }

  function countAllQuestions() {
    var data = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var callback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

    var search = data.search || '';
    var user = data.type === 'my' ? data.user ? data.user.name : undefined : '';
    $http({
      url: '/question/count?search=' + search + '&user=' + user,
      method: 'GET'
    }).then(function onSuccess(response) {
      callback(undefined, response.data);
    }).catch(function onError(response) {
      callback(response, undefined);
    });
  }

  function countQuestionInfo(question) {
    var peers = [];
    var peersAnswered = [];
    var discussion = 0;
    var conversations = 0;
    if (question.answers && question.answers.length) {
      conversations = question.answers.length;
      question.answers.forEach(function (answer) {
        if (peers.indexOf(answer.user.name) === -1 && answer.user.name !== question.user.name) {
          peers.push(answer.user.name);
        }
        if (peersAnswered.indexOf(answer.user.name) === -1 && answer.user.name !== question.user.name) {
          peersAnswered.push(answer.user.name);
        }
        if (answer.comments && answer.comments.length) {
          discussion++;
          answer.comments.forEach(function (comment) {
            if (peers.indexOf(comment.user.name) === -1 && comment.user.name !== question.user.name) {
              peers.push(comment.user.name);
            }
          });
        }
      });
    }
    return {
      peers: peers,
      peersAnswered: peersAnswered,
      discussion: discussion,
      conversations: conversations
    };
  }

  function countAnswerInfo(answer) {
    var peers = [];
    var discussion = answer.comments.length;
    if (answer.comments && answer.comments.length) {
      answer.comments.forEach(function (comment) {
        if (peers.indexOf(comment.user.name) === -1 && comment.user.name !== answer.user.name) {
          peers.push(comment.user.name);
        }
      });
    }
    return {
      peers: peers,
      discussion: discussion
    };
  }

  function countVotes(object) {
    var votes = {
      upvotes: [],
      downvotes: []
    };
    object.votes.forEach(function (vote) {
      if (vote.value === '+') {
        votes.upvotes.push(vote);
      } else if (vote.value === '-') {
        votes.downvotes.push(vote);
      }
    });
    return votes;
  }

  function createQuestion(question) {
    var callback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

    $http.post('/question/create', question).then(function onSuccess(response) {
      callback(undefined, response.data);
    }).catch(function onError(response) {
      callback(response, undefined);
    });
  };

  function createAnswer(answer) {
    var callback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

    $http.post('/answer/create', answer).then(function onSuccess(response) {
      callback(undefined, response.data);
    }).catch(function onError(response) {
      callback(response, undefined);
    });
  };

  function createComment(comment) {
    var callback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

    $http.post('/comment/create', comment).then(function onSuccess(response) {
      callback(undefined, response.data);
    }).catch(function onError(response) {
      callback(response, undefined);
    });
  };

  function voteDifference(object) {
    if (object && object.votes) {
      return object.votes.upvotes.length - object.votes.downvotes.length;
    }
    return 0;
  }

  return {
    getQuestion: getQuestion,
    searchQuestions: searchQuestions,
    getTheHottestAnswer: getTheHottestAnswer,
    countAllQuestions: countAllQuestions,
    countQuestionInfo: countQuestionInfo,
    countVotes: countVotes,
    createQuestion: createQuestion,
    createAnswer: createAnswer,
    createComment: createComment,
    voteQuestion: voteQuestion,
    voteAnswer: voteAnswer,
    voteComment: voteComment,
    wasUserVote: wasUserVote
  };
}]);

'use strict';

WebModule.controller('AuthController', ['$scope', '$rootScope', '$http', '$sessionStorage', function ($scope, $rootScope, $http, $sessionStorage) {

	OAuth.initialize(OAUTH_KEY);
	$rootScope.user = $sessionStorage.user;

	setTimeout(function () {
		if (!$rootScope.user) {
			$('#navbar .user-navbar').addClass('show');
			$('#modal-blanket').fadeIn();
		}
	}, 1000);

	$scope.loginLocal = function () {
		$http.post('/user/login', {
			name: $scope.loginForm.name,
			password: $scope.loginForm.password
		}).then(function (response) {
			$sessionStorage.user = response.data;
			$rootScope.user = response.data;
			$rootScope.openUserModal(response.data);
		}).catch(function (response) {
			if (response.status === 400 || 404) {
				$scope.errorLogin = 'Ivalid login or password';
				return;
			}

			$scope.errorLogin = 'Error';
			return;
		});
	};

	$scope.loginFacebook = function () {
		OAuth.popup('facebook').done(function (result) {
			result.me().done(function (response) {
				var dataUser = {
					uid: response.id,
					name: response.name,
					avatar: response.avatar,
					provider: 'facebook'
				};

				$http.post('/user/loginFacebook', {
					uid: dataUser.uid
				}).then(function onSuccess(response) {
					$sessionStorage.user = response.data;
					$rootScope.user = response.data;
					$rootScope.openUserModal(response.data);
				}).catch(function onError(response) {
					if (response.status === 400 || 404) {
						$http.post('/user/create', dataUser).then(function onSuccess(response) {
							$sessionStorage.user = response.data;
							$rootScope.user = response.data;
							$rootScope.openUserModal(response.data);
						});
						return;
					}

					$scope.errorLogin = 'Error';
					return;
				});
			}).fail(function (err) {
				//handle error with err
			});
		}).fail(function (err) {
			$scope.errorLogin = err;
		});
	};

	$scope.logout = function () {
		if ($sessionStorage.user) {
			$http.post('/user/logout', {
				name: $sessionStorage.user.name
			});
		}
		delete $sessionStorage.user;
		$rootScope.user = undefined;
	};

	$scope.signup = function () {
		$http.post('/user/create', {
			name: $scope.signupForm.name,
			password: $scope.signupForm.password
		}).then(function onSuccess(response) {
			$sessionStorage.user = response.data;
			$rootScope.user = response.data;
			$rootScope.openUserModal(response.data);
		}).catch(function onError(response) {
			if (response.status == 409) {
				$scope.errorSignup = 'That login has already been taken, please try again.';
			} else if (response.status == 500) {
				$scope.errorSignup = response.data.originalError;
				return;
			}
		});
	};
}]);

'use strict';

WebModule.controller('NavbarController', ['$scope', '$rootScope', '$http', '$sessionStorage', 'questionService', 'dateService', function ($scope, $rootScope, $http, $sessionStorage, questionService, dateService) {

  timeDifference();

  $scope.changeQuestionsType = function (type) {
    $rootScope.type = type;
    $rootScope.skip = 0;
    questionService.searchQuestions({
      search: $rootScope.search,
      sort: $rootScope.sort,
      type: $rootScope.type,
      limit: $rootScope.limit,
      skip: $rootScope.skip,
      user: $sessionStorage.user
    }, false, function (err, questions) {
      $rootScope.questions = questions;
      $rootScope.skip += $rootScope.limit;
    });
    questionService.countAllQuestions({
      search: $rootScope.search,
      type: $rootScope.type,
      user: $sessionStorage.user
    }, function (err, data) {
      $rootScope.questionsAmount = data.amount;
    });
  };

  $scope.changeQuestionsSort = function (sort) {
    $rootScope.sort = sort;
    questionService.searchQuestions({
      search: $rootScope.search,
      sort: $rootScope.sort,
      type: $rootScope.type,
      limit: $rootScope.limit,
      skip: $rootScope.skip,
      user: $sessionStorage.user
    }, true, function (err, questions) {
      $rootScope.questions = questions;
    });
  };

  $scope.changeSearch = function (search) {
    $rootScope.search = search;
    $rootScope.skip = 0;
    questionService.searchQuestions({
      search: $rootScope.search,
      sort: $rootScope.sort,
      type: $rootScope.type,
      limit: $rootScope.limit,
      skip: $rootScope.skip,
      user: $sessionStorage.user
    }, false, function (err, questions) {
      $rootScope.questions = questions;
      $rootScope.skip += $rootScope.limit;
    });
    questionService.countAllQuestions(function (err, data) {
      $rootScope.questionsAmount = data.amount;
    });
  };

  $scope.createQuestion = function (question) {
    $scope.closeModal();
    questionService.createQuestion({
      name: question.name,
      content: question.content,
      user: $sessionStorage.user.name
    });
  };

  $scope.backClick = function () {
    switch ($rootScope.view) {
      case 'questions':
        if ($rootScope.user) {
          $rootScope.openUserModal($rootScope.user);
        } else {
          $scope.openLoginModal();
        }
        break;
      case 'question':
        window.location = '/#/question';
        break;
    }
  };

  $scope.openQuestionModal = function () {
    if ($sessionStorage.user) {
      $('#modal-question').addClass('show');
      $('#modal-blanket').fadeIn();
    } else {
      $scope.openLoginModal();
    }
  };

  $scope.closeModal = function () {
    $('#modal-question').removeClass('show');
    $('#modal-blanket').fadeOut();
  };

  $scope.openLoginModal = function () {
    $('#navbar .user-navbar').addClass('show');
    $('#modal-blanket').fadeIn();
  };

  function timeDifference() {
    if ($rootScope.question) {
      (function () {
        var date = $rootScope.question.updatedAt;
        $scope.$apply(function () {
          $scope.lastTime = dateService.dateDifference(new Date(), new Date(date));
        });
      })();
    }
    setTimeout(function () {
      timeDifference();
    }, 3000);
  }

  $scope.$on('$includeContentLoaded', function (event) {
    $('input[type="radio"]').each(function () {
      $(this).radio();
    });
  });
}]);

'use strict';

WebModule.controller('QuestionController', ['$scope', '$rootScope', '$http', '$sessionStorage', '$routeParams', 'questionService', 'dateService', function ($scope, $rootScope, $http, $sessionStorage, $routeParams, questionService, dateService) {

	$rootScope.navbarUrl = '/templates/navbar/navbar-question.html';
	$rootScope.view = 'question';
	$('body').removeClass('question-list').addClass('question-single');

	if (!$rootScope.question) {
		questionService.getQuestion($routeParams.id, function (err, question) {
			$rootScope.question = question;
		});
	}

	$scope.voteDiff = function (object) {
		if (object && object.votes) {
			return object.votes.upvotes.length - object.votes.downvotes.length;
		}
		return 0;
	};

	$scope.dateDiff = function (date) {
		if (date) {
			return dateService.inWords(dateService.dateDifference(new Date(), new Date(date)));
		}
	};

	$scope.wasUserVote = function (object, objectName) {
		return questionService.wasUserVote(object, objectName, $sessionStorage.user, function (err, wasVote) {
			return wasVote;
		});
	};

	$scope.voteQuestion = function (vote) {
		questionService.voteQuestion({
			question: $rootScope.question,
			user: $sessionStorage.user,
			value: vote
		});
	};

	$scope.voteAnswer = function (answer, vote) {
		questionService.voteAnswer({
			answer: answer,
			user: $sessionStorage.user,
			value: vote
		});
	};

	$scope.voteComment = function (comment, vote) {
		questionService.voteComment({
			comment: comment,
			user: $sessionStorage.user,
			value: vote
		});
	};

	$scope.createAnswer = function (answer) {
		questionService.createAnswer({
			question: $rootScope.question.id,
			content: answer.content,
			user: $sessionStorage.user.name
		});

		$('.give-answer').fadeIn();
		$('.form-slide.form-answer').slideUp();
	};

	$scope.createComment = function (answer, comment) {
		questionService.createComment({
			answer: answer.id,
			content: comment.content,
			user: $sessionStorage.user.name
		});

		$('.give-comment').fadeIn();
		$('.form-slide.form-comment').slideUp();
	};

	function addVoteQuestion(vote) {
		if ($rootScope.question.id === vote.question) {
			if (vote.value === '+') {
				$rootScope.question.votes.upvotes.push(vote);
			} else if (vote.value === '-') {
				$rootScope.question.votes.downvotes.push(vote);
			}
		}
	}

	function addVoteAnswer(vote) {
		$rootScope.question.answers.forEach(function (answer) {
			if (answer.id === vote.answer) {
				if (vote.value === '+') {
					answer.votes.upvotes.push(vote);
				} else if (vote.value === '-') {
					answer.votes.downvotes.push(vote);
				}
			}
		});
	}

	function addVoteComment(vote) {
		$rootScope.question.answers.forEach(function (answer) {
			answer.comments.forEach(function (comment) {
				if (comment.id === vote.comment) {
					if (vote.value === '+') {
						comment.votes.upvotes.push(vote);
					} else if (vote.value === '-') {
						comment.votes.downvotes.push(vote);
					}
				}
			});
		});
	}

	function addAnswerQuestion(answer) {
		if ($rootScope.question.id === answer.question) {
			if (!$rootScope.question.answers) question.answers = [];
			answer.votes = {
				upvotes: [],
				downvotes: []
			};
			$rootScope.question.answers.push(answer);
			return;
		}
		$rootScope.question.info = questionService.countQuestionInfo($rootScope.question);
	}

	function addCommentQuestion(comment) {
		$rootScope.question.answers.forEach(function (answer) {
			if (answer.id === comment.answer) {
				if (!answer.comments) answer.comments = [];
				comment.votes = {
					upvotes: [],
					downvotes: []
				};
				answer.comments.push(comment);
				return;
			}
		});
		$rootScope.question.info = questionService.countQuestionInfo($rootScope.question);
	}

	// Pusher events
	var channel = pusher.subscribe('question' + $routeParams.id);
	channel.bind('voteQuestion', function (data) {
		addVoteQuestion(data.vote);
	});
	channel.bind('voteAnswer', function (data) {
		addVoteAnswer(data.vote);
	});
	channel.bind('voteComment', function (data) {
		addVoteComment(data.vote);
	});
	channel.bind('answer', function (data) {
		var answer = data.answer;
		addAnswerQuestion(answer);
	});
	channel.bind('comment', function (data) {
		var comment = data.comment;
		addCommentQuestion(comment);
	});

	$scope.$on('$routeChangeStart', function (next, current) {
		pusher.unsubscribe('question' + $routeParams.id);
	});

	// jQuery events
	// show answer form
	$('.give-answer').click(function () {
		$(this).fadeOut();
		$(this).parents('.question-container').find('.form-slide').slideDown();
	});

	$scope.$on('$includeContentLoaded', function (event) {
		// show comment form
		$('.give-comment').click(function () {
			$(this).fadeOut();
			$(this).parents('.answer').find('.form-slide').slideDown();
		});
	});
}]);

'use strict';

WebModule.controller('QuestionsController', ['$scope', '$rootScope', '$http', '$sessionStorage', 'questionService', function ($scope, $rootScope, $http, $sessionStorage, questionService) {

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
	}, function (err, data) {
		$rootScope.questionsAmount = data.amount;
	});

	questionService.searchQuestions({
		search: $rootScope.search,
		sort: $rootScope.sort,
		type: $rootScope.type,
		limit: $rootScope.limit,
		skip: $rootScope.skip,
		user: $sessionStorage.user
	}, false, function (err, questions) {
		$rootScope.questions = questions;
		$rootScope.skip += $rootScope.limit;
	});

	$scope.openQuestion = function (question) {
		$rootScope.question = question;
		window.location = '/#/question/' + question.id;
	};

	$scope.loadMore = function () {
		questionService.searchQuestions({
			search: $rootScope.search,
			sort: $rootScope.sort,
			type: $rootScope.type,
			limit: $rootScope.limit,
			skip: $rootScope.skip,
			user: $sessionStorage.user
		}, false, function (err, questions) {
			$rootScope.questions = $rootScope.questions.concat(questions);
			$rootScope.skip += $rootScope.limit;
		});
	};

	$scope.getActivities = function (question, max) {
		var list = [];
		var more = 0;
		var iterator = max;
		if (question.answers && question.answers.length) {
			question.answers.forEach(function (answer) {
				more++;
				if (iterator > 0) {
					answer.type = "answer";
					list.push(answer);
					iterator--;
				}
			});
			question.answers.forEach(function (answer) {
				if (answer.comments && answer.comments.length) {
					answer.comments.forEach(function (comment) {
						more++;
						if (iterator > 0) {
							comment.type = "comment";
							list.push(comment);
							iterator--;
						}
					});
				}
			});
		}
		more -= list.length;
		return {
			list: list,
			more: more
		};
	};

	function addQuestion(question) {
		if ($rootScope.type === 'all' || $rootScope.type === 'my' && $rootScope.user.name === question.name) {
			if ($rootScope.sort === 'recent') {
				$rootScope.questions.unshift(question);
			} else if ($rootScope.sort === 'hot') {
				if ($rootScope.questions[$rootScope.questions.length - 1].hot >= question.hot) {
					// don't add
				} else if ($rootScope.questions[0].hot <= question.hot) {
						$rootScope.questions.unshift(question);
					} else {
						for (var i = 1; i < $rootScope.questions.length - 1; i++) {
							if ($rootScope.questions[i].hot <= question.hot) {
								$rootScope.questions.splice(i, 0, question);
								break;
							}
						}
					}
			}
		}
	}

	function addAnswerQuestion(answer) {
		$rootScope.questions.forEach(function (question) {
			if (question.id === answer.question) {
				if (!question.answers) question.answers = [];
				question.answers.push(answer);
				return;
			}
		});
	}

	function addCommentQuestion(comment) {
		$rootScope.questions.forEach(function (question) {
			question.answers.forEach(function (answer) {
				if (answer.id === comment.answer) {
					if (!answer.comments) answer.comments = [];
					answer.comments.push(answer);
					return;
				}
			});
		});
	}

	function getActivitiesSize() {
		var width = $(window).width();
		var size = 4;
		if (width >= 800) {
			size = 4;
		} else if (width >= 675 && width < 800) {
			size = 3;
		} else if (width >= 600 && width < 675) {
			size = 2;
		} else {
			size = 1;
		}
		return size;
	}

	$(window).resize(function () {
		$scope.$apply(function () {
			$scope.activitiesSize = getActivitiesSize();
		});
	});

	var channel = pusher.subscribe('questions');
	channel.bind('create', function (data) {
		var question = questionService.getQuestion(data.question.id, function (err, question) {
			addQuestion(question);
		});
	});
	channel.bind('answer', function (data) {
		var answer = data.answer;
		addAnswerQuestion(answer);
	});
	channel.bind('comment', function (data) {
		var comment = data.comment;
		addCommentQuestion(comment);
	});

	$scope.$on('$routeChangeStart', function (next, current) {
		pusher.unsubscribe('questions');
	});
}]);

'use strict';

WebModule.controller('UserController', ['$scope', '$rootScope', '$http', '$sessionStorage', 'userService', 'dateService', 'questionService', function ($scope, $rootScope, $http, $sessionStorage, userService, dateService, questionService) {

	$rootScope.defaultAvatar = DEFAULT_AVATAR;

	$rootScope.openUserModal = function (user) {
		userService.openUserModal(user);
		userService.getUsersInSamePeriod($rootScope.userModal, function (err, users) {
			$rootScope.userModal.usersInPeriod = users;
		});
		userService.getUserQuestions(user, function (err, questions) {
			var info = {
				peers: [],
				discussion: 0,
				findings: 0,
				questions: questions.length

			};
			questions.forEach(function (question) {
				question.info = questionService.countQuestionInfo(question);
				question.info.peers.forEach(function (peer) {
					if (info.peers.indexOf(peer) === -1) {
						info.peers.push(peer);
					}
				});
				info.discussion += question.info.discussion;
				if (info.discussion > 0) {
					info.findings++;
				}
			});
			$rootScope.userModal.info = info;
			$rootScope.userModal.questions = questions;
			$rootScope.userModal.hottestAnswer = questionService.getTheHottestAnswer(questions);
			$rootScope.userModal.activityLevel = userService.countActivity($rootScope.userModal);
		});
	};

	$scope.closeModal = function () {
		userService.closeUserModal();
	};

	$scope.logout = function () {
		if ($sessionStorage.user) {
			$http.put('/user/logout', {
				name: $sessionStorage.user.name
			});
		}
		delete $sessionStorage.user;
		$rootScope.user = undefined;
		$scope.closeModal();
	};

	$scope.dateDifference = function (date) {
		return dateService.dateDifference(new Date(), new Date(date));
	};

	$scope.voteDiff = function (object) {
		if (object && object.votes) {
			return object.votes.upvotes.length - object.votes.downvotes.length;
		}
		return 0;
	};
}]);

'use strict';

$(document).ready(function () {

  $('#user-close-button').click(function () {
    $('#navbar .user-navbar').removeClass('show');
    $('#modal-blanket').fadeOut();
  });

  $('#modal-blanket').click(function () {
    $('#navbar .user-navbar').removeClass('show');
    $('#modal-user').removeClass('show');
    $('#modal-question').removeClass('show');
    $('#modal-blanket').fadeOut();
  });

  // config the navbar on scroll
  var prev = $(window).scrollTop();
  $(window).on('scroll', function (event) {
    var now = $(this).scrollTop();
    var difference = prev - now;
    var top = $('#navbar').position().top;
    var height = $('#navbar').height();
    var newPosition = top + difference;
    if (newPosition > height * -1 && newPosition < 0) {
      $('#navbar').css('top', newPosition + 'px');
    } else if (newPosition <= height * -1) {
      $('#navbar').css('top', height * -1 + 'px');
    } else if (newPosition > 0) {
      $('#navbar').css('top', 0 + 'px');
    }
    prev = now;
  });
});
