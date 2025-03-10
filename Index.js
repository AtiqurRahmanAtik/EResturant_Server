const express = require('express')
const app = express()
const port = process.env.PORT || 5000;
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const bcrypt = require('bcrypt');
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
    app.get('/product', async(req,res)=>{
        const users = await UserCollection.find();

    
        const cursor = await users.toArray();

        res.send(cursor);
    })

    // RegisterUser Post api from register from
    app.post('/register', async (req, res) => {

      const { name, email, password } = req.body;
      
  
      try {
          // Check if user already exists
          const user = await RegisterUserCollection.findOne({email});
         
  
          if (user) {
              return res.status(400).send('User already registered');
          }
  
          // Hash the password
          const hashPassword = await bcrypt.hash(password, 12);
  
          // Insert the new user into the database
          const result = await RegisterUserCollection.insertOne({ name, email, password: hashPassword });
  
         

         const token = jwt.sign({email} ,process.env.JWT_TOKEN, { expiresIn: '1h' } );

         res.cookie('token', token);

         res.status(201).send({'result': result, 'token' : token});
      } catch (error) {
          console.error(error);
          res.status(500).send('Internal Server Error');
      }
  });


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

     

      const users = await UserCollection.find().sort({Ratings:1});
      const cursor = await users.toArray();
      res.send(cursor);
    })


    // show big price 
    app.get('/bigPice', async(req,res)=> {

     

      const users = await UserCollection.find();
      const cursor = await users.toArray();
      res.send(cursor);
    })


    app.get('/product/:id', async(req,res)=>{
      const id = req.params.id;
      // console.log('id is : ',id);
    
      const cursor = {_id : new ObjectId(id)};

      const result = await UserCollection.findOne(cursor);

      res.send(result);
      
    })

    // Shoping Card or Add to Card Api post here
    app.post('/card/post', async(req,res)=>{
      const { _id, ...cardData } = req.body;
      // console.log(card);
      const result = await AddToCardCollection.insertOne(cardData);
      res.send(result);
    })
    
    // get add to card data here
    app.get('/card/get', async(req,res)=>{
      const card = AddToCardCollection.find();
      const result = await card.toArray();
      
      res.send(result);
    })

    app.delete('/card/get/:id',async(req,res)=>{
      const id = req.params.id;
      // console.log(id)
      const quary = {_id: new ObjectId(id)};
     
      const result = await AddToCardCollection.deleteOne(quary);
    
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