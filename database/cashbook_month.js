var exports = (module.exports = {});
exports.cashbook_month = function (
  month,
  financial_year,
  req,
  res,
  connection
) {
  var year = financial_year;
  year = year.split("-")[1];

  var query = `select * from approved_remittance where MONTHNAME(insert_dt)='${month}' and Year(insert_dt)='${year}' UNION select * from approved_remittance where MONTHNAME(update_dt)='${month}' and Year(update_dt)='${year}';select * from cash_book_total_val where month='${month}'and financial_year='${year}';
  select * from approved_acknowledgement where MONTHNAME(insert_dt)='${month}' and Year(insert_dt)='${year}' UNION select * from approved_acknowledgement where MONTHNAME(update_dt)='${month}' and Year(update_dt)='${year}';`;
  connection.query(query, function (error, results) {
    if (error) {
      res.send("DataBase Error!"); //Both send will be same
    } else {
      // console.log(results[0])
      var rows1 = results[0].map(function (item) {
        return [item.date, item.month, item.financial_year, item.amount];
      });
      var rows2 = results[1].map(function (item) {
        return [
          item.total_receipt_amount,
          item.gras_total,
          item.total_expenditure,
          item.opening_bal,
          item.closing_bal,
        ];
      });
      var rows3 = results[2].map(function (item) {
        return [item.amount];
      });
      console.log(rows3);
      // z = { remittance: rows1, total: rows2 };
      // console.log(z);
      // if (rows1 == "") {
      //   res.send("");
      // } else {
      res.send({
        remittance: rows1,
        total: rows2,
        ack: rows3,
      });
      // }
    }
  });
};
