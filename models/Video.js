const mongoose = require('mongoose');

export const formatHashtags = (hashtags) => {
    return hashtags.split(',').map( (word) =>  {
        return (word.startsWith('#') ? word : `#${word}`)
    })
}   
    

const videoSchema = new mongoose.Schema({
    fileUrl: { type: String, required: true },
    thumbUrl: { type: String, required: true },
    title : { type: String, required: true, trim : true },
    description: { type: String, required: true, trim : true },
    date : { type: Date, required: true, default: Date.now } ,
    hashtags: [{ type: String, trim: true }],
    meta : {
        views : { type : Number, default : 0 },
        rating: { type : Number, default : 0 },
    },
    owner : {
        type : mongoose.Schema.Types.ObjectId, required: true, ref : 'User'
    },
});


const Video = mongoose.model('Video',videoSchema);
export default Video

