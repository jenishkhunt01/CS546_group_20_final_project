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
    let recommendPrice = $("#recommendPrice");

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
    recommendPrice.click(function () {
      error.hide();
      if(!startLocation.val() || !endLocation.val()){
        error.text("Please enter both start and end locations to get a recommended price.").show();
        return;
      }
      if(!carType.val()){
        error.text("Please select a car type to get a recommended price.").show();
        return;
      }
      if(!seatsAvailable.val() || seatsAvailable.val() < 1 || !Number.isInteger(Number(seatsAvailable.val()))){
        error.text("Please enter the number of seats available to get a recommended price.").show();
        return;
      }
      const gasPrices = new Map([
        ['Boston', 3.034],
        ['New York City', 2.953],
        ['Hoboken', 2.953] 
      ]); 
      const carMileage = new Map([
        ['Sedan', 31],
        ['SUV', 29],
        ['Truck', 20]
      ]);
      const distances = new Map([
        ['Hoboken - New York City', 9],
        ['Hoboken - Boston', 218],
        ['New York City - Boston', 209]
    ]);

    if(!gasPrices.has(startLocation.val()) || !gasPrices.has(endLocation.val())){
      error.text("Please enter valid start and end locations to get a recommended price.").show();
      return;
    };

    if(!carMileage.has(carType.val())){
      error.text("Please enter a valid car type to get a recommended price.").show();
      return;
    }
    let distanceKey = `${startLocation.val()} - ${endLocation.val()}`;
    if (!distances.has(distanceKey)) {
      distanceKey = `${endLocation.val()} - ${startLocation.val()}`;
      if (!distances.has(distanceKey)) {
      error.text("Distance between the specified locations is not available.").show();
      return;
      }
    }

    let distance = distances.get(distanceKey);
    let gasPrice = gasPrices.get(startLocation.val());
    let mileage = carMileage.get(carType.val());
    let averagePrice = distance / mileage * gasPrice;
    let pricePerSeat = averagePrice / seatsAvailable.val() + 1;
    price.val(Math.round(pricePerSeat));
  });
}
)})(jQuery);
