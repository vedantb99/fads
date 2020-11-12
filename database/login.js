var exports = (module.exports = {});
exports.login = function (
  username,
  user_ip,
  reg_date,
  password,
  connection,
  res,
  bcrypt,
  req
) {
  if (username != "" && password != "") {
    var status = true;
    var query = `SELECT * FROM register WHERE username = ? `;

    connection.query(query, [username], function (error, results) {
      if (results != "") {
        var rows = results.map(function (item) {
          return item["password"];
        });
        // console.log(rows);
        let x = JSON.parse(rows[0]);
        let y = x.pop();
        // console.log(y);
        var rows1 = results.map(function (item) {
          return item["confirmed"];
        });
        var rows2 = results.map(function (item) {
          return item["user_type"];
        });
        // let y = JSON.stringify(password);
        // console.log(y);
        // // console.log(rows[0]);
        var v1 = bcrypt.compareSync(password, y);
        if (v1 == true) {
          // console.log(rows1[0]);
          if (rows1[0] == 1) {
            req.session.username = username;
            req.session.user_type = rows2[0];
            // console.log(req.session.user_type);
            res.send("Successful1");
            status = true;
            var loginCheck = `insert into login_check (username,user_ip,login_status,login_dt)values('${username}','${user_ip}',${status},'${reg_date}');`;
            connection.query(loginCheck);
          } else if (rows1[0] == 2) {
            req.session.username = username;
            req.session.user_type = rows2[0];
            // console.log(req.session.user_type);
            res.send("Successful");
            status = true;
            var loginCheck = `insert into login_check (username,user_ip,login_status,login_dt)values('${username}','${user_ip}',${status},'${reg_date}');`;
            connection.query(loginCheck);
          } else if (rows1[0] == 3) {
            res.send("Account is Deactive!");
            status = false;
            var loginCheck = `insert into login_check (username,user_ip,login_status,login_dt)values('${username}','${user_ip}',${status},'${reg_date}');`;
            connection.query(loginCheck);
          } else {
            res.send("Email Not Verified");
            status = false;
            var loginCheck = `insert into login_check (username,user_ip,login_status,login_dt)values('${username}','${user_ip}',${status},'${reg_date}');`;
            connection.query(loginCheck);
          }
        } else {
          res.send("password Does not match");
          status = false;
          var loginCheck = `insert into login_check (username,user_ip,login_status,login_dt)values('${username}','${user_ip}',${status},'${reg_date}');`;
          connection.query(loginCheck);
        }
      } else {
        res.send("User Not Found");
        status = false;
        var loginCheck = `insert into login_check (username,user_ip,login_status,login_dt)values('${username}','${user_ip}',${status},'${reg_date}');`;
        connection.query(loginCheck);
      }
    });
  } else {
    res.send("Fields Cannot Be Empty");
  }
};
