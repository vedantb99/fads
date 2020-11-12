var exports = (module.exports = {});
exports.ack = function (
  particular,
  voucher_no,
  budget_code,
  tablename,
  month,
  financial_year,
  username,
  date,
  reg_dt,
  amount,
  cheque_number,
  user_ip,
  payment_details,
  // desk_number,
  connection,
  res
) {
  var query = `insert into ${tablename}(particular,voucher_no,budget_code,payment_details,date,month,financial_year,cheque_no,amount,insert_by,insert_ip,insert_dt)values('${particular}','${voucher_no}','${budget_code}','${payment_details}','${date}','${month}','${financial_year}','${cheque_number}','${amount}','${username}','${user_ip}','${reg_dt}');`;
  //   var check = `select * from cash_book_total_val where month='${month}'and financial_year='${financial_year}';`;
  //   connection.query(check, function (error, results) {
  //     if (error) {
  //       res.send("SomeThing Went Wrong!");
  //       var query1 = `insert into error_log(page_name,error_date,error)values('${"gras.js(server)"}', '${reg_dt}','${error}');`;
  //       connection.query(query1);
  //     } else if (results != "") {
  connection.query(query, function (error, results) {
    if (error) {
      console.error(error.message);
      // console.log(error);
      res.send("Unable To Insert"); //Both send will be same
    } else {
      res.send("Successful");
    }
  });
  //     } else {
  //       res.send(
  //         "First Insert Gras Amount for \n Month: " +
  //           month +
  //           "  and  financial_year:" +
  //           financial_year
  //       );
  //     }
  //   });
};
