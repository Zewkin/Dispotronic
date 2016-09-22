angular.module('Insta.translate', []).factory('translate', ['$http','localStorageService',
    function($http, localStorageService) {

    var module = this;
    this.currentLang = '';
    var translations = {};
    var translation = {}

    return {
        translateAll: function(lang, scopeToApply) {
            if (localStorageService.get('language') != lang) {
                localStorageService.set('language', lang);
            }
            var changeTranslation = function(lang) {
                module.currentLang = lang;
                angular.extend(scopeToApply, translation);
            }

            var doTranslate = function (translations_data) {

                translations[lang] = translations_data;

                translation = translations[lang];
                changeTranslation(lang);
            }

            if (!translations[lang]) {
                translations[lang] = {};
                $http.get('/js/config/' + lang + '.json').then(
                    function (response) {
                        doTranslate(response.data);
                    },
                    function (response) {
                        if (response.status == 304) {//304 is not-modified
                            doTranslate(response.data);
                        }
                        //handle connection error
                    })
            } else {
                translation = translations[lang];
                changeTranslation(lang);
            }
        },
        getTranslation: function(phrase) {
            return translation[phrase];
        }
    };
}]);