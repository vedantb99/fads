var exports = (module.exports = {});
exports.changepass = function (
  password,
  newPassword,
  connection,
  res,
  bcrypt,
  req,
  bPassword
) {
  let username = req.session.username;
  let r = 1;
  if (newPassword != "" && password != "") {
    var query = `SELECT * FROM register WHERE username = ? `;
    connection.query(query, [username], function (error, results) {
      if (results != "") {
        var rows = results.map(function (item) {
          return item["password"];
        });
        let x = JSON.parse(rows[0]);
        let z = JSON.parse(rows[0]);
        for (i = 0; i < z.length; i++) {
          var v1 = bcrypt.compareSync(newPassword, z[i]);
          if (v1 == true) {
            r = 0;
            // console.log("true");
          } else {
            // console.log(v1);
          }
        }
        // console.log(z+"      here");
        let count = z.length;
        // console.log(x.length+"ddwqd");
        // x.push("second string")
        let x1 = x.pop();
        // console.log(z);
        // let y = JSON.stringify(password);
        // console.log(y);
        // // console.log(rows[0]);
        var v1 = bcrypt.compareSync(password, x1);
        if (v1 == true) {
          if (r == 1) {
            if (count == 3) {
              // console.log(z.length);
              z.shift();
              // console.log(z.length);
              z.push(bPassword);
              // console.log(z.length);
              let y = JSON.stringify(z);
              var query = `update register set password ='${y}'where username ='${username}'`;
              connection.query(query, function (error, results) {
                if (error) {
                  // console.log(error);
                  res.send("unsuccesssful");
                } else {
                  res.send("Successful");
                }
              });
            } else {
              z.push(bPassword);
              // console.log(z);
              let y = JSON.stringify(z);
              var query = `update register set password ='${y}'where username ='${username}'`;
              connection.query(query, function (error, results) {
                if (error) {
                  // console.log(error);
                  res.send("unsuccesssful");
                } else {
                  res.send("Successful");
                }
              });
            }
          } else {
            res.send("Use Another Password!");
          }
          //   x.push(newPassword);
          //   let y = JSON.stringify(x)
          //   var query = `update register set password ='${y}'where username ='${username}'`;
          //   console.log(x[1]);
          //   console.log(y);

          //   console.log(x+'  1');
        } else {
          res.send("Old Password Does Not Match");
        }
      } else {
        res.send("Error");
      }
    });
  } else {
    res.send("Fields Cannot Be Empty");
  }
};
