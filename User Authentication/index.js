 
 require('dotenv').config()


const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const ejs = require('ejs')
// const encrypt = require('mongoose-encryption')
const { log } = require('console')
const { publicDecrypt } = require('crypto')
// const md5 = require('md5') USED FOR HASHING
const bcrypt = require('bcrypt-nodejs')
// const saltRounds =10; USED IN SALTING 
const session = require("express-session")
const  passport = require('passport')
const localMongoose = require('passport-local-mongoose')
var GoogleStrategy = require('passport-google-oauth20').Strategy
const findOrCreate = require('mongoose-findorcreate')
const { Strategy } = require('passport-local').Strategy


const app = express()
app.use(express.static('public'))
app.set('view engine' , 'ejs')
app.use(bodyParser.urlencoded ({extended :true}))

app.use(session({
    secret : 'this is my secret',
    resave: false,
    saveUninitialized :false
   
}))

app.use(passport.initialize())
app.use(passport.session())


mongoose.connect('mongodb://127.0.0.1/test')
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


// USED IN ENCRYPTION TECHNIQUES 
// const secretKey = "thisisoursecretstring"
// userSchema.plugin(encrypt,{secret : secretKey , encryptedFields : ['password']});

userSchema.plugin(localMongoose)
userSchema.plugin(findOrCreate)

const user = new mongoose.model('user' , userSchema)

passport.use(user.createStrategy())

// const passport = require('passport');

passport.serializeUser((user , done) => {
    done(null , user);
})
passport.deserializeUser(function(user, done) {
    done(null, user);
});



passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
    user.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
}

))

app.get('/', (req,res)=>{
    res.render('home')
})

app.get('/auth/google' , 
    passport.authenticate('google' ,{scope : ["profile"]})
)
app.get('/auth/google/secrets' ,
passport.authenticate('google' , {failureRedirect : '/login'})),
function(req,res){
    res.redirect('/secrets')
}


app.get('/register' , (req,res)=>{
    res.render('register')
})

app.get('/login' , (req,res)=>{
    res.render('login')
})
app.get('/submit' ,(req,res)=>{
    res.render('submit')
})

app.get('/logout' , (req , res,next)=>{
    req.logout((err)=>{
        if(err){
            return next (err)
        }else{
            res.redirect('/')
        }
    });
    

   
})

//  USING HASING
// app.post("/register", function(req,res){

//     const user1 = new user({
//         email : req.body.username,
//         password :md5(req.body.password)
//     })

//   user1.save()

//   res.render('secrets')
// }) 

// USING PASSPORT JS 


app.get('/secrets' ,(req,res)=>{
if(req.isAuthenticated()){
    res.render('secrets')
}else{
    res.redirect('/login')
}
})


app.post('/register' , (req,res)=>{
user.register({username : req.body.username} ,req.body.password,null , (err,user)=>{
    if(err){
        console.log(err);
        res.redirect('/register')
    }else{
        passport.authenticate('local')(req,res ,()=>{
            res.redirect('secrets')
        })
    }
})
})

app.post('/submit' , (req ,res)=>{
    const newUser = new user({
       secret : req.body.secret
    })
    async function saveUser(){
        try{
            const saving = await newUser.save();
            res.render("submit");
        } catch(err){
            console.error(err);
        }
    }
    saveUser()


})


// USING HASHING 
// app.post('/login' , (req , res)=>{
//  const name = req.body.username
//  const pass = req.body.password


// user.findOne({email : name}) .then((users)=>{
// if(users.email === name){
//     if(users.password === pass){
//         console.log('login is successfu;=l');
//         res.render('secrets')
//     }
// }
// }).catch((err)=>{
// console.log(err);
// })

// })



// USING PASSPORT JS 
app.post('/login' , (req , res)=>{
    const user1 = new user({
        username : req.body.username,
        password : req.body.password
    })
    req.login(user1 , (err)=>{
        if(err){
            console.log(err);
        }else{
            passport.authenticate('local')(req,res ,()=>{
                res.redirect('secrets')
            })
        }
    })
})




app.listen(3000 , ()=>{
    console.log("server is up and running on server 3000");
})
