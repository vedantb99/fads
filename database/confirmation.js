var exports = (module.exports = {});
exports.confirmation = function (username, connection, res, datetime, req) {
  let con = 1;
  let reg_dt = datetime;
  var query = `update register set confirmed = '${con}' where username='${username}';`;
  connection.query(query, function (error, results) {
    if (error) {
      res.render("../views/pages/confirmation", {
        title: "SomeThing Went Wrong",
        session: req.session.username,
      }); //Both send will be same
      //    console.log(error);
      var query1 = `insert into error_log(page_name,error_date,error)values('${"confirmation.js(server)"}', '${reg_dt}','${error}');`;
      connection.query(query1);
    } else {
      res.render("../views/pages/confirmation", {
        title: "Email Verified",
        session: req.session.username,
      });
    }
  });
};
