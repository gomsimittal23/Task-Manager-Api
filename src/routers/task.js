const express = require('express');
const router = new express.Router();
const Task = require('../models/task.js');
const auth = require('../middleware/auth.js');

router.post('/tasks', auth, async (req, res) => {
    // const task = new Task(req.body);

    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try {
        await task.save();
        res.status(201).send(task);
    } catch (error) {
        res.status(400).send(error);
    }
})

//GET /tasks?completed=true
//GET /tasks?limit=2&skip=4     this means we will skip 4 elements and land on third page
//GET /tasks?sortBy=createdAt:desc   
router.get('/tasks', auth, async(req, res) => {
    const match = {};
    const sort = {};

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    if(req.query.completed){
        match.completed = req.query.completed === 'true';
    }

    try {
        //const tasks = await Task.find({owner: req.user._id});
        //or
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        });
        res.send(req.user.tasks);
    } catch (error) {
        res.status(500).send(error);
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;
    
    try {
        // const task = await Task.findById({_id});
        //only view the task created by the owner
        const task = await Task.findOne({_id, owner: req.user._id});
        if(!task){
            return res.status(404).send();
        }
        res.send(task);
    } catch (error) {
        res.status(500).send(error);
    }
})

router.patch('/tasks/:id', auth, async(req, res) => {
    const updates = Object.keys(req.body)
    const validUpdates = ['description', 'completed'];
    const isValidUpdate = updates.every((update) => {
        return validUpdates.includes(update);
    })

    if(!isValidUpdate){
        return res.status(400).send('error: Update not allowed');
    }

    try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id});
        // const user = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    
        if(!task){
            return res.status(404).send();
        }
        updates.forEach((update) => task[update] = req.body[update]);
        await task.save();

        res.send(task);
    } catch (error) {
        res.status(400).send(error);
    }

})

router.delete('/tasks/:id', auth, async(req, res) => {
    try {
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id});

        if(!task){
            return res.status(404).send(); //not found
        }
        res.send(task);
    } catch (error) {
        res.status(500).send()
    }
})

module.exports = router