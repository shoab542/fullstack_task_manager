const db = require("../db");
const bcrypt = require("bcrypt");
const jsonWebToken = require("jsonwebtoken");

exports.register = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new Error("Please enter an email and password"));
    }
    const hashPassword= await bcrypt.hash(password, 10);

    const [result]= await db.query("INSERT INTO users (email, password) VALUES(?, ?)", [email, hashPassword])
    res.json({
        success: true,
        message: "User registered",
      });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res , next) =>{
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new Error("Please enter an email and password"));
    }

    const [rows]= await db.query("SELECT * FROM users WHERE email= ?",[email]);
    if (rows.length === 0) {
        return next(new Error("Invalid credentials"));
      }

    const user = rows[0];
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return next(new Error("Invalid credentials"));
      }
    const token = jsonWebToken.sign(
        {id: user.id},
        process.env.JWT_SECRET,
        { expiresIn: "1d" },
    )
    res.json({
        success: true,
        token,
      });
}
