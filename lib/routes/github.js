'use strict';

var assert = require('assert');
var router = require('express').Router();
var tentacles = require('../tentacles');
var db = require('../db');
var queueUserGraphUpdate = require('../graph/queue-update');
var github = require('../utils/github');
var StatusError = require('statuserror');

router.get('/login', function(req, res, next) {
  res.redirect('https://github.com/login/oauth/authorize?client_id='+process.env.GITHUB_CLIENT_ID+'&auth_type=reauthenticate');
});

router.get('/logout', function(req, res, next) {
  res.clearCookie('auth', {signed: true});
  res.redirect(process.env.FRONTEND_BASE_URL+'/');
});

router.get('/callback', function(req, res, next) {
  assert(req.query.code, "code required");
  var accessToken;

  github.getAccessToken(req.query.code)
    .then(function(data) {
      assert(data.access_token, "access_token required from github");
      accessToken = data.access_token;
      return tentacles.user.getAuthUser({ accessToken: accessToken });
      if (data.access_token) {
        accessToken = data.access_token;
        return tentacles.user.getAuthUser({ accessToken: accessToken });
      } else {
        var redirect = new StatusError(301, 'access_token required')
        redirect.location = '/'
        throw redirect;
      }
    })
    .then(function(attrs) {
      if (!attrs.name) {
        attrs.name = attrs.login;
      }
      return db.users.create(attrs);
    })
    .then(function(user) {
      // return response immediately
      var payload = { login: user.login };
      res.cookie('auth', payload, { signed: true });
      res.redirect(process.env.FRONTEND_BASE_URL+'#login');

      if (user.partial === false) {
        // already loaded
        return;

      } else if (user.partial === true) {
        // still busy
        return;

      } else {
        // first time!
        return queueUserGraphUpdate(user.login, accessToken);
      }
    })
    .catch(next);
});

module.exports = router;
