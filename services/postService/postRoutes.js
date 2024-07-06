const express = require('express');
const router = express.Router();
const postController = require('./postController.js');
const { auth } = require('../../middleware/auth.js');



router.post('/', auth, postController.createPost);
router.put('/like', auth, postController.likePost);
router.put('/:id', auth, postController.userAllowed, postController.updatePost);
router.delete('/:id', auth, postController.userAllowed, postController.deletePost);
router.get('/', postController.getPostsByTags);
router.get('/discussions', postController.getDiscussionsByText);
router.get('/:id', postController.getPostById);


module.exports = router;
