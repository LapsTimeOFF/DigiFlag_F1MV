import i18next from 'i18next';
import jqueryI18next from 'jquery-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
const DETECTION_OPTIONS = {
    order: ['localStorage', 'navigator'],
    caches: ['localStorage'],
};

async function initI18n() {
    await i18next
        .use(LanguageDetector)
        .use(Backend)
        // detect user language
        // learn more: https://github.com/i18next/i18next-browser-languageDetector
        // init i18next
        // for all options read: https://www.i18next.com/overview/configuration-options
        .init({
            debug: false,
            fallbackLng: 'en',
            load: 'languageOnly',
            detection: DETECTION_OPTIONS,
            backend: {
                loadPath: './localization/locales/{{lng}}/{{ns}}.json',
            },
            interpolation: {
                escapeValue: false,
            },
        });
}
jqueryI18next.init(i18next, $, {useOptionsAttr: true});
function translatePage() {
    $(document).localize();
    setTimeout(() => {
        $('.loader').hide();
        $('#menuContent').removeAttr('style');
    }, 1000);
}

function bindLocaleSwitcher() {
    const $switcher = $('[data-i18n-switcher]');

    $switcher.val(i18next.language);

    $switcher.on('change', async function () {
        const chosenLng = $(this).find('option:selected').attr('value');
        await i18next.changeLanguage(chosenLng);
        translatePage();
    });
}

(async function () {
    await initI18n();
    translatePage();
    bindLocaleSwitcher();
})();
