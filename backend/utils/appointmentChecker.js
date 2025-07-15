const cron=require('node-cron')
const BloodRequest = require('../models/BloodRequest');
const BloodOffer = require('../models/BloodOffer');
const User = require('../models/User');

cron.schedule('* * * * *',async()=>{
  //  console.log('Running cron job to update past offers...');
    try{
        const now= new Date();

        const pastoffer=await BloodOffer.find({
            status:'Confirmed',
            appointmentTime:{$lt:now}
        })

     //   console.log(`Found ${pastoffer.length} past confirmed offers`);


        for(let offer of pastoffer){
            if(offer.status === 'Completed'){
                continue;
            }
            offer.status = 'Completed';
            await offer.save();

            let date = new Date(offer.appointmentTime);

            console.log(`Updating user ${offer.user} with lastDonated: ${offer.appointmentTime}`);

            await User.findByIdAndUpdate(offer.user,
                {$inc: { donationCount: 1 },
                 $set: { lastDonated: date} },
                { new: true })
        }
        
        

    }
    catch(err){
        console.error('Error in cron job:', err);
    }
})