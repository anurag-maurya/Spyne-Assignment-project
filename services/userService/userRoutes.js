const express = require('express');
const router = express.Router();
const userController = require('./userController.js');
const { auth } = require('../../middleware/auth.js');

router.get('/search', userController.searchUserByName);
router.post('/', userController.createUser);
router.post('/signin', userController.signIn);
router.put('/:id', auth, userController.updateUser);
router.delete('/', auth, userController.deleteUser);
router.get('/:id', userController.getUserById);
router.get('/', userController.getAllUsers);

// router.post('/:id/follow', auth, userController.followUser);
// router.post('/:id/unfollow',auth, userController.unfollowUser);

module.exports = router;
