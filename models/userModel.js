import mongoose, { Mongoose, Schema } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim :true
    },
    email: {
      type: String,
      required: true,
      unique:true,
      trim:true
    },
    mobile: {
      type: String,
      required: false,
      unique:false,
      sparse:true,
      default:null
    }, 
    googleId:{
      type:String,
      unique:true,
      sparse:true
    },
    password: {
      type: String,
      required: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isAdmin:{
      type:Boolean,
      default:false

    },
    cart:[{
      type:Schema.Types.ObjectId,
      ref:"Cart",
    }],
    wallet:{
      type:Number,
      default:0,
    }, 
    wishlist:[{
      type:Schema.Types.ObjectId,
      ref:"Wishlist"
    }],
    orderHistory:[{
      type:Schema.Types.ObjectId,
      ref:"Order"
    }],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    referalCode:{
      type:String,
    },
    redeemed:{
      type:Boolean
    },
    redeemedUsers:[{
      type:Schema.Types.ObjectId,
      ref:"User"
    }],
    searchHistory:[{
      category:{
        type:Schema.Types.ObjectId,
        ref:"Category"
      },
      searchOn:{
        type:Date,
        default:Date.now
      }
    }]
  },{timestamps:true}
);



const User = mongoose.model("User", userSchema);
export default User;