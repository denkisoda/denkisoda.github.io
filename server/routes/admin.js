const express = require('express');
const router = express.Router();
const Post = require('../models/Post')
const User = require('../models/User')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;

// Check admin login
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;

    if(!token) {
        return res.status(401).json({ message: 'Unauthorized' });
        // res.render a 404 page
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId;
        next();
    } catch(error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

// GET admin login page
router.get('/admin', async (req, res) => {

    try {
        const locals = {
            title: 'Admin',
        }

        res.render('admin/admin_login', { 
            locals,
            layout: adminLayout 
        });
        
    } catch (error) {
        console.log(error);
    }
});

// POST admin login
router.post('/admin', async (req, res) => {

    try {

        const { username, password } = req.body;
        
        const user = await User.findOne( { username } );

        if(!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, jwtSecret );
        res.cookie('token', token, { httpOnly: true });

        res.redirect('/dashboard');

    } catch (error) {
        console.log(error);
    }
});



// GET admin dashboard
router.get('/dashboard', authMiddleware, async (req, res) => {

    try {
        const locals = {
            title: 'Admin Dashboard'
        };

        const data = await Post.find();
        res.render('admin/dashboard', {
            locals,
            data,
            layout: adminLayout
        });
    } catch (error) {
        console.log(error);
    }
});

// GET admin create new post
router.get('/add_post', authMiddleware, async (req, res) => {

    try {
        const locals = {
            title: 'Add Post'
        };

        res.render('admin/add_post', {
            locals,
            layout: adminLayout
        });
    } catch (error) {
        console.log(error);
    }
});

// POST admin create new post
router.post('/add_post', authMiddleware, async (req, res) => {

    try {
        const newPost = new Post({
            title: req.body.title,
            summary: req.body.summary,
            body: req.body.body,
            topic: req.body.topic,
            tags: req.body.tags,
        })
        await Post.create(newPost);

        res.redirect('/dashboard');

    } catch (error) {
        console.log(error);
    }
});

// GET admin edit post
router.get('/edit_post/:id', authMiddleware, async (req, res) => {

    try {
        const locals = {
            title: 'Edit Post'
        };

        const data = await Post.findOne({ _id: req.params.id });

        res.render('admin/edit_post', {
            locals,
            data,
            layout: adminLayout
        });
    } catch (error) {
        console.log(error);
    }
});

// PUT admin edit post
router.put('/edit_post/:id', authMiddleware, async (req, res) => {

    try {
        await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            summary: req.body.summary,
            body: req.body.body,
            topic: req.body.topic,
            tags: req.body.tags,
            updatedAt: Date.now(),
        });

        res.redirect(`/edit_post/${req.params.id}`);

    } catch (error) {
        console.log(error);
    }
});

// DELETE admin delete post
router.delete('/delete_post/:id', authMiddleware, async (req, res) => {
    try {
        await Post.deleteOne( { _id: req.params.id } );
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }
});

// GET admin logout, clear cookie
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});

// POST admin register
router.post('/register', async (req, res) => {

    try {

        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const user = await User.create({ username, password: hashedPassword });
            // res.status(201).json({ message: 'User Created', user });
        } catch (error) {
            if(error.code === 11000) {
                res.status(409).json({ message: 'Username already exists. '})
            }
            res.status(500).json({ message: 'Internal server error. '})
        }

    } catch (error) {
        console.log(error);
    }
});

module.exports = router;