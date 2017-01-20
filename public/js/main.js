$(document).ready(function(){
    //Comments Form submit
    $('input#commentsForm').keydown(function(event){
       
        if (event.which == 13) {

            $("form.comment").submit(function(){
                event.preventDefault();
                $(this).submit();
                
                return false;
            });

            
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

                    $('#'+comments.uploadId).append('<li>'+'<a href="/users/'+comments.userId+'">'+comments.userEmail+'</a>'+'<span class="comment-span">'+comments.comment+'</span>'+'</li>')

                    $('#'+comments.uploadId).append('<li>'+'<a href="/users/'+comments.userId+'">'+comments.userEmail+'</a>'+'<span>'+comments.comment+'</span>'+'</li>')
                });
            }
        });

    })

    //Post Comments

    // $(function(){
    //     var uploadId = $('.comments ul').attr('id');
    //     $.ajax({
    //         type: "POST",
    //         url: "/comments/"+uploadId+"/post",
    //         data: $('input#commentsForm').val(),
    //         success: function(comment){
    //             $('.comments.uploadId').append('<li>'+comment+'</li>');
    //         }
    //     })
    // })

});