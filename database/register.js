var exports = (module.exports = {});
exports.register = function (
  Gmail_user,
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
  Email_Secret
) {
  var del_query = `delete from register where username='${username}';`;
  var query = `insert into register(name,username,email,password,user_type,ip_address,reg_dt)values('${name}', '${username}','${email}', '${password}', '${user_type}', '${user_ip}', '${reg_dt}');`;
  if (
    Temp != "" &&
    name != "" &&
    username != "" &&
    email != "" &&
    password != "" &&
    user_type != "" &&
    reg_dt != ""
  ) {
    connection.query(query, function (error, results) {
      if (error) {
        // console.log(error);
        var query1 = `insert into error_log(page_name,error_date,error)values('${"register.js(server)"}', '${reg_dt}','${error}');`;
        connection.query(query1);
        res.send("Username Already In Use");
      } else {
        try {
          const emailToken = jwt.sign({ user: username }, Email_Secret, {
            expiresIn: "1d",
          });
          const url = `http://localhost:3000/confirmation/${emailToken}`;
          var mailOptions = {
            from: process.env.Gmail_user,
            to: email,
            subject: "Confirmation Email!",
            html: `Please Click On The Following Link To Verify You'r Account: <br>Your Username: "${username}"<br> One Time Password: "${Temp}"<br><a href="${url}">Click Here To Confirm Email</a>`,
          };
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
            } else {
              res.send("Successful");
            }
            // transporter.sendMail({
            //   to: email,
            //   subject: "Confirmation Email",
            //   html: `Please Click On The Following Link To Verify You'r Account: <br>Your Username: "${username}"<br> One Time Password: "${Temp}"<br><a href="${url}">Click Here To Confirm Email</a>`,
            // });
            // console.log(emailToken);
          });
        } catch (error) {
          // console.log(e);
          var query1 = `insert into error_log(page_name,error_date,error)values('${"register-page"}', '${reg_dt}','${error}');`;
          connection.query(query1);
          connection.query(del_query);
          res.send("Something Went Wrong");
        }
      }
    });
  } else {
    res.send("Fields Cannot Be Empty");
  }
};
