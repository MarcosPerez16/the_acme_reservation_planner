const { createTables, client } = require("./db");
const express = require("express");
const app = express();

const startServer = async () => {
  try {
    await client.connect();
    console.log("Connected to database");

    await createTables();
    console.log("Tables created");

    //REST API routes here

    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Listening on port ${port}`));
  } catch (error) {
    console.error("Error during server init:", error);
  }
};

startServer();
