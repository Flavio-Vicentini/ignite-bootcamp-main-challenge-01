const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers
  const user = users.find(user => user.username === username);
  if (!user){
    return response.status(401).json({error: "User not found."});
  }
  request.user = user
  next()
}
function checksExistsToDoId(request, response, next) {
  const {id} = request.params
  const user = request.user

  const checkToDoExists = user.todos.find(todo => todo.id === id)
  if (!checkToDoExists){
    return response.status(404).json ({error:"Todo doesn't exists"})
  }
  request.todo = checkToDoExists
  next()
}

app.post('/users', (request, response) => {
  const {name, username} = request.body
  
  const userAlreadyExists = users.some(user => user.username === username);
  if(userAlreadyExists){
    return response.status(400).json({error: "Username already exists."})
  }
  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  users.push(user)
  return response.status(201).send(user)

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user
  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body
  const user = request.user
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  user.todos.push(todo)
  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount,checksExistsToDoId, (request, response) => {
  const toDo = request.todo
  const {title, deadline} = request.body   
  toDo.title = title,
  toDo.deadline = new Date (deadline)
  return response.json(toDo)
});

app.patch('/todos/:id/done', checksExistsUserAccount,checksExistsToDoId, (request, response) => {
  const toDo = request.todo
  toDo.done = true
  return response.send(toDo)
});

app.delete('/todos/:id', checksExistsUserAccount,checksExistsToDoId, (request, response) => {
  const toDo = request.todo
  const user = request.user
  user.todos.splice(toDo, 1)
  return response.status(204).send()
});

module.exports = app;