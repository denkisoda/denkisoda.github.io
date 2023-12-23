const express = require('express');
const router = express.Router();
const Post = require('../models/Post')

// Routes

// GET Homepage
router.get('', async (req, res) => {
    
    const locals = {
        title:  "Denki-Log",
        description: "DenkiSoda's Blog."
    }

    try {
        const data = await Post.find(); // find all posts
        res.render('index', {
            locals, 
            data,
            currentRoute: '/',
        });
    } catch (error) {
        console.log(error);
    }

});

// GET Post with id
router.get('/post/:id', async (req, res) => {

    try {
        let slug = req.params.id;

        const data = await Post.findById({ _id: slug });

        const locals = {
            title: "Denki-Log",
        }

        res.render('post', {
            locals, 
            data,
            currentRoute: `/post/${slug}`
        });
    } catch (error) {
        console.log(error);
    }

});

// GET search with pagination
router.get('/search', async (req, res) => {

    try {
        const locals = {
            title:  "Search Blog",
        }

        let searchTerm = req.query.searchTerm;
        const searchTermCleaned = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "")

        let itemsPerPage = 10;
        let page = req.query.page || 1;

        const searchPipeline = [
            {
                $match: {
                    $or: [
                    { title: { $regex: new RegExp(searchTermCleaned, 'i') } },
                    { body: { $regex: new RegExp(searchTermCleaned, 'i') } },
                    ],
                },
            },
            {
                $sort: {
                    createdAt: -1, // Sort by createdAt in descending order
                },
            },
        ];

        const data = await Post.aggregate(searchPipeline)
            .skip(itemsPerPage * page - itemsPerPage)
            .limit(itemsPerPage)
            .exec();
        
        const count = await Post.countDocuments();
        const nextPage = parseInt(page) + 1;
        const hasNextPage = nextPage <= Math.ceil(count / itemsPerPage);

        // const data = await Post.find({
        //     $or: [
        //         { title: { $regex: new RegExp(searchTermCleaned, 'i') }},
        //         { body: { $regex: new RegExp(searchTermCleaned, 'i') }}
        //     ]
        // })

        res.render("searchResult", {
            data,
            locals,
            searchTerm,
            current: page,
            nextPage: hasNextPage ? nextPage : null,
            currentRoute: '/search',
        });

    } catch (error) {
        console.log(error);
    }

});


router.get('/about', (req, res) => {
    res.render('about', {
        currentRoute: '/about'
    });
});


module.exports = router;