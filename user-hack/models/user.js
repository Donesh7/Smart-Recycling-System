const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String, required: true },
  employeeid: { type: String, unique: true },
  // detected: [
  //   {
  //     timestamp: { type: Date, default: Date.now },
  //     total_bottle_count: { type: Number },
  //     total_recycled_bottles: { type: Number },
  //   },
  // ],
  // Array of detected objects
});

userSchema.pre("save", async function (next) {
  if (this.isNew) {
    const User = mongoose.model("User", userSchema);
    const count = await User.countDocuments();
    this.employeeid = `ECO-${String(count + 1).padStart(3, "0")}`;
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
