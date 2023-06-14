/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Amarjot Singh Student ID: 172521213  Date: 2/06/2023
*
*  Online (Cyclic) Link: https://bright-scarf-newt.cyclic.app/about
*
********************************************************************************/ 


const express = require('express');
const path = require('path');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

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
    const category = req.query.category;
    const minDate = req.query.minDate;

    if (category) {
        // Filter by category
        storeService.getItemsByCategory(category)
            .then(items => res.json(items))
            .catch(err => res.status(500).json({ message: err }));
    } else if (minDate) {
        // Filter by minDate
        storeService.getItemsByMinDate(minDate)
            .then(items => res.json(items))
            .catch(err => res.status(500).json({ message: err }));
    } else {
        // No filter, return all items
        storeService.getAllItems()
            .then(items => res.json(items))
            .catch(err => res.status(500).json({ message: err }));
    }
});

// Adding the /item/value route
app.get('/item/:id', (req, res) => {
    const itemId = req.params.id;
  
    storeService.getItemById(itemId)
        .then(item => {
            if (item) {
                res.json(item);
            } else {
                res.status(404).json({ message: 'Item not found' });
            }
        })
        .catch(err => res.status(500).json({ message: err }));
});


// Adding the /categories route
app.get('/categories', (req, res) => {
    storeService.getCategories()
        .then(categories => res.json(categories))
        .catch(err => res.status(500).json({message: err}));
});

// Adding the /items/add route
app.get('/items/add', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/addItem.html'));
});


// Handling 404
app.use((req, res) => {
    res.status(404).send('Page Not Found');
});

// Set cloudinary config
cloudinary.config({
    cloud_name: 'dwnzbw471',
    api_key: '158811645749647',
    api_secret: 'LMciiQzzOGcGzFaSB_MASfgVFMI',
    secure: true
});

// Create upload variable without disk storage
const upload = multer();

// Adding the /items/add route with upload middleware
app.post('/items/add', upload.single('featureImage'), (req, res) => {
    if (req.file) {
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

        upload(req)
            .then((uploaded) => {
                processItem(uploaded.url, req.body);
            })
            .catch((error) => {
                console.error('Failed to upload file:', error);
                processItem('', req.body);
            });
    } else {
        processItem('', req.body);
    }
});

function processItem(imageUrl, itemData) {
    itemData.featureImage = imageUrl;

    //Process the itemData and add it as a new Item before redirecting to /items

    storeService.addItem(itemData)
    .then(() => {
        res.status(200).send('Item added successfully');
    })
    .catch((err) => {
        console.error('Failed to add item:', err);
        res.status(500).send('Failed to add item');
    });
}

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
