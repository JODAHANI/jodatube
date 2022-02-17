import Mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Mongoose.Schema({
    avatarUrl : String ,
    socialOnly: { type: Boolean, default: false },
    email : {type: String, required: true, unique: true  },
    pw : {type: String, },
    userName : {type: String, required: true},
    name : {type: String, required: true, unique: true  },
    videos : [{ type : Mongoose.Schema.Types.ObjectId, ref: 'Video'}]
});

userSchema.pre('save', async function() {
    if(this.isModified('pw')){
        this.pw = await bcrypt.hashSync(this.pw, 5);
    }
});

const User = Mongoose.model('User', userSchema);
export default User;