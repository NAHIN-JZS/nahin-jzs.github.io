// Animations
AOS.init({
  anchorPlacement: 'top-left',
  duration: 1000
});

// Add your javascript here

//  Bind the event handler to the "submit" JavaScript event
$('form').submit(function () {

  // Get the Login Name value and trim it
  var fname = $.trim($('#fname').val());
  var lname = $.trim($('#lname').val());
  var phon =$.trim($('#phon').val());

  // Check if empty of not
  if (fname === '') {
      alert('First name is empty.');
      return false;
  }
  else if (lname === '') {
      alert('Last Name is empty.');
      return false;
  }
  else if (phon === '') {
      alert('Phone is empty.');
      return false;
  }
});