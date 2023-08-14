import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import _ from 'lodash';

const app=express();
const port=process.env.PORT || 3030
// const port=3000;
// var todo=[];
// var work=[];
function connectToDatabase() {
    try {
      mongoose.connect("mongodb+srv://aniketghorpade360:Aniket2001@todolist.hyueiqg.mongodb.net/tasktrackDB", { useNewUrlParser: true });
      console.log('Database connection successful');
  
    } catch (err) {
      console.error('Error connecting to database:', err);
    }
  }
connectToDatabase();

const taskschema = new mongoose.Schema({
    name: String
});

const Task = mongoose.model("Task", taskschema);

const task1=new Task({
    name:"Welcome to task tracker"
});

const task2=new Task({
    name:"Add daily tasks and delete after completion"
});
const defaulttasks=[task1,task2];
async function insertMany() {

      try {
        await Task.insertMany(defaulttasks);
        console.log("inserted");
      }catch(err){
        console.log(err);
      }
}

const listschema = new mongoose.Schema({
  name: String,
  tasks:[taskschema]
});

const List = mongoose.model("List", listschema);



// const html2="<h1>Work List</h1>"
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.get("/",(req,res)=>{
    async function fetchData() {
        try {
              const taskslist = await Task.find({});
              if(taskslist.length===0){
                insertMany();
              }
            //   console.log(taskslist);
              res.render("index.ejs",{list1:taskslist,html1:"Today"});
            }
        catch (error) {
                console.error(error);
           }
      }
   fetchData(); 
});



app.post("/",(req,res)=>{
  const taskx = new Task({
    name:req.body["input1"]
  });

  if(req.body.listname==="Today"){
    if(req.body["input1"]!=""){
      taskx.save();
    }
   res.redirect("/");
  }else{
    async function additem(){
      try{
        const l1= await List.findOne({name:req.body.listname});
        l1.tasks.push(taskx);
        l1.save();
        res.redirect("/"+req.body.listname);
      } catch(err){
        console.log(err);
      }
    }
    console.log(req.body.listname);
    additem();
    
  }
    
});


app.post("/delete",(req,res)=>{
    // console.log(req.body.check);
    const listname=req.body.listname;
   if(listname==="Today"){
     if(req.body.check){
       Task.deleteOne({_id:req.body.check})
       .then(deleted => {
           console.log("deleted document:", deleted);
           res.redirect("/");
       })
      .catch(error => {
             console.error("Error updating document:", error);
       });
    }
   } else{
    if(req.body.check){
      List.findOneAndUpdate({name:listname},{$pull:{tasks:{_id:req.body.check}}})
      .then(deleted => {
          console.log("deleted document:", deleted);
          res.redirect("/"+listname);
      })
     .catch(error => {
            console.error("Error updating document:", error);
      });
    }
   }
    
}); 


app.get("/:customlist",(req,res)=>{
  // console.log(req.params.customlist);
  const listname=_.capitalize(req.params.customlist);
  async function findone(){
       
       try {
        const found=await List.findOne({name:listname});
        if(!found){
          const list1 =new List({
            name:listname,
            tasks:defaulttasks
          });
          list1.save();
          // console.log("not exists");
          res.redirect("/"+listname);
        }
        else{
          res.render("index.ejs",{list1:found.tasks,html1:found.name});
          //  console.log("exists");
        }
      }
  catch (error) {
          console.error(error);
     }
  }
  findone();
  
});


app.listen(port,()=>{
   console.log(`started the server with ${port}`);
});