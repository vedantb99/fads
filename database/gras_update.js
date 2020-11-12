var exports = (module.exports = {});
exports.gras_update = function (
  pdf_location,
  type_of_transaction,
  particular,
  date,
  tablename,
  gras_receipt_check,
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
  update_by
) {
  var query;
  if (pdf_location !== undefined) {
    query = `update ${tablename} set  gras_receipt_no='${gras_receipt}',particular='${particular}',date='${date}',type_of_transaction='${type_of_transaction}',budget_code='${budget_code}',district='${district}',amount='${amount}',update_ip='${user_ip}',update_by='${update_by}',update_dt='${reg_dt}',pdf='${pdf_location}' where gras_receipt_no='${gras_receipt_check}';`;
  } else {
    query = `update ${tablename} set  gras_receipt_no='${gras_receipt}',particular='${particular}',date='${date}',type_of_transaction='${type_of_transaction}',budget_code='${budget_code}',district='${district}',amount='${amount}',update_ip='${user_ip}',update_by='${update_by}',update_dt='${reg_dt}' where gras_receipt_no='${gras_receipt_check}';`;
  }
  if (tablename == "gras") {
    check = `select status from ${tablename} where gras_receipt_no='${gras_receipt}'`;
    connection.query(check, function (error, results) {
      if (error) {
        console.error(error.message);
        console.log(error);
        res.send("Unable To Update"); //Both send will be same
      } else {
        if (results[0].status == 2 || results[0].status == 0) {
          if (pdf_location !== undefined) {
            query = `update ${tablename} set  gras_receipt_no='${gras_receipt}',particular='${particular}',date='${date}',type_of_transaction='${type_of_transaction}',budget_code='${budget_code}',district='${district}',amount='${amount}',update_ip='${user_ip}',update_by='${update_by}',update_dt='${reg_dt}',status=0, pdf='${pdf_location}' where gras_receipt_no='${gras_receipt_check}';`;
          } else {
            query = `update ${tablename} set  gras_receipt_no='${gras_receipt}',particular='${particular}',date='${date}',type_of_transaction='${type_of_transaction}',budget_code='${budget_code}',district='${district}',amount='${amount}',update_ip='${user_ip}',update_by='${update_by}',update_dt='${reg_dt}',status=0 where gras_receipt_no='${gras_receipt_check}';`;
          }
        }
      }
    });
  }
  connection.query(query, function (error, results) {
    if (error) {
      res.send("Unsuccessful"); //Both send will be same
      console.error(error.message);
      console.log(error);
    } else {
      // console.log(results);
      res.send("Successful");
    }
  });
};
