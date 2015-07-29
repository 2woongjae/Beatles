/**
 * Created by leewoongjae on 15. 7. 28..
 */
$(function() {

    $(document).keydown(function (e) {

        console.log(e.keyCode);

        if (e.keyCode === 192) {

            Application.reload();

        } else if (e.keyCode === 37) {

            Application.left();

        } else if (e.keyCode === 39) {

            Application.right();

        } else if (e.keyCode === 32) {

            Application.toggle();

        }

    });

    Application.run();

    $(".button").animate({boxShadow: '0 0 10px #699, 0 0 10px #969, 0 0 10px #996, 0 0 30px #669'});

});