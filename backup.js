 var fs=require('fs')
async function log(arg)
{
    //console.log(arg);
    update(arg)
}
var maxC=0;
var curC=1;
async function process(n){

    var coll = db.collection(n.name)
    var count = await coll.countDocuments()
    log(n.name+ "   =   "+count);
    await coll.find()
    .toArray((err, results) => {
        if(err) throw err;

        output[n.name]=results;
        log("Dumped "+n.name+" ("+curC+"/"+maxC+")");
        if(maxC>curC)
        {
            curC++;
        }
        else{ 
            log("\n\n All Dumps completed !!");
            log("Uploading to GCS bucket....")
            write();
        }
    }) 
};

async function write()
{
    fs.writeFileSync(file,JSON.stringify(output));
    // FileUpload.uploadDataToCloud({
    //     name:file,
    //     blob:JSON.stringify(output)
    // },function(data){
    //     console.log(data.url)
    //     finish("Done !");
    // })
}

function getDateString() {
     var d = new Date();

    var datestring = d.getFullYear()  + "" + (d.getMonth()+1) + "" + d.getDate() + "_" +
    d.getHours() + "" + d.getMinutes();

    return datestring;
}

var output={};
var file;
var db;
async function dump(){
    file="dumps/dump_"+getDateString()+".json";
    log("Dumps Saved to "+file);
    db.listCollections().toArray(function (err, names) {
        if(maxC == 0)
        {
            maxC = names.length;
        }
        names.forEach(process)
    });

}

var update;
var finish;

var backup=function (dbc, upd,fin) {
    var module = {};

    if(upd==undefined || dbc == undefined)
    {
        fin("No DB Connection");
        return
    }
    db=dbc;
    update=upd;
    finish=fin;
    module.dump =  dump
    return module;
};
module.exports = backup;

const mongoose = require('mongoose');


mongoose.connect("mongodb://ut5bygpcen2ojyz5km2u:GQDBtsMOZZ4S1d6xzZj7@bppc3ptxjl9gyv7-mongodb.services.clever-cloud.com:27017/bppc3ptxjl9gyv7", {
    useNewUrlParser: true
}).then(() => {
    console.log("Successfully connected to the database");  
     var bpk=backup(mongoose.connection.db,function(data){
        console.log(data)
    },function(fin){
        console.log(fin)
    }) 
    bpk.dump()
    
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    
});
mongoose.Promise = global.Promise;