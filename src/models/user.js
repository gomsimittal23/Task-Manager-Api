const mongoose = require('mongoose');
const validator = require('validator');
const brcypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task.js');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Please enter a valid email!'); 
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('Password should not contain "password"');
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value){
            if(value < 0){
                throw new Error('Age cannot be negative!');
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true  //adding time at which user was created and updated
});

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

//hiding the data that we send to client
//express uses JSON.stringify method before sending data, so toJSON() method gets called automatically 
userSchema.methods.toJSON = function(){
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;
    return userObject;
}

//methods is used for individual user 
userSchema.methods.generateAuthToken = async function() {
    const user = this;
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET )

    user.tokens = user.tokens.concat({token: token});
    await user.save();
    
    return token;
}

//statics is used for User model
userSchema.statics.findByCredentials = async(email, password) => {
    const user = await User.findOne({email});

    if(!user){
        throw new Error('Unable to login!');
    }

    const isMatch = brcypt.compare(password, user.password);
    
    if(!isMatch){
        throw new Error('Unable to login!');
    }

    return user;
}

//hashing password before saving
userSchema.pre('save', async function(next) {
    const user = this;

    if(user.isModified('password')){
        user.password = await brcypt.hash(user.password, 8);
    }

    next();
})

//deleting all tasks of users before deleting the user
userSchema.pre('remove', async function(next) {
    const user = this;

    await Task.deleteMany({owner: user._id});
    next();
})

const User = mongoose.model('User', userSchema)

module.exports = User