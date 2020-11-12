var exports = (module.exports = {});
exports.other_receipts = function (
  tablename,
  reg_dt,
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
) {
  var query = `insert into ${tablename}(particular,instrument,date,budget_code,payment_method,month,financial_year,amount,insert_ip,insert_by,insert_dt)values('${particular}','${instrument}','${date}','${budget_code}','${payment}','${month}','${financial_year}','${amount}','${user_ip}','${insert_by}','${reg_dt}');`;
  var check = `select * from other_receipts where month='${month}'and financial_year='${financial_year}';`;
  if (   
     reg_dt !== "" &&

    user_ip !== "" &&
    particular !== "" &&
    instrument !== "" &&
    date !== "" &&
    payment !== "" &&
    financial_year !== "" &&
    budget_code !== "" &&
    month !== "" &&
    amount !== "" 
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
        var query1 = `insert into error_log(page_name,error_date,error)values('${"other_receipts.js(server)"})', '${reg_dt}','${error}');`;
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
