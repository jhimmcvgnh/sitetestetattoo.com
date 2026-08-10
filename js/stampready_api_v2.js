var $ =jQuery.noConflict();

$(document).ready(function(){

	/*
	 		StampReady Subscriber API jQuery file
			written by Kevin Groenendaal.
	*/

	//on keypress email input field
	$('[name="sr_email"]').keypress(function(e) {

	    //remove the class target..
	    $('[name="sr_email"]').removeClass('target');

	    //..and add class target to 'this'
	    $(this).addClass('target');

	});

	$(document).on('focus', '[name="sr_email"]', function(){

		//remove the class target..
	    $('[name="sr_email"]').removeClass('target');

	    //..and add class target to 'this'
	    $(this).addClass('target');

	});

	//on keypress name input field
	$('[name="sr_name"]').keypress(function(e) {

	    //remove the class target..
	    $('[name="sr_name"]').removeClass('target');

	    //..and add class target to 'this'
	    $(this).addClass('target');

	});

	//on form submit by enter
	$('[name="sr_email"]:not(.disabled), [name="sr_name"]:not(.disabled)').keypress(function(e) {

	    //if enter
	    if(e.which == 13) {

	    	//run submit function
	        submit();
	    }

	});

	//prevent default on form and return false
	$('.sr_form').submit(function(e){
		 e.preventDefault();
		 return false;
	});

});

//submit function
function submit() {

	//if referrer cookie has not been set
	if (document.cookie.indexOf('referrer') < 0) {

		SetCookie('referrer',document.referrer,7);

	}

	//detect data if multiple forms
	form = $('.target').closest('body');

	//get public API key
    api = $(form).find('[api]').attr('api');

    //get the name of the list
    list = $(form).find('[list]').attr('list');

    //get the email of the subscriber
    email = $(form).find('[name="sr_email"].target').val();

    //get the name of the subscriber
    name = $(form).find('[name="sr_name"].target').val();

    //retrieve opt to verify wether or not
    opt = $(form).find('[opt]').attr('opt');

    //retrieve the email design when someone registers, triggers only when someone verifies
    register_email = $(form).find('[register-email]').attr('register-email');

    //register email subject
    register_email_subject = $(form).find('[register-email]').attr('register-email-subject');

    //retrieve the email design when someone registers, triggers only when someone verifies
    verify_email = $(form).find('[verify-email]').attr('verify-email');

    //verify email subject
    verify_email_subject = $('[verify-email]').attr('verify-email-subject');

    //retrieve the email design when someone registers, triggers only when someone verifies
    verify_page = $(form).find('[verify-page]').attr('verify-page');

    //sender address
    sender_address = $(form).find('[sender-address]').attr('sender-address');

    //sender name
    sender_name = $(form).find('[sender-name]').attr('sender-name');

    //retrieve the email design when someone registers, triggers only when someone verifies
    unsubscribe_page = $(form).find('[unsubscribe-page]').attr('unsubscribe-page');

    //ajax
    $.ajax({
        type: 'POST',
        url: 'https://www.stampready.net/api2/api.php',
        data: {
            api: api,
            list: list,
            email: email,
            name: name,
            opt: opt,
            register_email: register_email,
            register_email_subject: register_email_subject,
            verify_email: verify_email,
            verify_email_subject: verify_email_subject,
            verify_page: verify_page,
            sender_address: sender_address,
            sender_name: sender_name,
            unsubscribe_page: unsubscribe_page
        },
        success: function (e) {

            if (e == '1') {
                exists();
            }
            if (e == '2') {
                success();
            }
            if (e == '3') {
                error();
            }
            if (e == '4') {
                confirm();
            }

        }
    })

}

function SetCookie(cookieName,cookieValue,nDays) {
	var today = new Date();
	var expire = new Date();
	if (nDays==null || nDays==0) nDays=1;
	expire.setTime(today.getTime() + 3600000*24*nDays);
	document.cookie = cookieName+"="+escape(cookieValue)+";path=/"
	             + ";expires="+expire.toGMTString();
}
