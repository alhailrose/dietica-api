const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require("body-parser");
const db = require("./database");
const response = require("./response");
require("dotenv").config();

app.use(bodyParser.json());

app.get("/", (req, res) => {
  response(200, "API Profiler ready to use", "SUCCESS", res);
});

app.get("/users", (req, res) => {
  const sql =
    "SELECT name, email, birthdate, sex, height, weight FROM profiler";

  db.query(sql, (err, fields) => {
    const data = {};
    response(200, fields, "SUCCESS", res);
  });
});

const moment = require("moment"); // Tambahkan pustaka moment

app.get("/users/:email", (req, res) => {
  const email = req.params.email;
  const sql = `SELECT name, email, birthdate, sex, height, weight FROM profiler WHERE email = '${email}'`;

  db.query(sql, (err, fields) => {
    if (err) {
      return response(500, "Database error", "error", res); // Tangani error
    }

    // Memformat tanggal birthdate sebelum mengirimkan response
    if (fields.length > 0) {
      fields.forEach((user) => {
        user.birthdate = moment(user.birthdate).format("YYYY-MM-DD"); // Memformat tanggal
      });
    }

    response(200, fields, `Specific data by email '${email}'`, res);
  });
});

app.post("/register", (req, res) => {
  const { name, email, password, birthdate, sex, height, weight } = req.body;
  const sql = `INSERT INTO profiler (name, email, password, birthdate, sex, height, weight) VALUES ('${name}', '${email}', '${password}', '${birthdate}', '${sex}', ${height}, ${weight})`;

  db.query(sql, (err, fields) => {
    if (err) response(500, "invalid", "error", res);
    if (fields?.affectedRows) {
      const data = {
        isSuccess: fields.affectedRows,
        email: fields.email,
      };
      response(200, data, "Data Added Successfuly", res);
    }
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const sql = `SELECT email, password FROM profiler WHERE email = '${email}'`;

  db.query(sql, (err, fields) => {
    if (err) {
      console.error("Kesalahan dalam menjalankan kueri:", err);
      return response(500, {}, "Terjadi kesalahan dalam login", res);
    }

    if (fields.length === 0) {
      return response(
        200,
        { success: false },
        "Gagal login: Pengguna tidak ditemukan",
        res
      );
    }

    const user = fields[0];
    if (user.password === password) {
      return response(200, { success: true }, "Berhasil login", res);
    } else {
      return response(
        200,
        { success: false },
        "Gagal login: Email atau password salah",
        res
      );
    }
  });
});

app.put("/users/:email", (req, res) => {
  const email = req.params.email;
  const { name, password, birthdate, sex, height, weight } = req.body;
  const sql = `UPDATE profiler SET name = '${name}', password = '${password}', birthdate = '${birthdate}', sex = '${sex}', height = ${height}, weight = ${weight} WHERE email = '${email}'`;

  db.query(sql, (err, fields) => {
    if (err) response(500, "invalid", "error", res);
    if (fields?.affectedRows) {
      const data = {
        isSuccess: fields.affectedRows,
        message: fields.message,
      };
      response(200, data, "Update Data Successfuly", res);
    } else {
      response(404, "user not found", "error", res);
    }
  });
});

app.delete("/users", (req, res) => {
  const { email } = req.body;
  const sql = `DELETE FROM profiler WHERE email = '${email}'`;
  db.query(sql, (err, fields) => {
    if (err) response(500, "invalid", "error", res);

    if (fields?.affectedRows) {
      const data = {
        isDeleted: fields.affectedRows,
      };
      response(200, data, "Delete Data Successfuly", res);
    } else {
      response(404, "user not found", "error", res);
    }
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
