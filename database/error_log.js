var exports = (module.exports = {});
exports.error_log = function (page, date, error, connection, res) {
  var query = `insert into error_log(page_name,error_date,error)values('${page}', '${date}','${error}');`;
  connection.query(query, function (error, results) {
    if (error) {
      res.send("DataBase Error!"); //Both send will be same
    } else {
      res.send("SomeThing Went Wrong");
    }
  });
};
