const client = require("../config/db.config.js");

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

// get all blogs viewed by user in each month OR in a particular date
exports.blogView= async(req, res) => {
  let request_type=req.body.request_type
  if(request_type=="monthly"){
//generate series() is used for getting series of months of current year
  let monthlyView= await client.query(`

    SELECT TO_CHAR(created_at, 'FMMonth')  as Month, min(to_char(created_at,'mm')) as month_id,
    COUNT(blog_id) FROM blog_view
    WHERE user_id='${req.body.user_id}' AND to_char(created_at,'yyyy')=to_char(now(),'yyyy')
    GROUP BY Month
    UNION
    select
    to_char(gen_series, 'FMMonth') as Month, min(to_char(gen_series,'mm')) as month_id,count(blog_id)
    FROM generate_series(
    date_trunc('year',now()),
    date_trunc('year',now()) + '12 month' - '1 day'::interval,
    '1 month') as gen_series
    LEFT JOIN blog_view
    ON ( TO_CHAR(created_at, 'FMMonth') = to_char(gen_series, 'Month') )
    WHERE NOT EXISTS (SELECT TO_CHAR(created_at, 'FMMonth') FROM blog_view
    WHERE TO_CHAR(created_at, 'FMMonth') = to_char(gen_series, 'FMMonth') AND user_id='${req.body.user_id}' AND to_char(created_at,'yyyy')=to_char(now(),'yyyy'))
    GROUP BY Month
    Order by month_id

     `);

      res.status(200).json({'status':200,'data':monthlyView.rows});
  }

//CASE is applied because if no values found count gives null rather than 0

  if(request_type=="daily"){

    let dailyView= await client.query(`
      SELECT
      CASE WHEN Count(blog_id) IS NULL THEN 0
      ELSE Count(blog_id)
      END as Count
      FROM blog_view
      WHERE user_id='${req.body.user_id}' AND created_at::timestamp::date='${req.body.date}'
      `);

    res.status(200).json({'status':200,'data':dailyView.rows});
  }

}
