/* jshint esversion: 6 */
/**
 * BarcodeReader
 * @requires Quagga
 * @requires jQuery
 */
var BarcodeReader = (function (window, document, $, undefined) {

    // 'use strict'; // FIXME something here doesn’t agree with strict mode

    /**
     * @constructor
     */
    function BarcodeReader() {}

    var proto = BarcodeReader.prototype;

    /**
     * Called when a photo is successfully retrieved
     * @param String imageData base64-encoded image data
     */
    proto.onPhotoDataSuccess = function (imageData) {
        var dimmer = document.querySelector('.dimmer');

        // show loading indicator
        dimmer.querySelector('.text').innerHTML = 'Deciphering barcode…';
        dimmer.classList.add('active');

        function callback(result) {
            // clear the 10 second timeout
            clearTimeout(timeout);

            function displayProductModal(data) {
                // display barcode value
                $('#barcode-result').html(result.codeResult.code);

                // set product info in modal
                $('#new-product .header').html(data.name);
                $('#new-product .content .image').attr('src', data.product_image);

                // hide loading indicator
                dimmer.classList.remove('active');

                // show product modal
                $('#new-product').modal('show');
            }

            if(result.codeResult) {
                // update status for the user
                dimmer.querySelector('.text').innerHTML = 'Fetching product info…';

                $.getJSON(`${BASEURL}/api/thing/${result.codeResult.code}/`, function (json) {
                    json.data = json.data || {
                        name: 'Unknown Product',
                        product_image: 'img/default-image.png'
                    };
                    // preload the image before showing the modal
                    var img = new Image();
                    img.onload = function () {
                        displayProductModal(json.data);
                    };
                    img.src = json.data.product_image;
                });
            }
            else {
                noBarcode();
            }
        }

        function noBarcode() {
            // hide loading indicator
            dimmer.classList.remove('active');
            // put this in a RAF so the dimmer can hide before the alert shows
            window.requestAnimationFrame(function () {
                alert('No barcode detected. Try again.');
            });
        }

        Quagga.decodeSingle({
            src: `data:image/jpeg;base64,${imageData}`,
            numOfWorkers: 2,
            decoder: {
                readers: [
                    // order matters, upc is most common in the usa
                    'upc_reader', 'upc_e_reader', 'ean_reader', 'ean_8_reader',
                    'code_128_reader', 'code_39_reader', 'code_39_vin_reader',
                    'codabar_reader', 'i2of5_reader',
                ] // List of active readers
            },
            locate: true, // try to locate the barcode in the image
        }, callback);

        // stop trying to decipher the barcode after 10 seconds
        var timeout = setTimeout(function () {
            Quagga.stop();
            noBarcode();
        }, 10000);
    };

    /**
     * Take picture using device camera and retrieve image as base64-encoded string
     */
    proto.capturePhoto = function () {
        navigator.camera.getPicture(this.onPhotoDataSuccess, this.onCaptureFail, {
            quality: 50,
            destinationType: navigator.camera.DestinationType.DATA_URL
        });
    };

    /**
     * Called if image capture fails
     */
    proto.onCaptureFail = function (message) {
        alert('Image capture failed because: ' + message);
    };

    return BarcodeReader;

}(this, this.document, jQuery));