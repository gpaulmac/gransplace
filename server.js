'use strict';

//mongoose file must be loaded before all other files in order to provide
// models to other modules
var fs = require("fs");
var hbs = require('hbs');
var express = require('express'),
  router = express.Router(),
  path = require('path'),
  bodyParser = require('body-parser'),
  swaggerUi = require('swagger-ui-express'),
  swaggerDocument = require('./swagger.json');


var mongoose = require('mongoose'),
  Schema = mongoose.Schema;





//mongoose.connect('mongodb://localhost:27017/swagger-demo');

var UserSchema = new Schema({
  email: {
    type: String, required: true,
    trim: true, unique: true,
    match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
  },
  firstName: {type: String},
  lastName: {type: String}
});

mongoose.model('User', UserSchema);
var User = require('mongoose').model('User');

var app = express();
// set the view engine to use handlebars
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

app.use(express.static(__dirname + '/public'));
//rest API requirements
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization ");
  next();
});

//middleware for create
var createUser = function (req, res, next) {
  var user = new User(req.body);

  user.save(function (err) {
    if (err) {
      next(err);
    } else {
      res.json(user);
    }
  });
};

var updateUser = function (req, res, next) {
  User.findByIdAndUpdate(req.body._id, req.body, {new: true}, function (err, user) {
    if (err) {
      next(err);
    } else {
      res.json(user);
    }
  });
};

var deleteUser = function (req, res, next) {
  req.user.remove(function (err) {
    if (err) {
      next(err);
    } else {
      res.json(req.user);
    }
  });
};

var getAllUsers = function (req, res, next) {
  User.find(function (err, users) {
    if (err) {
      next(err);
    } else {
      res.json(users);
    }
  });
};

var getOneUser = function (req, res) {
  res.json(req.user);
};

var getByIdUser = function (req, res, next, id) {
  User.findOne({_id: id}, function (err, user) {
    if (err) {
      next(err);
    } else {
      req.user = user;
      next();
    }
  });
};

router.route('/users')
  .post(createUser)
  .get(getAllUsers);

router.route('/users/:userId')
  .get(getOneUser)
  .put(updateUser)
  .delete(deleteUser);

router.param('userId', getByIdUser);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/v1', router);


app.get('/', function (req, res) {
  var content = fs.readFileSync("data/data.json");
//res.sendFile(path.join(__dirname+'/index.html'));
res.render('index');
  //res.sendFile(path.join(__dirname+'/index.html'));
});

app.get('/ajaxData', function (req, res) {
  var content = fs.readFileSync("data/data.json");
//res.sendFile(path.join(__dirname+'/index.html'));
 res.send(content);
  //res.sendFile(path.join(__dirname+'/index.html'));
});

app.listen(3000);
module.exports = app;
