$(document).ready(function(){
    //Comments Form submit
    $('input#commentsForm').keypress(function(event){
        if(event.which == 13){
            $('form.comment').submit();
        }
    });

    // Get All comments accordingly by Uploads id
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