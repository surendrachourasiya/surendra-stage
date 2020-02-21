function otpLogin() {
    var inputname = document.getElementById("name").value;
    var inputnumber = document.getElementById("phone").value;

    var name_length = inputname.length;
    var mb_length = inputnumber.length;


    if (name_length > 30) {
        $('.signup_name').val(inputname.slice(0, 30));
    }

    if (mb_length > 10) {
        $('.signup_phone').val(inputnumber.slice(0, 10));
    }
    if (name_length > 0 && mb_length == 10) {
        $(".getOtpBtn").removeClass("disabled");
    } else {
        $(".getOtpBtn").addClass("disabled");
    }
}

function validateOtp(e,index) {
        // console.log(index);
        // var curpos= document.getElementById("otp"+index).value;
        // console.log(document.getElementById("otp"+index).value);
        
        var otp1 = document.getElementById("otp1").value;
        var otp2 = document.getElementById("otp2").value;
        var otp3 = document.getElementById("otp3").value;
        var otp4 = document.getElementById("otp4").value;
       
    
    if (otp1 !='' && otp2 != '' && otp3 != '' && otp4 != '') {
        $(".verifyBtn").removeClass("disabled");
    } else {
        $(".verifyBtn").addClass("disabled");
    }
}


function popOver(){
    // $('#popover11').popover({
    //     container: 'body'
    //  });
     $('#popover11').popover('show')
    //  $('[data-toggle="popover"]').popover();
}