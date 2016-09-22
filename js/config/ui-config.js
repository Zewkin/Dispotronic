angular.module('Insta.uiconfig', [])
    .constant('ADDITIONAL_CSS_FILE', 'css/themes/optiqo_white.css')/*relative path*/
    .constant('CUSTOM_FAVICON', 'css/favicon.ico')
    .constant('APP_TITLE', 'INSTA')
    .constant('IMAGES_URL_ROOT', "http://instastage.ksf")
    .constant('DEFAULT_LANGUAGE', "en")
    .constant('API_CONFIG', {
        api_prefix: 'http://instatest.ksf.kiev.ua/api/3',
        api_key: '4KxedxpvBUrBUN*x',
        authority_id: '100401'
    })
;
