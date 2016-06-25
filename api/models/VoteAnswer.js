/**
 * VoteAnswer.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    user: {
      model: 'User',
      required: true
    },

    value: {
      type: 'string',
      enum: ['+', '-'],
      required: true
    },

    answer: {
      model: 'Answer',
      required: true
    }

  },

  afterCreate(vote, cb) {
    Answer.findOne({
      id: vote.answer
    }).exec((err, answer) => {

      PusherService.trigger(`question${answer.question}`, 'voteAnswer', {
  		  vote
  		});
    })

    User.findOne({
      name: vote.user
    }).exec((err, user) => {
      if(err) console.log(err);

      if(!user.activity) user.activity = 0;
      user.activity++;
      user.save();
    })

    cb();
  }
};
