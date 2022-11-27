const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({ 
    extra: String,
    id: String,   
    name : String, 
    group : String,  
}, {
    timestamps: true
});

 module.exports = mongoose.model('PPUser', UserSchema);