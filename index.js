const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const env = require('dotenv')
env.config();
const PORT = process.env.PORT || 3000;
// Import routes
const userRoutes = require('./services/userService/userRoutes');
const postRoutes = require('./services/postService/postRoutes');
const commentRoutes = require('./services/commentService/commentRoutes');


app.use(bodyParser.json());

// Use routes
app.use('/user', userRoutes);
app.use('/post', postRoutes);
app.use('/comment', commentRoutes);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
