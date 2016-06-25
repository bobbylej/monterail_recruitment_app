/**
 * Comment.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

 var Pusher = require('pusher');

 module.exports = {

   attributes: {
     user: {
       model: 'User',
       required: true
     },

     answer: {
       model: 'Answer',
       required: true
     },

     content: {
       type: 'string',
       required: true
     }
   },

   beforeValidate(values, cb) {
     if(!(values.user && values.answer && values.content)) {
       return cb('Required values are not default');
     }
     cb();
   },

   afterCreate(comment, cb) {
     Answer.findOne({
       id: comment.answer
     }).exec((err, answer) => {
       if(err) console.log(err);

       PusherService.trigger(`question${answer.question}`, 'comment', {
   		  comment
     	 });

       Question.findOne({
         id: answer.question
       }).exec((err, question) => {
         if(err) console.log(err);

         question.updatedAt = comment.updatedAt;
         if(!question.hot) question.hot = 0;
         question.hot++;
         question.save();
       })
     })

     User.findOne({
       name: comment.user
     }).exec((err, user) => {
       if(err) console.log(err);

       if(!user.activity) user.activity = 0;
       user.activity++;
       user.save();
     })

     PusherService.trigger('questions', 'comment', {
 		  comment
   	 });


     cb();
   }
 };
