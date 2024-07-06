const db = require("./../../models/index").db;

const createPost = async (req, res) => {
  const { text, image_url, tags } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO posts (text, image_url, tags, user_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [text, image_url, tags, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updatePost = async (req, res) => {
  const postId = req.params.id;
  const { text, image_url, tags } = req.body;
  try {
    const result = await db.query(
      "UPDATE posts SET text = $1, image_url = $2, tags = $3 WHERE id = $4 RETURNING *",
      [text, image_url, tags, postId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deletePost = async (req, res) => {
  const postId = req.params.id;
  try {
    const result = await db.query(
      "DELETE FROM posts WHERE id = $1 RETURNING *",
      [postId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getPostsByTags = async (req, res) => {
  const { tags } = req.query;
  try {
    const tagList = tags.split(",").map((tag) => tag.trim());
    const queryText = `
      SELECT * 
      FROM posts 
      WHERE tags && $1::text[]
    `;
    const result = await db.query(queryText, [tagList]);
    res.json(result.rows);
  } catch (error) {
    console.error("Error retrieving posts by tags:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getDiscussionsByText = async (req, res) => {
  const { text } = req.query;
  try {
    const result = await db.query("SELECT * FROM posts WHERE text ILIKE $1", [
      `%${text}%`,
    ]);
    res.json(result.rows);
  } catch (error) {
    console.error("Error retrieving discussions by text:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const userAllowed = async (req, res, next) => {
  const postId = req.params.id;
  const userId = req.user.id;
  try {
    const post = await db.query("SELECT id, user_id FROM posts WHERE id=$1", [
      postId,
    ]);
    if (post.rows.length > 0) {
      const postUserId = post.rows[0].user_id;
      if (postUserId == userId) {
        next();
      } else {
        res.status(401).json({ error: "User not allowed" });
      }
    } else {
      res.status(401).json({ error: "post not found" });
    }
  } catch (error) {
    console.error("Error retrieving discussions", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const incrementPostViews = async (postId) => {
  try {
    await db.query("UPDATE posts SET views = views + 1 WHERE id = $1", [
      postId,
    ]);
  } catch (error) {
    console.error("Error incrementing post views:", error);
  }
};

const getPostById = async (req, res) => {
  const postId = req.params.id;
  try {
    await incrementPostViews(postId);

    const result = await db.query("SELECT * FROM posts WHERE id = $1", [
      postId,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error retrieving post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const likePost = async (req, res) => {
    const postId = req.query.postId;
  
    try {
      const result = await db.query('UPDATE posts SET likes = likes + 1 WHERE id = $1 RETURNING *',
        [postId]
      );
  
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }
  
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error liking post:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

module.exports = {
  createPost,
  updatePost,
  deletePost,
  getPostsByTags,
  getDiscussionsByText,
  userAllowed,
  getPostById,
  likePost
};
