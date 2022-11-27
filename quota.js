var express=require('express')
var app=express()
var hbs=require('express-handlebars') 

app.engine('hbs',hbs({
    extname:"hbs"
}))
 
app.set('view engine','hbs') 
app.all('*',function(req,res)
{
    res.render('quota')
})




 
app.listen(process.env.PORT  || 8080,function(){
    console.log('Server Started');
})
