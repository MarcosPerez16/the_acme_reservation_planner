const pg = require("pg");
const uuid = require("uuid");
const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/acme_reservation_db"
);

const createTables = async () => {
  const SQL = `
    DROP TABLE IF EXISTS reservations;
    DROP TABLE IF EXISTS customers;
    DROP TABLE IF EXISTS restaurants;

    CREATE TABLE customers (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(100)
    );

    CREATE TABLE restaurants (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(100)
    );

    CREATE TABLE reservations (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      date DATE NOT NULL,
      party_count INTEGER NOT NULL,
      restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
      customer_id UUID REFERENCES customers(id) NOT NULL
    );

    INSERT INTO customers(name) VALUES ('John Doe'), ('Jane Smith');
    INSERT INTO restaurants(name) VALUES ('Restaurant A'), ('Restaurant B');

    INSERT INTO reservations(date, party_count, restaurant_id, customer_id)
      VALUES
        ('2024-03-01', 5, (SELECT id FROM restaurants WHERE name = 'Restaurant A'), (SELECT id FROM customers WHERE name = 'John Doe')),
        ('2024-03-02', 3, (SELECT id FROM restaurants WHERE name = 'Restaurant B'), (SELECT id FROM customers WHERE name = 'Jane Smith'));
  `;
  await client.query(SQL);
};

const createCustomer = async (name) => {
  const SQL = `
        INSERT INTO customers(id, name) VALUES($1, $2) RETURNING *
        `;
  const response = await client.query(SQL, [uuid.v4(), name]);
  return response.rows[0];
};

const createRestaurant = async (name) => {
  const SQL = `
    INSERT INTO restaurants(id, name) VALUES($1, $2) RETURNING *
    `;
  const response = await client.query(SQL, [uuid.v4(), name]);
  return response.rows[0];
};

const fetchCustomers = async () => {
  const SQL = `
        SELECT * FROM customers
    `;
  const response = await client.query(SQL);
  return response.rows;
};

const fetchRestaurants = async () => {
  const SQL = `
    SELECT * FROM restaurants
    `;
  const response = await client.query(SQL);
  return response.rows;
};

const fetchReservations = async () => {
  const SQL = `
        SELECT * FROM reservations
    `;
  const response = await client.query(SQL);
  return response.rows;
};

const createReservation = async ({
  restaurant_id,
  customer_id,
  date,
  party_count,
}) => {
  const SQL = `
        INSERT INTO reservations(id, restaurant_id, customer_id, date, party_count) VALUES($1,$2,$3,$4,$5) RETURNING *
    `;
  const response = await client.query(SQL, [
    uuid.v4(),
    restaurant_id,
    customer_id,
    date,
    party_count,
  ]);
  return response.rows[0];
};

const destroyReservation = async (id) => {
  const SQL = `
        DELETE FROM reservations WHERE id = $1
    `;
  await client.query(SQL, [id]);
};

module.exports = {
  client,
  createTables,
  createCustomer,
  createRestaurant,
  fetchCustomers,
  fetchRestaurants,
  fetchReservations,
  createReservation,
  destroyReservation,
};
