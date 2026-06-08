const mongoose = require("mongoose");
mongoose.connect("mongodb://admin:Rudy%40143@ac-uttjm1y-shard-00-00.a8zerow.mongodb.net:27017,ac-uttjm1y-shard-00-01.a8zerow.mongodb.net:27017,ac-uttjm1y-shard-00-02.a8zerow.mongodb.net:27017/rvr_catering?ssl=true&authSource=admin&retryWrites=true&w=majority")
.then(() => console.log("Connected!"))
.catch(err => console.error(err))
.finally(() => process.exit());
