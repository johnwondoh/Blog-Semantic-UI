
var express           = require("express"),
    app               = express(),
    mongoose          = require("mongoose"),
    bodyParser        = require("body-parser"),
    methodOverride    = require("method-override"),
    expressSanitizer  = require("express-sanitizer");
// method overy  

        /*============================
                  APP CONFIG 
        =============================*/
mongoose.connect("mongodb://localhost/restful_blog_app");
app.set('view engine', 'ejs');
app.use(express.static('public'));
// It helps express to know that we are using .css file 
//that is kept in public directory.Without this command, 
//it won't be able to retrieve css file instead it will look 
//up for views directory(where ejs files are kept) only  
//and will not recognise css file.
app.use(bodyParser.urlencoded({extended: true})); 
app.use(methodOverride("_method"));
// method ovrride is required to override form methods in html files, 
// since forms cannot specify PUT and DELETE methods. This is therefore 
// delegated to the action of the form, added at the end of the action 
// attribute value is action =" something here ?_method=PUT" for example. 
//  What ever is specified for the method attribute will then be overritten. 
app.use(expressSanitizer());
// Only condition for this (express sanitizer) is that it is place after the body parser. 
// This is to ensure that user are not able to write scripts in input field tags to run.
// Used mainly in create and update routes.....

    /*==============================
          MONGOOSE/MODEL CONFIG
    ================================*/
var blogSchema = new mongoose.Schema({
    name: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now} //sets the data a blog is created to now
});
var Blog = mongoose.model("Blog", blogSchema);

/*=======================
          ROUTES
========================*/
app.get('/', function(req, res) {
    res.redirect('/blogs');
});

// INDEX route
app.get('/blogs', function(req, res){
    Blog.find({}, function(err, blogs){
        if(err){
            console.log(err);
        } else {
            res.render('index', {blogs : blogs});
        }
    });
}); 

// NEW route
app.get('/blogs/new', function(req, res) {
     res.render('new');
});

//CREATE route
app.post('/blogs', function(req, res){
    var newblog = req.body.blog;
    newblog.body = req.sanitize(newblog.body); 
    Blog.create(newblog, function(err, createdblog){
        if(err){
            res.render('new');
        } else {
            res.redirect('/blogs');
        }
    });
});

// SHOW route
app.get('/blogs/:id', function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect('/blogs');
        } else {
            res.render('show', {blog: foundBlog});
        }
    });
});

// EDIT route
app.get('/blogs/:id/edit', function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect('/blogs');
        } else {
            res.render('edit', {blog:foundBlog});
        }
    });
}); 

// UPDATE route
app.put('/blogs/:id', function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
   Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
       if(err){
           res.render('/blogs');
       } else {
           res.redirect('/blogs/'+ req.params.id);
       }
   });
});

//DELETE route
app.delete('/blogs/:id', function(req, res){
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect('/blogs');
        } else {
            res.redirect('/blogs');
        }
    });
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log('RESTful Blog App Server has Started...');
});