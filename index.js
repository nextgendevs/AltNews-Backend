const PORT = process.env.PORT || 5000
const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer');
const cors = require("cors");
const fleekStorage = require('@fleekhq/fleek-storage-js')
const mongoose = require("mongoose");



const MLAB_URI = process.env.MLAB_URI || "mongodb+srv://john:12345qwerty@cluster0-tnors.mongodb.net/AltNews?retryWrites=true&w=majority";

const app = express();

app.use(cors());

mongoose.connect(MLAB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


//import schemas

const {  User , ClaimbleAds, Advt,  Post } = require("./models/Schemas");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());




//Multer Initailization
var storage = multer.memoryStorage()
var upload = multer({ storage: storage })

//for Multipart form data
app.use(upload.array());


// Error Handling middleware
app.use((err, req, res, next) => {

  let errCode, errMessage;

  if (err.errors) {
    // mongoose validation error
    errCode = 400; // bad request
    const keys = Object.keys(err.errors);
    // report the first validation error
    errMessage = err.errors[keys[0]].message;
  } else {
    // generic or custom error
    errCode = err.status || 500;
    errMessage = err.message || "Internal Server Error";
  }
  res
    .status(errCode)
    .type("txt")
    .send(errMessage);
});

//ROUTES WILL GO HERE
/*
app.get('/', function(req, res) {
    res.json({ message: 'WELCOME' });   
});
*/

//Register (more like record) New User
app.post("/registerUser", (req,res) => {
  var sUsername = req.body.username || "";
  console.log(req.body);
  if (  ! (req.body.cryptoaddress )  ) {
    res.status(400);
    res.send("Bad Payload: CryptoAddress required");
    return;
  }

  var newUser = new User({ username: sUsername, cryptoaddress: req.body.cryptoaddress });

  newUser.save((err, oUser) => {
    if (err) {
      res.json({ error: "invalid POST body" });
      return console.log(err);
    }
    res.json({ username: oUser.username, address: oUser.cryptoaddress });
  });

});

//get User info
app.get("/getUser", (req,res) => {
var  cryptoaddress = req.query.cryptoadd;
if( !(cryptoaddress) )
{
  res.status(400);
  res.send("crypto address required to fetch user details");
  return;
}

User.findOne({ cryptoaddress: cryptoaddress }, function (err, User) {

  if(err)
  {
    res.json({ error: "Could not found user. Please contact Admin" });
    return console.log(err);
  }

  res.json(User);
}).populate("availableAds");


});



app.post('/uploadfile', upload.single('adImage'), async (req, res, next) => {
  const file = req.file
  if (!file) {
    const error = new Error('Please upload a file')
    error.httpStatusCode = 400
    return next(error)
  }

  const uploadedFile = await fleekStorage.upload({
    apiKey: 'uE0fQtHtzBL3M/4lR5+ZZA==',
    apiSecret: 'uZL1QfOW0KSiqOBqSGi5X5UQ2M4HEQDmpGsVIdf7RWk=',
    key: 'adFile' + Date.now(),
    data: file.buffer,
  });

  //console.log(uploadedFile);    
  res.send("file received");

})


//Server start
app.listen(PORT, () => console.log(`Server started on port ${PORT} `));