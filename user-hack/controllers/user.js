const User = require("../models/user");

exports.gethome = (req, res) => {
  res.render("home");
};

exports.getlogin = (req, res) => {
  res.render("login");
};
exports.getdash = (req, res) => {
  res.render("dash");
};
exports.postuser = (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const mobile = req.body.mobile;

  const user = new User({
    name: name,
    email: email,
    mobile: mobile,
  });
  user
    .save()
    .then((result) => {
      console.log(result);
      res.redirect("/login");
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.getuser = async (req, res) => {
  const email = req.body.email;
  const userid = req.body.userid;

  User.find({ objectId: userid })
    .then((user) => {
      if (user) {
        // Ensure detected property is initialized
        user.detected = user.detected || [];

        // Calculate total bottle count
        const totalBottleCount = user.detected.reduce(
          (acc, obj) => acc + obj.total_bottle_count,
          0
        );
        console.log(totalBottleCount);

        res.render("dash", {
          totalBottleCount: totalBottleCount,
        });
      }
    })

    .catch((err) => {
      console.log(err);
    });
};
