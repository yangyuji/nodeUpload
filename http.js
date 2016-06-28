
var express = require('express')
  , path = require('path')
  , app = express()
  , logger = require('morgan')
  , bodyParser = require('body-parser');

var router = express.Router();
var config = {
    host: 'localhost',
    port: 8008
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'www')));
app.set('views', path.join(__dirname, 'www'));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '监控页面' });
});

app.listen(config.port, config.host, function() {
    console.log('Server start on ' + config.host + ':' + config.port);
});