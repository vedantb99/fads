var exports = (module.exports = {});
exports.ack_up = function (
  tablename,
  username,
  user_ip,
  // desk_number_check,
  date_check,
  cheque_number_check,
  reg_dt,
  // desk_number,
  particular,
  voucher_no,
  budget_code,
  payment_details,
  date,
  cheque_number,
  amount,
  cheque_date,
  month,
  financial_year,
  connection,
  res
) {
  // console.log(cheque_number_check);
  var query;
  query = `update ${tablename} set particular='${particular}',voucher_no='${voucher_no}',budget_code='${budget_code}',payment_details='${payment_details}',date='${date}',month='${month}',financial_year='${financial_year}',cheque_no='${cheque_number}',amount='${amount}',update_by='${username}',update_ip='${user_ip}',update_dt='${reg_dt}' where date='${date_check}'and cheque_no='${cheque_number_check}'`;
  if (tablename == "acknowledgement") {
    check = `select status from ${tablename} where cheque_no='${cheque_number}'`;
    connection.query(check, function (error, results) {
      if (error) {
        console.error(error.message);
        console.log(error);
        res.send("Unable To Update"); //Both send will be same
      } else {
        if (results[0].status == 2 || results[0].status == 0) {
          query = `update ${tablename} set particular='${particular}',voucher_no='${voucher_no}',budget_code='${budget_code}',payment_details='${payment_details}',date='${date}',month='${month}',financial_year='${financial_year}',cheque_no='${cheque_number}',amount='${amount}',update_by='${username}',update_ip='${user_ip}',update_dt='${reg_dt}',status=0 where date='${date_check}'and cheque_no='${cheque_number_check}'`;
        }
      }
    });
  }
  connection.query(query, function (error, results) {
    if (error) {
      console.error(error.message);
      console.log(error);
      res.send("Unable To Update"); //Both send will be same
    } else {
      res.send("Successful");
    }
  });
};
