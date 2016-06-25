/**
 * VoteQuestion.js
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

    question: {
      model: 'Question',
      required: true
    }

  },

  afterCreate(vote, cb) {
    Question.findOne({
      id: vote.question
    }).exec((err, question) => {
      if(err) console.log(err);

      if(!question.hot) question.hot = 0;

      if(vote.value === '+') {
        question.hot++;
      }
      else if(vote.value === '-') {
        question.hot--;
      }
      question.save();
    })

    User.findOne({
      name: vote.user
    }).exec((err, user) => {
      if(err) console.log(err);

      if(!user.activity) user.activity = 0;
      user.activity++;
      user.save();
    })

    PusherService.trigger(`question${vote.question}`, 'voteQuestion', {
      vote
    });

    cb();
  }
};
