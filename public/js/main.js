$( document ).ready(function() {
    //create new user
    $('#create').on('click', function (e){
        e.preventDefault();
        var name = $('#name').val().toLowerCase();
        var narr = name.split(" ");
        narr = narr.map(function(n){
            return n[0].toUpperCase() + n.slice(1);
        }) ;
        name = narr.join(" ");
        var user = {
            username: $('#userid').val().toLowerCase(),
            password: $('#pwd').val(),
            name: name,
            email: $('#email').val().toLowerCase()
        };
        $.ajax({
            method: "POST",
            url:"/user/create",
            data:{
                user:user
            },
            success: function(response){
                if(response.success){
                    location.reload();
                }
            },
            error: function(reject){
            }
        })
    });

    //user logout
    $('#logOut').on('click', function(e){
        e.preventDefault();
        $.ajax({
            method:"POST",
            url:"/user/logout",
            success: function(response){
                if(response.success){
                    window.location.href = '/';
                }
            },
            error: function(reject){

            }
        })
    });

    //user sign in
    $('#signIn').on('click', function(e){
        console.log("signin");
        e.preventDefault();
        $.ajax({
            method:"GET",
            url:"/user/signin",
            success: function(response){
                if(response.success){
                    location.reload();
                }
            },
            error: function(){

            }
        })
    })
    $('#signInn').on('click', function(e){
        console.log("signin");
        e.preventDefault();
        $.ajax({
            method:"GET",
            url:"/user/signin",
            success: function(response){
                if(response.success){
                    location.reload();
                }
            },
            error: function(){

            }
        })
    })

    //user signup
    $('#signUp').on('click', function(e){
        e.preventDefault();
        $.ajax({
            method:"GET",
            url:"/user/signup",
            success: function(response){
                if(response.success){
                    location.reload();
                }
            },
            error: function(){

            }
        })
    })
    $('#signUpn').on('click', function(e){
        e.preventDefault();
        $.ajax({
            method:"GET",
            url:"/user/signup",
            success: function(response){
                if(response.success){
                    location.reload();
                }
            },
            error: function(){

            }
        })
    })

    //user login
    $('#logIn').on('click', function(e){
        e.preventDefault();
        $.ajax({
            method:"POST",
            url:"user/login",
            data:{
                username: $('#userid').val(),
                password: $('#pwd').val()
            },
            success: function(response){
                if(response.success){
                    location.reload();
                }else{
                    $('#error').text(response.message);
                }
            },
            error: function(){

            }
        })
    })




});