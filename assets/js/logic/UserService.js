WebModule.service('userService', ['$rootScope', '$http', '$sessionStorage', 'questionService', function($rootScope, $http, $sessionStorage, questionService) {

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

  function getUsersInSamePeriod(user, callback = () => {}) {
    if(user) {
      let period = '15'; // 5 days before and after regiter user
      $http({
        url:`/user/usersInPeriod?date=${user.createdAt}&period=${period}&user=${user.name}`,
        method: 'GET'
      })
      .then(function onSuccess(response) {
        let users = response.data;
        callback(undefined, users);
      })
      .catch(function onError(response) {
        callback(response, undefined);
      });
    }
  }

  function getUserQuestions(user, callback = () => {}) {
    questionService.searchQuestions({
      type: 'my',
      user: user,
      limit: 0
    }, false, (err, questions) => {
      callback(undefined, questions);
    })
  }

  function countActivity(user) {
    if(user.activity) {
      if(user.activity > 0) {
        return 1;
      }
      else if(user.activity > 20) {
        return 2;
      }
      else if(user.activity > 50) {
        return 3;
      }
    }
    else {
      return 0;
    }
  }

  return {
    openUserModal,
    closeUserModal,
    getUsersInSamePeriod,
    getUserQuestions,
    countActivity
  }

}]);
