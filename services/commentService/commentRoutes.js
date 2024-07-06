const express = require("express");
const router = express.Router();
const commentController = require("./commentController.js");
const { auth } = require("../../middleware/auth.js");

router.post("/", auth, commentController.createComment);
router.put("/like", auth, commentController.likeComment);
router.put(
  "/:id",
  auth,
  commentController.userAllowed,
  commentController.updateComment
);
router.delete(
  "/:id",
  auth,
  commentController.userAllowed,
  commentController.deleteComment
);

router.get("/", commentController.getCommentsForPost);

module.exports = router;
