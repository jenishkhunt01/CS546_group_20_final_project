(function ($) {
  $(document).ready(function () {
    let form = $("#rideSearchForm");
    let carType = $("#carType");
    let seatsAvailable = $("#seats");
    let startLocation = $("#startLocation");
    let endLocation = $("#endLocation");
    let error = $("#error");
    let date = $("#date");
    let time = $("#time");
    let price = $("#price");

    form.submit(function (event) {
      event.preventDefault();
      error.hide();

      // Validation checks
      if (
        !carType.val() ||
        !seatsAvailable.val() ||
        !startLocation.val() ||
        !endLocation.val() ||
        !date.val() ||
        !time.val() ||
        !price.val()
      ) {
        error.text("All fields are required.");
        error.show();
        return;
      }

      let requestData = {
        carType: carType.val(),
        seatsAvailable: seatsAvailable.val(),
        startLocation: startLocation.val(),
        endLocation: endLocation.val(),
        date: date.val(),
        time: time.val(),
        price: price.val(),
      };

      $.ajax({
        type: "POST",
        url: "/ridePost",
        data: requestData,
        success: function (response) {
          $("#success").text(response.message).show();
          alert(response.message);
        },
        error: function (xhr, status, errorThrown) {
          error
            .text(
              "An error occurred while publishing the ride: " +
                xhr.responseJSON.message
            )
            .show();
          alert(xhr.responseJSON.message);
        },
      });
    });
  });
})(jQuery);
