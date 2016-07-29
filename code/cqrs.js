var express = require('express');
var bodyParser = require('body-parser');
var unirest = require('unirest');
var uuid = require('node-uuid');
require('should');

class TodoQueryService{
  constructor(database){
    this.databasee = database;
  }

  getById(id, callback){
    let todo = this.database[id];
    if (todo === undefined){
      callback(new Error('cannot find todo'));
    }else{
      callback(undefined, todo);
    }
  }
}

class CreateTodoCommand{
  constructor(item){
    this.item = item;
  } 
}

class CreateTodoCommandHandler{
  constructor(database){
    this.database = database;
  } 

  handle(command, callback){
      var id = uuid.v4();
      var data = command;
      data.id = id;
      this.database[id] = data;
      callback(undefined, {id : id});
  }
}

class TodoCommandService{
  constructor(database){
    this.database = database;
    this.handlers = {};
    this.handlers['CreateTodoCommand'] = new CreateTodoCommandHandler(this.database);
  }

  handle(command, callback){
    let handler = this.handlers[command.constructor.name];
    handler.handle(command, callback);
  }
}

describe('cqrs', () => {

  it('Logically separate handlers in the same process', (done) => {
    var database = {};
    var queryService = new TodoQueryService(database);
    var commandService = new TodoCommandService(database);
    var app = express();

    app.use(bodyParser.json())

    app.get('/todos/:id', (req, res) => {
      queryService.getById(req.params.id, (err, result) => {
        res.json(result);
      });
    });

    app.post('/todos', (req, res) => {
      var command = new CreateTodoCommand(req.body);
      commandService.handle(command, (err, result) => {
        res.status(201).location(`http://localhost:3000/todos/${result.id}`).end();;
      })
    });

    var server = require('http').createServer(app);
    server.listen(3000, function() {
      unirest.post('http://localhost:3000/todos')
        .type('json')
        .send({
          item: 'get the milk',
        })
        .end((response) => {
          var newTodoLocation = response.headers.location;
          response.status.should.equal(201);

          unirest.get(newTodoLocation)
            .end((response) => {
              response.body.item.should.eql('get the milk');
            })

          server.close(done);
        })
    })
  })

})
