var express = require("express");
var app = express();

const path = require("path");

app.use(express.static(__dirname + "/dist/rpg-sheet-app"));

app.all("*", (req,res,next) => {
    res.sendFile(path.resolve(__dirname + "/dist/rpg-sheet-app/index.html"));
});

app.listen(8000, function() {
    console.log(__dirname)
    console.log("listening on port 8000");
});