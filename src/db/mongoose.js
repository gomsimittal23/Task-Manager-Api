const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    //below option not supported
    // useCreateIndex: true 
})


// const myTask = new Task({
//     description: '   solve leetcode   ',
//     completed: true
// })

// myTask.save().then(() => console.log(myTask))
// .catch((error) => {
//     console.log('Error', error);
// })