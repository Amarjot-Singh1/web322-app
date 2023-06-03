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
