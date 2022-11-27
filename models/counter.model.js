const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({ 
    
    id: String,   
    count : Number   
}, {
    timestamps: true
});

 module.exports = mongoose.model('Counter', UserSchema);