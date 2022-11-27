var express=require('express')
var app=express()
var hbs=require('express-handlebars') 
var path=require('path')   
const User = require('./models/pp_user.model.js'); 
const Counterr = require('./models/counter.model.js'); 
const Comment = require('./models/comment.model.js'); 
const KValue = require('./models/key_value.model.js'); 
const Feedback = require('./models/feedback.model.js'); 
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
var KEY="aezakmi"
var per=10;
mongoose.Promise = global.Promise;
    


mongoose.connect("mongodb+srv://cuface:aezakmi@juntos.0v96x.gcp.mongodb.net/cuface?retryWrites=true&w=majority", {
    useNewUrlParser: true
}).then(() => {
    console.log("Successfully connected to the database");   
    
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
});

app.engine('hbs',hbs({
    extname:"hbs"
}))
 
app.use(bodyParser.urlencoded({ extended: true })) 
//app.use(bodyParser.urlencoded())

app.set('view engine','hbs')
app.use(express.static(path.join(__dirname,'public')))

app.all('/',function(req,res){

    

   Comment.find({}) .collation({locale:'en',strength: 2})
   .limit(per).sort({id:-1}).then(function(comments)
   {
       try{
                                        var msg="Need a comment to be removed , Send an email to cuface.official@gmail.com"
                                        if(comments.length<1)
                                        {
                                            msg="Comments"
                                        } 
                                        try{
                                           
                                        for(var i=0;i<comments.length;i++)
                                        {
                                            var user=finduser(comments[i].userid)
                                           
                                            if(user)
                                            {
                                                
                                                comments[i].name=user.name
                                            }
                                        }
                                        
                                    }catch(e){
                                       /// console.log(e)
                                    }
                                        
                                    

    var page=0;
    if(req.query.page)
    page=JSON.parse(req.query.page)
                var params={};
              if(req.body!==undefined && isValid(req.body.query))
                {
                    params=req.body
                }
                else  if(req.query!==undefined && isValid(req.query.query))
                {
                    params=req.query
                }

                var srchq={ }
                if(isValid(params.query))
                {
                     srchq.name= new RegExp(params.query, 'i')
                }

                if(isValid(params.group))
                {
                    srchq.group=new RegExp(params.group, 'i')
                }
               // console.log(srchq)
                User.find(srchq)  .collation({locale:'en',strength: 2}).sort({name:1}).then(function(docs)
                {
                                            var msg="Click On a Batchmate to View"
                                            if(docs.length<1)
                                            {
                                                msg="Can't Find your friend ? Send his/her name with a display picture to cuface.official@gmail.com , we'll add "
                                            }
                                        //   console.log("__",msg)

                                        //shuffle(docs)

                                        var cmts=docs

                                        var startIndex=per*page;
                                        var endIndex=per*page+per+1;
                                        if(!(req.query.query))
                                        {
                                            cmts=[]
                                            for(var i=startIndex;i<docs.length && i<endIndex;i++)
                                            {
                                                cmts.push(docs[i])
                                            } 
                                            
                                        }

                                        KValue.find({},function(err,vals)
                                        {


                                            
                                            res.render('index',{
                                                message:msg,
                                                users:cmts,
                                                page:(page+1),
                                                comments:comments,
                                                poll0:getkey("poll0",vals),
                                                poll1:getkey("poll1",vals),
                                                poll_text:getkey("poll3",vals)?"Poll - "+getkey("poll3",vals).value_str:"Current Poll",
                                                did_poll:req.query.did_poll,
                                                latest:getkey("latest",vals).value_str,
                                        
                                            })
                                            
                                        })

                });
            

 












                                    }catch(e){}

                       })












                       

})


var getkey=function(name,pairs)
{
    if(!pairs)
    return null;
    for(var i=0;i<pairs.length;i++)
    {
        //console.log('  ',name,' ---  ',pairs[i].name)
        if(name==pairs[i].name)
        {
            return pairs[i];
        }
    }
    return null;
}

function swap(arr, i, j) { 
    // swaps two elements of an array in place
    var temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  function randInt(max) { 
    // returns random integer between 0 and max-1 inclusive.
    return Math.floor(Math.random()*max);
  }
  function shuffle(arr) {
    // For each slot in the array (starting at the end), 
    // pick an element randomly from the unplaced elements and
    // place it in the slot, exchanging places with the 
    // element in the slot. 
    for(var slot = arr.length - 1; slot > 0; slot--){
      var element = randInt(slot+1);
      swap(arr, element, slot);
    }
  }
var updateCount=function(cb)
{
    if(cb===undefined)
    {
        cb=function(r){};
    }
    Counterr.findOne({},function(err,count)
    {
        if(count===undefined || count===null)
        {
            var countTask=new Counterr({id:0,count:10})
           
            console.log("Creating new counter");
            countTask.save()
            .then(user => {
                Counterr.findOne({},function(err,count)
                {
                    cb(count.count);
                });
                 
            }).catch(err => {
                
            }); 
        }
        else
        {
            count.count=count.count+1;
            var myquery = {  };
            var newvalues = { $set: count };  
            Counterr.updateOne(myquery, newvalues, function(err, saveRes) {
                Counterr.findOne({},function(err,ct){
                    console.log("Count is ",ct.count);
                    cb(ct.count)
                })
   
               
            });


          

        }
    })
}






app.all('/setkv',function(req,res)
{
 
    if(req.query===undefined || !isValid(req.query.key)|| KEY!==(req.query.key))
    {
        res.send({message:"Unauthorized"})
        return
    }

    KValue.find({},function(err,vals)
    {

        var msg=""
            if(!isValid(req.query.name) || ( !isValid(req.query.value_str) && !isValid(req.query.value_str)) )
            {

                
        res.send({vals:vals,message:msg})
        return
            }


            try{

          
                if(getkey(req.query.name,vals))
                {
                    msg="Key Already exists"
                    res.send({vals:vals,message:msg})
                    return
                }

               
            var keytask=new KValue({

                id: Date.now(),  
                name:req.query.name,  
                value_str: req.query.value_str, 
                value_num:JSON.parse( req.query.value_num )


            });


           
            keytask.save().then(s=>
                {
                    res.redirect('/setkv?key='+req.query.key)
                })
        }catch(e)
        {
          //  console.log(e)
            res.redirect('/')
        }

    });
    


})




app.all('/unsetkv',function(req,res)
{
 
    if(req.query===undefined || !isValid(req.query.key)|| KEY!==(req.query.key))
    {
        res.send({message:"Unauthorized"})
        return
    }

    KValue.find({},function(err,vals)
    {

        var msg="key name invalid"
            if(!isValid(req.query.name))
            {

                
        res.send({vals:vals,message:msg})
        return
            }
          
            KValue.deleteOne({name:req.query.name},function(err)
            {
                res.send({err:err,msg:"Done",vals:vals})
            })


    });
    


})


var lastip=""
app.all('/poll_plus',function(req,res)
{
 
    if(req.query===undefined || !isValid(req.query.name))
    {
        res.redirect('/')
        return
    }
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    if(lastip===ip)
    {
        res.redirect('/?did_poll=1')
        lastip=ip
        return
    }
    lastip=ip
    KValue.findOne({name:req.query.name},function(err,vals)
    {
        if(!vals)
            res.redirect('/')
        else
        {

            //console.log('saving ',vals)

            vals.value_num=(vals.value_num)+1
            var myquery = {name:req.query.name};
            var newvalues = { $set: vals };  
            KValue.updateOne(myquery, newvalues, function(err, saveRes) {
               
             //   console.log("save ",saveRes)
                

                res.redirect('/?did_poll=1')

               
            });
        }


    });
    


})






app.all('/search',function(req,res)
{

    var params={};
    if(req.body!==undefined && isValid(req.body.query))
    {
        params=req.body
    }
    else if(req.query!==undefined && isValid(req.query.query))
    {
        params=req.query
    }

    var srchq={'name' : new RegExp(params.query, 'i')}
    if(isValid(params.group))
    {
        srchq.group=new RegExp(params.group, 'i')
    }
    User.find(srchq, function(err, docs){
       
        res.send(docs)
 
    });
})



app.all('/addUser',function(req,res)
{

    /***
     *    extra: String,
    id: String,   
    name : String, 
    group : String,  

     */
    

    User.find({},function(err,users)
    {
 
        shuffle(users)

        if(!req.query.key || req.query.key!==KEY)
        {
            users=[]
        }

    if(isValid(req.body.name) && isValid(req.body.group)  )
    {
//&& ( isValid(req.body.key) && req.body.key==KEY )

        User.find({name:req.body.name},function(err,data)
        {
            if(err)
            {
                res.render('add',err)
                return
            }
            if(data!==null && data!==undefined && data.length>0)
            {
                res.render('add',{message:"User already exists",user:data,users:users})
            }
            else
            {
                updateCount(function(id)
                {
                    var userTask=new User({name:req.body.name,group:req.body.group,id:id})
                    userTask.save() 
                    .then(user => {
                      
                       
                        User.findOne({id:id},function(err,data)
                        {
                            if(data)
                            {
                                res.render('add',{message:"Created success , Refresh homepage to see new user",user:data,users:users})

                            }
                            else
                            {
                                res.render('add',{message:"Err creating user",users:users})

                            }
                        })
                        
                         
                    }).catch(err => {
                        res.render('add',{message:err,users:users})
                    });  

                })
            }
        })
    }
    else
    {
        res.render('add',{message:"Invalid prameters , name or group ",users:users})
    }


    })



})

app.get('/deleteUser',function(req,res)
{

    if(req.query.key===undefined ||req.query.key!==KEY )
    {
        res.send({message:"Invalid Key ! Please send and email to cuface.official@gmail.com to delet user"})

        return
    }
    User.findOne({id:req.query.id},function(err,user)
    {
        if(err || user===null || user===undefined)
        {
            res.send({message:"User not existe"})
        }
        else
        {
            User.deleteOne({id:req.query.id},function(err)
            {
                if(err)
                res.send(err)
                else
                res.send({message:"Deleted Success",removed_user:user})
            })
        }
    })


})




app.get('/deleteComment',function(req,res)
{
//||req.query.key2!=="aezakmi" 
    if(req.query.key===undefined ||req.query.key!==KEY)
    {
        res.send({message:"Invalid Key"})

        return
    }
    Comment.findOne({id:req.query.id},function(err,user)
    {
        if(err || user===null || user===undefined)
        {
            res.send({message:"Comment not existe"})
        }
        else
        {
            Comment.deleteOne({id:req.query.id},function(err)
            {
                if(err)
                res.send(err)
                else
                res.send({message:"Deleted Success",removed_comment:user})
            })
        }
    })


})



var isValid=function(str)
{
    return str!==undefined &&  str.length>1
}

var getFormattedTime=function(time) {


    var monthNames = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
      ];


    var today = new Date(time);
    var y = today.getFullYear();
    var m =monthNames[today.getMonth()] ;//today.getMonth();
    var d = today.getDate(); 

    var hours = today.getHours();
    var minutes = today.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;



    return d + "-" + m + "-" +y  + " " + strTime;
} 






app.all('/user',function(req,res)
{
 
    if(  ! req.query.id ) 
    {
        res.redirect('/')
        return
    }
    if(req.body.comment )
    {
        var comment=req.body.comment
        var commentTask=new Comment({
            message:req.body.comment,
            id: Date.now(),   
            userid : req.query.id, 
            datetime :  getFormattedTime(Date.now()),  
            name : req.body.name,  

        })

        commentTask.save() .then(user => {
                                    
                            
                    User.findOne({id:req.query.id}, function(err, user){
                        
                        Comment.find({userid:req.query.id},function(err,comments){

                            var msg="Need a comment to be removed , Send an email to cuface.official@gmail.com"
                            if(comments.length<1)
                            {
                                msg="Not Feedbacks yet . Be the first to break the Ice"
                            }


                            //console.log({user:user,comments:comments,message:msg})
                            res.render('user',{user:user,comments:comments,message:msg})




                        })
                        
                
                    });
             
        }).catch(err => {
            res.render('user',{message:err,comment:[]})
        });
    }
    else{

                User.findOne({id:req.query.id}, function(err, user){
                    
                    if(err || !user)
                    {
                        res.redirect('/')
                        return
                    }
                    Comment.find({userid:req.query.id},function(err,comments){

                        var msg="Need a comment to be removed , Send an email to cuface.official@gmail.com"
                        if(comments.length<1)
                        {
                            msg="Not Feedbacks yet . Be the first to break the Ice"
                        }

                        
                        if(req.query.key && req.query.key===KEY)
                        { 
                            res.render('useradmin',{user:user,comments:comments,message:msg })

                        }
                        else
                        {
                            res.render('user',{user:user,comments:comments,message:msg })

                        }
 





                    })
                    
            
                });
    }

})












 
app.listen(process.env.PORT  || 8080,function(){
    console.log('Server Started');
})



var users=[]
var updateuser=function()
{
    User.find({},function(er,us)
    {
       
        users=us
    })
}

var finduser=function(id)
{
    if(users===null) {
        updateuser();
        return null
    }
    for(var i=0;i<users.length;i++)
    {
        if(users[i].id==id)
        return users[i]
    }

    updateuser();
}


app.get('/comments',function(req,res)
{
    if(users.length<1)
         updateuser();
    else
    {
       // console.log(users)
    }
/*
    if(req.query.key===undefined ||req.query.key!==KEY )
    {
        res.send({message:"Invalid Key"})

        return
    } 
    
    */

   Comment.find({}) .collation({locale:'en',strength: 2}).sort({id:-1}).then(function(comments)
   {
       try{
                                        var msg="Need a comment to be removed , Send an email to cuface.official@gmail.com"
                                        if(comments.length<1)
                                        {
                                            msg="Comments"
                                        } 
                                        try{
                                          // console.log(users.length)
                                        for(var i=0;i<comments.length;i++)
                                        {
                                            var user=finduser(comments[i].userid)
                                           // console.log(' ---> ',user)
                                            if(user)
                                            {
                                               // console.log("found ",user.name)
                                                comments[i].name=user.name
                                            }
                                        }
                                        
                                    }catch(e){
                                       /// console.log(e)
                                    }
                                        if(req.query.key && req.query.key===KEY)
                                        { 
                                            res.render('comments',{comments:comments,message:msg,key:req.query})

                                        }
                                        else
                                        {
                                            res.render('comments',{comments:[] ,message:"UnAuthorized"})

                                        }
                                    }catch(e){}

                       })



 

})









app.get('/feedback',function(req,res)
{

    
    Feedback.find({}) .collation({locale:'en',strength: 2}).sort({id:-1}).then(function(feedbacks)
   {
      
    
       try{
                                        var msg="Need to say something to admin , Send an email to cuface.official@gmail.com"
                                       
                                       
                                        
                                        if(req.query.feedback)
                                        {
                                            msg="Thanks for your contribution , it's under review.stay tuned.."
                                            var fb=new Feedback({
                                                message: req.query.feedback,
                                                id: Date.now(),    
                                                datetime : getFormattedTime(Date.now()),  
                                                name : String,  
                                            })

                                            fb.save().then(r=>{

                                               

                                                    res.render('feedback',{
                                                        message:msg
                                                    })


                                            })
                                        }
                                        else
                                        {

                                            if(req.query.key && req.query.key===KEY)
                                            {
                                                res.render('feedback',{
                                                    feedbacks:feedbacks,
                                                    message:msg 
                                                })
                                            }
                                            else
                                            {
                                                res.render('feedback',{ 
                                                    message:msg 
                                                })
                                            }

                                           
                                        }



                                    }catch(e){


                                        console.log(e)
                                    }

                       })



 

})


