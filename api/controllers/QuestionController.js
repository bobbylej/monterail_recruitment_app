/**
 * QuestionController
 *
 * @description :: Server-side logic for managing Questions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

	search(req, res) {
		var search = req.param('search') ? req.param('search') : '';
		var user = req.param('user') ? req.param('user') : undefined;
		var sort = req.param('sort') ? req.param('sort') : '';
		var limit = req.param('limit') ? req.param('limit') : 3;
		var skip = req.param('skip') ? req.param('skip') : 0;

		var criteria = {
			limit: limit,
			skip: skip
		};

		if(user) {
			criteria.where = {
				or : [
					{ name : {'contains': search} },
					{ content : {'contains': search} },
					{ user : {'contains': search} }
				],
				user: user
			}
		}
		else {
			criteria.where = {
				or : [
		      { name : {'contains': search} },
		      { content : {'contains': search} },
		      { user : {'contains': search} }
		    ],
			};
		}

		if(sort === 'recent') {
			sort = 'createdAt';
		}
		else if(sort === 'hot') {
			sort = 'hot';
		}
		else {
			sort = 'createdAt';
		}

		Question.find(criteria).sort(sort + ' DESC').populate('user')
		.exec((err, questions) => {
			if(err) return res.serverError(err);

			var questionsScopeLength = questions.length;
			if(questionsScopeLength) {
				questions.forEach((question) => {
					VoteQuestion.find({
						question: question.id
					}).exec((err, votes) => {
						if(err) return res.serverError(err);

						question.votes = votes;

						Answer.find({
							question: question.id
						}).populate('user').exec((err, answers) => {
							if(err) return res.serverError(err);

							var answersScopeLength = answers.length;
							if(answersScopeLength) {
								answers.forEach((answer) => {
									VoteAnswer.find({
										answer: answer.id
									}).exec((err, votes) => {
										if(err) return res.serverError(err);

										answer.votes = votes;

										Comment.find({
											answer: answer.id
										}).populate('user').exec((err, comments) => {
											if(err) return res.serverError(err);

											var commentsScopeLength = comments.length;
											if(commentsScopeLength) {
												comments.forEach((comment) => {
													VoteComment.find({
														comment: comment.id
													}).exec((err, votes) => {
														if(err) return res.serverError(err);

														comment.votes = votes;
														commentsScopeLength--;
														if(commentsScopeLength === 0) {
															answer.comments = comments;
															answersScopeLength--;
															if(answersScopeLength === 0) {
																question.answers = answers;
																questionsScopeLength--;
																if(questionsScopeLength === 0) {
																	return res.send(questions);
																}
															}
														}
													});
												});
											}
											else {
												answer.comments = comments;
												answersScopeLength--;
												if(answersScopeLength === 0) {
													question.answers = answers;
													questionsScopeLength--;
													if(questionsScopeLength === 0) {
														return res.send(questions);
													}
												}
											}
										});
									});
								});
							}
							else {
								question.answers = answers;
								questionsScopeLength--;
								if(questionsScopeLength === 0) {
									return res.send(questions);
								}
							}
						});
					});
				});
			}
			else {
				return res.send(questions);
			}

		})
	},

	getOne(req, res) {
		var id = req.param('id');

		Question.findOne({ id: id }).populate('user')
		.exec((err, question) => {
			if(err) return res.serverError(err);
			if(!question) return res.notFound('Question not found');

			VoteQuestion.find({
				question: question.id
			}).exec((err, votes) => {
				if(err) return res.serverError(err);

				question.votes = votes;

				Answer.find({
					question: question.id
				}).populate('user').exec((err, answers) => {
					if(err) return res.serverError(err);

					var answersScopeLength = answers.length;
					if(answersScopeLength) {
						answers.forEach((answer) => {
							VoteAnswer.find({
								answer: answer.id
							}).exec((err, votes) => {
								if(err) return res.serverError(err);

								answer.votes = votes;

								Comment.find({
									answer: answer.id
								}).populate('user').exec((err, comments) => {
									if(err) return res.serverError(err);

									var commentsScopeLength = comments.length;
									if(commentsScopeLength) {
										comments.forEach((comment) => {
											VoteComment.find({
												comment: comment.id
											}).exec((err, votes) => {
												if(err) return res.serverError(err);

												comment.votes = votes;
												commentsScopeLength--;
												if(commentsScopeLength === 0) {
													answer.comments = comments;
													answersScopeLength--;
													if(answersScopeLength === 0) {
														question.answers = answers;
														return res.send(question);
													}
												}
											});
										});
									}
									else {
										answer.comments = comments;
										answersScopeLength--;
										if(answersScopeLength === 0) {
											question.answers = answers;
											return res.send(question);
										}
									}
								});
							});
						});
					}
					else {
						question.answers = answers;
						return res.send(question);
					}
				});
			});

		})
	},

	count(req, res) {
		var user = req.param('user') ? req.param('user') : undefined;
		var search = req.param('search') ? req.param('search') : '';

		var criteria = {};

		if(user) {
			criteria.where = {
				and : [
					{
						or : [
				      { name : {'contains': search} },
				      { content : {'contains': search} },
				      { user : {'contains': search} }
				    ],
					},
					{ user: user }
				]
			};
		}
		else {
			criteria.where = {
				or : [
		      { name : {'contains': search} },
		      { content : {'contains': search} },
		      { user : {'contains': search} }
		    ],
			};
		}

		Question.count(criteria).exec((err, amount) => {
			if(err) return res.serverError(err);

			return res.send({
				amount
			});
		});
	},

	destroyAll(req, res) {
		console.log('destroy');
		Comment.destroy({}).exec((err) => {
			console.log(err);
		});
		Answer.destroy({}).exec((err) => {
			console.log(err);
		});
		Question.destroy({}).exec((err) => {
			console.log(err);
		});
		res.send('success')
	}

};
