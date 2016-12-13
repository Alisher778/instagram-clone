$(document).ready(function(){
    $(function(){
        var $comments = $('.comments ul');  
        $.ajax({
            type: "GET",
            url: "/comments",
            success: function(comments){
                $.each(comments, function(i, comments){
                    $('#'+comments.uploadId).append('<li>'+comments.comment+'</li>')
                });
            }
        });

    })
    

});