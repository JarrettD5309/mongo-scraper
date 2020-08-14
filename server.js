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
    // db.Article.findOne({_id:req.params.id})
    // .populate("note")
    // .then(function(response) {
    //     console.log("this is the response: " + JSON.stringify(response));
    //     res.json(response);
    // })
    // .catch(function(err) {
    //     res.json(err);
    // });
});

app.post("/api/:id", function (req, res) {
    db.Note.create({
        comment: req.body.comment,
        articleid: req.params.id
    })
        // .then(function (dbNote) {
        //     return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        // })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
    // db.Note.create(req.body)
    //     .then(function (dbNote) {
    //         return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    //     })
    //     .then(function (dbArticle) {
    //         res.json(dbArticle);
    //     })
    //     .catch(function (err) {
    //         res.json(err);
    //     });
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
                if (n===0) {
                    if (rawLink2[i]==="/") {
                        n++;
                        // return;
                    } else {
                        articleYear=articleYear+rawLink2[i];
                    }
                } else if (n===1) {
                    if (rawLink2[i]==="/") {
                        n++;
                        if (parseInt(articleMonth)<10) {
                            articleMonth="0" + articleMonth;
                        }
                        // return;
                    } else {
                        articleMonth=articleMonth+rawLink2[i];
                    }
                } else if (n===2) {
                    if (rawLink2[i]==="/") {
                        n++;
                        if (parseInt(articleDay)<10) {
                            articleDay="0"+articleDay;
                        }
                        // return;
                    } else {
                        articleDay=articleDay+rawLink2[i];
                    }
                } else if (n===3) {
                    articleDate=articleYear+"-"+articleMonth+"-"+articleDay;
                    result.articledate=articleDate;
                }
                // if (rawLink2[i] === "/") {
                //     n++;
                //     if (n === 3) {
                //         result.articledate = articleDate;
                //         console.log("article date: " + articleDate);
                //         return;
                //     } else {
                //         articleDate = articleDate + "-";
                //     }


                // } else {
                //     articleDate = articleDate + rawLink2[i];
                // }
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