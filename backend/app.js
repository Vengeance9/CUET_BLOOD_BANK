require('dotenv').config()
const express=require('express')
const cors=require('cors')
const morgan=require('morgan')
const routes = require('./routes/authroutes')
const dashboardRoutes = require('./routes/dashboardRoutes');
const requestRoutes = require('./routes/requestRoutes');
const offerRoutes = require('./routes/offerRoutes');
const adminRoutes = require('./routes/adminRoutes');

const connectdb= require('./config/db')

const app=express()

connectdb()

app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

app.use('/api/auth',routes)
app.use('/api/users', dashboardRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/campaigns',dashboardRoutes)



app.get('/',(req,res)=>{
    res.send('API is running...')
})

module.exports=app;