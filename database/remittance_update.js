var exports = (module.exports = {});
exports.remittance_update = function (
  tablename,
  reg_dt,
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
) {
  var query;
  query = `update ${tablename} set letter_no='${letter}',so2_no='${so2}',date='${date}',month='${month}',financial_year='${financial_year}',budget_code='${budget_code}',payment_method='${payment}',cheque_no='${cheque_no}',particular='${particular}',sales_office='${sales_office}',amount='${amount}', update_by='${update_by}',update_ip='${user_ip}',update_dt='${reg_dt}' where letter_no='${letter_check}'`;
  // var check = `select * from cash_book_total_val where month='${month}'and financial_year='${financial_year}';`
  // connection.query(check,function(error,results){
  //     if(error){
  //         res.send("SomeThing Went Wrong!");
  //     }
  //     else if(results!=""){
  // console.log(query);
  if (tablename == "remittance") {
    check = `select status from ${tablename} where letter_no='${letter}'`;
    connection.query(check, function (error, results) {
      if (error) {
        // console.error(error.message);
        // console.log(error);
        res.send("Unable To Update"); //Both send will be same
      } else {
        if (results[0].status == 2 || results[0].status == 0) {
          console.log(results[0].status);
          var st = 0;
          query = `update remittance set status="0",letter_no='${letter}',so2_no='${so2}',date='${date}',month='${month}',financial_year='${financial_year}',budget_code='${budget_code}',payment_method='${payment}',cheque_no='${cheque_no}',particular='${particular}',sales_office='${sales_office}',amount='${amount}', update_by='${update_by}',update_ip='${user_ip}',update_dt='${reg_dt}' where letter_no='${letter_check}'`;
        }
      }
    });
  }
  connection.query(query, function (error, results) {
    if (error) {
      res.send("Unsuccessful"); //Both send will be same
      //    console.log(error);
    } else {
      // console.log(results);
      res.send("Successful");
    }
  });
  // }
  // else{
  //     res.send("First Insert Gras Amount for \n Month: "+month+"  and  financial_year:"+financial_year);
  // }
  // });
};
