var socket = io();
$( document ).ready(function() {
    //user & receiver detail
    var name, userId;
    var receiver, receiverId;
    var userid = $('.messager').attr("id");
    var url = "/user/"+userid;
    var usersid =[];

    //get user
    $.ajax({
        method:"GET",
        url:url,
        success:function(response){
            name = response.user.name;
            userId = response.user.id;
        }
    });

    //list users
    $.ajax({
        method:"GET",
        url:"/api/message",
        data:{userId:userid},
        success: function(response){
            console.log("list user", response.users);
            $('#listUsers li').remove();
            var list = $('#listUsers');
            //console.log("users", response.users);
            var users = response.users;
            for(user in users){
                usersid.push(users[user].id);
                var a = $('<a></a>').text(users[user].name);
                a.attr({href:"#", id:"loadMsg", to:users[user].name, toId:users[user].id} );
                var li = $('<li></li>');
                li.append(a);
                list.append(li);
            }
        }
    })
    //search user
    $('#searchUser').keyup(function(e){
        e.preventDefault();
        var username = $('#searchUser').val();
        var myList = $('#showUser');
        $('#showUser li').remove();
        $.ajax({
            method:"GET",
            url:"/api/users",
            data:{
                user:$('#name').text(),
                name:username
            },
            success: function(response){
                var users = response.users;
                for(user in users){
                    var a = $('<a></a>').text(users[user].name);
                    a.attr({href:"#", id:"send", to:users[user].name, toId:users[user].id} );
                    var li = $('<li></li>');
                    li.append(a);
                    myList.append(li);
                }
            }

        })
    })

    //click the user to send msg
    $('#showUser' ).on('click', '#send',function(e){
        e.preventDefault();
        //console.log("this", $(this).attr("to"));
        var to = $(this).attr("to");
        var toId = $(this).attr("toId");

        if(!usersid.includes(toId)){
            var list = $('#listUsers');
            var a = $('<a></a>').text(to);
            a.attr({href:"#", id:"loadMsg", to:to, toId:toId} );
            var li = $('<li></li>');
            li.append(a);
            list.append(li);
        }
        $('#searchUser').val("");
        $('#msg li').remove();
        $('#showUser li').remove();
        $('#msg h3').remove();
        var title = $('<h3></h3>').text("MESSAGE <-> " + to );
        $('#msg').append(title);
        receiver = to;
        receiverId = toId;
        $.ajax({
            method:"GET",
            url:"/message/"+userId+ "/"+toId,
            success: function(response){
                //console.log("success", response.messages);
                loadMsg(response.messages);
            }
        })
    })

    //click the user that has chat history
    $('#listUsers' ).on('click', '#loadMsg',function(e){
        e.preventDefault();
        //console.log("this", $(this).attr("to"));
        var to = $(this).attr("to");
        var toId = $(this).attr("toId");
        receiver = to;
        receiverId = toId;
        $.ajax({
            method:"GET",
            url:"/message/"+userId+ "/"+toId,
            success: function(response){
                //console.log("success", response.messages);
                loadMsg(response.messages);
            }
        })
    })

    //load msg
    function loadMsg(msgs){
        $('#msg li').remove();
        $('#msg h3').remove();
        var title = $('<h3></h3>').text("MESSAGE <-> " + receiver );
        $('#msg').append(title);
        for(msg in msgs){
            //console.log("m", msgs[msg].from.name);
            var span = $('<span>').text(msgs[msg].from.name);
            var img = $('<img>').attr('src',msgs[msg].content);
            var li = $('<li>');
            li.append(span);
            li.append(img);
            $('#msg').append(li);
            var message = document.getElementById("msg-box");
            message.scrollTop = message.scrollHeight;
        }

    }

    //send message
    $('#send').on('click', function(e){
        e.preventDefault();
        var msg = $('#input-msg').val();
        var url = "http://api.giphy.com/v1/gifs/translate?s=" +msg+ "&api_key=dc6zaTOxFJmzC";
        $.ajax({
            method:"GET",
            url:url,
            success: function(response){
                 $('#img').attr('src',response.data.images.downsized.url);
            },
            error: function(error){
            }
        })


    })
    //socket io , receive message
    socket.on('chat message', function(data){
        // console.log("data",data);

        if(data.receiver == name){
            if(receiver == ""){
                receiver =data.name;
                var title = $('<h3></h3>').text("MESSAGE <-> " + data.name );
                $('#msg').append(title);
            }
            appendMessage(receiver, data.img);
        }else if(data.name == name){
            appendMessage(name,data.img);
        }
    });

    //send img
    $("#input-msg").keydown(function(event){
      if ( event.which == 13 ){
        var msg = $('#input-msg').val();
        var url = "http://api.giphy.com/v1/gifs/translate?s=" +msg+ "&api_key=dc6zaTOxFJmzC";
        $.ajax({
            method:"GET",
            url:url,
            success: function(response){
                if(response){

                    var img = response.data.images.downsized.url;
                    socket.emit('chat message', name, img, receiver);
                    $('#input-msg').val('');
                    console.log("post receiver", receiverId);
                    $.ajax({
                    method:"POST",
                    url:"/message",
                    data:{
                        fromId:userId,
                        toId: receiverId,
                        img: img,
                        isRead: true
                    },
                    success: function(response){
                        if(response.success){
                            console.log("db save")
                        }
                    }
                })
                }
            }
        })
      }
    });

    //send sticker
    $('#sticker').on('click', function(e){
        e.preventDefault();
        var msg = $('#msg').val();
        // console.log("click", msg);
        var url = "http://api.giphy.com/v1/stickers/search?q=" +msg+ "&api_key=dc6zaTOxFJmzC";
        $.ajax({
            method:"GET",
            url:url,
            success: function(response){
                // console.log("RES-----------------", response.data)
                var len = response.data.length;
                console.log("len", len);
                var random = Math.floor(Math.random() * len);
                console.log("num", random);
                 $('#img').attr('src',response.data[random].images.downsized.url);
            },
            error: function(error){
                // console.log("ERR-----------------", error)
            }
        })


    })

    //append img to checkbox
    function appendMessage(name, img){
        // console.log("IMG", img);
        var span = $('<span>').text(name);
        var img = $('<img>').attr('src',img);
        var li = $('<li>');
        li.append(span);
        li.append(img);
        $('#msg').append(li);
        var message = document.getElementById("msg-box");
        message.scrollTop = message.scrollHeight;

    }

});