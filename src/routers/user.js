const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const router = new express.Router();
const User = require('../models/user.js');
const auth = require('../middleware/auth.js');
const { sendWelcomeMail, sendGoodbyeMail } = require('../emails/account.js')

//signup new user
router.post('/users', async (req, res) => {
    const user = new User(req.body);

    // user.save().then(() => {
    //     res.status(201).send(user);
    // }).catch((e) => {
    //     res.status(400).send(e);
    // })

    try {
        await user.save();
        sendWelcomeMail(user.email, user.name)
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    } catch (error) {
        res.status(400).send(error);
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);

        const token = await user.generateAuthToken();
        res.send({user, token});
    } catch (e) {
        res.status(400).send();
    }
})

//uploading profile image
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload an image under 1MB size'))
        }
        cb(undefined, true);
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    //req.user.avatar = req.file.buffer;
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

//deleting user avatar
router.delete('/users/me/avatar', auth, async(req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
})

//getting the avatar of user
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if(!user || !user.avatar){
            return new Error();
        }
        res.set('Content-Type', 'image/png');
        res.send(user.avatar);
    } catch (error) {
        res.status(404).send();
    }
})

//getting individual profile
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
})

router.post('/users/logout', auth, async(req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((tokenObj) => {
            return req.token !== tokenObj.token;
        });

        await req.user.save();
        res.send();
    } catch (error) {
        res.status(500).send();
    }
})

router.post('/users/logoutAll', auth, async(req, res) => {
    try {
        req.user.tokens = [];

        await req.user.save();
        res.send();
    } catch (error) {
        res.status(500).send();
    }
})

// router.get('/users', auth, async (req, res) => {
//     // User.find({}).then((users) => {
//     //     res.send(users);
//     // }).catch((e) => {
//     //     res.status(500).send(e);
//     // })

//     try {
//         const users = await User.find({});
//         res.send(users);
//     } catch (error) {
//         res.status(500).send(error);
//     }
// })

// router.get('/users/:id', async (req, res) => {
//     const _id = req.params.id;
    
//     // User.findById(_id).then((user) => {
//     //     if(!user){
//     //         return res.status(404).send()
//     //     }
//     //     res.send(user);
//     // }).catch((e) => {
//     //     res.status(500).send(e);
//     // })
//     try {
//         const user = await User.findById({_id});
//         if(!user){
//             return res.status(404).send();
//         }
//         res.send(user);
//     } catch (error) {
//         res.status(500).send(error);
//     }
// })

router.patch('/users/me', auth, async(req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdaes = ['name', 'email', 'password', 'age'];
    const isValidUpdate = updates.every((update) => {
        return allowedUpdaes.includes(update);
    })

    if(!isValidUpdate){
        return res.status(400).send('Update not allowed');
    }
    try {
        // const user = await User.findById(req.user._id);

        updates.forEach((update) => req.user[update] = req.body[update]);
        await req.user.save();

        // const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});

        // if(!user){
        //     return res.status(404).send();
        // }
        res.send(req.user);
    } catch (e) {
        res.status(400).send(e);
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        // const user = await User.findByIdAndDelete(req.user._id);

        // if(!user){
        //     return res.status(404).send(); //not found
        // }
        await req.user.remove();
        sendGoodbyeMail(req.user.email, req.user.name);
        res.send(req.user);
    } catch (error) {
        res.status(500).send();
    }
})


module.exports = router