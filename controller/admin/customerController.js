import User from "../../models/userModel.js";




export const customerInfo=async(req,res)=>{
    try {
        let search="";
        if(req.query.search){
            search=req.query.search;
        }
        let page=1;
        if(req.query.page){
            page=req.query.page;
        }

        const limit=5
        const userData= await User.find({
            isAdmin:false,
            $or:[
                {name:{$regex:".*"+search+".*"}},
                {email:{$regex:".*"+search+".*"}}
            ]
        })
        .limit(limit*1)
        .skip((page-1)*limit)
        .exec();

        const count= await User.find({
               isAdmin:false,
            $or:[
                {name:{$regex:".*"+search+".*"}},
                {email:{$regex:".*"+search+".*"}}
            ]
        }).countDocuments();

        const totalPages = Math.ceil(count / limit);

        res.render("admin/users",{
            page:"users",
            totalPages: totalPages,
            currentPage:page,
            data:userData

        })
        


    } catch (error) {
        
        console.error("Error in customerInfo controller",error.message);
        res.redirect("/admin/pageerror")
        
    }
}


export const customerBlocked=async(req,res)=>{

    try {
        let id=req.query.id;
        await User.updateOne({_id:id},{$set:{isBlocked:true}});
        res.redirect("/admin/users")
    } catch (error) {
        res.redirect("/admin/pageerror")
    }
}


export const customerunBlocked=async(req,res)=>{
    try {
        let id=req.query.id;
        await User.updateOne({_id:id},{$set:{isBlocked:false}});
        res.redirect("/admin/users")
    } catch (error) {
        res.redirect("/admin/pageerror")
    }
}