const db = require("./../../models/index").db;

exports.createComment = async (req, res) => {
  const { postId, text } = req.body;
  const userId = req.user.id;
  try {
    const result = await db.query(
      "INSERT INTO comments (post_id, comment_by, text) VALUES ($1, $2, $3) RETURNING *",
      [postId, userId, text]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getCommentsForPost = async (req, res) => {
  const postId = req.query.postId;
  try {
    const result = await db.query("SELECT * FROM comments WHERE post_id = $1", [
      postId,
    ]);
    res.json(result.rows);
  } catch (error) {
    console.error("Error retrieving comments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteComment = async (req, res) => {
  const commentId = req.params.id;
  try {
    const query = {
      text: "DELETE FROM comments WHERE id = $1 RETURNING *",
      values: [commentId],
    };
    const result = await db.query(
      "DELETE FROM comments WHERE id = $1 RETURNING *",
      [commentId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Comment not found" });
    }
    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateComment = async (req, res) => {
  const commentId = req.params.id;
  const { text } = req.body;
  try {
    const result = await db.query(
      "UPDATE comments SET text = $1 WHERE id = $2 RETURNING *",
      [text, commentId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Comment not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.userAllowed = async (req, res, next) => {
  const commentId = req.params.id;
  const userId = req.user.id;
  try {
    const comment = await db.query(
      "SELECT id, comment_by FROM comments WHERE id=$1",
      [commentId]
    );
    if (comment.rows.length > 0) {
      const commentUserId = comment.rows[0].comment_by;
      if (commentUserId == userId) {
        next();
      } else {
        res.status(401).json({ error: "User not allowed" });
      }
    } else {
      res.status(401).json({ error: "comment not found" });
    }
  } catch (error) {
    console.error("Error retrieving comment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.likeComment = async (req, res) => {
  const commentId = req.query.commentId;

  try {
    const result = await db.query(
      "UPDATE comments SET likes = likes + 1 WHERE id = $1 RETURNING *",
      [commentId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Comment not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error liking comment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
