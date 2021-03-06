// Carrie Barrett
// CS 290

// start with setup code from lecture
var express = require('express');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 5358);

var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var session = require('express-session');
app.use(session({secret:'DoNotTell'}));

var request = require('request');

var path = require('path');
app.use(express.static(path.join(__dirname, '/public')));

var apiKey = "2a83a0b321985d7a305e91ce40ce86b0";

// basic to do list code from lecture
app.get('/',function(req,res,next){
  var context = {};
  //If there is no session, go to the main page.
  if(!req.session.name){
    res.render('newSession', context);
    return;
  }
  context.name = req.session.name;
  context.toDoCount = req.session.toDo.length || 0;
  context.toDo = req.session.toDo || [];
  console.log(context.toDo);
  res.render('toDo',context);
});

app.post('/',function(req,res){
  var context = {};

  if(req.body['New List']){
    req.session.name = req.body.name;
    req.session.toDo = [];
    req.session.curId = 0;
    res.render('toDo', context);
  }

  //If there is no session, go to the main page.
  if(!req.session.name){
    res.render('newSession', context);
    return;
  }

  if(req.body['Add Item']){
    req.session.curId++;
    request("https://api.openweathermap.org/data/2.5/weather?q=" + req.body.city + ",us&appid=" + apiKey, highlight);
    function highlight(err, response, body){
      if(!err && response.statusCode <400){
        context.owm = JSON.parse(body);
        console.log(context.owm);
        console.log(context.owm.main.temp);
        if((context.owm.main.temp - 271.15) > req.body.temp){
          var isTempOk = true;
        }
        else{
          var isTempOk = false;
        }

      req.session.toDo.push({"name":req.body.name, "id":req.session.curId, "city":req.body.city, "temp":req.body.temp, "tempOk":isTempOk});
      context.name = req.session.name;
      context.toDoCount = req.session.toDo.length;
      context.toDo = req.session.toDo;
      console.log(context.toDo);
      res.render('toDo',context);
      }
      else{
        console.log(err);
        if(response) {
          console.log(response.statusCode);
        }
        next(err);
      }
    }
  }

  if(req.body['Done']){
    req.session.toDo = req.session.toDo.filter(function(e){
      return e.id != req.body.id;
    })
    context.name = req.session.name;
    context.toDoCount = req.session.toDo.length;
    context.toDo = req.session.toDo;
    console.log(context.toDo);
    res.render('toDo', context);
  }

  context.name = req.session.name;
  context.toDoCount = req.session.toDo.length;
  context.toDo = req.session.toDo;
  console.log(context.toDo);

 
});

// setup code from lecture continues
app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});