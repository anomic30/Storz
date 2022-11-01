const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  magic_id: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  user_name: {
    type: String,
    required: true,
    default: 'User'
  },
  encryption_key: {
    type: String,
    required: true
  },
  files: [
    {
      file_name: {
        type: String
      },
      public: {
        type: Boolean
      },
      cid: {
        type: String
      },
      file_creationDate: {
        type: String
      },
      file_size: {
        type: Number
      }
    }
  ]
});

// export the model
module.exports = mongoose.model('User', userSchema);
