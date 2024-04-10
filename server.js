// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken'); // Import JWT library
const bcrypt = require('bcrypt'); // Import bcrypt library
const { User } = require('./models'); // Import User model

// Initialize Express app
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/restaurantDB', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Middleware
app.use(bodyParser.json());

// Secret key for JWT token (should be stored securely)
const secretKey = 'your_secret_key_here';

// Middleware to check if user is logged in
const isLoggedIn = (req, res, next) => {
    const token = req.headers.authorization;

    // Check if token is provided
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    // Verify token
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }
        req.user = decoded;
        next();
    });
};

// Apply middleware globally
app.use(isLoggedIn);

// Route to handle user registration
app.post('/register', async (req, res) => {
    try {
        const { username, password, role } = req.body;
        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create new user with hashed password
        const newUser = new User({ username, password: hashedPassword, role });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to handle user login and generate JWT token
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        // Check if user exists
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        // Compare passwords
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        // User authenticated, generate JWT token
        const token = jwt.sign({ username: user.username, role: user.role }, secretKey, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to add a new food item
app.post('/fooditems/add', async (req, res) => {
    try {
        const { name, price } = req.body;
        const newFoodItem = new FoodItem({ name, price });
        await newFoodItem.save();
        res.status(201).json({ message: 'Food item added successfully' });
    } catch (error) {
        console.error('Error adding food item:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to delete a food item
app.delete('/fooditems/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedFoodItem = await FoodItem.findByIdAndDelete(id);
        if (!deletedFoodItem) {
            return res.status(404).json({ message: 'Food item not found' });
        }
        res.json({ message: 'Food item deleted successfully' });
    } catch (error) {
        console.error('Error deleting food item:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to update a food item
app.put('/fooditems/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price } = req.body;
        const updatedFoodItem = await FoodItem.findByIdAndUpdate(id, { name, price }, { new: true });
        if (!updatedFoodItem) {
            return res.status(404).json({ message: 'Food item not found' });
        }
        res.json({ message: 'Food item updated successfully', updatedFoodItem });
    } catch (error) {
        console.error('Error updating food item:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to list all orders
app.get('/order/list', async (req, res) => {
    try {
        const orders = await Order.find().populate('foodItem');
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to add a food item to the cart
app.post('/cart/add', async (req, res) => {
    try {
        const { foodItemId } = req.body;
        const foodItem = await FoodItem.findById(foodItemId);
        if (!foodItem) {
            return res.status(404).json({ message: 'Food item not found' });
        }
        // Assuming cart is associated with the user, you may need to add authentication
        const cartItem = new Cart({ foodItemId });
        await cartItem.save();
        res.status(201).json({ message: 'Food item added to cart successfully' });
    } catch (error) {
        console.error('Error adding food item to cart:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to list all reservations
app.get('/reservation/list', async (req, res) => {
    try {
        const reservations = await Reservation.find();
        res.json(reservations);
    } catch (error) {
        console.error('Error fetching reservations:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to add a new reservation
app.post('/reservation/add', async (req, res) => {
    try {
        const { time } = req.body;
        const newReservation = new Reservation({ time });
        await newReservation.save();
        res.status(201).json({ message: 'Reservation added successfully' });
    } catch (error) {
        console.error('Error adding reservation:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to delete a reservation
app.delete('/reservation/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedReservation = await Reservation.findByIdAndDelete(id);
        if (!deletedReservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }
        res.json({ message: 'Reservation deleted successfully' });
    } catch (error) {
        console.error('Error deleting reservation:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
