const db = require("../../models/index").db;
// import {config} from './../../config'
const config = require("../../config");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.createUser = async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ msg: "Email is mandatory." });
    }
    if (!phone) {
      return res.status(400).json({ msg: "phone is mandatory." });
    }
    if (!name) {
      return res.status(400).json({ msg: "name is mandatory." });
    }
    if (!password) {
      return res.status(400).json({ msg: "password is mandatory." });
    }

    let user = await db.query("SELECT * FROM users WHERE email=$1", [email]);
    if (user.rows.length > 0) {
      return res
        .status(400)
        .json({ msg: "User with this email already exists" });
    }

    if (
      (await db.query("SELECT * FROM users WHERE phone=$1", [phone])).rows
        .length > 0
    ) {
      return res
        .status(400)
        .json({ msg: "User with this phone number already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    await db.query(
      "INSERT INTO users (name, email, phone, password) VALUES ($1, $2, $3, $4)",
      [name, email, phone, hash]
    );

    user = await db.query(
      "SELECT id, name, email, phone FROM users WHERE email=$1",
      [email]
    );

    const token = jwt.sign({ id: user.rows[0].id }, config.jwtsecret, {
      expiresIn: "1h",
    });

    res.json({ user: user.rows[0], token });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send(`Server Error: ${err}`);
  }
};

exports.updateUser = async (req, res) => {
  const id = req.params.id;

  try {
    let user = (
      await db.query("SELECT * FROM users WHERE id=$1", [req.user.id])
    ).rows[0];
    const name = req.body.name ? req.body.name : user.name;
    const email = req.body.email ? req.body.email : user.email;
    const phone = req.body.phone ? req.body.phone : user.phone;
    const salt = await bcrypt.genSalt(10);

    const hash = req.body.password
      ? await bcrypt.hash(req.body.password, salt)
      : user.password;
    await db.query(
      "UPDATE users SET name = $2, email = $3, phone = $4, password = $5 WHERE id = $1",
      [id, name, email, phone, hash]
    );
    console.log("after db update");
    user = await db.query(
      "SELECT id, name, email, phone FROM users WHERE id=$1",
      [user.id]
    );
    res.json(user.rows[0]);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json( {error:`Server Error: ${error}`});
  }
};

exports.signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const storedHashedPassword = user.password;
      console.log("after hashed password");
      const data = await bcrypt.compare(password, storedHashedPassword);
      if (data) {
        delete user.password;

        console.log("password is verified");
        const token = jwt.sign({ id: user.id }, config.jwtsecret, {
          expiresIn: "1h",
        });
        res.json({ user: user, token: token });
      }else{
        return res.status(400).json({ error: "Password is incorrect" });
      }
    } else {
      return res.status(400).json({ error: "User not found" });
    }
  } catch (err) {
    return res.status(400).json({ error: err });
  }
};

exports.deleteUser = async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await db.query(
          "DELETE FROM users WHERE id = $1 RETURNING *",
          [userId]
        );
        if (result.rowCount === 0) {
          return res.status(404).json({ error: "user not found" });
        }
        res.json({ message: "User deleted successfully" });
      } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: "Internal server error" });
      }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await db.query(
      "SELECT id, name, email, phone FROM users WHERE id=$1",
      [req.params.id]
    );
    if (user.rows.length > 0) {
      res.json(user.rows[0]);
    } else {
      return res.status(400).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error while getting user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await db.query("SELECT name, email, phone FROM users");
    if (users.rows.length > 0) {
      res.json({users: users.rows});
    } else {
      return res.status(400).json({ message: "No users present" });
    }
  } catch (error) {
    console.error("Error while getting all user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.searchUserByName = async (req, res) => {
  try {
    const name = req.query.name;
    const cleanedName = name ? `%${name}%` : '%';

    const users = await db.query(
      "SELECT name, email, phone FROM users WHERE name ILIKE $1",
      [cleanedName]
    );
    if (users.rows.length > 0) {
      res.json({users: users.rows});
    } else {
      return res.status(400).json({ message: "No users present" });
    }
  } catch (error) {
    console.error("Error searching users:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
