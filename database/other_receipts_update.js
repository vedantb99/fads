var exports = (module.exports = {});
exports.other_receipts_update = function (
  tablename,
  reg_dt,
  user_ip,
  particular,
  instrument,
  instrument_check,
  date,
  budget_code,
  month,
  financial_year,
  amount,
  payment,
  connection,
  res,
  update_by
) {
  var query;
  query = `update ${tablename} set particular='${particular}',instrument='${instrument}',date='${date}',month='${month}',financial_year='${financial_year}',budget_code='${budget_code}',payment_method='${payment}',amount='${amount}', update_by='${update_by}',update_ip='${user_ip}',update_dt='${reg_dt}' where instrument='${instrument_check}'`;
  // var check = `select * from cash_book_total_val where month='${month}'and financial_year='${financial_year}';`
  // connection.query(check,function(error,results){
  //     if(error){
  //         res.send("SomeThing Went Wrong!");
  //     }
  //     else if(results!=""){
  // console.log(query);
  if (tablename == "other_receipts") {
    check = `select status from ${tablename} where instrument='${instrument_check}'`;
    connection.query(check, function (error, results) {
      if (error) {
        // console.error(error.message);
        // console.log(error);
        res.send("Unable To Update"); //Both send will be same
      } else {
        if (results[0].status == 2 || results[0].status == 0) {
          console.log(results[0].status);
          var st = 0;
          query = `update other_receipts set status="0",particular='${particular}',instrument='${instrument}',date='${date}',month='${month}',financial_year='${financial_year}',budget_code='${budget_code}',payment_method='${payment}',amount='${amount}', update_by='${update_by}',update_ip='${user_ip}',update_dt='${reg_dt}' where instrument='${instrument_check}'`;
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
