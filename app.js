const express=require('express')
const exphbs=require('express-handlebars')
const path=require('path')
const bodyParser=require('body-parser')
const methodOverride=require('method-override')
const redis=require('redis')
const dotenv=require('dotenv')

dotenv.config({path:'./config/dev.env'})
const PORT=process.env.PORT
const app=express()
let client=redis.createClient()

client.on('connect',()=>{
    console.log('Connected to redis')
})

app.engine('handlebars',exphbs({defaultLayout:'main'}))
app.set('view engine','handlebars')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))
app.use(methodOverride('_method'))

app.get('/',(req,res,next)=>{
    res.render('searchusers')
})

app.post('/user/search',(req,res,next)=>{
    let id=req.body.id
    client.hgetall(id,(err,obj)=>{
        if(!obj){
            res.render('searchusers',{
                error:'Uset does not exist'
            })
        }else{
            obj.id=id
            res.render('details',{
                user:obj
            })
        }
    })
})

app.get('/user/add',(req,res)=>{
    res.render('adduser')
})

app.post('/user/add',(req,res)=>{
    let id=req.body.id
    let first_name=req.body.first_name
    let last_name=req.body.last_name
    let email=req.body.email
    let phone=req.body.phone

    client.HMSET(id,[
        'first_name',first_name,
        'last_name',last_name,
        'phone',phone,
        'email',email
    ],(err,reply)=>{
        if(err){console.log(err)}
        else{console.log(reply)}
        res.redirect('/')
    })
})

app.delete('/user/delete/:id',(req,res)=>{
    client.DEL(req.params.id)
    res.redirect('/')
})

app.listen(PORT,()=>{console.log('Server started on port',PORT)})