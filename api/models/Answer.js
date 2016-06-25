/**
 * Answer.js
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

     question: {
       model: 'Question',
       required: true
     },

     content: {
       type: 'string',
       required: true
     }
   },

   beforeValidate(values, cb) {
     if(!(values.user && values.question && values.content)) {
       return cb('Required values are not defined');
     }
     cb();
   },

   afterCreate(answer, cb) {
     Question.findOne({
       id: answer.question
     }).exec((err, question) => {
       if(err) console.log(err);

       question.updatedAt = answer.updatedAt;
       if(!question.hot) question.hot = 0;
       question.hot++;
       question.save();
     })

     User.findOne({
       name: answer.user
     }).exec((err, user) => {
       if(err) console.log(err);

       if(!user.activity) user.activity = 0;
       user.activity++;
       user.save();
     })

     PusherService.trigger('questions', 'answer', {
       answer
     });

     PusherService.trigger(`question${answer.question}`, 'answer', {
       answer
     });

     cb();
   }
 };
