const express = require('express')
const cors = require('cors');
const app = express()
const port =process.env.PORT || 7000
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
        const bookingCOllection = database.collection("bookingCOllection");

        








        app.post('/bookings',async(req,res)=>{
            const data=req.body;
            const result=await bookingCOllection.insertOne(data)
            res.send(result);
        })
        
        app.get('/bookings/:email',async(req,res)=>{
            const email=req.params.email;
            const query = { customerEmail : email}
            const result=await bookingCOllection.find(query).toArray()
            res.send(result)
        })
        app.get('/bookingRequest/:email',async(req,res)=>{
            const email=req.params.email;
            const query = { providerEmail : email}
            const result=await bookingCOllection.find(query).toArray()
            res.send(result)
        })
        app.patch('/update/:id',async(req,res)=>{
            const status=req.body;
            const id=req.params.id;
            const filter={_id : new ObjectId(id)}
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    ...status,
                },
            };

            const result=await bookingCOllection.updateOne(filter,updateDoc,options)
            res.send(result)
            
        })


        app.post('/services',async(req,res)=>{
            const data=req.body
            console.log(data)
            const result=await servicesCollection.insertOne(data)
            res.send(result)
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

        app.get('/services/:email',async(req,res)=>{
            const email=req.params.email;
            const query = { providerEmail : email}

            const result= await servicesCollection.find(query).toArray()
            res.send(result)
        })




       app.get('/single/:id',async(req,res)=>{
        const id=req.params.id;
        const query={_id: new ObjectId(id)}
        const result=await servicesCollection.findOne(query);
        res.send(result)

       })

       app.put('/single/:id',async(req,res)=>{
        const id =req.params.id;
        const data=req.body
           const filter ={_id : new ObjectId(id)}
            const options = { upsert: true };
           const updateDoc = {
               $set: {
                   serviceName: data.serviceName,
                   providerEmail: data.providerEmail,
                   price: data.price,
                   providerName: data.providerName,
                   servicePhoto: data.servicePhoto,
                   area: data.area,
                   providerImage: data.providerImage,
                   description : data.description
               },
            }

           const result = await servicesCollection.updateOne(filter, updateDoc, options);
           res.send(result)


       })

       app.delete('/single/:id',async(req,res)=>{
        const id=req.params.id;
        const query={_id : new ObjectId(id)}

        const result=await servicesCollection.deleteOne(query)
        res.send(result);

       })














        await client.db("admin").command({ ping: 1 });
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