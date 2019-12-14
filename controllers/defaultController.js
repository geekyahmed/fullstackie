const Post = require("../models/PostModel").Post;
const Category = require("../models/CategoryModel").Category;
const Comment = require("../models/CommentModel").Comment;
const bcrypt = require("bcryptjs");
const User = require("../models/UserModel").User;
const Like = require("../models/LikeModel").Like;
const Swal = require("sweetalert2");

module.exports = {
  index: async (req, res) => {
    const posts = await Post.find();
    const categories = await Category.find();
    res.render("default/index", { posts: posts, categories: categories });
  },
  user: async (req, res) => {
    const users = await User.find();
    const posts = await Post.find();
    res.render("default/users", {
      users: users,
      posts: posts
    });
  },

  /* LOGIN ROUTES */
  loginGet: (req, res) => {
    res.render("default/login", { message: req.flash("error") });
  },

  loginPost: (req, res) => {},

  /* REGISTER ROUTES*/

  registerGet: (req, res) => {
    res.render("default/register");
  },

  registerPost: (req, res) => {
    let errors = [];

    if (!req.body.username) {
      errors.push({ message: "First name is mandatory" });
    }
    if (!req.body.fullname) {
      errors.push({ message: "Last name is mandatory" });
    }
    if (!req.body.email) {
      errors.push({ message: "Email field is mandatory" });
    }
    if (!req.body.password || !req.body.passwordConfirm) {
      errors.push({ message: "Password field is mandatory" });
    }
    if (req.body.password !== req.body.passwordConfirm) {
      errors.push({ message: "Passwords do not match" });
    }

    if (errors.length > 0) {
      res.render("default/register", {
        errors: errors,
        fullname: req.body.fullname,
        username: req.body.lastName,
        email: req.body.email
      });
    } else {
      User.findOne({ email: req.body.email }).then(user => {
        if (user) {
          Swal.fire("Hello world!");
          res.redirect("/login");
        } else {
          const newUser = new User(req.body);

          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              newUser.password = hash;
              newUser.save().then(user => {
                req.flash("success-message", "You are now registered");
                res.redirect("/login");
              });
            });
          });
        }
      });
    }
  },

  getSinglePost: (req, res) => {
    const id = req.params.id;

    Post.findById(id)
      .populate({
        path: "comments",
        populate: { path: "user", model: "user" },
        populate: { path: "category", model: "category" }
      })
      .then(post => {
        if (!post) {
          res.status(404).json({ message: "No Post Found" });
        } else {
          res.render("default/singlePost", {
            post: post,
            comments: post.comments
          });
        }
      });
  },

  getUserPage: (req, res) => {
    const id = req.params.id;

    User.findById(id)
      .populate({
        path: "posts",
        populate: { path: "user", model: "user" }
      })
      .then(user => {
        if (!user) {
          res.status(404).json({ message: "No User Found" });
        } else {
          res.render("default/userPage", {
            user: user
          });
        }
      });
  },
  submitComment: (req, res) => {
    if (req.user) {
      Post.findById(req.body.id).then(post => {
        const newComment = new Comment({
          user: req.user.id,
          body: req.body.comment_body
        });

        post.comments.push(newComment);
        post.save().then(() => {
          newComment.save(newComment).then(() => {
            req.flash("success-message", "Your comment was submitted .");
            res.redirect(`/post/${post._id}`);
          });
        });
      });
    } else {
      req.flash("error-message", "Login first to comment");
      res.redirect("/login");
    }
  },
  likePost: (req, res) => {
    if (req.user) {
      Post.findById(req.body.id).then(post => {
        const newLike = new Like({
          user: req.user.id,
          like: req.body.likebody
        });

        post.likes.push(newLike);
        post.save().then(savedPost => {
          newLike.save().then(savedLike => {
            req.flash("success-message", "Your Like was submitted .");
            res.redirect(`/post/${post.id}`);
          });
        });
      });
    } else {
      req.flash("error-message", "Login first to like");
      res.redirect("/login");
    }
  }
};
