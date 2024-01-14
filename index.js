const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

// Sample array of users
const users = [
  { id: 1, username: "user1", password: "password1" },
  { id: 2, username: "user2", password: "password2" },
];

// Secret key for JWT
const secretKey = "yourSecretKey";

app.use(bodyParser.json());

// Middleware to check if the request has a valid token
const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.get("/", (req, res) => {
  res.send("HEllo WOrld");
});

// Get all users
app.get("/users", authenticateToken, (req, res) => {
  res.json(users);
});

// Get a specific user by ID
app.get("/users/:id", authenticateToken, (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find((u) => u.id === userId);

  if (user) {
    res.json(user);
  } else {
    res.status(404).send("User not found");
  }
});

// Create a new user
app.post("/users", authenticateToken, (req, res) => {
  const newUser = req.body;
  users.push(newUser);
  res.status(201).json(newUser);
});

// Update a user by ID
app.put("/users/:id", authenticateToken, (req, res) => {
  const userId = parseInt(req.params.id);
  const updateUser = req.body;

  const index = users.findIndex((u) => u.id === userId);

  if (index !== -1) {
    users[index] = { ...users[index], ...updateUser };
    res.json(users[index]);
  } else {
    res.status(404).send("User not found");
  }
});

// Delete a user by ID
app.delete("/users/:id", authenticateToken, (req, res) => {
  const userId = parseInt(req.params.id);
  const index = users.findIndex((u) => u.id === userId);

  if (index !== -1) {
    const deletedUser = users.splice(index, 1);
    res.json(deletedUser[0]);
  } else {
    res.status(404).send("User not found");
  }
});

// Login route to generate a JWT token
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    const token = jwt.sign({ username: user.username, id: user.id }, secretKey);
    res.json({ token });
  } else {
    res.status(401).send("Invalid credentials");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
