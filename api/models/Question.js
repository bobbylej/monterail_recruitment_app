/**
 * Question.js
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

    name: {
      type: 'string',
      required: true
    },

    content: {
      type: 'string'
    },

    hot: {
      type: 'integer',
      defaultsTo: 0
    }
  },

  beforeValidate(values, cb) {
    if(!(values.user && values.content)) {
      return cb('Required values are not default');
    }
    cb();
  },

  afterCreate(question, cb) {

    User.findOne({
      name: question.user
    }).exec((err, user) => {
      if(err) console.log(err);

      if(!user.activity) user.activity = 0;
      user.activity++;
      user.save();
    })

		PusherService.trigger('questions', 'create', {
		  question
		});

    cb();
  }
};
