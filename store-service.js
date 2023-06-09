const fs = require('fs');

let items = [];
let categories = [];

module.exports.initialize = function () {
  return new Promise((resolve, reject) => {
    fs.readFile('./data/items.json', 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        items = JSON.parse(data);

        fs.readFile('./data/categories.json', 'utf8', (err, data) => {
          if (err) {
            reject(err);
          } else {
            categories = JSON.parse(data);
            resolve();
          }
        });
      }
    });
  });
};



module.exports.getAllItems = function () {
  return new Promise((resolve, reject) => {
    items.length > 0 ? resolve(items) : reject('No results returned');
  });
};

module.exports.getPublishedItems = function () {
  return new Promise((resolve, reject) => {
    const publishedItems = items.filter((item) => item.published);

    publishedItems.length > 0
      ? resolve(publishedItems)
      : reject('No results returned');
  });
};

module.exports.getCategories = function () {
  return new Promise((resolve, reject) => {
    categories.length > 0
      ? resolve(categories)
      : reject('No results returned');
  });
};

module.exports.addItem = function (itemData) {
  return new Promise((resolve, reject) => {
    // Set the postDate property to the current date
    const currentDate = new Date().toISOString().split('T')[0];
    itemData.postDate = currentDate;

    if (itemData.published === undefined) {
      itemData.published = false;
    } else {
      itemData.published = true;
    }

    itemData.id = items.length + 1;

    items.push(itemData);

    resolve(itemData);
  });
};


module.exports.getItemsByCategory = function (category) {
  return new Promise((resolve, reject) => {
    const filteredItems = items.filter((item) => item.category === category);

    if (filteredItems.length === 0) {
      reject('No results returned');
    }

    resolve(filteredItems);
  });
};


module.exports.getPublishedItemsByCategory = (category)=>{
  return new Promise((resolve,reject)=>{
      let pubItems = [];
      for (let i=0;i<items.length;i++)
      {
          if(items[i].published==true && items[i].category == category)
          {
              pubItems.push(items[i]);
          }
      }
      if(pubItems.length==0)
      {
          reject("no matching items");
      }else{
          resolve(pubItems);
      }
  })
}

module.exports.getItemsByMinDate = function (minDateStr) {
  return new Promise((resolve, reject) => {
    const minDate = new Date(minDateStr);

    if (isNaN(minDate)) {
      reject('Invalid date format');
    }

    const filteredItems = items.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= minDate;
    });

    if (filteredItems.length === 0) {
      reject('No results returned');
    }

    resolve(filteredItems);
  });
};

module.exports.getItemById = function (id) {
  return new Promise((resolve, reject) => {
    const item = items.find((item) => item.id.toString() === id);

    if (!item) {
      reject('No result returned');
    }

    resolve(item);
  });
};
