console.log("YUP");

$.ajax({
    type: "GET",
    url: "/api",
}).then(function(res) {
    console.log(res);

    for (var i=0;i<res.length;i++) {
        var newCol = $("<div>").addClass("col-lg-6 my-2");
        var newCard = $("<div>").addClass("card h-100");
        var newCardBody = $("<div>").addClass("card-body");
        var newTitle = $("<h5>").addClass("card-title").text(res[i].title);
        newCardBody.append(newTitle);
        newCard.append(newCardBody);
        var newFooter = $("<div>").addClass("card-footer");
        var newCommentBtn = $("<a>").addClass("btn btn-primary comment-btn").attr("data-title",res[i].title).attr("role","button").text("Comments");
        newFooter.append(newCommentBtn);
        var newLink = $("<a>").addClass("card-text").attr("href", res[i].link).text("Link to Article");
        newFooter.append(newLink);
        newCard.append(newFooter);
        newCol.append(newCard);
        $("#news-items").append(newCol);
    }
});

$(document).on("click",".comment-btn", function(event) {
    $("#comment-title").empty();
    $("#comment-title").append($(this).attr("data-title"));
    var thisThing = $(this).attr("data-title");
    console.log("this: " + thisThing);
    $("#commentModal").modal()
});