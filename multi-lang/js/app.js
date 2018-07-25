(function () {
    'use strict';
    angular.module('multi-lang-app', ['pascalprecht.translate', 'tmh.dynamicLocale','ngCookies','ngSanitize'])
        .constant('LOCALES', {
            'locales': {
                'ru_RU': 'Русский',
                'en_US': 'English',
                'hi_in': 'Hindi',
                'mr_in': 'Marathi'
            },
            'preferredLocale': 'en_US'
        })
        .config(function ($translateProvider, LOCALES) {

            $translateProvider.useStaticFilesLoader({
                prefix: 'resources/locale-',
                suffix: '.json'
            });

            $translateProvider.preferredLanguage(LOCALES.preferredLocale);
            $translateProvider.useSanitizeValueStrategy('escape');
            $translateProvider.useLocalStorage();
        })
        // Angular Dynamic Locale
        .config(function (tmhDynamicLocaleProvider) {
            tmhDynamicLocaleProvider.localeLocationPattern('node_modules/angular-i18n/angular-locale_{{locale}}.js');
        })
        .controller('languageController', function ($scope, $rootScope, $translate, localeService) {

            $scope.currentLocaleDisplayName = localeService.getLocaleDisplayName();

            $scope.localesDisplayNames = localeService.getLocalesDisplayNames();

            $scope.changeLanguage = function (locale) {
                localeService.setLocaleByDisplayName(locale);
            };

            $scope.locale = $translate.use();

            $rootScope.$on('$translateChangeSuccess', function (event, data) {
                $scope.locale = data.language;
            });

        })
        .service('localeService', function ($translate, LOCALES, $rootScope, tmhDynamicLocale) {

            var localesObj = LOCALES.locales;
            // locales and locales display names
            var _LOCALES = Object.keys(localesObj);
            var _LOCALES_DISPLAY_NAMES = [];
            _LOCALES.forEach(function (locale) {
                _LOCALES_DISPLAY_NAMES.push(localesObj[locale]);
            });

            var currentLocale = $translate.proposedLanguage(); // because of async loading

            var checkLocaleIsValid = function (locale) {
                return _LOCALES.indexOf(locale) !== -1;
            };

            var setLocale = function (locale) {
                if (!checkLocaleIsValid(locale)) {
                    console.error('Locale name ' + locale + ' is invalid');
                    return;
                }
                //startLoadingAnimation();
                currentLocale = locale;
                $translate.use(locale);
            };

            $rootScope.$on('$translateChangeSuccess', function (event, data) {
                document.documentElement.setAttribute('lang', data.language); // sets "lang" attribute to html

                tmhDynamicLocale.set(data.language.toLowerCase().replace(/_/g, '-')); // load Angular locale
            });

            return {
                getLocaleDisplayName: function () {
                    return localesObj[currentLocale];
                },
                setLocaleByDisplayName: function (localeDisplayName) {
                    setLocale(
                        _LOCALES[
                            _LOCALES_DISPLAY_NAMES.indexOf(localeDisplayName) // get locale index
                        ]
                    );
                },
                getLocalesDisplayNames: function () {
                    return _LOCALES_DISPLAY_NAMES;
                }
            };
        });
})();