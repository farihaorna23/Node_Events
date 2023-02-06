//a server that can handle a post request to an url
// must read and decode the request body (which will contain a name and email), and append the contact information to a csv file (your newsletter list)
const { EventEmitter } = require("events");
const http = require("http");
const fs = require("fs");
//creating a new EventEmitter instance called NewsLetter
const NewsLetter = new EventEmitter();
const port = 3000;

NewsLetter.on("signup", contact => {
  //appendFile will create a file if a file doesn't exist
  fs.appendFile("contact.csv", `${contact.name} ${contact.email}\n`, err => {
    if (err) {
      console.error(err);
    } else {
      console.log("Successfully added content");
    }
  });
});

http
  .createServer((req, res) => {
    const chunks = [];
    //collecting data
    //listenng for the data event
    req.on("data", chunk => chunks.push(chunk));

    //after data has been collected
    ////listenng for the end event
    req.on("end", () => {
      const { url, method } = req;
      let statusCode = 200;
      let contentType = "text/html";
      let errorMessage = "";
      let info;
      let resBody;
      if (url == "/" && method == "GET") {
        resBody = "<h1>Home Page</h1>";
      } else if (url == "/newsletter_signup" && method == "POST") {
        try {
          //decode the chunks array
          let body = Buffer.concat(chunks).toString();
          //to access the request body values
          info = JSON.parse(body);
          //console.log(info); //{ name: 'Fariha', email: 'farihaorna@gmail.com' } -> if object was sent from a client
        } catch (err) {
          errorMessage = "<h1>Not the correct request body</h1>";
        }
        NewsLetter.emit("signup", info);
        resBody = errorMessage
          ? errorMessage
          : "<h1>Thank You For Signing Up!</h1>";
      } else {
        statusCode = 404;
        resBody = "<h1> Error. Page Not Found</h1>";
      }
      res.statusCode = statusCode;
      res.setHeader("content-type", contentType);
      res.write(resBody);
      res.end();
    });
  })
  .listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
