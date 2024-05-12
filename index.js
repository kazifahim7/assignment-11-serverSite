const express = require('express')
const cors = require('cors');
const app = express()
const port =process.env.PORT || 5000
require('dotenv').config()

app.use(cors())
app.use(express.json())



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.afhro9w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

console.log(uri)

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        // Send a ping to confirm a successful connection

        const database = client.db("assignmentDB");
        const servicesCollection = database.collection("servicesCollection");



        app.post('/services',async(req,res)=>{
            const data=req.body
            console.log(data)
            const result=await servicesCollection.insertOne(data)
            res.send(result.ops[0])
        })

        app.get('/service',async(req,res)=>{
            const search = req.query.search;
           

            let query = {
                serviceName: { $regex: search, $options: 'i' }
            };



            const result=await servicesCollection.find(query).toArray()
            res.send(result)
        })

        app.get('/services',async(req,res)=>{
            const result=await servicesCollection.find().toArray()
            res.send(result)
        })




        app.get('/services/:id',async(req,res)=>{
            const id=req.params.id;
            const query={_id: new ObjectId (id)}
            const result= await servicesCollection.findOne(query)
            res.send(result)
        })















        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);












app.get('/', (req, res) => {
    res.send('assignment 1......')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})