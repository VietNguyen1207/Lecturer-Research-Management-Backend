const express = require("express");
const database = require("./config/db");
// const cors = require("cors");
// const morgan = require("morgan");
// const corsOption = require("./config/corsOption");
const router = require("./routes/rootRoutes");
// const { logger } = require("./middleware/logEvents");
// const cookieParser = require("cookie-parser");

const app = express();
const port = 3000;

// app.use(logger);

database.connect();

// app.use(cors(corsOption));

// app.use(morgan("dev"));

// app.use(cookieParser());

// app.use(express.json());

// app.use(express.urlencoded({ extended: true }));

// app.use("/", express.static(path.join(__dirname, "public")));

app.use("/", router);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
