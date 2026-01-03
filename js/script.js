
    // The "getFormData()" function retrieves the names and values of each input field in the form; 

    function getFormData(form) {
      var data = {};
      $(form).find('input, select').each(function() {
        if (this.tagName.toLowerCase() == 'input') {
          if (this.type.toLowerCase() == 'checkbox') {
            data[this.name] = this.checked;
          } else if (this.type.toLowerCase() != 'submit') {
            data[this.name] = this.value;
          }
        } else {
          data[this.name] = this.value;
        }
      });
      return data;
    }

    // The "addFormError()" function, when called, adds the "error" class to the form-group that wraps around the "formRow" attribute;

    function addFormError(formRow, errorMsg) {
      var errorMSG = '<span class="error-msg">' + errorMsg + '</span>';
      $(formRow).parents('.form-group').addClass('has-error');
      $(formRow).parents('.form-group').append(errorMSG);
      $('#dialog').removeClass('dialog-effect-in');
      $('#dialog').addClass('shakeit');
      setTimeout(function() {
        $('#dialog').removeClass('shakeit');
      }, 300);
    }

    // FORM HANDLER:

    // form_name - This attribute ties the form-handler function to the form you want to submit through ajax. Requires an ID (ex: #myfamousid)
    // custom_validation - 

    function form_handler(form_name, custom_validation, success_message, error_message, success_function, error_function) {
      $(form_name).find('input[type="submit"]').on('click', function(e) { // if submit button is clicked

        window.onbeforeunload = null; // cancels the alert message for unsaved changes (if such function exists)

        $(form_name).find('.form-group .error-msg').remove();
        var submitButton = this;
        submitButton.disabled = true; // Disables the submit buttton until the rows pass validation or we get a response from the server.

        var form = $(form_name)[0];
        // The custom validation function must return true or false.
        if (custom_validation != null) {
          if (!custom_validation(form, getFormData(form))) {
            submitButton.disabled = false;
            return false;
          }
        }
        e.preventDefault(); //STOP default action
      });
      $(document).click(function(e) { // Whenever the user clicks inside the form, the error messages will be removed.
        if ($(e.target).closest(form_name).length) {
          $(form_name).find('.form-group').removeClass('has-error');
          setTimeout(function() {
            $(form_name).find('.form-group .error-msg').remove();
          }, 300);
        } else {
          return
        }
      });
    }

    // LOGIN FORM: Validation function
    function validate_login_form(form, data) {
      if (data.user_username == "") {
        // if username variable is empty
        addFormError(form["user_username"], 'The username is invalid');
        return false; // stop the script if validation is triggered
      }

      if (data.user_password == "") {
        // if password variable is empty
        addFormError(form["user_password"], 'The password is invalid');
        return false; // stop the script if validation is triggered
      }

      $('#dialog').removeClass('dialog-effect-in').removeClass('shakeit');
      $('#dialog').addClass('dialog-effect-out');

      $('#successful_login').addClass('active');
      //return true;
    }

    // REGISTRATION FORM: Validation function
    function validate_registration_form(form, data) {
      if (data.user_username == "") {
        // if username variable is empty
        addFormError(form["user_username"], 'The username is invalid');
        return false; // stop the script if validation is triggered
      }


      if (data.user_password == "") {
        // if password variable is empty
        addFormError(form["user_password"], 'The password is invalid');
        return false; // stop the script if validation is triggered
      }

      if (data.user_cnf_password == "" || data.user_password != data.user_cnf_password) {
        // if password variable is empty
        addFormError(form["user_cnf_password"], "The passwords don't match");
        return false; // stop the script if validation is triggered
      }

      if (!data.user_terms) {
        // if password variable is empty
        addFormError(form["user_terms"], "You need to read and accept the Terms and Conditions before proceeding");
        return false; // stop the script if validation is triggered
      }
      
      $('#dialog').removeClass('dialog-effect-in').removeClass('shakeit');
      $('#dialog').addClass('dialog-effect-out');
      
      $('#successful_registration').addClass('active');
      //return true;
    }

   

    

    // $('#successful_login,#successful_registration').on('click', 'a.dialog-reset', function() {
    //   $('#successful_login,#successful_registration').removeClass('active');
    //   dialogBox.removeClass('dialog-effect-out').addClass('dialog-effect-in');
    //   document.getElementById('login_form').reset();
    //   document.getElementById('register_form').reset();
    // });
    // form_handler("#login_form", validate_login_form, null, null, null, null, null, null);
    // form_handler("#register_form", validate_registration_form, null, null, null, null, null, null);
    function flip() {
      $('#dialog').toggleClass('flip');
    }
    $(document).ready(function () {
      // Listen to submit event on the <form> itself!
      $('#register_form').submit(function (e) {
    
        // Prevent form submission which refreshes page
        e.preventDefault();
        $(this).find('.form-group').removeClass('has-error');
        // Serialize data
        var formData = $(this).serializeArray(); //voir si ça beug pas avec serializeArray (ça envoie un tableau de paramètre plutôt que les paramètres en post j'ai l'impression)
        //remettre serialize() et utiliser serializeArray sur une autre variable pour checker en JS
        dataObj = {};
        $(formData).each(function(i, field){
          dataObj[field.name] = field.value;
        });
        $testres = "salut";
        $.post("exist.php", formData);
        console.log("testres : ". $testres);
        console.log(dataObj["user_username"]);
        if (dataObj["user_username"] == "") {
          // if username variable is empty
          addFormError($(this)[0][1], 'The username is invalid');
          console.log($(this)[0][1]);
          console.log("nop");
          return false;
        }
    
        if (dataObj["user_password"] == "") {
          // if password variable is empty
          addFormError($(this)[0][2], 'The password is invalid');
          return false; // stop the script if validation is triggered
        }
  
        if (dataObj["user_cnf_password"] == "" || dataObj["user_password"] != dataObj["user_cnf_password"]) {
          // if password variable is empty
          addFormError($(this)[0][3], "The passwords don't match");
          return false; // stop the script if validation is triggered
        }
  
        if (!dataObj["user_terms"]) {
          // if password variable is empty
          addFormError($(this)[0][4], "You need to read and accept the Terms and Conditions before proceeding");
          return false; // stop the script if validation is triggered
        }
        
  
        //$('#dialog').removeClass('dialog-effect-in').removeClass('shakeit');
        //$('#dialog').addClass('dialog-effect-out');
  
        //$('#successful_login').addClass('active');
        //return true;
        // Make AJAX request
        $.post("addmember.php", formData).done(function(data) {
          console.log(formData);
          console.log("ResponseText:" + data);
        });
      });

      $('#login_form').submit(function (e) {
    
        // Prevent form submission which refreshes page
        e.preventDefault();
        $(this).find('.form-group').removeClass('has-error');
        // Serialize data
        var formData = $(this).serializeArray(); //voir si ça beug pas avec serializeArray (ça envoie un tableau de paramètre plutôt que les paramètres en post j'ai l'impression)
        //remettre serialize() et utiliser serializeArray sur une autre variable pour checker en JS
        dataObj = {};
        $(formData).each(function(i, field){
          dataObj[field.name] = field.value;
        });
        console.log(dataObj["user_username_log"]);
        
        if (dataObj["user_username_log"] == "") {
          // if username variable is empty
          addFormError($(this)[0][1], 'The username is invalid');
          console.log($(this)[0][1]);
          console.log("nop");
          return false;
        }
    
        if (dataObj["user_password_log"] == "") {
          // if password variable is empty
          addFormError($(this)[0][2], 'The password is invalid');
          return false; // stop the script if validation is triggered
        }

        //$('#dialog').removeClass('dialog-effect-in').removeClass('shakeit');
        //$('#dialog').addClass('dialog-effect-out');
  
        //$('#successful_login').addClass('active');
        //return true;
        // Make AJAX request
        $.post("connexion.php", formData).done(function(data) {
          console.log(formData);
          console.log("ResponseText:" + data);
        });
      });
    
    });

    