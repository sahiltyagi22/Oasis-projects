require('dotenv').config()

const express = require('express')
const ejs = require('ejs')
const mongoose = require('mongoose')
// const encrypt = require('mongoose-encryption')
// const hash = require('md5')

const bcrypt = require('bcrypt')
const saltRounds = 10;



const app = express()

app.use(express.static("public"))
app.set('view engine' , 'ejs')

app.use(express.json())
app.use(express.urlencoded({extended :true}))


mongoose.connect('mongodb://127.0.0.1/testdb')
.then(()=>{
    console.log("connection is successful");
})
.catch((err)=>{
    console.log(err);
})

const userSchema = new mongoose.Schema({
    email : String,
    password : String,
    secret : String
})

const secret = process.env.SECRET

// userSchema.plugin(encrypt ,{secret :secret , encryptedFields :["password"]}) (FOR ENCRYPTING THE PASSWORD IN DATABSE)

const users = new mongoose.model('users' , userSchema)

app.get('/' ,(req,res)=>{
    res.render('home')
})

app.get('/register' ,(req,res)=>{
    res.render('register')
})

app.get('/login' ,(req,res)=>{
    res.render('login')
})

app.get('/submit' ,(req,res)=>{
    res.render('submit')
})

app.get('/logout' ,(req,res)=>{
    res.render('login')
})


app.post('/register' , (req,res)=>{
    bcrypt.hash(req.body.password , saltRounds ).then((hash)=>{
        const newRegister = new users ({
            email : req.body.username,
            password : hash
        })
            async function saveData(){
            try {
           const result = await newRegister.save()
               res.render("secrets")
         } catch (error) {
             console.log(error);
          }
         }
         saveData()
    })
  
 })


app.post('/login' , (req,res)=>{
const username = req.body.username
const password = req.body.password


    users.findOne({email : username}).then((found)=>{
        if(found){
            bcrypt.compare(password , found.password, (err , result)=>{
                if(result === true){
                    res.render("secrets")
                }else{
                    res.send("<h1 styles = text-align = 'centre'> Invalid crendentials</h1>")
                }
            })
        
}})
        
})


 app.post('/submit' , (req,res)=>{
        const newSecret = new users({
            secret : req.body.secret
        })
        async function secret(){
            try {
                const result = await newSecret.save()
                res.render("secrets")
            } catch (error) {
                console.log(error);
            }
        }
        secret()
    })
   

  


app.listen(7080 , ()=>{
    console.log('server is running');
})
