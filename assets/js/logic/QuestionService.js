WebModule.service('questionService', ['$rootScope', '$http', '$sessionStorage', function($rootScope, $http, $sessionStorage) {
  $rootScope.sort = 'recent';
  $rootScope.type = 'all';

  function getQuestion(id, callback = () => {}) {
    $http({
      url:`/question/get/${id}`,
      method: 'GET'
    })
    .then(function onSuccess(response) {
      let question = response.data;
      question.info = countQuestionInfo(question);
      question.votes = countVotes(question);
      if(question.answers) {
        question.answers.forEach((answer) => {
          answer.votes = countVotes(answer);
          if(answer.comments) {
            answer.comments.forEach((comment) => {
              comment.votes = countVotes(comment);
            });
          }
        });
      }
      callback(undefined, question);
    })
    .catch(function onError(response) {
      callback(response, undefined);
    });
  };

  function searchQuestions(data = {}, savePage = false, callback = () => {}) {
    let search = data.search || '';
    let sort = data.sort;
    let user = data.type === 'my' ? (data.user ? data.user.name : undefined) : '';
    let limit = data.limit || 3;
    let skip = data.skip || 0;
    if(savePage) {
      limit = skip >= 3 ? skip : 3;
      skip = 0;
    }
    $http({
      url:`/question/search?search=${search}&sort=${sort}&user=${user}&limit=${limit}&skip=${skip}`,
      method: 'GET'
    })
    .then(function onSuccess(response) {
      let questions = response.data;
      questions.forEach((question) => {
        question.info = countQuestionInfo(question);
        question.votes = countVotes(question);
        if(question.answers) {
          question.answers.forEach((answer) => {
            answer.votes = countVotes(answer);
            if(answer.comments) {
              answer.comments.forEach((comment) => {
                comment.votes = countVotes(comment);
              });
            }
          });
        }
      })

      callback(undefined, questions);
    })
    .catch(function onError(response) {
      callback(response, undefined);
    });
  };

  function getTheHottestAnswer(questions) {
    let theHottestAnswer;
    let hottestValue = 0;
    questions.forEach((question) => {
      question.answers.forEach((answer) => {
        answer.info = countAnswerInfo(answer);
        let answerValue = answer.info.peers.length+answer.info.discussion+voteDifference(answer);
        if(answerValue > hottestValue) {
          theHottestAnswer = answer;
          theHottestAnswer.question = question;
          hottestValue = answerValue;
        }
      })
    })
    return theHottestAnswer;
  }

  function voteQuestion(data, callback = () => {}) {
    wasUserVote(data.question, 'question', data.user, (err, wasVote) => {
      if(!err && !wasVote) {
        $http.post('/votequestion/create', {
          user: data.user.name,
          value: data.value,
          question: data.question.id
        })
        .then(function onSuccess(response) {
          let vote = response.data;
          callback(undefined, vote);
        })
        .catch(function onError(response) {
          callback(response, undefined);
        });
      }
    });
  }

  function voteAnswer(data, callback = () => {}) {
    wasUserVote(data.answer, 'answer', data.user, (err, wasVote) => {
      if(!err && !wasVote) {
        $http.post('/voteanswer/create', {
          user: data.user.name,
          value: data.value,
          answer: data.answer.id
        })
        .then(function onSuccess(response) {
          let vote = response.data;
          callback(undefined, vote);
        })
        .catch(function onError(response) {
          callback(response, undefined);
        });
      }
    });
  }

  function voteComment(data, callback = () => {}) {
    wasUserVote(data.comment, 'comment', data.user, (err, wasVote) => {
      if(!err && !wasVote) {
        $http.post('/votecomment/create', {
          user: data.user.name,
          value: data.value,
          comment: data.comment.id
        })
        .then(function onSuccess(response) {
          let vote = response.data;
          callback(undefined, vote);
        })
        .catch(function onError(response) {
          callback(response, undefined);
        });
      }
    });
  }

  function wasUserVote(object, objectName, user, callback = () => {}) {
    let wasVote = false;
    if(object && user) {
      if(object.votes) {
        object.votes.upvotes.forEach((vote) => {
          if(vote.user === user.name) {
            wasVote = true;
            return true;
          }
        })
        object.votes.downvotes.forEach((vote) => {
          if(vote.user === user.name) {
            wasVote = true;
            return true;
          }
        })
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
    }
    else {
      return callback(undefined, wasVote);
    }
    return callback(undefined, wasVote);
  }

  function countAllQuestions(data = {}, callback = () => {}) {
    let search = data.search || '';
    let user = data.type === 'my' ? (data.user ? data.user.name : undefined) : '';
    $http({
      url:`/question/count?search=${search}&user=${user}`,
      method: 'GET'
    })
    .then(function onSuccess(response) {
      callback(undefined, response.data);
    })
    .catch(function onError(response) {
      callback(response, undefined);
    });
  }

  function countQuestionInfo(question) {
    let peers = [];
    let peersAnswered = [];
    let discussion = 0;
    let conversations = 0;
    if(question.answers && question.answers.length) {
      conversations = question.answers.length;
      question.answers.forEach((answer) => {
        if(peers.indexOf(answer.user.name) === -1 && answer.user.name !== question.user.name) {
          peers.push(answer.user.name);
        }
        if(peersAnswered.indexOf(answer.user.name) === -1 && answer.user.name !== question.user.name) {
          peersAnswered.push(answer.user.name);
        }
        if(answer.comments && answer.comments.length) {
          discussion++;
          answer.comments.forEach((comment) => {
            if(peers.indexOf(comment.user.name) === -1 && comment.user.name !== question.user.name) {
              peers.push(comment.user.name);
            }
          })
        }
      })
    }
    return {
      peers,
      peersAnswered,
      discussion,
      conversations
    };
  }

  function countAnswerInfo(answer) {
    let peers = [];
    let discussion = answer.comments.length;
    if(answer.comments && answer.comments.length) {
      answer.comments.forEach((comment) => {
        if(peers.indexOf(comment.user.name) === -1 && comment.user.name !== answer.user.name) {
          peers.push(comment.user.name);
        }
      })
    }
    return {
      peers,
      discussion,
    };
  }

  function countVotes(object) {
    let votes = {
      upvotes: [],
      downvotes: []
    }
    object.votes.forEach((vote) => {
      if(vote.value === '+') {
        votes.upvotes.push(vote);
      }
      else if(vote.value === '-') {
        votes.downvotes.push(vote);
      }
    });
    return votes;
  }

  function createQuestion(question, callback = () => {}) {
    $http.post('/question/create', question)
    .then(function onSuccess(response) {
      callback(undefined, response.data);
    })
    .catch(function onError(response) {
      callback(response, undefined);
    });
  };

  function createAnswer(answer, callback = () => {}) {
    $http.post('/answer/create', answer)
    .then(function onSuccess(response) {
      callback(undefined, response.data);
    })
    .catch(function onError(response) {
      callback(response, undefined);
    });
  };

  function createComment(comment, callback = () => {}) {
    $http.post('/comment/create', comment)
    .then(function onSuccess(response) {
      callback(undefined, response.data);
    })
    .catch(function onError(response) {
      callback(response, undefined);
    });
  };

  function voteDifference(object) {
    if(object && object.votes) {
			return object.votes.upvotes.length - object.votes.downvotes.length;
		}
		return 0;
  }

  return {
    getQuestion,
    searchQuestions,
    getTheHottestAnswer,
    countAllQuestions,
    countQuestionInfo,
    countVotes,
    createQuestion,
    createAnswer,
    createComment,
    voteQuestion,
    voteAnswer,
    voteComment,
    wasUserVote
  };

}]);
