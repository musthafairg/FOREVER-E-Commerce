import User from "../../models/userModel.js"
import bcrypt from 'bcrypt'


export const loadLogin=async (req,res)=>{
    if(req.session.admin){
        return res.redirect("/admin")
    }
    res.render('admin/login')
}

export const login=async(req,res)=>{
    try {
        const {email,password}=req.body;
        console.log("admin :",email,password);
        
        const admin=await User.findOne({email,isAdmin:true})
        if(admin){
            const passwordMatch= await bcrypt.compare(password,admin.password);
            if(passwordMatch){
                console.log("password matched");
                
                req.session.admin=true;
                return res.redirect('/admin')
            }else{
                console.log("password didnot match");
                
                return res.redirect("/admin/login")
            }
        }else{
            console.log("admin not found");
            
            return res.redirect("/admin/login")
        }
    } catch (error) {
        console.error("Login error",error.message);
        return res.redirect("/pageerror")
        
    }
}

export const loadDashboard=async (req,res)=>{
    if(req.session.admin){
        try {
            res.render('admin/dashboard',{page:'dashboard'})
        } catch (error) {
            res.redirect("/pageerror")
        }
    }
}

export const pageerror=async (req,res)=>{
    res.render("admin/pageerror")
}

export const logout=async(req,res)=>{
    try {
        req.session.destroy(err=>{
            if(err){
                console.error("Error destroying session",err);
                return res.redirect("/admin/pageerror")
                
            }
            res.redirect("/admin/login")
        })
        
    } catch (error) {
        
        console.error("unexpected error during logout",error);
        req.redirect("/admin/pageerror")
        
    }
}