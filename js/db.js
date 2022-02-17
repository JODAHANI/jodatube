import mongoose from "mongoose";

// 커넥트 된 애 가지고 와서 옆에 꼭 /뭐붙여주삼 이름을 붙여주삼.
mongoose.connect('mongodb://127.0.0.1:27017/jodatube').then(() => {
    console.log('잘 연결됐음.')
}).catch( (err) => {
    console.log(err)
});

export const db = mongoose.connection;

// import mongoose from "mongoose";

// mongoose.connect(process.env.DB_URL, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   useFindAndModify: false,
//   useCreateIndex: true,
// });



// const handleOpen = () => console.log("✅ Connected to DB");
// const handleError = (error) => console.log("❌ DB Error", error);

// db.on("error", handleError);
// db.once("open", handleOpen);