const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json())
console.log('hi')

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ebhzh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
    try{
        await client.connect();
        const database = client.db('niche');
        const productsCollection = database.collection('products');
        const reviewCollection = database.collection('reviews');
        const ordersCollection = database.collection('orders');

        //GET PRODUCTS API
        app.get('/home/products', async(req,res)=>{
            const cursor = productsCollection.find({}).limit(6);
            const products = await cursor.toArray();
            res.send(products);
        });

        //POST PRODUCTS API
        app.post('/home/products',async(req,res)=>{
            const addProduct = req.body;
            const result = await products.insertOne(addProduct);
            res.json(result);
        });
         //GET PRODUCTS API
         app.get('/products', async(req,res)=>{
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        });

        //POST PRODUCTS API
        app.post('/products',async(req,res)=>{
            const addExploreProduct = req.body;
            const result = await products.insertOne(addExploreProduct);
            res.json(result);
        });

        //GET REVIEWS API 
        app.get('/reviews', async(req,res)=>{
            const cursor = reviewCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        //POST REVIEWS API
        app.post('/reviews', async(req,res) =>{
            const review =req.body;
            
            const result = await reviewCollection.insertOne(review);
            res.json(result);
        });

        //GET ORDERS API 
        app.get('/orders', async(req,res)=>{
            const cursor = orderCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        });

        //POST ORDERS API
        app.post('/orders', async(req,res) =>{
            const order =req.body;
            
            const result = await orderCollection.insertOne(order);
            res.json(result);
        });
        
    }
    finally{
        //await client.close();
    }

}
run().catch(console.dir);


app.get('/', (req, res) =>{
    res.send('Niche website running');
});

app.listen(port, ()=>{
    console.log('hey i am running')
});

