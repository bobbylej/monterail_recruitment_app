var WebModule = angular.module('WebModule', ['ngRoute', 'ngStorage']);

WebModule.config(function($routeProvider, $locationProvider) {
  $routeProvider

  .when('/question', {
      templateUrl : '/templates/question/list.html',
      controller  : 'QuestionsController'
  })

  .when('/question/:id', {
      templateUrl : '/templates/question/single.html',
      controller  : 'QuestionController'
  })

  .otherwise({ redirectTo: '/question' });

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

const DEFAULT_AVATAR = 'http://www.insoso.org/images/avatar.jpeg';
const OAUTH_KEY = 'x9Rg0yXYXMDkXMQQBDq9Zmw5V08';
