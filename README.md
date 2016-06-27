# monterail_recruitment_app

## Getting started
Download and install [Node.js](https://nodejs.org/en/download/)

Clone project
```bash
git clone https://github.com/bobbylej/monterail_recruitment_app.git

```
or download zip.

Run in project folder
```bash
npm install
sails lift
```
open in browser [localhost:1337](http://localhost:1337/)

## Introduction
This is test task for Monterail.

This app is a forum with questions, answers and comments to answers. The bottom level was to create app which:
- show list of questions with the possibility of sorting, filtering and searching
- show single question with answers and comments,
- allows to vote at questions, answers and comments
- show info about selected user
- is responsive
- is SPA

I also add some extra things to this app:
- login, login by facebook and signup user (modal will show at start if user is not logged),
- creating question, answer and comment (user need to be logged),
- using pusher.js to build realtime app
- create own JSON API with Sails.js

##How to interpret
###Task 3: Connect modal to users
- Activity level: amount of questions, answers, comments and votes added by user
- Users in the same period: users registered 15 days before and after selected user

###Task 5: Add pagination and sorting
- Sorting by hot: hot = amount of answers + comments + upvotes - downvotes
- My shelf: questions created by logged user

###Task 6: Add search
- Search questions which name, content or username contain search expression

##Environment
To create server I use Sails.js. This is Node.js framework which have MVC architecture and provides connection with DB.
I use Sails.js as my JSON API and save all data in MongoDB, instead of mock data on front-end, because Sails provides my simply REST API.

If you want to check back-end logic or models you need to open ***/api*** folder. There you have ***/api/controllers***, ***/api/models*** or ***/api/services***

This task was test for front-end developer, so I guess that you want to know where are whole front-end staff. Everything is in folder ***/assets***.

I use AngularJS to create logic on front-end and make app SPA. Files with Angular are in ***/assets/js/logic***.

I create one Module for whole website and few Controllers for difference views. For example, to controll questions list I have ***QuestionsController.js*** or for user modal ***UserController.js***.

I create also Services for questions and user, where I have functions repeated in few controllers.

Thanks to services and rootScope I solved problem with connection between controllers, for example when user change sorting settings in navbar it should have effect on question list, so then I run function in ***QuestionService.js*** that change ***$rootScope.questions*** variable.

To create SPA I also used Angular with ngRoute lib.

To save logged user in session I used ngStorage lib.

Files with html templates you will find in ***/assets/templates*** and styles in ***/assets/styles***, where I used SASS preprocessor.
Sails.js provides me thanks to Grunt compile all SASS and ES6 files to CSS and ES5. (Unfortunately I need to concat all js files with ES6 to one file ***all.js*** and convert manually to ES5, because Grunt give me errors and app didn't work on browsers without ES6 support)
