const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({ 
    message: String,
    id: String,    
    datetime : String,  
    name : String,  
}, {
    timestamps: true
});

 module.exports = mongoose.model('PPFeedback', UserSchema);