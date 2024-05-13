const express = require('express')
const cors = require('cors');
const app = express()
const port =process.env.PORT || 7000
require('dotenv').config()
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

app.use(cors({
    origin:[
        'http://localhost:5173',
        'https://assignment11-34744.web.app',
        'https://assignment11-34744.firebaseapp.com'
    ],
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())



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

// middleware

const verifyToken = async (req, res, next) => {
    const token = req.cookies?.token
    console.log(token)
    if (!token) {
        return res.status(401).send({ massage: 'not authorized' })
    }
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(401).send({ massage: 'not authorized' })
        }
        console.log('value in the ', decoded)
        req.user = decoded


        next()
    })


}





async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        // Send a ping to confirm a successful connection

        const database = client.db("assignmentDB");
        const servicesCollection = database.collection("servicesCollection");
        const bookingCOllection = database.collection("bookingCOllection");

        // jwt
        app.post('/jwt',async(req,res)=>{
            const data=req.body;
            const token = jwt.sign(data, process.env.ACCESS_TOKEN,{expiresIn:'7d'})
            res
            .cookie('token',token,{
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                maxAge: 60 * 60 * 1000,
            })
            .send({ success: true })
        })

        app.post('/logout', async (req, res) => {
            const user = req.body
            res.clearCookie('token', { maxAge: 0 }).send({ success: true })
        })










        app.post('/bookings',async(req,res)=>{
            const data=req.body;
            const result=await bookingCOllection.insertOne(data)
            res.send(result);
        })
        
        app.get('/bookings/:email',verifyToken,async(req,res)=>{
            const email=req.params.email;
            if(req.params.email!==req.user.email){
                return res.status(403).send({ massage: 'forbidden access' })
            }
            const query = { customerEmail : email}
            const result=await bookingCOllection.find(query).toArray()
            res.send(result)
        })
        app.get('/bookingRequest/:email',verifyToken,async(req,res)=>{
            const email=req.params.email;
            if (req.params.email !== req.user.email) {
                return res.status(403).send({ massage: 'forbidden access' })
            }
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
    res.send('assignment 11......')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})