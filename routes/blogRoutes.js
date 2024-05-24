const express = require('express');
const router = express.Router();
const upload=require('../middlewares/multer')
const blogController = require('../controllers/blogController');

router.get('/blogs', blogController.getAllBlogs);
router.get('/:id', blogController.getBlogById);
router.post('/blogs', upload.single('picture'), blogController.createBlog);
router.put('/blogs/:id',upload.single('picture'), blogController.updateBlog);
router.delete('/blogs/:id', blogController.deleteBlog);

module.exports = router;
