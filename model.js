// Import Mongoose
const mongoose = require('mongoose');

// Define Schema for User
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true }
}, { timestamps: true }); // Add timestamps

// Define Schema for FoodItem
const foodItemSchema = new mongoose.Schema({
    price: { type: Number, required: true },
    name: { type: String, required: true },
    time: { type: String, required: true }, // Change type to String
    images: { type: String } // New field for image URL
}, { timestamps: true }); // Add timestamps

// Define Schema for Order
const orderSchema = new mongoose.Schema({
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem' }],
    totalPrice: { type: Number, required: true },
    estTime: { type: String, required: true }, // Change type to String
    orderBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true }); // Add timestamps

// Define Schema for Reservation
const reservationSchema = new mongoose.Schema({
    time: { type: String, required: true }, // Change type to String
    madeBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true }); // Add timestamps

// Define Schema for Menu
const menuSchema = new mongoose.Schema({
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem' }],
    stock: { type: Boolean, required: true }
}, { timestamps: true }); // Add timestamps

// Define Schema for Cart
const cartSchema = new mongoose.Schema({
    items: { type: String, required: true },
    total: { type: Number, required: true }
}, { timestamps: true }); // Add timestamps

// Create Models
const User = mongoose.model('User', userSchema);
const FoodItem = mongoose.model('FoodItem', foodItemSchema);
const Order = mongoose.model('Order', orderSchema);
const Reservation = mongoose.model('Reservation', reservationSchema);
const Menu = mongoose.model('Menu', menuSchema);
const Cart = mongoose.model('Cart', cartSchema);

module.exports = { User, FoodItem, Order, Reservation, Menu, Cart };
