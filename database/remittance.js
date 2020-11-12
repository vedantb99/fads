var exports = (module.exports = {});
exports.remittance = function (
  tablename,
  reg_dt,
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
) {
  var query = `insert into ${tablename}(letter_no,so2_no,particular,sales_office,date,budget_code,payment_method,cheque_no,month,financial_year,amount,insert_ip,insert_by,insert_dt)values('${letter}','${so2}','${particular}','${sales_office}','${date}','${budget_code}', '${payment}', '${cheque_no}','${month}','${financial_year}','${amount}','${user_ip}','${insert_by}','${reg_dt}');`;
  var check = `select * from remittance where month='${month}'and financial_year='${financial_year}';`;
  if (
    user_ip !== "" &&
    reg_dt !== "" &&
    letter !== "" &&
    so2 !== "" &&
    date !== "" &&
    payment !== "" &&
    financial_year !== "" &&
    budget_code !== "" &&
    month !== "" &&
    amount !== "" &&
    cheque_no !== "" &&
    particular!=="" &&
    sales_office !==""
  ) {
    // connection.query(check, function (error, results) {
    //   if (error) {
    //     res.send("SomeThing Went Wrong!");
    //     var query1 = `insert into error_log(page_name,error_date,error)values('${"gras.js(server)"}', '${reg_dt}','${error}');`;
    //     connection.query(query1);
    //   } else if (results != "") {
    connection.query(query, function (error, results) {
      if (error) {
        res.send("SomeThing Went Wrong!");
        console.log(error);
        var query1 = `insert into error_log(page_name,error_date,error)values('${"remittance.js(server)"})', '${reg_dt}','${error}');`;
        connection.query(query1);
      } else {
        res.send("Successful");
      }
    });
    //   } else {
    //     res.send(
    //       "First Insert Gras Amount for \n Month: " +
    //         month +
    //         "  and  financial_year:" +
    //         financial_year
    //     );
    //   }
    // });
  } else {
    res.send("Fields Cannot Be Empty!");
  }
};
