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
            name = response.user.name.substring(0,1).toUpperCase()+ response.user.name.substring(1);
            userId = response.user.id;
        }
    });

    //list users
    $.ajax({
        method:"GET",
        url:"/api/message",
        data:{userId:userid},
        success: function(response){
            //console.log("list user", response.users);
            $('#listUsers li').remove();
            var list = $('#listUsers');
            //console.log("users", response.users);
            var users = response.users;
            for(user in users){
                usersid.push(users[user].id);
                let a = $('<a></a>').text(users[user].name.substring(0,1).toUpperCase()+ users[user].name.substring(1));
                a.attr({href:"#", id:"loadMsg", to:users[user].name, toId:users[user].id} );
                //find whether the msg isRead or not, to = user , from is
                let f = users[user].id;
                let t = userId;
                let n = users[user].name.substring(0,1).toUpperCase()+ users[user].name.substring(1);
                $.ajax({
                    method:"GET",
                    url:"/message/"+f+"/"+t+"/isRead",
                    success: function(response){
                        //console.log("IS READ", response);
                        if(!response.isRead) a.text("* "+n+" *");
                    }
                })
                var li = $('<li></li>');
                li.append(a);
                list.append(li);
            }
        }
    })
    //search user
    $('#searchUser').keyup(function(e){
        e.preventDefault();
        var username = $('#searchUser').val().toLowerCase();
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

                    var a = $('<a></a>').text(users[user].name.substring(0,1).toUpperCase()+ users[user].name.substring(1));
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
        var to = $(this).attr("to");
        var toId = $(this).attr("toId");

        if(usersid.indexOf(toId)<0){
            console.log("append user")
            var list = $('#listUsers');
            var a = $('<a></a>').text(to.substring(0,1).toUpperCase()+to.substring(1));
            a.attr({href:"#", id:"loadMsg", to:to, toId:toId} );
            var li = $('<li></li>');
            li.append(a);
            list.append(li);
        }
        $('#searchUser').val("");
        $('#msg li').remove();
        $('#showUser li').remove();
        $('#msg h5').remove();
        var title = $('<h5></h5>').text(to );
        $('#msg').append(title);
        receiver = to.substring(0,1).toUpperCase()+to.substring(1);
        receiverId = toId;
        $.ajax({
            method:"GET",
            url:"/message/"+userId+ "/"+toId,
            success: function(response){
                //console.log("load msg", response.messages);
                loadMsg(response.messages);
            }
        })
    })

    //click the user that has chat history
    $('#listUsers' ).on('click', '#loadMsg',function(e){
        e.preventDefault();
        //console.log("this", $(this).attr("to"));

        //console.log("this", $(this).css);
        var name = $(this).text();
        if(name.indexOf("*")>=0)$(this).text(name.substring(1, name.length-1))

        var to = $(this).attr("to");
        var toId = $(this).attr("toId");
        receiver = to.substring(0,1).toUpperCase()+to.substring(1);
        receiverId = toId;
        $.ajax({
            method:"GET",
            url:"/message/"+userId+ "/"+toId,
            success: function(response){
                //console.log("success", response.messages);
                loadMsg(response.messages);
                //message/:fromId/:toId/isRead"
                //console.log("from", receiverId);
                //console.log("to", userId);
                $.ajax({
                    method:"PUT",
                    url:"/message/"+receiverId+"/"+userId+"/isRead",
                    success:function(response){
                        console.log("success update isRead", response);
                    }
                })
            }
        })
    })

    //load msg
    function loadMsg(msgs){
        $('#msg li').remove();
        $('#msg h5').remove();
        var title = $('<h5></h5>').text(receiver );
        $('#msg').append(title);
        console.log("load msg", msgs);
        for(msg in msgs){
            var n = msgs[msg].fromId ==userid? name: receiver;
            var div = $('<div>').addClass('chip');
            var uimg = $('<img>').attr('src', "/img/"+n+".png");
            div.text(n);
            div.append(uimg);
            var img = $('<img>').attr('src',msgs[msg].content);
            var li = $('<li>');
            li.append(div);
            li.append(img);
            $('#msg').append(li);

            var message = document.getElementById("msg-box");
            console.log("h", message.scrollHeight);
            message.scrollTop = message.scrollHeight+3000;

        }
    }
    //
    function isRead(r){
        $.ajax({
                    method:"PUT",
                    url:"/message/"+r+"/"+userId+"/isRead",
                    success:function(response){
                        console.log("isRead FUNCTION", response);
                    }
                })
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
         console.log("receive msg",data);
        if(data.receiver == name){
            if(receiver == ""){
                receiver =data.name;
                var title = $('<h5></h5>').text(data.name );
                $('#msg').append(title);
            }
            //console.log("sender", data.name);
            //console.log("cur receiver", receiver);
            if(data.name != receiver){
                console.log("another msg");
                $.ajax({
                    method:"GET",
                    url:"/api/user/"+data.name.toLowerCase(),
                    success: function(response){
                        //console.log("users", usersid)

                        console.log("NOTIFY", response)
                        if(usersid.includes(response.user[0].id)){
                            console.log("noti");
                            $( "a[toId="+response.user[0].id+"]" ).text("* "+response.user[0].name.substring(0,1).toUpperCase()+response.user[0].name.substring(1)+" *");
                            var $toastContent = $('<img>').attr('src',"/img/"+response.user[0].name+".png");
                            $toastContent.addClass("notification");
                            Materialize.toast($toastContent, 5000);

                        }else{
                            console.log("nope");
                            usersid.push(response.user[0].id);
                            var list = $('#listUsers');
                            var a = $('<a></a>').text("* "+response.user[0].name.substring(0,1).toUpperCase()+response.user[0].name.substring(1)+" *");
                            a.attr({href:"#", id:"loadMsg", to:response.user[0].name, toId:response.user[0].id} );
                            var li = $('<li></li>');
                            li.append(a);
                            list.append(li);
                            var $toastContent = $('<img>').attr('src',"/img/"+response.user[0].name+".png");
                            $toastContent.addClass("notification");
                            Materialize.toast($toastContent, 5000);
                        }
                    }
                })
            }else{
                appendMessage(receiver, data.img)
                isRead(receiverId);

            }
            // $.ajax({
            //         method:"PUT",
            //         url:"/message/"+receiverId+"/"+userId+"/isRead",
            //         success:function(response){
            //             console.log("success update isRead when live to true", response);
            //         }
            //     })
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
                    //console.log("post receiver", receiverId);
                    $.ajax({
                    method:"POST",
                    url:"/message",
                    data:{
                        fromId:userId,
                        toId: receiverId,
                        img: img,
                        isRead: false
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
                //console.log("len", len);
                var random = Math.floor(Math.random() * len);
                //console.log("num", random);
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

        // <div class="chip">
        //     <img src="images/yuna.jpg" alt="Contact Person">
        //     Jane Doe
        //   </div>

        var div = $('<div>').addClass('chip');
        var uimg =$('<img>').attr('src', "/img/"+name+".png");
        div.text(name);
        div.append(uimg);
        var span = $('<span>').text(name);
        var img = $('<img>').attr('src',img);
        var li = $('<li>');
        li.append(div);
        li.append(img);
        $('#msg').append(li);
        var message = document.getElementById("msg-box");
        message.scrollTop = message.scrollHeight;
        // isRead(receiverId);

    }

});