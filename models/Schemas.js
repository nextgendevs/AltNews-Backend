var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;

var Advt = new Schema({
    title : String,
    description : String,
    hash : String,
    fileKey: String,
    sponser : {type : ObjectId, ref : 'User'}
})

//Status : d for Draft, p for Published
var Post = new Schema({
    post : String,
    title : String,
    short: String,
    status : String,
    likes :{type : Number, default: 0},
    views : {type : Number, default: 0},
    postDate : Date,
    coverImageHash: String,
    Ad : {type : ObjectId, ref : 'ClaimbleAds'},
    user: {type : ObjectId, ref : 'User'}
})


//status : u- unclaimed, r-readyForClaim,  c - claimed
var ClaimbleAds = new Schema({
    claimId : String,
    status: String,
    Ad : {type : ObjectId, ref : 'Advt'},
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




