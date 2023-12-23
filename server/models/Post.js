const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const postSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    topic: {
        type: String,
        required: true,
    },
    body: {
        type: String, 
        required: true
    },
    desc: {
        type: String, 
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    tags: {
        type: Array
    }
});

module.exports = mongoose.model('Post', postSchema);