const PORT = process.env.PORT || 5000
const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer');
const cors = require("cors");
const fleekStorage = require('@fleekhq/fleek-storage-js')
const mongoose = require("mongoose");
var ObjectId = mongoose.Schema.Types.ObjectId;


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
//app.use(upload.array());


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

//create posts
app.post("/post", upload.array(), async (req,res) => {
  
  var post = req.body;

  post.user = new mongoose.Types.ObjectId(  post.user );

  if(req.body.Ad)
  post.Ad = new mongoose.Types.ObjectId(  post.Ad );


  var newPost = new Post(post);

  newPost.save(async (err, oPost) => {
  if (err) {
    res.json({ error: "invalid POST body" });
    return console.log(err);
  }

  oPost = await oPost.populate("Ad").execPopulate();
  console.log(oPost);
  if(oPost.Ad)
  {//Logic to convert the status 
let oCAd = oPost.Ad;

oCAd.status = "r";

oCAd.save((err, oAd)=> {
  if (err) {
    res.json({ error: "invalid POST body" });
    return console.log(err);
  }
res.json({message : "Ad money can be claimed"})

});
}else
{
  res.json({ id : oPost.id , status : oPost.status  });
}



});

});
//retreive users posts
app.get("/postsByUser", async (req,res) =>{

var user = req.query.user;

var posts =  await Post.find({ user : new mongoose.Types.ObjectId( user ) } ).exec();

if(!!posts)
  res.json(posts);
else
res.send([]);

})

//retreive all posts
app.get("/posts", async (req,res) => {

  Post.find({ } , (err, posts)=> {

    if(err)
    {
      res.json({ error: "Could not posts" });
      return console.log(err);
    }

    res.json(posts);

  }).populate({path: "user",  select: "cryptoaddress username -_id" });



} )


//retreive post by id
app.get("/postbyId", async (req,res) => {

  var sId = req.query.postId;

  var posts =  await Post.find({ _Id : new mongoose.Types.ObjectId( sid ) } ).exec();
  
  if(!!posts)
    res.json(posts);
  else
  res.send([]);

})


//Create Ad
app.post("/createAd", upload.single('adImage'),  async (req, res, next) => {

  const file = req.file;

  const fileKey =  uploadToIPFS(file, next);

  console.log(fileKey);
  var oAdvt = new Advt({
    title: req.body.title,
    description : req.body.description,
    hash : "",
    fileKey : fileKey,
    sponser : new mongoose.Types.ObjectId( req.body.user )
  })

  oAdvt.save((err, oAd) => {
    if (err) {
      res.json({ error: "invalid Ad details" });
      return console.log(err);
    }

    res.json({ id : oAd._id , message : "Ad Posted to Secure storage, wait for confirmation"  });
  });


});

//check IPFS status
app.get("/checkFileStatus", async (req,res)=> {
let fileKey = req.query.fileKey;

var doc = await Advt.findOne({fileKey : fileKey });

if(doc.hash == "")
{
const myFileHash = await fleekStorage.get({
  apiKey: 'uE0fQtHtzBL3M/4lR5+ZZA==',
  apiSecret: 'uZL1QfOW0KSiqOBqSGi5X5UQ2M4HEQDmpGsVIdf7RWk=',
  key: fileKey,
  getOptions: [
    'hash'   
  ]
});

if(myFileHash.hash)
 {
  doc.hash = myFileHash.hash;
  doc.save();
  res.json(doc)
 }else
 {
  res.status(404).json({message : "file not uploaded yet"})
 }

}else
{
  res.json(doc)
}

})


function uploadToIPFS(file,next) {
  if (!file) {
    const error = new Error('Please upload a file')
    error.httpStatusCode = 400
    return next(error)
  }

  let fileKey = 'Image' + Date.now();
  fleekStorage.upload({
    apiKey: 'uE0fQtHtzBL3M/4lR5+ZZA==',
    apiSecret: 'uZL1QfOW0KSiqOBqSGi5X5UQ2M4HEQDmpGsVIdf7RWk=',
    key: fileKey,
    data: file.buffer
  });

  return fileKey;
}

//Get all ads with/without hash
app.get("/getAllAds", async (req,res)=> {
var userId = req.query.user;
var bHash = req.query.hash;
var oFilterOptions = {sponser : new mongoose.Types.ObjectId( userId)  };

console.log(req.query)

if(bHash !== 'false')
{
  oFilterOptions.hash = { $ne : "" };
}

docs = Advt.find(oFilterOptions,

(err,aAds) => {

  if (err) {
    res.json({ error: "could not find ads" });
    return console.log(err);
  }

  res.json(aAds);

}

)




});


app.post("/createClaimableAd" , async (req,res) => {
var destCrypto  = req.body.dest;

var newClaimableAd = new ClaimbleAds({
  claimId : req.body.claimId,
  Ad : new mongoose.Types.ObjectId( req.body.adId), 
  Beneficiary : destCrypto,
  status : "c"
})

newClaimableAd.save((err,oclaim)=> {
  if (err) {
    res.status(400).json({ error: "could not find ads" });
    return console.log(err);
  }

  res.json({message : "claim created "});
})



})



app.post('/uploadfile', upload.single("imageAd"), async (req, res, next) => {
  const file = req.file
  
  const fileKey = uploadToIPFS(file, next);
  
  res.send({fileKey : fileKey});

});

//Get all ads available to user based on status
app.get("/getClaimableAds" , async (req,res)=> {
var benCrypto = req.query.CryptoAddress,
status = req.query.status

var filterOptns = {Beneficiary : benCrypto};

if(status)
filterOptns.status = status;

ClaimbleAds.find(filterOptns, (err, aClaimableAds)=> {
  if (err) {
    res.status(400).json({ error: "could not find ads" });
    return console.log(err);
  }

  res.json(aClaimableAds);
})

});




//Server start
app.listen(PORT, () => console.log(`Server started on port ${PORT} `));