import mongoose, { Mongoose, Schema } from "mongoose";

const brandSchema = new mongoose.Schema({
    brandName:{
        type:String,
        required:true,
        unique:true
    },
    brandImage:{
        type:[String],
        required:true
    },
    isBlocked:{
        type:Boolean,
        default:false
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})


const Brand = mongoose.model("Brand", brandSchema);
export default Brand;
