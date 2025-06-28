const cron=require('node-cron')
const BloodRequest = require('../models/BloodRequest');
const BloodOffer = require('../models/BloodOffer');
const User = require('../models/User');

cron.schedule('0 0 0 * * *',async()=>{
    try{
        const now= new Date();
        const pastoffer=await BloodOffer.find({
            status:'Confirmed',
            appointmentTime:{$lt:now}
        })
        for(let offer of pastoffer){
            if(offer.status === 'Completed'){
                continue;
            }
            offer.status = 'Completed';
            await offer.save();

            await User.findByIdAndUpdate(offer.user,
                {$inc: { donationCount: 1 },
                 $set: { lastDonated: offer.appointmentTime} },
                { new: true })
        }
        

    }
    catch(err){
        console.error('Error in cron job:', err);
    }
})