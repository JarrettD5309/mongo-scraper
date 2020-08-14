$.ajax({
    type: "GET",
    url: "/api",
}).then(function (res) {
    console.log(res);

    if (res.length===0) {
        $("#news-items").empty();
        $("#news-items").append($("<h3>").text("No articles. Please push Scrape button."));
    } else {
        $("#news-items").empty();
        for (var i = 0; i < res.length; i++) {
            var newCol = $("<div>").addClass("col-lg-6 my-2");
            var newCard = $("<div>").addClass("card h-100");
            var newCardBody = $("<div>").addClass("card-body");
            var newTitle = $("<h5>").addClass("card-title").text(res[i].title);
            newCardBody.append(newTitle);
            newCard.append(newCardBody);
            var newFooter = $("<div>").addClass("card-footer");
            var newCommentBtn = $("<a>").addClass("btn btn-primary comment-btn").attr("data-title", res[i].title).attr("data-id", res[i]._id).attr("role", "button").text("Comments");
            newFooter.append(newCommentBtn);
            var newLink = $("<a>").addClass("btn btn-secondary ml-1").attr("href", res[i].link).attr("target", "_blank").text("Link to Article");
            newFooter.append(newLink);
            newCard.append(newFooter);
            newCol.append(newCard);
            $("#news-items").append(newCol);
        }

    }

    
});

$("#scrape-btn").on("click", function () {
    $.ajax({
        type: "GET",
        url: "/scrape"
    }).then(function (response) {
        console.log(response);
        window.location.href = "/";
    })
});

$(document).on("click", ".comment-btn", function (event) {
    $("#comment-title").empty();
    $("#comment-title").append($(this).attr("data-title"));
    var articleID = $(this).attr("data-id");
    $("#comment-footer").empty();
    var newAddCommentBtn = $("<button>").attr("type", "button").addClass("btn btn-primary add-comment-btn").attr("data-article-id", articleID).text("Add Comment");
    $("#comment-footer").append(newAddCommentBtn);
    var newCloseBtn = $("<button>").attr("type", "button").addClass("btn btn-secondary").attr("data-dismiss", "modal").text("Close");
    $("#comment-footer").append(newCloseBtn);

    $.ajax({
        method: "GET",
        url: "/api/" + articleID
    }).then(function (response) {
        console.log(response);
        if (response.length === 0) {
            $("#comment-list").empty();
            $("#no-comments").empty();
            $("#comment-directions").empty();
            $("#no-comments").append($("<p>").text("No comments yet"));
            $("#commentModal").modal();
        } else {
            $("#no-comments").empty();
            $("#comment-directions").empty();
            $("#comment-list").empty();
            for (var i = 0; i < response.length; i++) {
                var newDisplayComment = $("<li>").text(response[i].comment);
                $("#comment-list").append(newDisplayComment);
            }
            $("#commentModal").modal();
        }

    });

});

$(document).on("click", ".add-comment-btn", function () {
    var thisID = $(this).attr("data-article-id");
    var newComment = $("#add-comment").val();

    if (newComment === "") {
        $("#comment-directions").empty();
        $("#comment-directions").append($("<p>").text("Please enter some text to comment"));
    } else {

        $.ajax({
            method: "POST",
            url: "/api/" + thisID,
            data: {
                comment: $("#add-comment").val()
            }
        })
            .then(function (data) {
                $("#no-comments").empty();
                $("#comment-directions").empty();
                $("#add-comment").val("");
                $("#comment-list").append($("<li>").text(data.comment));
                console.log(data);
            });

    }


});
