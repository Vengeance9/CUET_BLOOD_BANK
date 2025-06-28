const app=require('./app')
require('./utils/appointmentChecker')
const port=process.env.PORT || 5000

if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET not set in .env');
    process.exit(1);
  }
  

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`)
})