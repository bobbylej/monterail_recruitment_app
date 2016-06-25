/**
 * VoteComment.js
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

    comment: {
      model: 'Comment',
      required: true
    }

  },

  afterCreate(vote, cb) {
    Comment.findOne({
      id: vote.comment
    }).exec((err, comment) => {

      Answer.findOne({
        id: comment.answer
      }).exec((err, answer) => {
        PusherService.trigger(`question${answer.question}`, 'voteComment', {
    		  vote
    		});
      })
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
