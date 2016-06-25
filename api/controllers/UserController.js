/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var bcrypt = require('bcryptjs');

module.exports = {

	login(req, res) {
		var password = req.param('password');
		var name = req.param('name');
		if(!(password && name)) {
			return res.badRequest('Name and password are required');
		}

		User.findOne({
			name
		}).exec((err, user) => {
			if(err) {
				return res.serverError(err);
			}
			if(!user) {
				return res.notFound('User not found');
			}

			bcrypt.compare(password, user.password, function(err, result) {
				if(err) {
					return res.serverError(err);
				}
				if(!result) {
					return res.notFound('User not found');
				}

				user.isLogged = true;
				user.lastSeen = new Date();
				user.save((err) => {
					return res.send(user);
				})
			});
		});
	},

	loginFacebook(req, res) {
		User.findOne({
			uid: req.param('uid')
		}).exec((err, user) => {
			if(err) {
				return res.serverError(err);
			}
			if(!user) {
				return res.notFound('User not found');
			}

			user.isLogged = true;
			user.lastSeen = new Date();
			user.save((err) => {
				return res.send(user);
			});
		});
	},

	logout(req, res) {
		User.findOne({
			name: req.param('name')
		}).exec((err, user) => {
			if(err) {
				return res.serverError(err);
			}
			if(!user) {
				return res.notFound('User not found');
			}

			user.isLogged = false;
			user.lastSeen = new Date();
			user.save((err) => {
				return res.send(user);
			})
		});
	},

	usersInPeriod(req, res) {
		var period = parseInt(req.param('period')) ? parseInt(req.param('period')) : 15;
		var user = req.param('user') || '';
		var date = new Date(req.param('date'));
		var dateBefore = new Date();
		dateBefore.setDate(date.getDate() - period);
		var dateAfter = new Date();
		dateAfter.setDate(date.getDate() + period);

		User.find({
			where: {
				name: {'!' : [user]},
				createdAt: {'>' : dateBefore},
				createdAt: {'<' : dateAfter},
			},
			limit: 4
		}).exec((err, users) => {
			if(err) {
				return res.serverError(err);
			}

			return res.send(users);
		})
	}

};
