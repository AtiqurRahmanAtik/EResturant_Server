const express = require('express')
const app = express()
const port = process.env.PORT || 5000;
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');


// MiddleWare
app.use(cors
  ({
    origin:'*', 
    // origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    optionSuccessStatus:200,
  })
);



app.use(express.json());
app.use(cookieParser());


const createSecretToken = (email) => {
  return jwt.sign({ email }, process.env.TOKEN_KEY, {
    expiresIn: 3 * 24 * 60 * 60,
  });
};




// Mongodb Connection Here :
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.aq01puw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// console.log(uri);



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
    await client.connect();
    
     const UserCollection = client.db('CURD_Server').collection('users');

     const RegisterUserCollection = client.db('CURD_Server').collection('registerUser');

     const AddToCardCollection = client.db('CURD_Server').collection('addCard');


   


      
    // Get data From mongodb 
    app.get('/user', async(req,res)=>{
        const users = await UserCollection.find();
    
        const cursor = await users.toArray();

        res.send(cursor);
    })

    // RegisterUser Post api from register from
    app.post('/register', async(req,res)=>{
      const users = req.body;
      console.log(users);
     
      const existingUser = await RegisterUserCollection.findOne({ email});
      if(existingUser){
        return res.json({ message: "User already exists" });
      }

     
      const result = await RegisterUserCollection.insertOne(users);
      // crete token here
      const token = createSecretToken(result.email);
      console.log('token : ', token);

      res.cookie('token', token,{
        withCredentials: true,
        httpOnly: false,
      });

      res
      .status(201)
      .json({ message: "User signed in successfully", success: true, result });

      res.send(result);

    }) 

    app.get('/register', async(req,res)=>{
      const users = await RegisterUserCollection.find();
      const result = await users.toArray();

      res.send(result);
    })

    app.get('/register/:id', async(req,res)=>{
      const id= req.params.id;
      const quary = {_id : new ObjectId(id)};
      const result = await RegisterUserCollection.findOne(quary);
      res.send(result);
    })

    // update Register user id of data 
    app.put('/register/:id',async(req,res)=>{
      const id = req.params.id;
      const filter = {_id : new ObjectId(id)};
      
      const users = req.body;
      // console.log(users);

      const options = { upsert: true };
      const updateUser = {
        $set:{
          name : users.name,
          email : users.email,
          password : users.password
        }
      };

      const result = await RegisterUserCollection.updateOne(filter,updateUser,options)

      res.send(result);
    })

    // 
    app.delete('/register/:id', async(req,res)=>{
      const id= req.params.id;
      const quary = {_id : new ObjectId(id)};
      const result = await RegisterUserCollection.deleteOne(quary);
      res.send(result);
    })
    
    // show data base on assending rating wish
    app.get('/big', async(req,res)=> {

     

      const users = await UserCollection.find().sort({rating:1});
      const cursor = await users.toArray();
      res.send(cursor);
    })


    // show big price 
    app.get('/bigPice', async(req,res)=> {

     

      const users = await UserCollection.find();
      const cursor = await users.toArray();
      res.send(cursor);
    })


    app.get('/user/:id', async(req,res)=>{
      const id = req.params.id;
      // console.log('id is : ',id);
    
      const cursor = {_id : new ObjectId(id)};

      const result = await UserCollection.findOne(cursor);

      res.send(result);
      
    })

    // Shoping Card or Add to Card Api post here
    app.post('/card/post', async(req,res)=>{
      // const card = req.body;
      console.log(card);
      const result = await AddToCardCollection.insertOne(card);
      res.send(result);
    })

      
    // Demo Api
    app.get('/', (req, res) => {
        res.send('Hello World!')
      })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





app.listen(port, () => {
  console.log(`CRUD Server listening on port ${port}`)
})