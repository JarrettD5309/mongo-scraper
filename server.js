var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
require('dotenv').config();

// Require all models
var db = require("./models");
const { json } = require("express");

var PORT = process.env.PORT || 3000;

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

const MONGODB_URI = process.env.mongodburi;

// Connect to the Mongo DB
mongoose.connect(MONGODB_URI || "mongodb://localhost/mongoScraper", { useNewUrlParser: true });

mongoose.connection.on("connected", () => console.log("Mongoose is connected")
);



// Routes

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname + "./public/index.html"));
});

app.get("/api", function (req, res) {
    db.Article.find({})
        // populate here like example 18
        .sort({ "articledate": -1 })
        .then(function (response) {
            res.json(response);
        })
        .catch(function (err) {
            res.json(err);
        });
});

app.get("/api/:id", function (req, res) {
    console.log("thisis the article: " + req.params.id);
    db.Note.find({ articleid: req.params.id })
        .then(function (response) {
            console.log("this is the response: " + JSON.stringify(response));
            res.json(response);
        })
        .catch(function (err) {
            res.json(err);
        });
});

app.post("/api/:id", function (req, res) {
    db.Note.create({
        comment: req.body.comment,
        articleid: req.params.id
    })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

app.delete("/api/comment/:id", function (req, res) {
    db.Note.findOneAndDelete({_id:req.params.id})
    .then(result=>res.json(result))
    .catch(err=>res.json(err))
});

app.get("/scrape", function (req, res) {
    console.log("scrape is getting called");
    axios.get("https://www.democracynow.org/categories/weekly_column").then(function (response) {

        // Load the HTML into cheerio and save it to a variable
        // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
        var $ = cheerio.load(response.data);

        var promises = [];
        // With cheerio, find each h3 tag
        $("h3").each(function (i, element) {
            var result = {};

            result.title = $(element).text();

            result.link = "https://www.democracynow.org" + $(element).children().attr("href");

            var rawLink = $(element).children().attr("href");
            var rawLink2 = rawLink.substr(1);
            var n = 0;
            var articleDate = "";

            var articleYear = "";
            var articleMonth = "";
            var articleDay = "";
            for (var i = 0; i < rawLink2.length; i++) {
                if (n === 0) {
                    if (rawLink2[i] === "/") {
                        n++;
                    } else {
                        articleYear = articleYear + rawLink2[i];
                    }
                } else if (n === 1) {
                    if (rawLink2[i] === "/") {
                        n++;
                        if (parseInt(articleMonth) < 10) {
                            articleMonth = "0" + articleMonth;
                        }
                    } else {
                        articleMonth = articleMonth + rawLink2[i];
                    }
                } else if (n === 2) {
                    if (rawLink2[i] === "/") {
                        n++;
                        if (parseInt(articleDay) < 10) {
                            articleDay = "0" + articleDay;
                        }
                    } else {
                        articleDay = articleDay + rawLink2[i];
                    }
                } else if (n === 3) {
                    articleDate = articleYear + "-" + articleMonth + "-" + articleDay;
                    result.articledate = articleDate;
                }
            }
            console.log("THIS IS THE DATE: " + articleDate);
            promises.push(
                db.Article.create(result)
                    .then(function (dbArticle) {
                        console.log(dbArticle);
                    })
                    .catch(function (err) {
                        console.log(err);
                    })
            );
        });
        Promise.all(promises).then(function () {
            res.send("Scrape Complete");
        });

    });
});

// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});