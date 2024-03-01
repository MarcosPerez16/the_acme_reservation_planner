const {
  createTables,
  client,
  createCustomer,
  createRestaurant,
  fetchCustomers,
  fetchRestaurants,
  fetchReservations,
  createReservation,
  destroyReservation,
} = require("./db");
const express = require("express");
const app = express();

//Middleware
app.use(express.json());

//REST API Routes

app.get("/api/customers", async (req, res, next) => {
  try {
    const customers = await fetchCustomers();
    res.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/restaurants", async (req, res, next) => {
  try {
    const restaurants = await fetchRestaurants();
    res.json(restaurants);
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/reservations", async (req, res, next) => {
  try {
    const reservations = await fetchReservations();
    res.json(reservations);
  } catch (error) {
    console.error("Error fetching reservations:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/customers/:id/reservations", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { restaurant_id, date, party_count } = req.body;

    const customers = await fetchCustomers();

    const customer = customers.find((customer) => customer.id === id);

    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    const reservation = await createReservation({
      restaurant_id,
      customer_id: id,
      date,
      party_count,
    });

    res.status(201).json(reservation);
  } catch (error) {
    console.error("Error creating reservation:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete(
  "/api/customers/:customer_id/reservations/:id",
  async (req, res, next) => {
    try {
      const { customer_id, id } = req.params;

      await destroyReservation(id);

      res.sendStatus(204);
    } catch (error) {
      console.error("Error deleting reservation:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

const startServer = async () => {
  try {
    await client.connect();
    console.log("Connected to database");

    await createTables();
    console.log("Tables created");

    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Listening on port ${port}`));
  } catch (error) {
    console.error("Error during server init:", error);
  }
};

startServer();
