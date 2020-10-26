const PORT = process.env.PORT || 5000
const express = require('express')
const bodyParser= require('body-parser')
const multer = require('multer');
const fleekStorage = require('@fleekhq/fleek-storage-js')

const app = express();

app.use(bodyParser.urlencoded({extended: true}))
 
//ROUTES WILL GO HERE
/*
app.get('/', function(req, res) {
    res.json({ message: 'WELCOME' });   
});
*/
/*
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now())
    }
  })
*/

var storage = multer.memoryStorage()

var upload = multer({ storage: storage })

app.post('/uploadfile', upload.single('adImage'),async  (req, res, next) => {
    const file = req.file
    if (!file) {
      const error = new Error('Please upload a file')
      error.httpStatusCode = 400
      return next(error)
    }
    //console.log(file);
    
    const uploadedFile = await fleekStorage.upload({
      apiKey: 'uE0fQtHtzBL3M/4lR5+ZZA==',
      apiSecret: 'uZL1QfOW0KSiqOBqSGi5X5UQ2M4HEQDmpGsVIdf7RWk=',
      key: 'adFile' + Date.now(),
      data: file.buffer,
    });
    
    //console.log(uploadedFile);    
    res.send("file received");
    
  })

 
app.listen(PORT, () => console.log(`Server started on port ${PORT} `));