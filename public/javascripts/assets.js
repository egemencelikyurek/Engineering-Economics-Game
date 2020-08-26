$('.myForm').submit(function() {
    var r = confirm("Are you sure? You won't be able to change it later");
    if (r == true) {
    }else{
        event.preventDefault();
    }
});