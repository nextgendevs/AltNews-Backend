var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;

var Advt = new Schema({
    title : String,
    description : String,
    hash : String,
    sponser : {type : ObjectId, ref : 'User'}
})

//Status : 1 for Draft, 2 for Published
var Post = new Schema({
    post : String,
    title : String,
    status : Number,
    likes : Number,
    views : Number,
    postDate : Date,
    coverImageHash: String,
    user: {type : ObjectId, ref : 'User'}
})

var ClaimbleAds = new Schema({
    claimId : String,
    Ad : {type : ObjectId, ref : 'User'},
    Beneficiary : String
})


var User = new Schema({
    cryptoaddress : String,
    username : String,
    messages : [String],
    availableAds: [{type: ObjectId, ref:'Advt'}],
    availableClaims : [String]
});



module.exports = {
    User : mongoose.model('User', User), 
    ClaimbleAds : mongoose.model('ClaimbleAds', ClaimbleAds),
    Advt : mongoose.model('Advt', Advt),
    Post : mongoose.model('Post', Post)
}




