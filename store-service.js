const fs = require('fs');
let items = [];
let categories = [];

// Initialize function
function initialize() {
    return new Promise((resolve, reject) => {
        fs.readFile('./data/items.json', 'utf8', (err, data) => {
            if (err) {
                reject("Unable to read items file");
            } else {
                items = JSON.parse(data);
                fs.readFile('./data/categories.json', 'utf8', (err, data) => {
                    if (err) {
                        reject("Unable to read categories file");
                    } else {
                        categories = JSON.parse(data);
                        resolve();
                    }
                });
            }
        });
    });
}

// getAllItems function
function getAllItems() {
    return new Promise((resolve, reject) => {
        if (items.length === 0) {
            reject("No items found");
        } else {
            resolve(items);
        }
    });
}

// getPublishedItems function
function getPublishedItems() {
    return new Promise((resolve, reject) => {
        const publishedItems = items.filter(item => item.published === true);
        if (publishedItems.length === 0) {
            reject("No published items found");
        } else {
            resolve(publishedItems);
        }
    });
}

// getCategories function
function getCategories() {
    return new Promise((resolve, reject) => {
        if (categories.length === 0) {
            reject("No categories found");
        } else {
            resolve(categories);
        }
    });
}

// addItem function
function addItem(itemData) {
  return new Promise((resolve, reject) => {
    itemData.published = itemData.published !== undefined ? true : false;
    itemData.id = items.length + 1;
    items.push(itemData);
    resolve(itemData);
  });
}

// getItemsByCategory function
const getItemsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        let filteredItems = items.filter(item => item.category === category);
        resolve(filteredItems);
    });
};

// getItemsByMinDate function
const getItemsByMinDate = (minDateStr) => {
    return new Promise((resolve, reject) => {
        let minDate = new Date(minDateStr);
        let filteredItems = items.filter(item => new Date(item.postDate) >= minDate);
        resolve(filteredItems);
    });
};

// getItemById function
const getItemById = (id) => {
    return new Promise((resolve, reject) => {
        let item = items.find(item => item.id === id);
        if (item) {
            resolve(item);
        } else {
            reject(`No item found with id: ${id}`);
        }
    });
};

module.exports = {
    initialize,
    getAllItems,
    getPublishedItems,
    getCategories,
    addItem,
    getItemsByCategory,
    getItemsByMinDate,
    getItemById
};
