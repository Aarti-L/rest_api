const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  usertype: {type:String, default:'user'},
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase:true },
  password: { type:String, required: true}
},{ timestamps: true });

module.exports = mongoose.model('User', userSchema);
