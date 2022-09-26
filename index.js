const express = require("express");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;
const cors = require("cors");
const admin = require("firebase-admin");
const app = express();
const port = process.env.PORT || 5000;

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

//niche-website-firebase-adminsdk.json
//middleware
app.use(cors());
app.use(express.json());
console.log("hi");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ebhzh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function verifyToken(req, res, next) {
  if (req.headers?.authorization?.startsWith("Bearer ")) {
    const token = req.headers.authorization.split(" ")[1];

    try {
      const decodedUser = await admin.auth().verifyIdToken(token);
      req.decodedEmail = decodedUser.email;
    } catch {}
  }
  next();
}

async function run() {
  try {
    await client.connect();
    const database = client.db("niche");
    const productsCollection = database.collection("products");
    const reviewCollection = database.collection("reviews");
    const ordersCollection = database.collection("orders");
    const usersCollection = database.collection("users");

    //GET PRODUCTS API
    app.get("/home/products", async (req, res) => {
      const cursor = productsCollection.find({}).limit(6);
      const products = await cursor.toArray();
      res.send(products);
    });

    //POST PRODUCTS API
    app.post("/home/products", async (req, res) => {
      const addProduct = req.body;
      const results = await productsCollection.insertOne(addProduct);
      res.json(results);
    });
    //GET Explore PRODUCTS API
    app.get("/products", async (req, res) => {
      const cursor = productsCollection.find({});
      const products = await cursor.toArray();
      res.send(products);
    });

    //POST Explore PRODUCTS API
    app.post("/products", async (req, res) => {
      const addExploreProduct = req.body;
      console.log(addExploreProduct);
      const results = await productsCollection.insertOne(addExploreProduct);
      res.json(results);
    });

    //GET REVIEWS API
    app.get("/reviews", async (req, res) => {
      const cursor = reviewCollection.find({});
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    //POST REVIEWS API
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.json(result);
    });

    //GET ORDERS API
    app.get("/orders", async (req, res) => {
      const cursor = ordersCollection.find({});
      const orders = await cursor.toArray();
      res.send(orders);
    });

    //POST ORDERS API
    app.post("/orders", async (req, res) => {
      const order = req.body;

      const result = await ordersCollection.insertOne(order);
      res.json(result);
    });
    //DELETE AN ORDER
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.json(result);
    });

    //DELETE A PRODUCT
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.json(result);
    });

    //GET USERS API
    app.get("/users", async (req, res) => {
      const cursor = usersCollection.find({});
      const users = await cursor.toArray();
      res.send(users);
    });
    //POST USERS API
    app.post("/users", async (req, res) => {
      const users = req.body;
      const result = await usersCollection.insertOne(users);
      res.json(result);
    });

    //PUT USERS API
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    //PUT ADMIN API
    //PUT ADMIN API
    app.put("/users/admin", verifyToken, async (req, res) => {
      const user = req.body;
      const requester = req.decodedEmail;
      if (requester) {
        const requesterAccount = await usersCollection.findOne({
          email: requester,
        });

        if (requesterAccount.role === "admin") {
          console.log("put", req.decodedEmail);
          const filter = { email: user.email };
          const updateDoc = { $set: { role: "admin" } };
          const result = await usersCollection.updateOne(filter, updateDoc);
          res.json(result);
        }
      } else {
        res.status(403).json({ message: "you dont have access to this route" });
      }
    });

    //GET ADMIN API
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    //UPDATE STATUS
    app.put("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const updateStatus = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      console.log(updateStatus[0]?.status);

      const updateDoc = {
        $set: {
          status: updateStatus[0]?.status,
        },
      };
      console.log(updateDoc);
      const result = await ordersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      console.log("show id", id);
      res.json(result);
    });
  } finally {
    //await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Happy laaahhh!");
});

app.listen(port, () => {
  console.log("hey i am running nnnn");
});

module.exports = app;
