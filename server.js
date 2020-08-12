var cheerio = require("cheerio");
var axios = require("axios");

// First, tell the console what server.js is doing
console.log("\n***********************************\n" +
    "Grabbing headline, summary, and\n" +
    "url from democracy now:" +
    "\n***********************************\n");

// // GETS TEXT FROM ARTCILE PAGE
// axios.get("https://www.democracynow.org/2020/8/6/medicare_for_all_a_prescription_against").then(function (response) {

//     var $ = cheerio.load(response.data);

//     var articleText = $(".story_summary").children(".text").eq(1).text();

//     console.log(articleText);
// });

axios.get("https://www.democracynow.org/categories/weekly_column").then(function (response) {

    // Load the HTML into cheerio and save it to a variable
    // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
    var $ = cheerio.load(response.data);

    // An empty array to save the data that we'll scrape
    var results = [];

    // With cheerio, find each h3 tag
    $("h3").each(function (i, element) {

        // Save the text of the element in a "title" variable
        var title = $(element).text();

        // In the currently selected element, look at its child elements (i.e., its a-tags),
        // then save the values for any "href" attributes that the child elements may have. Concatenate with leading url
        var link = "https://www.democracynow.org" + $(element).children().attr("href");

        // Save these results in an object that we'll push into the results array we defined earlier
        results.push({
          title: title,
          link: link
        });
    });

    console.log(results);
});