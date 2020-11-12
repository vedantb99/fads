var exports = (module.exports = {});
exports.gras = function (
  pdf_location,
  type_of_transaction,
  particular,
  date,
  tablename,
  user_ip,
  reg_dt,
  gras_receipt,
  month,
  financial_year,
  budget_code,
  district,
  amount,
  connection,
  res,
  insert_by
) {
  var query = `insert into ${tablename}(gras_receipt_no,particular,date,month,financial_year,type_of_transaction,budget_code,district,amount,insert_ip,insert_by,insert_dt,pdf)values('${gras_receipt}','${particular}','${date}', '${month}','${financial_year}','${type_of_transaction}', '${budget_code}', '${district}', '${amount}','${user_ip}','${insert_by}','${reg_dt}','${pdf_location}');`;
  // var check = `select * from gras where month='${month}'and (financial_year='${financial_year}' and scheme='${scheme}');`;
  if (
    type_of_transaction !== "" &&
    particular !== "" &&
    date !== "" &&
    user_ip !== "" &&
    reg_dt !== "" &&
    gras_receipt !== "" &&
    month !== "" &&
    financial_year !== "" &&
    budget_code !== "" &&
    district !== "" &&
    amount !== ""
  ) {
    // connection.query(check, function (error, results) {
    //   if (error) {
    //     res.send("SomeThing Went Wrong!");
    //     var query1 = `insert into error_log(page_name,error_date,error)values('${"gras.js(server)"}', '${reg_dt}','${error}');`;
    //     connection.query(query1);
    //     // console.log(error);
    //   } else if (results == "") {
    connection.query(query, function (error, results) {
      if (error) {
        res.send("SomeThing Went Wrong!");
         console.log(error);
        var query1 = `insert into error_log(page_name,error_date,error)values('${"gras.js(server)"}', '${reg_dt}','${
          error.message
        }');`;
        connection.query(query1);
      } else {
        res.send("Successful");
      }
    });
    // } else {
    //   res.send(
    //     "Gras Details Alredy Exits For \n Month: " +
    //       month +
    //       "  and  financial_year:" +
    //       financial_year
    //   );
    // }
    // });
  } else {
    res.send("Fields Cannot Be Empty!");
  }
};
