const customerId = document.querySelector('#cusomer_id').value;
document.querySelector('#payNow').addEventListener('click', function (evt) {
    evt.preventDefault();
    const customerId = document.querySelector('#cusomer_id').value;
    fetch("create-customer-portal-session", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
        }),
      }).then(function (result) {
      return result.json();
    }).then(function (json) {
        if(json.statusCode == 400 ){
        let errorMessage = "invalid customer id"
        document.querySelector('#error-message').innerHTML = errorMessage;
      }else {
          window.location.replace(json);
      }
  });;
  });
