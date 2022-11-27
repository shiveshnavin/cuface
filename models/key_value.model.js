const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({ 
    
    id: String,  
    name: String,  
    value_str: String, 
    value_num: Number 
}, {
    timestamps: true
});

 module.exports = mongoose.model('KValue', UserSchema);