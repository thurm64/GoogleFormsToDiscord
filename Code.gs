// Here's the inner workings of the code. You probably don't need to change any of this

// Run this function once. It will set up the hook to detect form submission
function myFunction() {
  var form = FormApp.openByUrl(options.form_url);
  //Create a trigger to run every time someone submits the form.
  ScriptApp.newTrigger('processForm')
    .forForm(form)
    .onFormSubmit()
    .create();
  
}

//Processes form data and submits it to the webhook
function processForm(data) {
  var response = data.response
  var responses = response.getItemResponses();
  var name = "";
  var fields = [];
  // Go through all the responses
  for(var i in responses) { 
    var item = responses[i];
    var question = item.getItem().getTitle();
    var answer = item.getResponse();
    if(name == "" && question.includes("discord id")) {
      name = answer;
    } else {
      fields.push(generateField(question, answer))
    }
  }
  var webhook_data = {
  "username": options.username,
  "avatar_url": options.profile_picture ?? "https://i.imgur.com/4M34hi2.png",
  "embeds": [
    {
      "title": options.title_format,
      "description": options.description_format.replace("%name", name),
      "color": parseInt(options.color ?? "000000", 16), //returns color or #000000 if none specified
      "fields": fields,
    }
  ]
  }
  sendWebhook(webhook_data);
}

//Helper function for generating embed fields
function generateField(name, value) {
   return {
          "name": options.question_format.replace("%question", name),
          "value": options.answer_format.replace("%answer", value),
          "inline": false
        }
}

//Sends the specified data to the webhook
function sendWebhook(webhook_data) {
  var string = JSON.stringify(webhook_data); //convert the webhook data to a string
  UrlFetchApp.fetch(options.webhook_url, {
    'method' : 'post',
    "headers": { "Content-Type": "application/json" },
    'payload' : string
  });
}
