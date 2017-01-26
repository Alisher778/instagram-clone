$(document).ready(function(){
    
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

   
        $('img.like').click(function(event){
            event.preventDefault();
            alert('clicked');

        var userLike2 = $('img.like').attr('data-upload');
        
        console.log(userLike2);
        });
        

    


});