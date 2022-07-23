const mongoose=require('mongoose')

const noteSchima=new mongoose.Schema({
    user:{
        type:String,
        required:true
    },
    title:{
        type:String
    },
    body:{
        type:String
    },
    date:{
        type:Date,
        default:Date.now
    }
})

module.exports=mongoose.model('Notes',noteSchima)