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
- are responsive
- are SPA

I also add some extra things to this app:
- login, login by facebook and signup user (modal will show at start if user is not logged),
- creating question, answer and comment (user need to be logged),
- using pusher.js to build realtime app
- create own JSON API with Sails.js

