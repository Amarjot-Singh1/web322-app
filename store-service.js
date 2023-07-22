const Sequelize = require('sequelize');
const { gte } = Sequelize.Op;

var sequelize = new Sequelize('xjmxxtgk', 'xjmxxtgk', 'ewuTS0JHMrL4L_MPnQgHT0VZjytD6n_h', {
    host: 'stampy.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: {
            rejectUnauthorized: false
        }
    },
    query: {
        raw: true
    }
});

// Define the Item model
const Item = sequelize.define('Item', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN,
    price: Sequelize.DOUBLE
});

// Define the Category model
const Category = sequelize.define('Category', {
    category: Sequelize.STRING
});

// Define the relationship between Item and Category
Item.belongsTo(Category, {foreignKey: 'category'});

// Initialize function
function initialize() {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => resolve())
            .catch((err) => reject("unable to sync the database"));
    });
}

// getAllItems function
function getAllItems() {
    return new Promise((resolve, reject) => {
        Item.findAll()
            .then(items => resolve(items))
            .catch(err => reject("no results returned"));
    });
}

// getPublishedItems function
function getPublishedItems() {
    return new Promise((resolve, reject) => {
        Item.findAll({ where: { published: true } })
            .then(items => resolve(items))
            .catch(err => reject("no results returned"));
    });
}

// getCategories function
function getCategories() {
    return new Promise((resolve, reject) => {
        Category.findAll()
            .then(categories => resolve(categories))
            .catch(err => reject("no results returned"));
    });
}

// addItem function
function addItem(itemData) {
    return new Promise((resolve, reject) => {
        itemData.published = itemData.published ? true : false;

        // Ensuring any empty values are set to null
        for (let prop in itemData) {
            if (itemData[prop] === "") {
                itemData[prop] = null;
            }
        }

        itemData.postDate = new Date();

        Item.create(itemData)
            .then(item => resolve(item))
            .catch(err => reject("unable to create post"));
    });
}

// getItemsByCategory function
const getItemsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        Item.findAll({ where: { category: category } })
            .then(items => resolve(items))
            .catch(err => reject("no results returned"));
    });
};

// getItemsByMinDate function
const getItemsByMinDate = (minDateStr) => {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: {
                postDate: {
                    [gte]: new Date(minDateStr)
                }
            }
        })
            .then(items => resolve(items))
            .catch(err => reject("no results returned"));
    });
};

// getItemById function
const getItemById = (id) => {
    return new Promise((resolve, reject) => {
        Item.findAll({ where: { id: id } })
            .then(items => {
                if(items.length > 0)
                    resolve(items[0]);
                else
                    reject("no results returned");
            })
            .catch(err => reject("no results returned"));
    });
};

// getPublishedItemsByCategory function
const getPublishedItemsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        Item.findAll({ where: { published: true, category: category } })
            .then(items => resolve(items))
            .catch(err => reject("no results returned"));
    });
};

// addCategory function
function addCategory(categoryData) {
    return new Promise((resolve, reject) => {
        // Ensuring any empty values are set to null
        for (let prop in categoryData) {
            if (categoryData[prop] === "") {
                categoryData[prop] = null;
            }
        }

        Category.create(categoryData)
            .then(category => resolve(category))
            .catch(err => reject("unable to create category"));
    });
}

// deleteCategoryById function
function deleteCategoryById(id) {
    return new Promise((resolve, reject) => {
        Category.destroy({ where: { id: id } })
            .then(() => resolve())
            .catch(err => reject("unable to delete category"));
    });
}

// deletePostById function
function deletePostById(id) {
    return new Promise((resolve, reject) => {
        Item.destroy({ where: { id: id } })
            .then(() => resolve())
            .catch(err => reject("unable to delete post"));
    });
}

module.exports = {
    initialize,
    getAllItems,
    getPublishedItems,
    getCategories,
    addItem,
    getItemsByCategory,
    getItemsByMinDate,
    getItemById,
    getPublishedItemsByCategory,
    addCategory,
    deleteCategoryById,
    deletePostById 
};
