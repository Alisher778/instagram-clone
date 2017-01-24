$(document).ready(function(){
    
    //Comments Form submit
    // $("form.comment").submit(function(event){
    //    // event.preventDefault()
    //    var uploadId = event.target.comment.dataset.id;
    //    var comment = event.target.comment.value;


    //    $.ajax({
    //     type: "POST",
    //     url: `/comments/${uploadId}/post`,
    //     data: comment,
    //     success: function(comments){

    //         console.log( $('#upload-'+comments.uploadId) );
    //         console.log(comments);
    //         console.log(comments.comment)
    //         console.log(comments.id)
    //         $('#upload-'+comments.uploadId).append(
    //             '<li>'+
    //                 '<a href="/users/'+comments.userId+'">'+comments.userEmail+'</a>'+
    //                 '<span class="comment-span">'+comments.comment+'</span>'+
    //             '</li>')

    //         }
    //     })
        
    // });


    // Get All comments accordingly by Uploads id
    $(function(){
        var $comments = $('.comments ul');  
        $.ajax({
            type: "GET",
            url: "/comments",
            success: function(comments){
                $.each(comments, function(i, comments){
        
                    $('#'+comments.uploadId).append('<li>'+'<a href="/users/'+comments.userId+'">'+comments.userEmail+'</a>'+'<span class="comment-span">'+comments.comment+'</span>'+'</li>')

                });
            }
        });

    })



});