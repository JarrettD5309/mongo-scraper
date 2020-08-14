$.ajax({
    type: "GET",
    url: "/api",
}).then(function (res) {
    console.log(res);

    if (res.length === 0) {
        $("#news-items").empty();
        var newHeadCol = $("<div>").addClass("col-12");
        var newHeader = $("<h3>").text("No articles. Please push Scrape button.")
        newHeadCol.append(newHeader);
        $("#news-items").append(newHeadCol);
    } else {
        $("#news-items").empty();
        for (var i = 0; i < res.length; i++) {
            var newCol = $("<div>").addClass("col-lg-6 my-2");
            var newCard = $("<div>").addClass("card h-100");
            var newCardBody = $("<div>").addClass("card-body");
            var newTitle = $("<h5>").addClass("card-title").text(res[i].title);
            newCardBody.append(newTitle);
            var longDate = res[i].articledate;
            var shortDate = longDate.substring(0, longDate.indexOf("T"));
            var newDate = $("<h6>").addClass("card-subtitle mb-2 text-muted").text("Date: " + shortDate);
            newCardBody.append(newDate);
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
                var newDisplayComment = $("<li>").attr("id", response[i]._id).addClass("mb-2").text(response[i].comment);
                var newDeleteCommentBtn = $("<button>").attr("type", "button").addClass("btn btn-danger comment-delete ml-2 py-0 px-2").attr("data-comment-id", response[i]._id).text("X");
                newDisplayComment.append(newDeleteCommentBtn);
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
                var newComment = $("<li>").attr("id", data._id).addClass("mb-2").text(data.comment);
                var newDeleteCommentBtn = $("<button>").attr("type", "button").addClass("btn btn-danger comment-delete ml-2 py-0 px-2").attr("data-comment-id", data._id).text("X");
                newComment.append(newDeleteCommentBtn);
                $("#comment-list").append(newComment);
                console.log(data);
            });

    }


});

$(document).on("click", ".comment-delete", function () {
    var commentID = $(this).attr("data-comment-id");
    $.ajax({
        method: "DELETE",
        url: "/api/comment/" + commentID
    }).then(data => {
        console.log(data);
        $("li").remove("#" + data._id);

        if ($(".comment-delete").parents("#comment-list").length === 0) {
            $("#comment-directions").empty();
            $("#no-comments").empty();
            $("#no-comments").append($("<p>").text("No comments yet"));
        }
    })
});
