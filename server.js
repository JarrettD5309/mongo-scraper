var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");
const { json } = require("express");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/mongoScraper", { useNewUrlParser: true });

// Routes

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname + "./public/index.html"));
});

app.get("/api", function(req,res) {
    db.Article.find({})
    // populate here like example 18
    .sort({"_id": -1})
    .then(function(response) {
        res.json(response)
        .catch(function(err) {
            res.json(err);
        });
    });
});

app.get("/scrape", function (req, res) {

    axios.get("https://www.democracynow.org/categories/weekly_column").then(function (response) {

        // Load the HTML into cheerio and save it to a variable
        // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
        var $ = cheerio.load(response.data);

        // With cheerio, find each h3 tag
        $("h3").each(function (i, element) {
            var result = {};

            result.title = $(element).text();

            result.link = "https://www.democracynow.org" + $(element).children().attr("href");

            db.Article.create(result)
                .then(function (dbArticle) {
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    console.log(err);
                });
        });

        res.send("Scrape Complete");
    })
});

// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});

// First, tell the console what server.js is doing
// console.log("\n***********************************\n" +
//     "Grabbing headline, summary, and\n" +
//     "url from democracy now:" +
//     "\n***********************************\n");

// // GETS TEXT FROM ARTCILE PAGE
// axios.get("https://www.democracynow.org/2020/8/6/medicare_for_all_a_prescription_against").then(function (response) {

//     var $ = cheerio.load(response.data);

//     var articleText = $(".story_summary").children(".text").eq(1).text();

//     console.log(articleText);
// });

// axios.get("https://www.democracynow.org/categories/weekly_column").then(function (response) {

//     // Load the HTML into cheerio and save it to a variable
//     // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
//     var $ = cheerio.load(response.data);

//     // An empty array to save the data that we'll scrape
//     var results = [];

//     // With cheerio, find each h3 tag
//     $("h3").each(function (i, element) {

//         // Save the text of the element in a "title" variable
//         var title = $(element).text();

//         // In the currently selected element, look at its child elements (i.e., its a-tags),
//         // then save the values for any "href" attributes that the child elements may have. Concatenate with leading url
//         var link = "https://www.democracynow.org" + $(element).children().attr("href");

//         // Save these results in an object that we'll push into the results array we defined earlier
//         results.push({
//           title: title,
//           link: link
//         });
//     });

//     console.log(results);
// });