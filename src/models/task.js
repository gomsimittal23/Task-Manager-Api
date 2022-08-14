const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'      //we are creating a reference to User model to display info about owner of task
    }
}, {
    timestamps: true //adding time at which task was created and updated
})

const Task = mongoose.model('Task', taskSchema)

module.exports = Task