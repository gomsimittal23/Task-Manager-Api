const express = require('express');
require('./db/mongoose.js');
const userRouter = require('./routers/user.js');
const taskRouter = require('./routers/task.js');

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
    console.log('Server running on port ' + port);
})

// const Task = require('./models/task.js');
// const User = require('./models/user.js');

// const main = async() => {
//     // const task = await Task.findById('62f511009e5d0fed125125d3');
//     // // console.log(task.owner);
//     // //task.populate('owner').execPopulate is not supported
//     // await task.populate('owner') //it makes the owner as the user object from id
//     // console.log(task.owner)

//     const user = await User.findById('62f50f7b9b43fb1c8f3a856f');
//     await user.populate('tasks')
//     console.log(user.tasks);
// }
// main()


// const pet = {
//     name: 'Slavier'
// }
// pet.toJSON = function(){
//     console.log(this);
//     return this;
// }
// console.log(JSON.stringify(pet));

// const jwt = require('jsonwebtoken');

// const myFunc = async () => {
//     const token = jwt.sign({ _id: 'myid123' }, 'mynewjwtsecret', {expiresIn: '20 seconds'});
//     console.log(token);

//     const data = jwt.verify(token, 'mynewjwtsecret');
//     console.log(data);
// }

// myFunc();