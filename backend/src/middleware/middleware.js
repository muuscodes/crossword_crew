// app.use(async (req, res, next) => {
//   req.dbClient = await connectToDatabase(); // Attach the client to the request
//   next();
// });

// // Example route using the database client
// app.get("/data", async (req, res) => {
//   try {
//     const result = await req.dbClient.query("SELECT * FROM your_table"); // Replace with your query
//     res.json(result.rows);
//   } catch (error) {
//     console.error("Query error", error);
//     res.status(500).send("Internal Server Error");
//   } finally {
//     await req.dbClient.end(); // Close the client after the request
//   }
// });
