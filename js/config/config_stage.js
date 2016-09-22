angular.module('Insta.config', [])
    .constant('IMAGES_URL_ROOT', "http://instatest.ksf.kiev.ua")
    .constant('API_CONFIG', {
        api_prefix: 'http://instatest.ksf.kiev.ua/api/1',
        api_key: '4KxedxpvBUrBUN*x',
        authority_id: '100401'
    })
    .constant('API_ERRORS', {
        TOKEN_INVALID: 3,
        TOKEN_EXPIRED: 4,
        INVALID_AUTHORITY: 8

    })
    .constant('AQL_GRADES', [2.5, 4, 6.5, 10])
    .constant('INSPECTION_STATUSES', {
        200201: '_preparing',
        200202: '_sampled',
        200203: '_prepared',
        200204: '_in_progress',
        200205: '_completed',
        200206: '_deleted'
    })
    .constant('DEFAULT_PROFILES_DATA', {
        'A': [5, 5, 5, 5, 5, 5, 5, 5],
        'B': [4, 4, 4, 4, 4, 4, 4, 4],
        'C': [3, 4, 3, 4, 3, 4, 3, 4],
        'D': [3, 3, 3, 3, 3, 3, 3, 3],
        'E': [4, 4, 4, 4, 4, 4, 4, 4],
        'F': [4, 4, 4, 4, 4, 4, 4, 4]
    })
    .constant('QUALITY_PROFILES_IDS', {
        100801: 'A',
        100802: 'B',
        100803: 'C',
        100804: 'D',
        100805: 'E',
        100806: 'F'
    })
    .constant('INSTA_SIZE_IDS', {
        100701: '0-15',
        100702: '15-35',
        100703: '35-60',
        100704: '60-100',
        100705: '100+'
    })
    .constant('INSTA_SIZES_MAP', [
        [15, 100701],
        [35, 100702],
        [60, 100703],
        [100, 100704],
        [Infinity, 100705]
    ])
    .constant('USER_STATUSES', {
        active: 100101,
        inactive: 100102
    })
    .constant('SAMPLING_PLAN_IDS', {
        single: 200101,
        double: 200102
    })
    .constant('INSPECTION_TYPE_IDS', {
        insta: 100901,
        hygiene: 100902
    })
    .constant('INSPECTION_METHOD_IDS', {
        total: 200401,
        sampling: 200402
    })
    .constant('PASSWORD_MIN_LENGTH', 3);