import express from "express";
import {dirname} from "path";
import {fileURLToPath} from "url";
import bodyParser from "body-parser";
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = 3000;
const __dirname=dirname(fileURLToPath(import.meta.url));

import { MongoClient, ServerApiVersion } from "mongodb";
const uri = process.env.uri;

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
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
    console.log("hello");
  }
}
run().catch(console.dir);

app.use(express.static("public"));
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const myDB = client.db("todolistproject");
const myColl = myDB.collection("listitems");

app.get("/",(req, res)=> {
    res.sendFile(__dirname+'/public/index.html');
});


app.post('/api/submit-form', async(req, res) => {
    const formData = req.body;
    const result = await myColl.insertOne(formData);
    console.log(`A document was inserted with the _id: ${result.insertedId}`);
});

app.post('/api/weatherData', (req, res) => {
  const code = req.body.code;
  console.log(code);
  fs.readFile('icons.json', 'utf8', (err, data) => {
    if (err) {
      console.log('Error reading file:', err);
      return;
    }
  
    try {
      const jsonData = JSON.parse(data);
      const foundObject = jsonData.find(obj => obj.code === code);
  
      if (foundObject) {
        console.log('found');
        console.log(foundObject.image);
        res.json({ iconUrl: foundObject.image });
      } else {
        console.log('Object not found');
      }
    } catch (err) {
      console.log('Error parsing JSON data:', err);
    }
  });
});




app.get('/api/todos', async(req,res)=>{
    try{
        const todos= await myColl.find().toArray();
        res.json(todos);
        console.log("got todos");
    }
    catch(error){
        console.log("error catching");
    }
});

app.delete('/api/delete-todo', async(req, res) => {
  try {
    const todoToDelete = req.body.todott;
    let newStr = todoToDelete.slice(0, -1);
    console.log(newStr+ " deleted");
    const result = await myColl.deleteOne({ todo: newStr });

    if (result.deletedCount === 0) {
      console.log('error');
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

app.put('/api/todoscomplete', (req, res) => {
  const todotext = req.body.todo;
  let newStr = todotext.slice(0, -1);
  const complete = req.body.completed;
  console.log(newStr);
  console.log(complete);

  myColl.updateOne(
    { todo: newStr },
    { $set: { completed: complete } }
  )
  .then(result => {
    if (result.modifiedCount === 0) {
      throw new Error('Todo not found');
    }
    res.json({ message: 'Todo updated successfully' });
  })
  .catch(error => {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  });
});





app.listen(port, ()=> {
    console.log(`listening on port ${port}`);
});