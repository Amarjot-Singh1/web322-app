/*********************************************************************************
*  WEB322 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Amarjot Singh Student ID: 172521213  Date: 08/07/2023
*
*  
*
********************************************************************************/ const clientSessions = require("client-sessions");
const express = require('express');
const path = require('path');
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const exphbs  = require('express-handlebars');
const storeService = require('./store-service');
const upload = multer(); 
const app = express();
const PORT = process.env.PORT || 8080;

cloudinary.config({ 
  cloud_name: 'dwnzbw471', 
  api_key: '158811645749647', 
  api_secret: 'LMciiQzzOGcGzFaSB_MASfgVFMI', 
  secure: true
});


// Middleware to get active route and category
app.use(function(req,res,next){
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});

app.use(clientSessions({
  cookieName: "session",  // this is the object name that will be added to 'req'
  secret: "some_long_random_string", // this should be a long un-guessable string.
  duration: 20 * 60 * 1000, // duration of the session in milliseconds (20 minutes here)
  activeDuration: 1000 * 60 * 5 // the session will be extended by this many ms each request (5 mins here)
}));

app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});


// Create an instance of the express-handlebars engine with custom helpers
const hbs = exphbs.create({
  // Specify helpers which are only registered on this instance.
  helpers: {
    navLink: function (url, options) {
      return (
        '<li class="nav-item"><a ' +
        (url == app.locals.activeRoute ? 'class="nav-link active"' : 'class="nav-link"') +
        ' href="' +
        url +
        '">' +
        options.fn(this) +
        '</a></li>'
      );
    },
    equal: function (lvalue, rvalue, options) {
      if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
      if (lvalue != rvalue) {
        return options.inverse(this);
      } else {
        return options.fn(this);
      }
    },
    formatDate: function(dateObj) {
      let year = dateObj.getFullYear();
      let month = (dateObj.getMonth() + 1).toString();
      let day = dateObj.getDate().toString();
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  },
  extname: '.hbs'
});

app.engine('.hbs', hbs.engine);

app.set('view engine', '.hbs');

app.use(express.static('public'));

app.use(express.urlencoded({extended: true})); // To support URL-encoded bodies

app.get('/', (req, res) => {
  res.redirect('main');
});


app.get('/about', (req, res) => {
    res.render('about');
});

// Adding the /shop route
app.get("/shop", async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};

  try {
      // declare empty array to hold "item" objects
      let items = [];

      // if there's a "category" query, filter the returned items by category
      if (req.query.category) {
          // Obtain the published "items" by category
          items = await storeService.getPublishedItemsByCategory(req.query.category);
      } else {
          // Obtain the published "items"
          items = await storeService.getPublishedItems();
      }

      // sort the published items by postDate
      items.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

      // get the latest post from the front of the list (element 0)
      let item = items[0];

      // store the "items" and "item" data in the viewData object (to be passed to the view)
      viewData.items = items;
      viewData.item = item;
  } catch (err) {
      viewData.message = "no results";
  }

  try {
      // Obtain the full list of "categories"
      let categories = await storeService.getCategories();

      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
  } catch (err) {
      viewData.categoriesMessage = "no results";
  }

  // render the "shop" view with all of the data (viewData)
  res.render("shop", { data: viewData });
});

app.get('/shop/:id', async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};

  try{
      // declare empty array to hold "item" objects
      let items = [];

      // if there's a "category" query, filter the returned posts by category
      if(req.query.category){
          // Obtain the published "items" by category
          items = await storeService.getPublishedItemsByCategory(req.query.category);
      } else {
          // Obtain the published "items"
          items = await storeService.getPublishedItems();
      }

      // sort the published items by postDate
      items.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

      // store the "items" data in the viewData object (to be passed to the view)
      viewData.items = items;

  } catch(err) {
      viewData.message = "no results";
  }

  try {
      // Obtain the item by "id"
      viewData.item = await storeService.getItemById(req.params.id);
  } catch(err) {
      viewData.message = "no results"; 
  }

  try {
      // Obtain the full list of "categories"
      let categories = await storeService.getCategories();

      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
  } catch(err) {
      viewData.categoriesMessage = "no results"
  }

  // render the "shop" view with all of the data (viewData)
  res.render("shop", {data: viewData})
});

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}

// Adding the /items route
app.get('/items', ensureLogin, (req, res) => {
  storeService.getAllItems()
    .then(items => {
      if(items.length > 0) {
        res.render("items", {items: items})
      } else {
        res.render("items", {message: "no results"});
      }
    })
    .catch(err => res.render("items", {message: "An error occurred."}));
});


// Adding the /categories route
app.get('/categories', ensureLogin, (req, res) => {
  storeService.getCategories()
    .then(categories => {
      if(categories.length > 0) {
        res.render("categories", {categories: categories})
      } else {
        res.render("categories", {message: "no results"});
      }
    })
    .catch(err => res.render("categories", {message: "An error occurred."}));
});

// Adding the /addItem route
app.get('/items/add', ensureLogin, (req, res) => {
  storeService.getCategories()
    .then(categories => {
      res.render('addItem', { categories });
    })
    .catch(err => {
      console.log(err);
      res.render('addItem', { categories: [] });
    });
});

// Add the '/items/add' route to handle file upload and item creation
app.post('/items/add', ensureLogin, upload.single("featureImage"), (req, res) => {
    if(req.file) {
      let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
          let stream = cloudinary.uploader.upload_stream(
            (error, result) => {
              if (result) {
                resolve(result);
              } else {
                reject(error);
              }
            }
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
      };
  
      async function upload(req) {
        let result = await streamUpload(req);
        console.log(result);
        return result;
      }
  
      upload(req).then((uploaded) => {
        processItem(uploaded.url);
      });
    } else {
      processItem("");
    }
  
    function processItem(imageUrl) {
      req.body.featureImage = imageUrl;
  
      storeService.addItem(req.body)
          .then(item => {
              res.redirect('/items');
          })
          .catch(error => {
              console.error(error);
              res.status(500).send("An error occurred while adding the item to the store.");
          });
    }
  });
  
  // Update '/items' route to support optional filters
  app.get('/items', ensureLogin, (req, res) => {
      if (req.query.category) {
          storeService.getItemsByCategory(req.query.category)
              .then(items => res.json(items))
              .catch(err => res.status(500).json({message: err}));
      } else if (req.query.minDate) {
          storeService.getItemsByMinDate(req.query.minDate)
              .then(items => res.json(items))
              .catch(err => res.status(500).json({message: err}));
      } else {
          storeService.getAllItems()
              .then(items => res.json(items))
              .catch(err => res.status(500).json({message: err}));
      }
  });
  
  // Add the '/item/value' route
  app.get('/item/:id', ensureLogin, (req, res) => {
      storeService.getItemById(req.params.id)
          .then(item => res.json(item))
          .catch(err => res.status(404).json({message: err}));
  });
  
// Use express.urlencoded middleware
app.use(express.urlencoded({extended: true}));

// GET route for /categories/add
app.get('/categories/add', ensureLogin, (req, res) => {
    res.render('addCategory');
});

// POST route for /categories/add
app.post('/categories/add', ensureLogin, (req, res) => {
    storeService.addCategory(req.body)
        .then(() => {
            res.redirect('/categories');
        })
        .catch(error => {
            console.error(error);
            res.status(500).send("An error occurred while adding the category.");
        });
});

// GET route for /categories/delete/:id
app.get('/categories/delete/:id', ensureLogin, (req, res) => {
    storeService.deleteCategoryById(req.params.id)
        .then(() => {
            res.redirect('/categories');
        })
        .catch(error => {
            console.error(error);
            res.status(500).send("Unable to Remove Category / Category not found");
        });
});

// GET route for /items/delete/:id
app.get('/items/delete/:id', ensureLogin, (req, res) => {
    storeService.deleteItemById(req.params.id)
        .then(() => {
            res.redirect('/items');
        })
        .catch(error => {
            console.error(error);
            res.status(500).send("Unable to Remove Item / Item not found");
        });
});  

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  authData.registerUser(req.body)
    .then(() => {
      res.render('register', {successMessage: "User created"});
    })
    .catch((err) => {
      res.render('register', {errorMessage: err     });
    });
    
    app.post('/login', (req, res) => {
      req.body.userAgent = req.get('User-Agent');
      authData.checkUser(req.body)
        .then((user) => {
          req.session.user = {
            username: user.username,
            email: user.email,
            loginHistory: user.loginHistory
          }
          res.redirect('/dashboard');
        })
        .catch((err) => {
          res.render('login', {errorMessage: err, userName: req.body.userName});
        });
    });
    
    app.get('/logout', (req, res) => {
      req.session.reset();
      res.redirect('/');
    });
    
    app.get('/userHistory', ensureLogin, (req, res) => {
      res.render('userHistory');
    });
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

// Handling 404
app.use((req, res) => {
  res.status(404).render('404');
});

// Initialize the store service and then start the server
storeService.initialize()
.then(authData.initialize) // add authData.initialize to the promise chain
.then(() => {
    app.listen(PORT, () => {
        console.log(`Express http server listening on port ${PORT}`);
    });
})
.catch(err => {
    console.error("Failed to initialize store service:", err);
});
