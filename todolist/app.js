const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const { name } = require('ejs')

const app = express()

// const items =[]
// const workItems = []

app.use(bodyParser.urlencoded({extended :true}))
app.use(express.static("public"))

app.set('view engine', 'ejs')

mongoose.connect("mongodb://127.0.0.1:/todoDB")

const itemsSchema = {
    name : String
}

const itemModel = mongoose.model('itemModel' , itemsSchema)

const item1 = new itemModel({
    name : "welcome to the to do list "
})

const item2 = new itemModel({
    name : "add the items by clicking here "
})

const item3 = new itemModel({
    name : "delete the items by clicking here  "
})

const itemsArray = [item1 , item2 ,item3]
    
const listSChema = {
    name :String,
    items : [itemsSchema]
}

const listModel = mongoose.model("listModel" , listSChema)

app.get('/' ,(req , res)=>{

    itemModel.find({}).then(function(FoundItems){
        if(FoundItems.length === 0){
            itemModel.insertMany(itemsArray ,{
                if (err) {
                    console.log('kya hai error');
                } 
            });
            res.redirect('/')
        }  
        res.render('list' ,{listTitle : "Today" , newListitems : FoundItems})
         })
          .catch(function(err){
           console.log(err);
         })
})


app.get('/:customParam' , (req , res)=>{
    const paramCustom = (req.params.customParam);

    listModel.findOne ({name : paramCustom}) .then(function (FoundItems){
       
            if(!FoundItems){
                const list = new listModel({
                    name : paramCustom,
                    items :itemsArray
                })
                list.save()
                res.redirect('/' + paramCustom)
            }
         else{
            res.render('list' ,{listTitle :FoundItems.name, newListitems : FoundItems.items})
        }
    }) .catch({
        if(err){
            console.log(err);
        }
    })
})

app.post('/' , (req ,res)=>{
    var itemname = req.body.newItem
    var listName = req.body.button

    const addItem = new itemModel({
        name :itemname
    })

    if(listName === 'Today'){
        addItem.save()
        res.redirect('/')
    } else {
        listModel.findOne({name : listName}).then(function(FoundItems){
            FoundItems.items.push(addItem)
            FoundItems.save()
            res.redirect('/' + listName)
        })

    }

})

app.post('/delete', (req,res)=>{
const removeId =(req.body.checkbox);

itemModel.findByIdAndRemove(removeId).then(function(err){
  console.log("deleted successfully");
})
res.redirect('/')
})

app.get('/work', (req ,res)=>{
    res.render('list' ,{listTitle : "work" , newListitems : workItems})
})

app.post('/work', (req ,res)=>{
    let item = req.body.newItem
    workItems.push(item)
    res.redirect('/work')
})

app.listen(3000 ,()=>{
    console.log('srver is running on port 3000');
})