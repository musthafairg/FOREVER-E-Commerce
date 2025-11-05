import express from 'express'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import session from 'express-session'
import nocache from 'nocache'
import userRouter from"./routes/user.js"
import adminRouter from "./routes/admin.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const app=express()
const port = process.env.PORT || 4000
connectDB()

app.use(nocache())
app.use(session({
    secret: "my_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000*60*60*24 ,
      httpOnly: true,
      secure: false,
    },
}))

app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')

app.use(express.static('public'))
app.use(express.urlencoded({extended:true}))
app.use(express.json())


app.use('/user',userRouter)
app.use('/admin',adminRouter)

app.get('/',(req,res)=>{
  res.render("user/otpVerification")
})

app.get('/cp',(req,res)=>{
  res.render("user/changePassword")
})
app.listen(port,()=>{
    console.log(`Server started on port ${port}`)
})