const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();


app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const userExists = users.some(user => user.username === username)


  if (!userExists) {
    return response.status(404).json({ message: 'User does not exist' })
  }

  request.username = username

  next()

}

app.post('/users', (request, response) => {
  const id = uuidv4()
  const { name, username } = request.body
  const newUser = {
    id,
    name,
    username,
    todos: []
  }

  const userAlreadyExists = users.some(user => user.username === username)

  if (userAlreadyExists) {
    return response.status(404).json({ message: 'User already exists' })
  }
  users.push(newUser)

  return response.status(201).json({ message: `Novo usuário criado ${username}` })
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request

  const user = users.filter(user => user.username === username)

  const todos = user[0].todos

  return response.status(201).json(todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { taskTitle, deadline } = request.body
  const { username } = request

  const user = users.find(user => user.username === username)

  const newTask = {
    id: uuidv4(),
    title: taskTitle,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newTask)

  return response.status(201).json({ message: 'Nova task criada ' })

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { deadline, title } = request.body
  const { username } = request
  const { id } = request.params
  const user = users.find(user => user.username === username)

  const task = user.todos.find(todo => todo.id === id)

  if (deadline) {
    task.deadline = new Date(deadline)

  }
  if (title) {
    task.title = title
  }
  console.log(task)

  return response.status(200).json({ Message: `Task Updated: ${task}` })


});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request
  const { id } = request.params
  const user = users.find(user => user.username === username)

  const task = user.todos.find(todo => todo.id === id)

  task.done = !task.done
  return response.status(200).json({ Message: `Task Switched: ${task}` })
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request
  const { id } = request.params
  const user = users.find(user => user.username === username)

  const taskId = user.todos.findIndex(todo => todo.id === id)

  user.todos.splice(taskId, 1)

  return response.status(200).json({ message: 'Task deleted' })


});

module.exports = app;