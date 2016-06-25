/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var bcrypt = require('bcryptjs');

module.exports = {

  attributes: {
    name: {
      type: 'string',
      required: true,
      primaryKey: true,
      unique: true
    },

    password: {
      type: 'string'
    },

    uid: {
      type: 'string',
      unique: true
    },

    provider: {
      type: 'string',
      enum: ['facebook', 'local'],
      required: true,
      defaultsTo: 'local'
    },

    avatar: {
      type: 'string'
    },

    lastSeen: {
      type: 'datetime'
    },

    isLogged: {
      type: 'boolean'
    },

    activity: {
      type: 'integer',
      defaultsTo: 0
    }
  },

  beforeValidate(values, cb) {
    if(!(values.name)) {
      return cb('Name is required')
    }
    cb();
  },

  beforeCreate(values, cb) {
    var dataUser = {};
    if(values.uid) {
      dataUser.uid = values.uid;
    }
    else {
      dataUser.name = values.name;
    }
    User.findOne(dataUser).exec((err, user) => {
      if(err) return cb(err);
      if(user) {
          return cb('User already created');
      }
      else {
        if(values.provider === 'local') {
          if(values.password) {
            bcrypt.hash(values.password, 10, function(err, hash) {
              if(err) return cb(err);
              values.password = hash;
              return cb();
            });
          }
          else {
            return cb('Password is required')
          }
        }
        else {
          return cb();
        }
      }
    });
  },
};
