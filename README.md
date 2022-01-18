# DCC Node API
Source code of the node.js server app running at https://production.dccapi.org/

## Is this Official/Approved?
The verifica-c19-sdk (node.js) that is being used in this app has been developed by the Italia Digitale team and is pending approval and a public statement which should come in the next few days.

The API itself adds a layer of security and does not perform any additional verification of the certificates themselves so - although we haven't yet received a formal approval - we think it will be soon.

## Why a dedicated server API
The main problems when dealing with digital covid certificates are:

1. **Trust**: processing covid certificates on your own application requires blind trust from the user providing the certificate. Nobody can assure that behind closed doors you are not saving important details about the person's health or the certificate itself unless your application code is open source.
2. **Platform agnostic**: the available official SDKs are only the ones based on Node.js or Java/Android. There's no other official option to support PHP, Ruby, Go, you name it.
3. **Ever changing rules**: the rules around digital covid certificates are always changing and maintaining all the logic required to check the validity of the certificates can be a nightmare in bloated monolithic apps (most of them).

Having an open source, community maintained API service solves both the TRUST and the PLATFORM issues.

## How it solves the TRUST issue
Like Stripe validating and storing the credit card on their server and passing onto you only a token, DCCAPI works similarly but it's even more secure.

It's more secure because:
1. It does NOT store any data at all. In fact the application has NO database.
2. While also making sure the integrated application never receives the raw data in the first place. This is achieved by splitting the process into 1) Encryption and 2) Validation.

## How it works
You gotta work with 2 endpoints in order to validate a Digital Covid Certificate:

1. First you need to `POST /encrypt` your rawString (CORS are enabled). *Please note that at the moment this endpoint does not support images.*

```js
// You can do this in Javascript on the Browser for example
// This way, the person's data NEVER reaches your server
var settings = {
  "url": "https://production.dccapi.org/encrypt",
  "method": "POST",
  "timeout": 0,
  "headers": {
    "Content-Type": "application/json"
  },
  "data": JSON.stringify({
    "rawString": "HC1*******************QRCODE**STRING**GOES**HERE***********"
  }),
};

$.ajax(settings).done(function (response) {
  // Then pass the result to your server
  // This ensures maximum security and allows you to fulfill anything based on the validation result
  // response will look like this:
  // {
  //     "encryptedString": {
  //         "iv": "iv string here**************",
  //         "content": "very long long string"
  //     }
  // }
  sendToServer(response);
});

function sendToServer(encryptedObject) {
  // You could make another Ajax call -
  var settings = {
    "url": "/your_app_endpoint",
    "method": "POST",
    "timeout": 0,
    "headers": {
      "Content-Type": "application/json"
    },
    "data": encryptedObject,
  };
  $.ajax(settings).done(function (response) {
    // Fulfill your duty now and check the response from YOUR APP
  });

  // ------------

  // Or you could add the object to a form on the page and then submit it.
  ivInput.value       = encryptedObject.encryptedString.iv;
  contentInput.value  = encryptedObject.encryptedString.content;
  form.submit();
}
```

2. Then - on your server - you can validate the certificate using the `POST /validations` endpoint (CORS are not enabled on this one).

```ruby
require "uri"
require "json"
require "net/http"

url = URI("https://production.dccapi.org/validations")

http = Net::HTTP.new(url.host, url.port);
request = Net::HTTP::Post.new(url)
request["x-resume-token"] = "0"
request["Content-Type"] = "application/json"
# You can also set which mode to validate the certificate with if you want (NORMAL_DGP [default], SUPER_DGP and BOOSTER_DGP)
request.body = JSON.dump(params[:encryptedString].merge(mode: "SUPER_DGP"))

response = http.request(request)
puts response.read_body
# Now you can check the response that will look something like this
# {
#     "validation": {
#         "person": "MARIO ROSSI",
#         "date_of_birth": "1990-01-01",
#         "result": true,
#         "code": "VALID",
#         "message": "This message might be available only when there's an error in future versions",
#         "mode": "2G"  # 2G for super, 3G for normal, BOOSTER for booster
#     }
# }

```

## Self hosting
If you wanted to deploy your own API validation service you could simply clone this repo and deploy it on Heroku or your favorite hosting provider.

Although we do want to keep this repo growing so it's in everybody's interest to use the dccapi.org instance it's perfectly fine to spin up your own.

If you decide to go that way, we highly recommend you keep your source code public in order to maintain the maximum level of trust.

## Contributing
This repo is in its initial stage and needs some work around writing tests and it would be great to add support for country-specific Business Rules other than the general ones from EUROPE:

Each country can make their own rules - like how many hours a covid test is valid for - around which pass is to be valid and which isn't although there are a lot of things in common.

## Things to work on
Quick list:
- Write automated tests
- Provide a staging environment that accepts test data
- add a proper home page for the service explaining what it does and how to implement
- add support for country specific rules - I think this work has to be done within the verifica-c19-sdk to be on the safe side.
