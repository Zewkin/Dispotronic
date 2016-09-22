angular.module('Insta').provider('auth', function () {
    var options = {};

    this.config = function (opt) {
        angular.extend(options, opt);
    };

    this.$get = function (localStorageService) {
        var sign = function (message, secret) {
            return CryptoJS.HmacSHA256(message, secret).toString();
        };
        return {
            getHttpAuthConfig: function (data) {
                var token = localStorageService.get('token');
                var token_id = localStorageService.get('token_id');

                return {
                    'headers': {'token': token, 'token_id': token_id, 'signature': sign(data)}
                };
            }
        }
    };
});