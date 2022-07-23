require('dotenv').config()

const express=require('express')
const app=express()
const mongoose=require('mongoose')
const cors=require('cors')
app.use(cors())
mongoose.connect(process.env.DATABASE_URL)
const db=mongoose.connection
db.on('error',(error)=>console.log(error))
db.once('open',()=>console.log('connected to database!'))

app.use(express.json())

const users=require('./routes/users')
app.use('/users',users)
app.use('/notes',require('./routes/notes'))

app.listen(3000,()=>console.log('server started!'))
