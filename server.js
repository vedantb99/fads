var port = process.env.PORT || 3000;
// var url = require("url");
const fs = require("fs");
// var url_parts = url.parse(request.url, true);
// var url1 = url_parts.query;
// @Session
const session = require("express-session");

const express = require("express");
const upload = require("express-fileupload");

// One time opening bal insert
var op_check=0
// @mail checker
var emailCheck = require("email-check");

const path = require("path");
// EVN FILE
require("dotenv").config();
// For Sending Mail
const nodemailer = require("nodemailer");
// transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  // port: 465,
  // // secure: true,
  // auth: {
  //   type: "OAuth2",
  //   user: process.env.Gmail_user,
  //   clientId:
  //     "1001947679627-8nc21fvrongl43epavgbks1jm4b4hpuo.apps.googleusercontent.com",
  //   clientSecret: "CVPaLux8NWutj1x0PqJ4MBhx",
  // },
  auth: {
    user: process.env.Gmail_user,
    pass: process.env.Gmail_pass,
  },
});
// console.log(process.env.Gmail_user);
// var mailOptions = {
//   from: process.env.Gmail_user,
//   to: "ritvij05@gmail.com",
//   subject: "Sending Email using Node.js",
//   text: "That was easy!",
// };

// transporter.sendMail(mailOptions, function (error, info) {
//   if (error) {
//     console.log(error.message);
//   } else {
//     console.log("Email sent: " + info.response);
//   }
// });

// webtoken
var jwt = require("jsonwebtoken");
const Email_Secret = "pds-nic_project_intership";

// database
const mysql = require("mysql");
const bodyParser = require("body-parser");

const app = express();

//For hashing
var bcrypt = require("bcryptjs");
const saltRounds = 10;

const dateTime = require("date-time");
var datetime = new Date();
// if (datetime.getDate() == 5) {
//   updateCashBook();
// }

// Scheduling Task
var cron = require("node-cron");
//MIN HR DT MONTH DAY_OF_WEEk
var task = cron.schedule("0 0 28 * *", () => {
  updateCashBook();
});

// modules of database
const Register = require("./database/register");
const Error_log = require("./database/error_log");
const Login = require("./database/login");
const Confirmation = require("./database/confirmation");
const forgetpass = require("./database/forgetpassword");
const Gras = require("./database/gras");
const GrasUpdate = require("./database/gras_update");
const Remittance = require("./database/remittance");
const OtherReceipts = require("./database/other_receipts");
const OtherReceiptsUpdate = require("./database/other_receipts_update");
const RemittanceUpdate = require("./database/remittance_update");
const CashBook_month = require("./database/cashbook_month");
const Changepass = require("./database/changepass");
const Acknowledge = require("./database/acknowledge");
const Acknowledge_up = require("./database/acknowledge_update");
const { query } = require("express");
//setting view engine to ejs, to able to render ejs files
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/views"));

//joining path of directory
// app.use(
//   "/views/pages/gras.ejs",
//   express.static(path.join(__dirname, "./gras_pdf"))
// );

// memory leak issue solving line and session creation
// npm install express-session memorystore
var MemoryStore = require("memorystore")(session);
// Session
app.use(
  session({
    cookie: { maxAge: 86400000 },
    store: new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    }),
    resave: true,
    saveUninitialized: true,
    secret: "pds-nic_project_intership",
  })
);

//including public folder for accessing files present in public folder
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/gras_pdf"));
//file upload
app.use(upload());

// Body Parser
app.use(bodyParser.json());

var urlencodedParser = bodyParser.urlencoded({ extended: true });

// Database connection
const connection = mysql.createConnection({
  // host: process.env.db_server,
  // user: process.env.db_username,
  // password: process.env.db_pass,
  // database: process.env.db_name,

  host: process.env.db_local_server,
  user: process.env.db_local_username,
  password: process.env.db_local_pass,
  database: process.env.db_local_name,
  multipleStatements: true,
});

// Checking connection
connection.connect((error) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Connected to database!");
  }
});

// server start
app.listen(port, function () {
  console.log("Listening at port 3000");
});

function updateCashBook() {
  var month = new Array();
  month[0] = "January";
  month[1] = "February";
  month[2] = "March";
  month[3] = "April";
  month[4] = "May";
  month[5] = "June";
  month[6] = "July";
  month[7] = "August";
  month[8] = "September";
  month[9] = "October";
  month[10] = "November";
  month[11] = "December";
  var M = month[datetime.getMonth()];
  var Y = datetime.getFullYear();
  let last_financial_year, last_month, financial_year, opening_bal;
  if (M == "January") {
    // last_financial_year = Y - 2 + "-" + (Y - 1);
    last_financial_year = Y - 1;
    last_month = "December";
    // financial_year = Y - 1 + "-" + Y;
    financial_year = Y;
    // console.log(last_financial_year + " " + last_month + " " + financial_year);
  } else {
    // last_financial_year = Y - 1 + "-" + Y;
    last_financial_year = Y;
    // financial_year = Y - 1 + "-" + Y;
    financial_year = Y;
    last_month = month[datetime.getMonth() - 1];
  }
  var selectquery = `select closing_bal from cash_book_total_val where month= '${last_month}' and financial_year='${last_financial_year}'`;
  try {
    connection.query(selectquery, function (error, result) {
      if (error) {
        console.error(error.message);
      } else {
        opening_bal = result[0].closing_bal;
        var Insertquery = `insert into cash_book_total_val(month,financial_year,opening_bal,closing_bal)values('${M}','${Y}',${opening_bal},${opening_bal})`;
        connection.query(Insertquery, function (error, result) {
          if (error) {
            console.error(error.message);
          }
        });
        // console.log(result[0].closing_bal);
      }
    });
  } catch (error) {
    //Convert JS datetime To mysql datetime
    var dt =
      datetime.toISOString().split("T")[0] +
      " " +
      datetime.toTimeString().split(" ")[0];
    var query1 = `insert into error_log(page_name,error_date,error)values('${"updateCashBook()"}', '${dt}','${
      error.message
    }');`;
    connection.query(query1);
  }
}

app.get("/download", function (req, res) {
  // console.log(req.param("filename"));
  res.download(req.param("filename"));
});

// Error Log :
//                                                                 value:Page-Name
//            1. Error on server.js while page processing (DB) ==> pagename(server.js)
//            2. Error on render page                          ==> pagename-render(server.js)
//            3. Error on database pagename.js                 ==> pagename.js

//Setting the index page render or start page Route
app.get("/", function (req, res) {
  // res.redirect('/');
  // req.session.username = "adward";
  // req.session.user_type = "Jr.Accountant";
  if (req.session.username) {
    res.redirect("/home");
  } else {
    res.render("pages/index", {
      session: req.session.username,
      user_type: req.session.user_type,
    });
  }
});

// Login Process
app.post("/submit_login", urlencodedParser, function (req, res) {
  let username = req.body.username;
  let user_ip = req.body.user_ip;
  let reg_dt = new Date();
  let password = req.body.password;
  console.log(dt);
  var dt =
    reg_dt.toISOString().split("T")[0] +
    " " +
    reg_dt.toTimeString().split(" ")[0];
  // console.log(dt);
  try {
    Login.login(username, user_ip, dt, password, connection, res, bcrypt, req);
  } catch (error) {
    // console.log("hehehee");
    Error_log.error_log("login(server.js)", reg_dt, error, connection, res);
  }
});

// After Login Render home page
app.get("/home", function (req, res) {
  if (req.session.username) {
    connection.query(
      `SELECT * from login_check where username='${req.session.username}' ORDER BY login_dt DESC LIMIT 1 OFFSET 1;`,
      (error, rows) => {
        if (error) {
          Error_log.error_log(
            "home-render(server.js)",
            datetime,
            error,
            connection,
            res
          );
        }
        var last_login;
        var last_logout;
        // console.log("Data received from Db:");
        last_login = rows.map(function (item) {
          return item["login_dt"];
        });
        last_logout = rows.map(function (item) {
          return item["logout_dt"];
        });
        if (last_login[0] != null) {
          last_login =
            "Date: " +
            last_login[0].toISOString().split("T")[0] +
            " Time: " +
            last_login[0].toTimeString().split(" ")[0];
        } else {
          last_login = "-";
        }
        if (last_logout[0] != null) {
          last_logout =
            "Date: " +
            last_logout[0].toISOString().split("T")[0] +
            " Time: " +
            last_logout[0].toTimeString().split(" ")[0];
        } else {
          last_logout = "-";
        }
        // console.log(last_login);
        // console.log(last_logout);
        var gras, ack, rem;
        if (
          req.session.user_type != "Admin" &&
          req.session.user_type != "ABC"
        ) {
          var query = `select COUNT(*) from gras where status=2;select COUNT(*) from acknowledgement where status=2;select COUNT(*) from remittance where status=2;select COUNT(*) from other_receipts where status=2;`;
          connection.query(query, (error, rows1) => {
            // console.log(rows1);
            // });
            // console
            console.log(rows1);
            gras = rows1[0].map(function (item) {
              return item["COUNT(*)"];
            });
            ack = rows1[1].map(function (item) {
              return item["COUNT(*)"];
            });
            rem = rows1[2].map(function (item) {
              return item["COUNT(*)"];
            });
            other = rows1[3].map(function (item) {
              return item["COUNT(*)"];
            });
            // console.log(gras + " dqwdwq");
            res.render("pages/home", {
              session: req.session.username,
              user_type: req.session.user_type,
              last_login: last_login,
              last_logout: last_logout,
              gras: gras,
              ack: ack,
              rem: rem,
              other: other,
            });
          });
        } else if (req.session.user_type == "ABC") {
          var query = `select COUNT(*) from gras where status=0;select COUNT(*) from acknowledgement where status=0;select COUNT(*) from remittance where status=0;select COUNT(*) from other_receipts where status=0;`;
          connection.query(query, (error, rows1) => {
            console.log(rows1 + "here");
            // });
            // console
            // // console.log("Data received from Db:");
            gras = rows1[0].map(function (item) {
              return item["COUNT(*)"];
            });
            ack = rows1[1].map(function (item) {
              return item["COUNT(*)"];
            });
            rem = rows1[2].map(function (item) {
              return item["COUNT(*)"];
            });
            other = rows1[3].map(function (item) {
              return item["COUNT(*)"];
            });
            console.log(other);
            res.render("pages/home", {
              session: req.session.username,
              user_type: req.session.user_type,
              last_login: last_login,
              last_logout: last_logout,
              gras: gras,
              ack: ack,
              rem: rem,
              other,
              other,
            });
          });
        } else if  (req.session.user_type == "Admin"){ 
          gras = "-";
          ack = "-";
          rem = "-";
          res.render("pages/home", {
            session: req.session.username,
            user_type: req.session.user_type,
            last_login: last_login,
            last_logout: last_logout,
            gras: gras,
            ack: ack,
            rem: rem,
            op_check:op_check,
          });
        }
        else {
          gras = "-";
          ack = "-";
          rem = "-";
          res.render("pages/home", {
            session: req.session.username,
            user_type: req.session.user_type,
            last_login: last_login,
            last_logout: last_logout,
            gras: gras,
            ack: ack,
            rem: rem,
          });
        }

        // });
        // console.log(gras);
      }
    );
  } else {
    res.redirect("/");
  }
});

// Change Password Render
// @User
// Get Route
app.get("/changepassword", function (req, res) {
  if (req.session.username) {
    var query = `select confirmed from register where username="${req.session.username}"`;
    connection.query(query, function (error, results) {
      console.log(req.session.username);
      if (results[0].confirmed < 2) {
        res.render("pages/changepass", {
          session: req.session.username,
          user_type: req.session.user_type,
        });
      } else {
        res.render("pages/home", {
          session: req.session.username,
          user_type: req.session.user_type,
        });
      }
    });
  } else {
    res.render("pages/index", {
      session: req.session.username,
      user_type: req.session.user_type,
    });
  }
});

// Chnage pass process
app.post("/change_password", urlencodedParser, function (req, res) {
  let password = req.body.password;
  let newPassword = req.body.newPassword;
  let bPassword = bcrypt.hashSync(req.body.newPassword, saltRounds);
  console.log("here " + req.session.username);
  try {
    forgetpass.forgetpass(
      password,
      newPassword,
      connection,
      res,
      bcrypt,
      req,
      bPassword
    );
  } catch (error) {
    Error_log.error_log(
      "Changepass(server.js)",
      reg_dt,
      error,
      connection,
      res
    );
  }
});

// Logout And Render Index Page
app.get("/logout", function (req, res) {
  var reg_dt = new Date();
  var dt =
    reg_dt.toISOString().split("T")[0] +
    " " +
    reg_dt.toTimeString().split(" ")[0];
  var loginCheck = `Update login_check set logout_dt ='${dt}' where username='${req.session.username}' ORDER BY login_dt DESC LIMIT 1`;
  connection.query(loginCheck);
  req.session.username = "";
  req.session.user_type = "";
  res.render("pages/index", {
    session: req.session.username,
    user_type: req.session.user_type,
  });
  // console.log(req.session);
});

//RENDER register page
app.get("/register", function (req, res) {
  // req.session.username = "ritvij05";
  // req.session.user_type = "Admin";
  if (req.session.user_type != "Admin") {
    res.redirect("/");
  } else {
    connection.query("SELECT user_type from user_type", (error, rows) => {
      if (error) {
        Error_log.error_log(
          "Register-render(server.js)",
          datetime,
          error,
          connection,
          res
        );
      }
      // console.log('Data received from Db:');
      var rows = rows.map(function (item) {
        return item["user_type"];
      });
      // console.log(rows);
      // if (req.session.username && req.session.user_type != "Admin") {
      //   res.render("pages/home", {
      //     result: rows,
      //     session: req.session.username,
      //   });
      // } else if (req.session.user_type == "Admin") {
      res.render("pages/register", {
        result: rows,
        session: req.session.username,
        user_type: req.session.user_type,
      });
      // } else {
      //   res.redirect("/");
      // }
    });
  }
});

// REGISTRATION PROCESS
app.post("/submit_register", urlencodedParser, function (req, res) {
  let name = req.body.name;
  let username = req.body.username;
  let email = req.body.email;
  let pass = [];
  let Temp = req.body.password;
  pass.push(bcrypt.hashSync(req.body.password, saltRounds));
  console.log(pass);
  // let password = JSON.stringify(pass);
  let password = JSON.stringify(pass);
  console.log(password);
  let user_type = req.body.user_type;
  let user_ip = req.body.user_ip;
  let reg_dt = req.body.reg_dt;
  emailCheck(email, {
    from: process.env.Gmail_user,
    host: "Gmail",
    timeout: 3000,
  })
    .then(function (check) {
      if (check == true) {
        try {
          Register.register(
            process.env.Gmail_user,
            Temp,
            name,
            username,
            email,
            password,
            user_type,
            user_ip,
            reg_dt,
            connection,
            res,
            jwt,
            transporter,
            Email_Secret,
            process.env.Gmail_user
          );
        } catch (error) {
          Error_log.error_log(
            "register(server.js)",
            reg_dt,
            error,
            connection,
            res
          );
        }
      } else {
        res.send("Email-ID Invalid");
      }
    })
    .catch(function (error) {
      Error_log.error_log(
        "register(server.js)",
        reg_dt,
        error,
        connection,
        res
      );
    });
});

//New
//Forget password
app.get("/forgetpass", (req, res) => {
  let admin = req.session.user_type;
  if (admin != "Admin") {
    res.redirect("/");
  } else {
    res.render("pages/adminChangePass", {
      session: req.session.username,
      user_type: req.session.user_type,
    });
  }
});

//forget password post
app.post("/forget_pass", urlencodedParser, (req, res) => {
  const { user, password } = req.body;
  let admin = req.session.user_type;
  if (admin != "Admin") {
    req.session.username = "";
    req.session.user_type = "";
    res.render("pages/index", {
      session: req.session.username,
      user_type: req.session.user_type,
    });
  }
  try {
    var query = `select password from register where username="${req.session.username}"`;
    connection.query(query, function (error, results) {
      var rows;
      if (results) {
        rows = results.map(function (item) {
          return item["password"];
        });
        let x = JSON.parse(rows[0]);
        x = x.pop();
        console.log(x);

        console.log(password);
        //   for(i=0;i<z.length;i++){
        var v1 = bcrypt.compareSync(password, x);

        if (v1) {
          const emailToken = jwt.sign({ user: user }, Email_Secret, {
            expiresIn: "1d",
          });
          console.log(emailToken);
          const url = `http://localhost:3000/confirmchange/${emailToken}`;
          var mailOptions = {
            from: process.env.Gmail_user,
            to: user,
            subject: "Change Password!",
            html: `Please Click On The Following Link To Change You'r Account Password: <br><a href="${url}">Click Here To Confirm Email</a>`,
          };
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              // console.log(error.message);
              res.send("Unable to send Mail!");
            } else {
              // console.log("Email sent: " + info.response);
              res.send("Successful");
            }
          });
        } else {
          res.send("Password Does Not Match!");
        }
      }
      // var check =bcrypt.compareSync(password,results);
    });
  } catch (error) {}
});

//confirm token for change pass
app.get("/confirmchange/:token", async (req, res) => {
  try {
    var decoded = jwt.verify(req.params.token, Email_Secret);
    // req.session.username = decoded["user"];
    var query = `Select username from register where email='${decoded["user"]}';update register set confirmed=1 where email='${decoded["user"]}'`;
    connection.query(query, function (error, results) {
      if (results) {
        req.session.username = results[0][0].username;
        res.render("pages/changepass", {
          session: req.session.username,
          user_type: req.session.user_type,
        });
      } else {
        res.render("pages/confirmation", {
          title: "SomeThing Went Wrong",
          session: req.session.username,
          user_type: req.session.user_type,
        });
      }
    });
    // Confirmation.confirmation(decoded["user"], connection, res, dateTime, req);
  } catch (e) {
    res.render("pages/confirmation", {
      title: "SomeThing Went Wrong",
      session: req.session.username,
      user_type: req.session.user_type,
    });
  }
});

// Confirmation Token
app.get("/confirmation/:token", async (req, res) => {
  try {
    var decoded = jwt.verify(req.params.token, Email_Secret);
    Confirmation.confirmation(decoded["user"], connection, res, dateTime, req);
  } catch (e) {
    res.render("pages/confirmation", {
      title: "SomeThing Went Wrong",
      session: req.session.username,
      user_type: req.session.user_type,
    });
  }
});

// ***************************************************************************************
// **********************************AFTER LOGIN******************************************
// ***************************************************************************************

// Render Gras
app.get("/gras", function (req, res) {
  if (req.session.username && req.session.user_type != "Admin") {
    connection.query("SELECT budget_code from budget_code", (error, rows) => {
      if (error) {
        Error_log.error_log(
          "Gras-render(server.js)",
          datetime,
          error,
          connection,
          res
        );
      }
      var rows = rows.map(function (item) {
        return item["budget_code"];
      });
     
        connection.query("SELECT district from district", (error, rows2) => {
          if (error) {
            Error_log.error_log(
              "Gras-render(server.js)",
              datetime,
              error,
              connection,
              res
            );
          }
          var rows2 = rows2.map(function (item) {
            return item["district"];
          });
          res.render("pages/gras", {
            result: rows,
            result2: rows2,
            session: req.session.username,
            user_type: req.session.user_type,
          });
      });
    });
  } else {
    res.redirect("/");
  }
});

// Gras Process
app.post("/submit_gras", urlencodedParser, function (req, res) {
  let user_ip = req.body.user_ip;
  let reg_dt = new Date();
  let gras_receipt = req.body.gras_receipt;
  let month = req.body.month;
  let financial_year = req.body.financial_year;
  let budget_code = req.body.budget_code;
  //let scheme = req.body.scheme;
  let district = req.body.district;
  let amount = req.body.amount;
  let insert_by = req.session.username;
  const { type_of_transaction, particular, date } = req.body;
  console.log(type_of_transaction);
  var pdf = req.files.pdf;
  var filename = "Gras_" + month + "_" + financial_year +"_"+budget_code+".pdf";
  var pdf_location = "./gras_pdf/" + filename;
  pdf.mv(pdf_location, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Success");
    }
  });
  // console.log(pdf);
  // var filename = pdf.name;
  // console.log("dwqdwqd", filename);
  var dt =
    reg_dt.toISOString().split("T")[0] +
    " " +
    reg_dt.toTimeString().split(" ")[0];
  // var date1 =
  //   new Date(date).toISOString().split("T")[0] +
  //   " " +
  //   new Date(date).toTimeString().split(" ")[0];
  // console.log(dt);
  var tablename = "gras";

  if (req.session.user_type == "ABC") {
    var query = `insert into approved_gras(gras_receipt_no,particular,date,type_of_transaction,month,financial_year,budget_code,district,amount,insert_by,insert_ip,insert_dt,pdf)values('${gras_receipt}', '${particular}','${date}','${type_of_transaction}','${month}','${financial_year}', '${budget_code}', '${district}', '${amount}','${insert_by}','${user_ip}','${dt}','${pdf_location}');`;
    connection.query(query, function (error, results) {
      if (error) {
        console.log(error);
        res.send("SomeThing Went Wrong!");
      } else {
        res.send("Successful");
      }
    });
  } else {
    try {
      Gras.gras(
        pdf_location,
        type_of_transaction,
        particular,
        date,
        tablename,
        user_ip,
        dt,
        gras_receipt,
        month,
        financial_year,
        budget_code,
        district,
        amount,
        connection,
        res,
        insert_by
      );
    } catch (error) {
      console.log(error);
      Error_log.error_log("Gras(server.js)", dt, error, connection, res);
    }
  }
});

// Gras Check Update
app.post("/check_update", urlencodedParser, function (req, res) {
  // let month          = req.body.month;
  // let financial_year = req.body.financial_year;
  let gras_receipt_no = req.body.gras_receipt_check;
  var tablename = "gras";
  if (req.session.user_type == "ABC") {
    tablename = "approved_gras";
  }
  // if (req.session.user_type == "ABC") {
  //   var query = `SELECT * FROM approved_gras WHERE gras_receipt_no='${gras_receipt_no}'`;
  //   connection.query(query, function (error, results) {
  //     if (results != "") {
  //       res.send(results);
  //     } else {
  //       res.send("Data Not Found");
  //     }
  //   });
  // } else {
  try {
    var query = `SELECT pdf,gras_receipt_no,particular,date,month,financial_year,type_of_transaction,budget_code,district,amount FROM ${tablename} WHERE gras_receipt_no='${gras_receipt_no}'`;
    connection.query(query, function (error, results) {
      if (results != "") {
        // console.log(results);
        res.send(results);
      } else {
        res.send("Data Not Found");
      }
    });
  } catch (error) {
    Error_log.error_log(
      "GrasCheck(server.js)",
      datetime,
      error,
      connection,
      res
    );
  }
  // }
});

// Gras Update
app.post("/update_gras", urlencodedParser, function (req, res) {
  // console.log("here");
  let user_ip = req.body.user_ip;
  let reg_dt = new Date();
  let gras_receipt = req.body.gras_receipt;
  let gras_receipt_check = req.body.gras_receipt_check;
  let month = req.body.month;
  let financial_year = req.body.financial_year;
  let budget_code = req.body.budget_code;
  // let scheme = req.body.scheme;
  let district = req.body.district;
  let amount = req.body.amount;
  let update_by = req.session.username;
  const { old_file, type_of_transaction, particular, date } = req.body;

  if (old_file !== "") {
    var pdf = req.files.pdf;
    var filename = "Gras_" + month + "_" + financial_year + ".pdf";
    var pdf_location = "./gras_pdf/" + filename;
    fs.unlink("./gras_pdf/" + old_file, (err) => {
      if (err) {
        console.error(err);
        return;
      }
      pdf.mv(pdf_location, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Success");
        }
      });
      //file removed
    });
  }

  var dt =
    reg_dt.toISOString().split("T")[0] +
    " " +
    reg_dt.toTimeString().split(" ")[0];
  // date =
  //   date.toISOString().split("T")[0] + " " + date.toTimeString().split(" ")[0];
  var tablename = "gras";
  if (req.session.user_type == "ABC") {
    tablename = "approved_gras";
  }
  // if (req.session.user_type == "ABC") {
  //   var query = `update approved_gras set gras_receipt_no='${gras_receipt}',major_head='${major_head}',scheme='${scheme}',district='${district}',amount='${amount}' where gras_receipt_no='${gras_receipt_check}';`;
  //   connection.query(query, function (error, results) {
  //     if (error) {
  //       res.send("Unsuccessful"); //Both send will be same
  //       // console.log(error);
  //     } else {
  //       // console.log(results);
  //       res.send("Successful");
  //     }
  //   });
  // } else {
  try {
    GrasUpdate.gras_update(
      pdf_location,
      type_of_transaction,
      particular,
      date,
      tablename,
      gras_receipt_check,
      user_ip,
      dt,
      gras_receipt,
      month,
      financial_year,
      budget_code,
      district,
      amount,
      connection,
      res,
      update_by
    );
  } catch (error) {
    Error_log.error_log("GrasUpdate(server.js)", dt, error, connection, res);
  }
  // }
});

// Gras Display
app.post("/view_gras", urlencodedParser, function (req, res) {
  let month = req.body.month;
  let financial_year = req.body.financial_year;
  var tablename = "gras";
  if (req.session.user_type == "ABC") {
    tablename = "approved_gras";
  }
  // if (req.session.user_type == "ABC") {
  //   let query = `select * from approved_gras where financial_year='${financial_year}'and month='${month}'`;
  //   connection.query(query, function (error, results) {
  //     if (results != "") {
  //       res.send(results);
  //     } else {
  //       res.send("Data Not Found");
  //     }
  //   });
  // } else {
  let query = `select gras_receipt_no,particular,date, month, financial_year,type_of_transaction,budget_code,district,amount,pdf from ${tablename} where financial_year='${financial_year}'and month='${month}'`;
  try {
    connection.query(query, function (error, results) {
      if (results != "") {
        console.log(results);
        res.send(results);
      } else {
        res.send("Data Not Found");
      }
    });
  } catch (error) {
    Error_log.error_log(
      "GrasDisplay(server.js)",
      datetime,
      error,
      connection,
      res
    );
  }
  // }
});

// Render remittance
app.get("/remittance", function (req, res) {
  if (req.session.username && req.session.user_type != "Admin") {
    connection.query("SELECT budget_code from budget_code", (error, rows) => {
      if (error) {
        Error_log.error_log(
          "Remittance-render(server.js)",
          datetime,
          error,
          connection,
          res
        );
      }
      var rows = rows.map(function (item) {
        return item["budget_code"];
      });
  
        connection.query("SELECT district from district", (error, rows2) => {
          if (error) {
            Error_log.error_log(
              "Remittance-render(server.js)",
              datetime,
              error,
              connection,
              res
            );
          }
          var rows2 = rows2.map(function (item) {
            return item["district"];
          });
          res.render("pages/remittance", {
            result: rows,
            result2: rows2,
            session: req.session.username,
            user_type: req.session.user_type,
          });
        });
    });
  } else {
    res.redirect("/");
  }
});

// Remittance Process
app.post("/submit_remittance", urlencodedParser, function (req, res) {
  let user_ip = req.body.user_ip;
  let reg_dt = new Date();
  let letter = req.body.letter;
  let so2 = req.body.so2;
  let date = req.body.date;
  let budget_code = req.body.budget_code;
//  let scheme = req.body.scheme;
  let month = req.body.month;
  let financial_year = req.body.financial_year;
  let amount = req.body.amount;
  let payment = req.body.payment;
  let insert_by = req.session.username;
  var tablename = "remittance";
  const { particular, sales_office } = req.body;
  var dt =
    reg_dt.toISOString().split("T")[0] +
    " " +
    reg_dt.toTimeString().split(" ")[0];
  if (payment == "cheque") {
    var cheque_no = req.body.cheque_no;
  } else {
    var cheque_no = "-";
  }
  if (req.session.user_type == "ABC") {
    tablename = "approved_remittance";
  }
  try {
    // if (req.session.user_type == "ABC") {
    //   rem_query = `insert into approved_remittance(letter_no,so2_no,date,major_head,scheme,month,financial_year,amount,payment_method)values('${letter}','${so2}','${date}','${major_head}', '${scheme}','${month}','${financial_year}','${amount}','${payment}');`;
    //   connection.query(rem_query, function (error, data) {
    //     if (error) {
    //       console.error(error.message);
    //       console.log(error);
    //       res.send("");
    //     } else {
    //       res.send("Successful");
    //     }
    //   });
    // } else {
    // console.log("dwqdqw");
    Remittance.remittance(
      tablename,
      dt,
      user_ip,
      letter,
      so2,
      date,
      budget_code,
      month,
      financial_year,
      amount,
      payment,
      cheque_no,
      particular,
      sales_office,
      connection,
      res,
      insert_by
    );
    // }
  } catch (error) {
    Error_log.error_log("Remittance(server.js)", dt, error, connection, res);
  }
});

// Remittance Display
app.post("/rem_display", urlencodedParser, function (req, res) {
  var query;
  var tablename = "remittance";
  if (req.session.user_type == "ABC") {
    tablename = "approved_remittance";
  }
  if (req.body.select_radio == "day") {
    let date = req.body.date;

    // if (req.session.user_type == "ABC") {
    //   let query = `select * from approved_remittance where date='${date}'`;
    //   connection.query(query, function (error, results) {
    //     if (results == "") {
    //       res.send("Data Not Found");
    //     } else {
    //       res.send(results);
    //     }
    //   });
    // } else {
    query = `select letter_no,so2_no,date,month,financial_year,budget_code,payment_method,cheque_no,particular,sales_office,amount from ${tablename} where date='${date}'`;

    // try {
    //   connection.query(query, function (error, results) {
    //     if (results != "") {
    //       console.log(results);
    //       res.send(results);
    //     } else {
    //       res.send("Data Not Found");
    //     }
    //   });
    // } catch (error) {
    //   Error_log.error_log(
    //     "RemittanceDisplayDay(server.js)",
    //     datetime,
    //     error,
    //     connection,
    //     res
    //   );
    // }

    // }
  } else {
    let month = req.body.month;
    let financial_year = req.body.financial_year;
    // if (req.session.user_type == "ABC") {
    //   let query = `select * from approved_remittance where month='${month}' and financial_year='${financial_year}'`;
    //   connection.query(query, function (error, results) {
    //     if (results == "") {
    //       res.send("Data Not Found");
    //     } else {
    //       res.send(results);
    //     }
    //   });
    // } else {
    query = `select letter_no,so2_no,date,month,financial_year,budget_code,payment_method,cheque_no,particular,sales_office,amount,insert_by from ${tablename} where month='${month}' and financial_year='${financial_year}'`;
    // try {
    //   connection.query(query, function (error, results) {
    //     if (results != "") {
    //       console.log(results);
    //       res.send(results);
    //     } else {
    //       res.send("Data Not Found");
    //     }
    //   });
    // } catch (error) {
    //   Error_log.error_log(
    //     "RemittanceDisplayMonth(server.js)",
    //     datetime,
    //     error,
    //     connection,
    //     res
    //   );
    // }
    // }
  }
  try {
    connection.query(query, function (error, results) {
      if (results != "") {
        // console.log(results);
        res.send(results);
      } else {
        res.send("Data Not Found");
      }
    });
  } catch (error) {
    Error_log.error_log(
      "RemittanceDisplayMonth(server.js)",
      datetime,
      error,
      connection,
      res
    );
  }
});

// Remittance Check Update Data
app.post("/rem_check", urlencodedParser, function (req, res) {
  let letter_no = req.body.letter_no;
  var tablename = "remittance";
  if (req.session.user_type == "ABC") {
    tablename = "approved_remittance";
  }
  // if (req.session.user_type == "ABC") {
  //   let query = `select * from approved_remittance where letter_no='${letter_no}'`;
  //   connection.query(query, function (error, results) {
  //     if (results == "") {
  //       res.send("Data Not Found");
  //     } else {
  //       res.send(results);
  //     }
  //   });
  // } else {
  let query = `select letter_no,so2_no,date,month,financial_year,budget_code,payment_method,cheque_no,particular,sales_office,amount from ${tablename} where letter_no='${letter_no}'`;
  try {
    connection.query(query, function (error, results) {
      if (results != "") {
        // console.log(results);
        res.send(results);
      } else {
        res.send("Data Not Found");
      }
    });
  } catch (error) {
    Error_log.error_log(
      "RemittanceCheck(server.js)",
      datetime,
      error,
      connection,
      res
    );
  }
  // }
});

// Remittance Update
app.post("/update_remittance", urlencodedParser, function (req, res) {
  let user_ip = req.body.user_ip;
  let reg_dt = new Date();
  let letter = req.body.letter;
  let letter_check = req.body.letter_check;
  let so2 = req.body.so2;
  let date = req.body.date;
  let budget_code = req.body.budget_code;
 // let scheme = req.body.scheme;
  let month = req.body.month;
  let financial_year = req.body.financial_year;
  let amount = req.body.amount;
  let payment = req.body.payment;
  var cheque_no = req.body.cheque_no;
  const { particular, sales_office } = req.body;
  var update_by = req.session.username;
  var tablename = "remittance";
  var dt =
    reg_dt.toISOString().split("T")[0] +
    " " +
    reg_dt.toTimeString().split(" ")[0];
  if (req.session.user_type == "ABC") {
    tablename = "approved_remittance";
  }
  // if (req.session.user_type == "ABC") {
  //   var query = `update approved_remittance set letter_no='${letter}',so2_no='${so2}',date='${date}',month='${month}',financial_year='${financial_year}',major_head='${major_head}',scheme='${scheme}',payment_method='${payment}',cheque_no='${cheque_no}',cheque_payable='${cheque_payable}',bank_name='${bank_name}',branch_name='${bank_name}',amount='${amount}' where letter_no='${letter_check}'`;
  //   connection.query(query, function (error, results) {
  //     if (error) {
  //       console.error(error.message);
  //       res.send("Unsuccessful");
  //     } else {
  //       res.send("Successful");
  //     }
  //   });
  // } else {
  try {
    // console.log("dwqd");
    RemittanceUpdate.remittance_update(
      tablename,
      dt,
      user_ip,
      letter,
      letter_check,
      so2,
      date,
      budget_code,
      month,
      financial_year,
      amount,
      payment,
      cheque_no,
      particular,
      sales_office,
      connection,
      res,
      update_by
    );
  } catch (error) {
    Error_log.error_log(
      "RemittanceUpdate(server.js)",
      dt,
      error,
      connection,
      res
    );
  }
  // }
});

//  CashBook Render
app.get("/cashbook", function (req, res) {
  if (req.session.username && req.session.user_type != "Admin") {
    res.render("pages/cashbook", {
      session: req.session.username,
      user_type: req.session.user_type,
    });
  } else {
    res.redirect("/");
  }
});

app.get("/print", function (req, res) {
  res.render("pages/print");
});

// CashBook Process
app.post("/submit_cashbook", urlencodedParser, function (req, res) {
  // let select_radio = req.body.select_radio;
  // if (select_radio == "month") {
  let month = req.body.month;
  let financial_year = req.body.financial_year;
  CashBook_month.cashbook_month(month, financial_year, req, res, connection);
  // } else if (select_radio == "day") {
  //   let date = req.body.date;
  // } else {
  //   res.send("");
  // }
});

// Acknowledge render
app.get("/acknowledge", function (req, res) {
  if (req.session.username && req.session.user_type != "Admin") {
    connection.query("SELECT budget_code from budget_code", (error, rows) => {
      if (error) {
        Error_log.error_log(
          "ack-render(server.js)",
          datetime,
          error,
          connection,
          res
        );
      }
      var rows = rows.map(function (item) {
        return item["budget_code"];
      });
      res.render("pages/acknowledge", {
        session: req.session.username,
        user_type: req.session.user_type,
        result: rows,
      });
    });
  } else {
    res.redirect("/");
  }
});

// Acknowledge Process
app.post("/insert_ack", urlencodedParser, function (req, res) {
  if (req.session.username) {
    const {
      particular,
      voucher_no,
      budget_code,
      month,
      financial_year,
      date,
      amount,
      cheque_number,
      // cheque_date,
      user_ip,
      payment_details,
      // desk_number,
    } = req.body;
    var tablename = "acknowledgement";
    var reg_dt = new Date();
    var dt =
      reg_dt.toISOString().split("T")[0] +
      " " +
      reg_dt.toTimeString().split(" ")[0];
    let username = req.session.username;
    if (req.session.user_type == "ABC") {
      tablename = "approved_acknowledgement";
    }
    // if (req.session.user_type == "ABC") {
    //   var query = `insert into approved_acknowledgement(desk_no,payment_details,issue_date,month,financial_year,cheque_no,amount,cheque_date)values('${desk_number}','${payment_details}','${date}','${month}','${financial_year}','${cheque_number}','${amount}','${cheque_date}');`;
    //   connection.query(check, function (error, results) {
    //     if (error) {
    //       res.send("Unable To Insert");
    //     } else {
    //       res.send("Successful");
    //     }
    //   });
    // } else {
    try {
      Acknowledge.ack(
        particular,
        voucher_no,
        budget_code,
        tablename,
        month,
        financial_year,
        username,
        date,
        dt,
        amount,
        cheque_number,
        // cheque_date,
        user_ip,
        payment_details,
        // desk_number,
        connection,
        res
      );
    } catch (error) {
      Error_log.error_log(
        "AcknowledgemProcess(server.js)",
        dt,
        error,
        connection,
        res
      );
    }
    // }
  } else {
    res.render("pages/index", {
      session: req.session.username,
      user_type: req.session.user_type,
    });
  }
});
//check_expenditure
app.post("/check_expenditure", urlencodedParser, function (req, res) {
  if (req.session.username) {
    const { month, financial_year } = req.body;
    var tablename = "acknowledgement";
    if (req.session.user_type == "ABC") {
      tablename = "approved_acknowledgement";
    }
    // if (req.session.user_type == "ABC") {
    //   let query = `select * from acknowledgement where issue_date='${date}' and(cheque_no='${cheque_number}' and desk_no = '${desk_number}') `;
    //   connection.query(query, function (error, results) {
    //     if (results != "") {
    //       // console.log(results);
    //       res.send(results);
    //     } else {
    //       res.send("Data Not Found");
    //     }
    //   });
    // } else {
    let query = `select * from ${tablename} where month='${month}' and financial_year='${financial_year}'`;

    try {
      connection.query(query, function (error, results) {
        if (results != "") {
          // console.log(results);
          res.send(results);
        } else {
          res.send("Data Not Found");
        }
      });
    } catch (error) {
      Error_log.error_log(
        "AcknowledgemProcess(server.js)",
        reg_dt,
        error,
        connection,
        res
      );
    }
    // }
  } else {
    res.render("pages/index", {
      session: req.session.username,
      user_type: req.session.user_type,
    });
  }
});
// Create receipt side of Cashbook
app.post("/receipt_display", urlencodedParser, function (req, res) {
  var query;
  var tablename = "other_receipts";

  if (req.session.user_type == "ABC") {
    tablename = "approved_receipts";
  }
  if (req.body.select_radio == "day") {
    let date = req.body.date;

    // if (req.session.user_type == "ABC") {
    //   let query = `select * from approved_remittance where date='${date}'`;
    //   connection.query(query, function (error, results) {
    //     if (results == "") {
    //       res.send("Data Not Found");
    //     } else {
    //       res.send(results);
    //     }
    //   });
    // } else {
    query = `select particular,instrument,date,month,financial_year,budget_code,payment_method,amount from ${tablename} where date='${date}'`;

    // try {
    //   connection.query(query, function (error, results) {
    //     if (results != "") {
    //       console.log(results);
    //       res.send(results);
    //     } else {
    //       res.send("Data Not Found");
    //     }
    //   });
    // } catch (error) {
    //   Error_log.error_log(
    //     "RemittanceDisplayDay(server.js)",
    //     datetime,
    //     error,
    //     connection,
    //     res
    //   );
    // }

    // }
  } else {
    let month = req.body.month;
    let financial_year = req.body.financial_year;
    // if (req.session.user_type == "ABC") {
    //   let query = `select * from approved_remittance where month='${month}' and financial_year='${financial_year}'`;
    //   connection.query(query, function (error, results) {
    //     if (results == "") {
    //       res.send("Data Not Found");
    //     } else {
    //       res.send(results);
    //     }
    //   });
    // } else {
    //query = `select letter_no,so2_no,date,month,financial_year,major_head,scheme,payment_method,cheque_no,particular,sales_office,amount from ${tablename} where month='${month}' and financial_year='${financial_year}' order by date`;
    query = `select particular,instrument,date,month,financial_year,budget_code,payment_method,amount,insert_by from ${tablename} where month='${month}' and financial_year='${financial_year}'`;
    // try {
    //   connection.query(query, function (error, results) {
    //     if (results != "") {
    //       console.log(results);
    //       res.send(results);
    //     } else {
    //       res.send("Data Not Found");
    //     }
    //   });
    // } catch (error) {
    //   Error_log.error_log(
    //     "RemittanceDisplayMonth(server.js)",
    //     datetime,
    //     error,
    //     connection,
    //     res
    //   );
    // }
    // }
  }
  try {
    connection.query(query, function (error, results) {
      if (results != "") {
        //console.log(results);
        res.send(results);
      } else {
        res.send("Data Not Found");
      }
    });
  } catch (error) {
    Error_log.error_log(
      "OtherReceiptseDisplayMonth(server.js)",
      datetime,
      error,
      connection,
      res
    );
  }
});
// Create abstract of cashbook
app.post("/abstract_cashbook", urlencodedParser, function (req, res) {
  if (req.session.username) {
    const { month, financial_year } = req.body;
    var tablename = "acknowledgement";
    if (req.session.user_type == "ABC") {
      tablename = "approved_acknowledgement";
    }
    // if (req.session.user_type == "ABC") {
    //   let query = `select * from acknowledgement where issue_date='${date}' and(cheque_no='${cheque_number}' and desk_no = '${desk_number}') `;
    //   connection.query(query, function (error, results) {
    //     if (results != "") {
    //       // console.log(results);
    //       res.send(results);
    //     } else {
    //       res.send("Data Not Found");
    //     }
    //   });
    // } else {
    let query = `select * from ${tablename} where month='${month}' and financial_year='${financial_year}'`;

    try {
      connection.query(query, function (error, results) {
        if (results != "") {
          // console.log(results);
          res.send(results);
        } else {
          res.send("Data Not Found");
        }
      });
    } catch (error) {
      Error_log.error_log(
        "AcknowledgemProcess(server.js)",
        reg_dt,
        error,
        connection,
        res
      );
    }
    // }
  } else {
    res.render("pages/index", {
      session: req.session.username,
      user_type: req.session.user_type,
    });
  }
});

// Check Ack
app.post("/check_ack", urlencodedParser, function (req, res) {
  if (req.session.username) {
    const { date, cheque_number } = req.body;
    var tablename = "acknowledgement";
    if (req.session.user_type == "ABC") {
      tablename = "approved_acknowledgement";
    }
    // if (req.session.user_type == "ABC") {
    //   let query = `select * from acknowledgement where issue_date='${date}' and(cheque_no='${cheque_number}' and desk_no = '${desk_number}') `;
    //   connection.query(query, function (error, results) {
    //     if (results != "") {
    //       // console.log(results);
    //       res.send(results);
    //     } else {
    //       res.send("Data Not Found");
    //     }
    //   });
    // } else {
    let query = `select * from ${tablename} where date='${date}' and cheque_no='${cheque_number}'`;
    try {
      connection.query(query, function (error, results) {
        if (results != "") {
          // console.log(results);
          res.send(results);
        } else {
          res.send("Data Not Found");
        }
      });
    } catch (error) {
      Error_log.error_log(
        "AcknowledgemProcess(server.js)",
        reg_dt,
        error,
        connection,
        res
      );
    }
    // }
  } else {
    res.render("pages/index", {
      session: req.session.username,
      user_type: req.session.user_type,
    });
  }
});

// Ack Update
app.post("/update_ack", urlencodedParser, function (req, res) {
  if (req.session.username) {
    const {
      user_ip,
      // desk_number_check,
      date_check,
      cheque_number_check,
      // desk_number,
      particular,
      voucher_no,
      budget_code,
      payment_details,
      date,
      cheque_number,
      amount,
      cheque_date,
      month,
      financial_year,
    } = req.body;
    var tablename = "acknowledgement";
    var reg_dt = new Date();
    var dt =
      reg_dt.toISOString().split("T")[0] +
      " " +
      reg_dt.toTimeString().split(" ")[0];
    if (req.session.user_type == "ABC") {
      tablename = "approved_acknowledgement";
    }
    // if (req.session.user_type == "ABC") {
    //   var query = `update approved_acknowledgement set desk_no='${desk_number}',payment_details='${payment_details}',issue_date='${date}',month='${month}',financial_year='${financial_year}',cheque_no='${cheque_number}',amount='${amount}',cheque_date='${cheque_date}' where desk_no='${desk_number_check}' and(issue_date='${date_check}'and cheque_no='${cheque_number_check}')`;
    //   connection.query(query, function (error, results) {
    //     if (error) {
    //       console.error(error.message);
    //       console.log(error);
    //       res.send("Unable To Update"); //Both send will be same
    //     } else {
    //       res.send("Successful");
    //     }
    //   });
    // } else {
    let username = req.session.username;
    console.log(cheque_number_check);
    try {
      Acknowledge_up.ack_up(
        tablename,
        username,
        user_ip,
        // desk_number_check,
        date_check,
        cheque_number_check,
        dt,
        // desk_number,
        particular,
        voucher_no,
        budget_code,
        payment_details,
        date,
        cheque_number,
        amount,
        cheque_date,
        month,
        financial_year,
        connection,
        res
      );
    } catch (error) {
      Error_log.error_log(
        "AcknowledgeUpdate(server.js)",
        dt,
        error,
        connection,
        res
      );
    }
    // }
  } else {
    res.render("pages/index", {
      session: req.session.username,
      user_type: req.session.user_type,
    });
  }
});
// render Other Receipts
app.get("/other_receipts", function (req, res) {
  if (req.session.username && req.session.user_type != "Admin") {
    connection.query("SELECT budget_code from budget_code", (error, rows) => {
      if (error) {
        Error_log.error_log(
          "OtherReceipts-render(server.js)",
          datetime,
          error,
          connection,
          res
        );
      }
      var rows = rows.map(function (item) {
        return item["budget_code"];
      });

        connection.query("SELECT district from district", (error, rows2) => {
          if (error) {
            Error_log.error_log(
              "OtherReceipts-render(server.js)",
              datetime,
              error,
              connection,
              res
            );
          }
          var rows2 = rows2.map(function (item) {
            return item["district"];
          });
          res.render("pages/other_receipts", {
            result: rows,
            result2: rows2,
            session: req.session.username,
            user_type: req.session.user_type,
          });
        });
    });
  } else {
    res.redirect("/");
  }
});
// OtherReceipts Process
app.post("/submit_other_receipts", urlencodedParser, function (req, res) {
  let user_ip = req.body.user_ip;
  let reg_dt = new Date();
  let particular = req.body.particular;
  let instrument = req.body.instrument;
  let date = req.body.date;
  let budget_code = req.body.budget_code;
 // let scheme = req.body.scheme;
  let month = req.body.month;
  let financial_year = req.body.financial_year;
  let amount = req.body.amount;
  let payment = req.body.payment;
  let insert_by = req.session.username;
  var tablename = "other_receipts";
  var dt =
    reg_dt.toISOString().split("T")[0] +
    " " +
    reg_dt.toTimeString().split(" ")[0];
  // if (payment == "cheque") {
  //   var cheque_no = req.body.cheque_no;
  // } else {
  //   var cheque_no = "-";
  // }
  if (req.session.user_type == "ABC") {
    tablename = "approved_other_receipts";
  }
  try {
    // if (req.session.user_type == "ABC") {
    //   rem_query = `insert into approved_remittance(letter_no,so2_no,date,major_head,scheme,month,financial_year,amount,payment_method)values('${letter}','${so2}','${date}','${major_head}', '${scheme}','${month}','${financial_year}','${amount}','${payment}');`;
    //   connection.query(rem_query, function (error, data) {
    //     if (error) {
    //       console.error(error.message);
    //       console.log(error);
    //       res.send("");
    //     } else {
    //       res.send("Successful");
    //     }
    //   });
    // } else {
    // console.log("dwqdqw");
    OtherReceipts.other_receipts(
      tablename,
      dt,
      user_ip,
      particular,
      instrument,
      date,
      budget_code,
      month,
      financial_year,
      amount,
      payment,
      connection,
      res,
      insert_by
    );
    // }
  } catch (error) {
    Error_log.error_log("OtherReceipts(server.js)", dt, error, connection, res);
  }
});
// OtherReceipts Display
app.post("/other_receipts_display", urlencodedParser, function (req, res) {
  var query;
  var tablename = "other_receipts";
  if (req.session.user_type == "ABC") {
    tablename = "approved_other_receipts";
  }
  if (req.body.select_radio == "day") {
    let date = req.body.date;

    // if (req.session.user_type == "ABC") {
    //   let query = `select * from approved_remittance where date='${date}'`;
    //   connection.query(query, function (error, results) {
    //     if (results == "") {
    //       res.send("Data Not Found");
    //     } else {
    //       res.send(results);
    //     }
    //   });
    // } else {
    query = `select particular,instrument,date,month,financial_year,budget_code,payment_method,amount,insert_by from ${tablename} where date='${date}'`;

    // try {
    //   connection.query(query, function (error, results) {
    //     if (results != "") {
    //       console.log(results);
    //       res.send(results);
    //     } else {
    //       res.send("Data Not Found");
    //     }
    //   });
    // } catch (error) {
    //   Error_log.error_log(
    //     "RemittanceDisplayDay(server.js)",
    //     datetime,
    //     error,
    //     connection,
    //     res
    //   );
    // }

    // }
  } else {
    let month = req.body.month;
    let financial_year = req.body.financial_year;
    // if (req.session.user_type == "ABC") {
    //   let query = `select * from approved_remittance where month='${month}' and financial_year='${financial_year}'`;
    //   connection.query(query, function (error, results) {
    //     if (results == "") {
    //       res.send("Data Not Found");
    //     } else {
    //       res.send(results);
    //     }
    //   });
    // } else {
    query = `select particular,instrument,date,month,financial_year,budget_code,payment_method,amount,insert_by from ${tablename} where month='${month}' and financial_year='${financial_year}'`;
    // try {
    //   connection.query(query, function (error, results) {
    //     if (results != "") {
    //       console.log(results);
    //       res.send(results);
    //     } else {
    //       res.send("Data Not Found");
    //     }
    //   });
    // } catch (error) {
    //   Error_log.error_log(
    //     "RemittanceDisplayMonth(server.js)",
    //     datetime,
    //     error,
    //     connection,
    //     res
    //   );
    // }
    // }
  }
  try {
    connection.query(query, function (error, results) {
      if (results != "") {
        //console.log(results);
        res.send(results);
      } else {
        res.send("Data Not Found");
      }
    });
  } catch (error) {
    Error_log.error_log(
      "OtherReceiptsDisplayMonth(server.js)",
      datetime,
      error,
      connection,
      res
    );
  }
});
// Other Receipts Check Update Data
app.post("/other_receipts_check", urlencodedParser, function (req, res) {
  let instrument = req.body.instrument;
  var tablename = "other_receipts";
  if (req.session.user_type == "ABC") {
    tablename = "approved_other_receipts";
  }
  // if (req.session.user_type == "ABC") {
  //   let query = `select * from approved_remittance where letter_no='${letter_no}'`;
  //   connection.query(query, function (error, results) {
  //     if (results == "") {
  //       res.send("Data Not Found");
  //     } else {
  //       res.send(results);
  //     }
  //   });
  // } else {
  let query = `select particular,instrument,date,month,financial_year,budget_code,payment_method,amount from ${tablename} where instrument='${instrument}'`;
  try {
    connection.query(query, function (error, results) {
      if (results != "") {
        // console.log(results);
        res.send(results);
      } else {
        res.send("Data Not Found");
      }
    });
  } catch (error) {
    Error_log.error_log(
      "OtherReceiptsCheck(server.js)",
      datetime,
      error,
      connection,
      res
    );
  }
  // }
});

// Other Receipts Update
app.post("/update_other_receipts", urlencodedParser, function (req, res) {
  let user_ip = req.body.user_ip;
  let reg_dt = new Date();
  let particular = req.body.particular;
  let instrument_check = req.body.instrument_check;
  let instrument = req.body.instrument;
  let date = req.body.date;
  let budget_code = req.body.budget_code;
//  let scheme = req.body.scheme;
  let month = req.body.month;
  let financial_year = req.body.financial_year;
  let amount = req.body.amount;
  let payment = req.body.payment;
  var update_by = req.session.username;
  var tablename = "other_receipts";
  var dt =
    reg_dt.toISOString().split("T")[0] +
    " " +
    reg_dt.toTimeString().split(" ")[0];
  if (req.session.user_type == "ABC") {
    tablename = "approved_other_receipts";
  }
  // if (req.session.user_type == "ABC") {
  //   var query = `update approved_remittance set letter_no='${letter}',so2_no='${so2}',date='${date}',month='${month}',financial_year='${financial_year}',major_head='${major_head}',scheme='${scheme}',payment_method='${payment}',cheque_no='${cheque_no}',cheque_payable='${cheque_payable}',bank_name='${bank_name}',branch_name='${bank_name}',amount='${amount}' where letter_no='${letter_check}'`;
  //   connection.query(query, function (error, results) {
  //     if (error) {
  //       console.error(error.message);
  //       res.send("Unsuccessful");
  //     } else {
  //       res.send("Successful");
  //     }
  //   });
  // } else {
  try {
    OtherReceiptsUpdate.other_receipts_update(
      tablename,
      dt,
      user_ip,
      particular,
      instrument_check,
      instrument,
      date,
      budget_code,
      month,
      financial_year,
      amount,
      payment,
      connection,
      res,
      update_by
    );
  } catch (error) {
    console.log(error);
    Error_log.error_log(
      "OtherReceiptUpdate(server.js)",
      dt,
      error,
      connection,
      res
    );
  }
  // }
});
// Experimental page
app.get("/exp", function (req, res) {
  res.render("pages/exp", {
    session: req.session.username,
    user_type: req.session.user_type,
  });
});

// Approval page
app.get("/approval", function (req, res) {
  if (req.session.user_type == "ABC") {
    connection.query(
      "SELECT * from remittance where status=0",
      (error, rows) => {
        if (error) {
          Error_log.error_log(
            "Register-render(server.js)",
            datetime,
            error,
            connection,
            res
          );
        }
        connection.query(
          "SELECT * from gras where status=0",
          (error, rows1) => {
            if (error) {
              Error_log.error_log(
                "Register-render(server.js)",
                datetime,
                error,
                connection,
                res
              );
            }
            connection.query(
              "SELECT * from acknowledgement where status=0",
              (error, rows2) => {
                if (error) {
                  Error_log.error_log(
                    "Register-render(server.js)",
                    datetime,
                    error,
                    connection,
                    res
                  );
                }
                connection.query(
                  "SELECT * from other_receipts where status=0",
                  (error, rows3) => {
                    if (error) {
                      Error_log.error_log(
                        "Register-render(server.js)",
                        datetime,
                        error,
                        connection,
                        res
                      );
                    }
                    rows = Object.values(rows);
                    rows1 = Object.values(rows1);
                    rows2 = Object.values(rows2);
                    rows3 = Object.values(rows3);

                    // console.log(req.session.user_type);
                    res.render("pages/approval", {
                      session: req.session.username,
                      user_type: req.session.user_type,
                      rem_data: rows,
                      gras_data: rows1,
                      ack_data: rows2,
                      other: rows3,
                    });
                  }
                );
              }
            );
          }
        );
      }
    );
  } else {
    res.redirect("/");
  }
});

app.post("/rem_status", urlencodedParser, function (req, res) {
  const {
    letter_no,
    so2_no,
    major_head,
    scheme,
    date,
    amount,
    month,
    financial_year,
    status,
    payment_method,
    comment,
    user_ip,
    particular,
    sales_office,
  } = req.body;
  var reg_dt = new Date();
  var dt =
    reg_dt.toISOString().split("T")[0] +
    " " +
    reg_dt.toTimeString().split(" ")[0];
  // console.log(letter_no);
  try {
    var query = `update remittance set status=${status}, comment="${comment}" where letter_no="${letter_no}"`;
    connection.query(query, function (error, results) {
      if (error) {
        console.error(error.message);
        console.log(error);
        res.send(""); //Both send will be same
      } else {
        if (status == 1) {
          var rem_query = `insert into approved_remittance(letter_no,so2_no,date,major_head,scheme,month,financial_year,amount,payment_method,insert_dt,insert_by,insert_ip,particular,sales_office)values('${letter_no}','${so2_no}','${date}','${major_head}', '${scheme}','${month}','${financial_year}','${amount}','${payment_method}','${dt}','${req.session.username}','${user_ip}'),'${particular}','${sales_office}';`;
          connection.query(rem_query, function (error, data) {
            if (error) {
              console.error(error.message);
              console.log(error);
              res.send("");
            }
          });
        }
        connection.query(
          "SELECT * from remittance where status=0",
          (error, rows) => {
            if (error) {
              Error_log.error_log(
                "Register-render(server.js)",
                datetime,
                error,
                connection,
                res
              );
            }
            rows = Object.values(rows);
            res.send(rows);
          }
        );
      }
    });
  } catch (error) {
    console.log("catch");
    Error_log.error_log(
      "Remittance Approval(server.js)",
      reg_dt,
      error,
      connection,
      res
    );
  }
});
app.post("/other_receipts_status", urlencodedParser, function (req, res) {
  const {
    particular,
    instrument,
    budget_code,
    date,
    amount,
    month,
    financial_year,
    status,
    payment_method,
    comment,
    user_ip,
  } = req.body;
  var reg_dt = new Date();
  var dt =
    reg_dt.toISOString().split("T")[0] +
    " " +
    reg_dt.toTimeString().split(" ")[0];
  // console.log(letter_no);
  try {
    var query = `update other_receipts set status=${status}, comment="${comment}" where instrument="${instrument}"`;
    connection.query(query, function (error, results) {
      if (error) {
        console.error(error.message);
        console.log(error);
        res.send(""); //Both send will be same
      } else {
        if (status == 1) {
          var rem_query = `insert into approved_other_receipts(particular,instrument,date,budget_code,month,financial_year,amount,payment_method,insert_dt,insert_by,insert_ip)values('${particular}','${instrument}','${date}','${major_head}', '${scheme}','${month}','${financial_year}','${amount}','${payment_method}','${dt}','${req.session.username}','${user_ip}');`;
          connection.query(rem_query, function (error, data) {
            if (error) {
              console.error(error.message);
              console.log(error);
              res.send("");
            }
          });
        }
        connection.query(
          "SELECT * from other_receipts where status=0",
          (error, rows) => {
            if (error) {
              Error_log.error_log(
                "Register-render(server.js)",
                datetime,
                error,
                connection,
                res
              );
            }
            rows = Object.values(rows);
            res.send(rows);
          }
        );
      }
    });
  } catch (error) {
    console.log("catch");
    Error_log.error_log(
      "OtherReceipts Approval(server.js)",
      reg_dt,
      error,
      connection,
      res
    );
  }
});
app.post("/gras_status", urlencodedParser, function (req, res) {
  // console.log("here");
  const {
    gras_receipt_no,
    particular,
    date,
    type_of_transaction,
    month,
    financial_year,
    budget_code,
    district,
    amount,
    status,
    comment,
    user_ip,
  } = req.body;
  // console.log(
  //   gras_receipt_no,
  //   month,
  //   financial_year,
  //   scheme,
  //   major_head,
  //   district,
  //   amount,
  //   status,
  //   comment,
  //   user_ip
  // );
  var reg_dt = new Date();
  // date =
  //   date.toISOString().split("T")[0] + " " + date.toTimeString().split(" ")[0];
  var dt =
    reg_dt.toISOString().split("T")[0] +
    " " +
    reg_dt.toTimeString().split(" ")[0];
  // console.log(gras_receipt_no);
  try {
    var query = `update gras set status=${status},comment="${comment}" where gras_receipt_no="${gras_receipt_no}"`;
    connection.query(query, function (error, results) {
      if (error) {
        console.error(error.message);
        console.log(results);
        res.send("");
      } else {
        if (status == 1) {
          var gras_query = `insert into approved_gras(gras_receipt_no,particular,date,month,financial_year,type_of_transaction,budget_code,district,amount,insert_dt,insert_by,insert_ip)values('${gras_receipt_no}','${particular}','${date}','${month}','${financial_year}','${type_of_transaction}','${budget_code}','${district}','${amount}','${dt}','${req.session.username}','${user_ip}');`;
          connection.query(gras_query, function (error, data) {
            if (error) {
              // console.error(error.message);
              // console.log(data);
              var query = `update gras set status=0,comment="${comment}" where gras_receipt_no="${gras_receipt_no}"`;

              connection.query(query);
              res.send("");
            } else {
              connection.query(
                "SELECT * from gras where status=0",
                (error, rows) => {
                  if (error) {
                    console.log(error);
                    Error_log.error_log(
                      "Gras-Approval(server.js)",
                      datetime,
                      error,
                      connection,
                      res
                    );
                  }
                  // console.log(rows);
                  rows = Object.values(rows);
                  res.send(rows);
                }
              );
            }
          });
        }
      }
    });
  } catch (error) {
    Error_log.error_log(
      "Gras Approval(server.js)",
      reg_dt,
      error,
      connection,
      res
    );
  }
});

app.post("/Ack_status", urlencodedParser, function (req, res) {
  const {
    // desk_no,
    particular,
    voucher_no,
    budget_code,
    payment_details,
    date,
    cheque_no,
    month,
    financial_year,
    // cheque_date,
    amount,
    status,
    comment,
    user_ip,
  } = req.body;
  var reg_dt = new Date();
  var dt =
    reg_dt.toISOString().split("T")[0] +
    " " +
    reg_dt.toTimeString().split(" ")[0];
  // console.log(desk_no);
  try {
    var query = `update acknowledgement set status=${status},comment="${comment}" where cheque_no="${cheque_no}"`;
    connection.query(query, function (error, results) {
      if (error) {
        // console.error(error.message);
        // console.log(error);
        res.send("Unable To Update"); //Both send will be same
      } else {
        if (status == 1) {
          var ack_query = `insert into approved_acknowledgement(particular,voucher_no,budget_code,payment_details,date,month,financial_year,cheque_no,amount,insert_dt,insert_by,insert_ip)values('${particular}','${voucher_no}','${budget_code}',${payment_details}','${date}','${month}', '${financial_year}','${cheque_no}','${amount}','${dt}','${req.session.username}','${user_ip}')`;
          connection.query(ack_query, function (error, data) {
            if (error) {
              console.error(error.message);
              console.log(error);
              res.send("");
            }
          });
        }
        connection.query(
          "SELECT * from acknowledgement where status=0",
          (error, rows) => {
            if (error) {
              Error_log.error_log(
                "Ack-Approval(server.js)",
                datetime,
                error,
                connection,
                res
              );
            }
            rows = Object.values(rows);
            res.send(rows);
          }
        );
      }
    });
  } catch (error) {
    Error_log.error_log(
      "Ack Approval(server.js)",
      reg_dt,
      error,
      connection,
      res
    );
  }
});

// Admin Tables
app.get("/adminTables", function (req, res) {
  // connection.query("SELECT major_head from major_head", (error, rows) => {
  //   if (error) {
  //     Error_log.error_log(
  //       "Gras-render(server.js)",
  //       datetime,
  //       error,
  //       connection,
  //       res
  //     );
  //   }
  //   var rows = rows.map(function (item) {
  //     return item["major_head"];
  //   });
  //   connection.query("SELECT scheme from scheme", (error, rows1) => {
  //     if (error) {
  //       Error_log.error_log(
  //         "Gras-render(server.js)",
  //         datetime,
  //         error,
  //         connection,
  //         res
  //       );
  //     }
  //     var rows1 = rows1.map(function (item) {
  //       return item["scheme"];
  //     });
  //     connection.query("SELECT district from district", (error, rows2) => {
  //       if (error) {
  //         Error_log.error_log(
  //           "Gras-render(server.js)",
  //           datetime,
  //           error,
  //           connection,
  //           res
  //         );
  //       }
  //       var rows2 = rows2.map(function (item) {
  //         return item["district"];
  //       });
  //       connection.query("SELECT desk from desk", (error, rows3) => {
  //         if (error) {
  //           Error_log.error_log(
  //             "Gras-render(server.js)",
  //             datetime,
  //             error,
  //             connection,
  //             res
  //           );
  //         }
  //         var rows3 = rows3.map(function (item) {
  //           return item["desk"];
  //         });
  //         connection.query(
  //           "SELECT user_type from user_type",
  //           (error, rows4) => {
  //             if (error) {
  //               Error_log.error_log(
  //                 "Gras-render(server.js)",
  //                 datetime,
  //                 error,
  //                 connection,
  //                 res
  //               );
  //             }
  //             var rows4 = rows4.map(function (item) {
  //               return item["user_type"];
  //             });
  if (req.session.user_type == "Admin") {
    res.render("pages/adminTables", {
      // result: rows,
      // result1: rows1,
      // result2: rows2,
      // result3: rows3,
      // result4: rows4,
      session: req.session.username,
      user_type: req.session.user_type,
    });
  } else {
    res.redirect("/");
  }
  //   }
  // );
  //       });
  //     });
  //   });
  // });
});

app.post("/admin_data", urlencodedParser, (req, res) => {
  const { data, type, tablename } = req.body;
  var query;
  try {
    if (type == "insert") {
      query = `insert into ${tablename} values('${data}')`;
    } else {
      if(tablename == "budget_code"){
        query=`delete from ${tablename} where budget_code="${data}"`;
      }
      else{
      query = `delete from ${tablename} where ${tablename}="${data}"`;
    }
  }
    connection.query(query, function (error, results) {
      if (error) {
        console.log(error);
        res.send("UnSuccessful");
      } else {
        // console.log("results");
        res.send("Successful");
      }
    });
  } catch (error) {
    console.log(error);
    res.send("UnSuccessful");
  }
});
app.post("/budget_code_insert", urlencodedParser, function (req, res) {

  var tablename = "budget_code";
  const {major_head_new,major_head_name_new,sub_major_head_new,sub_major_head_name_new,minor_head_new,minor_head_name_new,
sub_minor_head_new,sub_minor_head_name_new,group_head_new,group_head_name_new,detail_head_new,detail_head_name_new,demand_number_new,
budget_code_new,budget_code_name_new } = req.body;
console.log(major_head_new);

let reg_dt= new Date();
var dt =
    reg_dt.toISOString().split("T")[0] +
    " " +
    reg_dt.toTimeString().split(" ")[0];
  // try {
  //   Budget_code.budget_code(
  //     tablename,
  //     major_head_new,
  //     major_head_name_new,
  //     sub_major_head_new,
  //     sub_major_head_name_new,
  //     minor_head_new,
  //     minor_head_name_new,
  //     sub_minor_head_new,
  //     sub_minor_head_name_new,
  //     group_head_new,
  //     group_head_name_new,
  //     detail_head_new,
  //     detail_head_name_new,
  //     demand_number_new,
  //    budget_code_new,
  //   budget_code_name_new 
  //   );
  //   // }
  // } catch (error) {
  //   Error_log.error_log("Budget_code(server.js)", dt, error, connection, res);
  // }

  try {
    //if (type == "insert") {
     var query = `insert into budget_code(major_head,major_head_name,sub_major_head,sub_major_head_name,minor_head,minor_head_name,sub_minor_head,sub_minor_head_name,group_head,group_head_name,detail_head,detail_head_name,demand_number,budget_code,budget_name) values('${major_head_new}','${major_head_name_new}','${sub_major_head_new}','${sub_major_head_name_new}','${minor_head_new}','${minor_head_name_new}',
      '${sub_minor_head_new}','${sub_minor_head_name_new}','${group_head_new}','${group_head_name_new}','${detail_head_new}','${detail_head_name_new}','${demand_number_new}',
      '${budget_code_new}','${budget_code_name_new}')`;
   // } else {
    //  query = `delete from ${tablename} where ${tablename}="${data}"`;
   // }
    connection.query(query, function (error, results) {
      if (error) {
        console.log(error);
        res.send("UnSuccessful");
      } else {
        // console.log("results");
        res.send("Successful");
      }
    });
  } catch (error) {
    console.log(error);
    res.send("UnSuccessful");
  }
});

app.get("/rejected", function (req, res) {
  if (req.session.user_type != "Admin" && req.session.username) {
    res.render("pages/rejected", {
      session: req.session.username,
      user_type: req.session.user_type,
    });
  } else {
    res.redirect("/");
  }
});

app.post("/display_table", urlencodedParser, (req, res) => {
  const { tablename, data } = req.body;
  // console.log("hi");
  try {
    var query = `select ${data},month,financial_year,comment from ${tablename} where status=2`;
    connection.query(query, function (error, results) {
      if (!results) {
        // console.error(error.message);
        res.send("No Data");
      } else {
        // console.log(results);
        res.send(results);
      }
    });
  } catch (error) {
    console.error(error);
  }
});

app.get("/delete", function (req, res) {
  if (req.session.user_type == "ABC") {
    res.render("pages/delete", {
      session: req.session.username,
      user_type: req.session.user_type,
    });
  } else {
    res.redirect("/");
  }
});

app.post("/delete_data", urlencodedParser, (req, res) => {
  const { ip, date1, tablename, tablename0, data, colname } = req.body;
  // console.log(tablename + " " + colname + " " + data);
  var month = new Array();
  month[0] = "January";
  month[1] = "February";
  month[2] = "March";
  month[3] = "April";
  month[4] = "May";
  month[5] = "June";
  month[6] = "July";
  month[7] = "August";
  month[8] = "September";
  month[9] = "October";
  month[10] = "November";
  month[11] = "December";
  var M = month[datetime.getMonth()];
  var Y = datetime.getFullYear();
  var cashbook_col;
  if (
    tablename == "approved_remittance" ||
    tablename == "approved_other_receipts"
  ) {
    cashbook_col = "total_receipt_amount";
  } else if (tablename == "approved_gras") {
    cashbook_col = "gras_total";
  } else {
    cashbook_col = "total_expenditure";
  }
  try {
    var query = `select * from ${tablename} where ${colname}='${data}';`;
    // console.log(query);
    connection.query(query, function (error, results) {
      // console.log(results[0], results[0].particular);
      if (error) {
        console.log("here");
        console.log(error);
        res.send("Unsuccessful");
      } else {
        var insert_del, tablename1;
        results = results[0];
        // if (results.insert_dt !== "") {
        //   results.insert_dt =
        //     results.insert_dt.toISOString().split("T")[0] +
        //     " " +
        //     results.insert_dt.toTimeString().split(" ")[0];
        // }
        // if (results.update_dt !== "") {
        //   results.update_dt =
        //     results.update_dt.toISOString().split("T")[0] +
        //     " " +
        //     results.update_dt.toTimeString().split(" ")[0];
        // }

        // date1 =
        //   date1.toISOString().split("T")[0] +
        //   " " +
        //   date1.toTimeString().split(" ")[0];
        if (tablename == "approved_remittance") {
          tablename1 = "deleted_remittance";
          insert_del = `insert into ${tablename1}(letter_no,so2_no,particular,sales_office,date,budget_code,payment_method,cheque_no,month,financial_year,amount,insert_ip,insert_by,insert_dt,update_ip,update_by,update_dt,delete_dt,delete_ip,delete_by)values('${results.letter_no}','${results.so2_no}','${results.particular}','${results.sales_office}','${results.date}','${results.budget_code}', '${results.payment_method}', '${results.cheque_no}','${results.month}','${results.financial_year}','${results.amount}','${results.insert_ip}','${results.insert_by}','${results.insert_dt}',
          '${results.update_ip}','${results.update_by}','${results.update_dt}','${date1}','${ip}','${req.session.username}'
                          );`;
        } else if (tablename == "approved_gras") {
          tablename1 = "deleted_gras";
          insert_del = `insert into ${tablename1}(gras_receipt_no,particular,date,month,financial_year,type_of_transaction,budget_code,district,amount,insert_ip,insert_by,insert_dt,update_ip,update_by,update_dt,delete_ip,delete_dt,delete_by)values('${results.gras_receipt_no}','${results.particular}','${results.date}', '${results.month}','${results.financial_year}','${results.type_of_transaction}', '${results.budget_code}',  '${results.district}', '${results.amount}','${results.insert_ip}','${results.insert_by}','${results.insert_dt}',
          '${results.update_ip}','${results.update_by}','${results.update_dt}','${ip}','${date1}','${req.session.username}'

          );`;
        } else if (tablename == "approved_other_receipts") {
          tablename1 = "deleted_other_receipts";
          insert_del = `insert into ${tablename1}(particular,instrument,date,budget_code,payment_method,month,financial_year,amount,insert_ip,insert_by,insert_dt,update_ip,update_by,update_dt,delete_ip,delete_by,delete_dt)values('${results.particular}','${results.instrument}','${results.date}','${results.budget_code}','${results.payment_method}','${results.month}','${results.financial_year}','${results.amount}','${results.insert_ip}','${results.insert_by}','${results.insert_dt}',
          '${results.update_ip}','${results.update_by}','${results.update_dt}','${ip}','${req.session.username}','${date1}'
          );`;
        } else {
          tablename1 = "deleted_acknowledgement";
          insert_del = `insert into ${tablename1}(particular,voucher_no,budget_code,payment_details,date,month,financial_year,cheque_no,amount,insert_by,insert_ip,insert_dt,update_ip,update_by,update_dt,delete_ip,delete_by,delete_dt)values('${results.particular}','${results.voucher_no}','${results.budget_code}','${results.payment_details}','${results.date}','${results.month}','${results.financial_year}','${results.cheque_no}','${results.amount}','${results.insert_by}','${results.insert_ip}','${results.insert_dt}',
          '${results.update_ip}','${results.update_by}','${results.update_dt}','${ip}','${req.session.username}','${date1}'
          );`;
        }
      }
      connection.query(insert_del, function (error, results) {
        if (error) {
          console.log(error);
          res.send("Unsuccessfull");
        } else {
          var del = `select amount from ${tablename} where ${colname}="${data}";select closing_bal, ${cashbook_col} from cash_book_total_val where month="${M}" and financial_year="${Y}"`;
          connection.query(del, function (error, results) {
            console.log(results + " dwqd");
            if (results == null) {
              // console.log(error);
              res.send("Data Not Found");
            } else {
              console.log(results[1][0]);
              console.log(results[1][0].closing_bal);
              console.log(results[1][0].total_receipt_amount);
              // console.log(
              //   results[0][0].amount + " " + results[1][1].total_receipt_amount
              // );
              var bal;
              var bal2;
              try {
                bal = results[1][0].closing_bal - results[0][0].amount;
                if (
                  tablename == "approved_remittance" ||
                  tablename == "approved_other_receipts"
                ) {
                  bal2 =
                    results[1][0].total_receipt_amount - results[0][0].amount;
                } else if (tablename == "approved_gras") {
                  bal2 = results[1][0].gras_total - results[0][0].amount;
                } else {
                  bal2 = results[1][0].total_expenditure - results[0][0].amount;
                }
                var query = `delete from ${tablename} where ${colname}="${data}";update cash_book_total_val set closing_bal=${bal}, ${cashbook_col}=${bal2} where month="${M}" and financial_year="${Y}"`;
                connection.query(query, function (error, results) {
                  if (error) {
                    console.log(error);
                    res.send("Unsuccessful");
                  } else {
                    res.send("Successful");
                  }
                });
              } catch (error) {
                console.error(error.message);
                res.send("Data Not Found");
              }
            }
          });
        }
      });
    });
  } catch (error) {
    // console.error(error.message);
    res.send("Some Thing Went Wrong!\nContact Admin...");
  }
});

app.post("/get_data", urlencodedParser, (req, res) => {
  const { tablename, data } = req.body;
  var query = `select ${data} from ${tablename}`;
  connection.query(query, function (error, result) {
    if (error) {
      res.send("");
    } else {
      res.send(result);
    }
  });
});
app.post("/get_budget_data", urlencodedParser, (req, res) => {
  const { tablename } = req.body;
  var query = `select * from ${tablename}`;
  connection.query(query, function (error, result) {
    if (error) {
      res.send("");
    } else {
      res.send(result);
    }
  });
});

app.post("/balance", urlencodedParser, (req, res) => {
  const { month, f_year } = req.body;
  //  month= 'September';
  // financial_year='2019-2020';
  var query = `select * from cash_book_total_val where month='${month}' and financial_year='${f_year}';`;
  connection.query(query, function (error, result) {
    if (error) {
      res.send("");
    } else {

      // for( i=0<res[0][1].length;i++)t[0][2][i
      res.send(result);
    }
  });
});
app.post("/abstract", urlencodedParser, (req, res) => {
  const { month, financial_year } = req.body;
  //  month= 'September';
  // financial_year='2019-2020';
  var query = `select approved_remittance.date,sum(approved_remittance.amount) as amt from approved_remittance  where month='${month}' and financial_year='${financial_year}' group by date order by date; select approved_other_receipts.date,sum(approved_other_receipts.amount) as amt from approved_other_receipts where month='${month}' and financial_year='${financial_year}' group by date  order by date; select approved_acknowledgement.date,sum(approved_acknowledgement.amount) as amt from approved_acknowledgement  where month='${month}' and financial_year='${financial_year}'  group by date order by date;`;
  connection.query(query, function (error, result) {
    if (error) {
      res.send("");
    } else {
      console.log(result);
      // for( i=0<res[0][1].length;i++)t[0][2][i
      res.send(result);
    }
  });
});

app.get("/account_status", function (req, res) {
  if (req.session.user_type == "Admin") {
    res.render("pages/account_status", {
      session: req.session.username,
      user_type: req.session.user_type,
    });
  } else {
    res.redirect("/");
  }
});
app.get("/op_balance", function (req, res) {
  if (req.session.user_type == "Admin" && op_check!=2) {
    res.render("pages/op_balance", {
      session: req.session.username,
      user_type: req.session.user_type,
    });
  } else {
    res.redirect("/");
  }
});
app.post("/active_deactive", urlencodedParser, (req, res) => {
  const { username, status } = req.body;
  var query = `update register set confirmed=${status} where username='${username}'`;
  connection.query(query, function (error, result) {
    if (error) {
      res.send("Unsuccessful");
    } else {
      res.send("Successful");
    }
  });
});
//Insert Opening Balance
app.post("/insert_opening_balance", urlencodedParser, (req, res) => {
  const { financial_year,month,opening_balance } = req.body;
  var query = `insert into cash_book_total_val values('${month}','${financial_year}','0','0','0','${opening_balance}','${opening_balance}')`;
  connection.query(query, function (error, result) {
    if (error) {
      res.send("Unsuccessful");
      console.log(error);
    } else {
      op_check+=1;
      res.send("Successful");
    }
  });
});
//Update Opening Balance
app.post("/update_opening_balance", urlencodedParser, (req, res) => {
  const { financial_year,month,opening_balance } = req.body;
  var query = `update cash_book_total_val set opening_bal=${opening_balance} where month ='${month}' and financial_year='${financial_year}'`;
  connection.query(query, function (error, result) {
    if (error) {
      res.send("Unsuccessful");
      console.log(error);
    } else {
      op_check+=1;
      res.send("Successful");
    }
  });
});
app.post("/fetch_status", urlencodedParser, (req, res) => {
  var query = `select username,confirmed from register`;
  connection.query(query, function (error, result) {
    if (error) {
      res.send("Unsuccessful");
    } else {
      console.log("query results:");
      console.log(query);
      res.send("Successful");
    }
  });
});
// Deleted records page
app.get("/deleted_records", function (req, res) {
  res.render("pages/deleted_records", {
    session: req.session.username,
    user_type: req.session.user_type,
  });
});
//fetch deleted records expenditure
app.post("/fetch_deleted_records", urlencodedParser, (req, res) => {
  const { tablename } = req.body;

  var query = `select * from ${tablename}`;
  connection.query(query, function (error, result) {
    if (error) {
      res.send("Unsuccessful");
    } else {
      res.send(result);
    }
  });
});

//fetch receipt side of cashbook
app.post("/fetch_receipt", urlencodedParser, (req, res) => {
  const { month,financial_year } = req.body;

  var query = `select * from approved_remittance where month='${month}' and financial_year='${financial_year}';select * from approved_other_receipts where month='${month}' and financial_year='${financial_year}';`;
  connection.query(query, function (error, result) {
    if (error) {
      res.send("Unsuccessful");
      console.log(error);
  
    } else {
      console.log("Inside success");

      console.log(result[0]);
      res.send(result);
    }
  });
});

