/**
 * Tooltip-legend hide/show
 */
(function($) {
    /* Не отрабатываем если другие шаблоны */
    if (!window.isOtherExotherPagesScript) return false;
    (undefined !== localStorage.legend) && $('#legend-arrow-check').prop('checked', !!+localStorage.legend ? null : true);
    $('#legend-arrow_check').on('change', function() {
        var date = new Date(new Date().getTime() + 6 * 30 * 24 * 60 * 60 * 1000);
        setCookie('tooltip-legend', localStorage.legend = $('#legend-arrow_check:checked').length, date.toUTCString(), "/");
    });
})(jQuery);