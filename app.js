const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");


//////connecting to DB
main().then(()=>{
    console.log("connected to db");
})
.catch((err)=>{
    console.log(err);
});

async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
////////////////

app.get("/",(req,res)=>{
    res.send("hi, i'm Root");
});
///////index route
app.get("/listings",async(req,res)=>{
   const allListings = await Listing.find({});
   res.render("listings/index.ejs",{ allListings });
   
});

/////new route

app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
});

//////show route

app.get("/listings/:id",wrapAsync(async(req,res)=>{
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs",{ listing });
}));



/////Create root...

app.post("/listings",wrapAsync(async(req,res,next)=>{
    ///let { name , decsription , image , price , country , location } = req.body;
    if(!req.body.listing){
        throw new ExpressError(400,"send valid data for listing");
    }
   
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");
    })
);
/////edit route
app.get("/listings/:id/edit",
    wrapAsync(async(req,res)=>{
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));
///update route
app.put("/listings/:id",wrapAsync(async(req,res)=>{
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${ id }`);
}));
/////delete route
app.delete("/listings/:id",wrapAsync(async (req,res) =>{
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));




//////////route /testlisting
// app.get("/testListing",async(req,res)=>{
//     let sampleListing = new Listing({
//         title : "My new villa",
//         description : "by the beach",
//         image :{
//             filename : "listingimage",
//             url : "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGxha2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
//         },
//         price : 1200,
//         location : "calangute , Goa",
//         country : "India",
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });
app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"page not found"));
});

///custom middleware
app.use((err,req,res,next)=>{
    let { statusCode = 500 , message} = err;
    res.status(statusCode).render("error.ejs",{ message });
    ///res.status(statusCode).send(message);
});

app.listen(8080,()=>{
    console.log("server is listening to port 8080 ");
});