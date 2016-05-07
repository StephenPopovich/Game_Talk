
var chatSchema = mongoose.Schema({
  nick: String,
  msg: String,
  created: {type: Date, default: Date.now}
});

// Validations
chatSchema.path('nick').required(true, 'Type something a nickname!');
chatSchema.path('msg').required(true, 'Type something!');
//model
var Chat = mongoose.model('Message', chatSchema);