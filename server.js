/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Amarjot Singh Student ID: 172521213  Date: 16/06/2023
*
*  Online (Cyclic) Link: https://fierce-tweed-jacket-deer.cyclic.app
*
********************************************************************************/ 


const express = require('express');
const path = require('path');
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({ 
  cloud_name: 'dwnzbw471', 
  api_key: '158811645749647', 
  api_secret: 'LMciiQzzOGcGzFaSB_MASfgVFMI', 
  secure: true
});

const upload = multer(); 
const app = express();
const storeService = require('./store-service');

const PORT = process.env.PORT || 8080;

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect('/about');
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/about.html'));
});

// Adding the /shop route
app.get('/shop', (req, res) => {
    storeService.getPublishedItems()
        .then(items => res.json(items))
        .catch(err => res.status(500).json({message: err}));
});

// Adding the /items route
app.get('/items', (req, res) => {
    storeService.getAllItems()
        .then(items => res.json(items))
        .catch(err => res.status(500).json({message: err}));
});

// Adding the /categories route
app.get('/categories', (req, res) => {
    storeService.getCategories()
        .then(categories => res.json(categories))
        .catch(err => res.status(500).json({message: err}));
});

// Adding the /addItem route
app.get('/items/add', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/addItem.html'));
});

// Add the '/items/add' route to handle file upload and item creation
app.post('/items/add', upload.single("featureImage"), (req, res) => {
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
  app.get('/items', (req, res) => {
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
  app.get('/item/:id', (req, res) => {
      storeService.getItemById(req.params.id)
          .then(item => res.json(item))
          .catch(err => res.status(404).json({message: err}));
  });
  

// Handling 404
app.use((req, res) => {
    res.status(404).send('Page Not Found');
});

// Initialize the store service and then start the server
storeService.initialize()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Express http server listening on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error("Failed to initialize store service:", err);
    });
