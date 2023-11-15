/**
 * Модальное окно для перехода по go-to
 */
(function($) {

    if (!String.prototype.format) {
        /**
         * Расширение String на функцию форматирующаю строку данными в {{}}
         * @return {string}
         */
        String.prototype.format = function() {
            var args = arguments;
            if (typeof args[0] === 'object')
                args = args[0];
            return this.replace(/{{([\w\d.]+)}}/g, function(match, index) {
                return typeof args[index] !== 'undefined' ?
                    args[index] : index;
            });
        };
    }
    var myModal;
    /**
     * Константа для имени в локал сторе
     * @type {string}
     */
    var GO_STORE = 'go_alert_disable';
    var COMPONENTS = {
        title: 'Вы переходите на {{name}}',
        article: 'Низкая вероятность получения кэшбэк при обмене на <b>{{name}}</b>. ' +
            'Рекомендуем выбрать другой обменник.'
    };
    var TEMPLATE =
        '<div class="modal fade" data-bs-backdrop="static" tabindex="-1" id="go-alert-row-modal">' +
        '<form id="exchanger-go-alert" class="exSumo-form" data-exchanger="{{name}}">' +
        '<div class="modal-dialog">' +
        ' <div class="modal-content">' +
        '  <div class="modal-header">' +
        '   <h5 class="modal-title">' + COMPONENTS.title + '</h5>' +
        '   <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>' +
        '  </div>' +
        '  <div class="modal-body">' +
        '   <article>' + COMPONENTS.article + '</article>' +
        '   <input type="checkbox" id="exchanger-go-hide-for-exchanger" {{ignore}} hidden >' +
        '   <label class="d-flex flex-row flex-nowrap align-items-center mt-2" for="exchanger-go-hide-for-exchanger">' +
        '     <label class="label-checkbox  " for="exchanger-go-hide-for-exchanger"></label>' +
        '     <span class=" ">Больше не показывать предупреждения для этого обменника</span>' +
        '   </label>' +
        '  </div>' +
        '  <div class="modal-footer">' +
        '   <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" data-open="{{link}}" data-statname="{{statname}}" data-xname="{{name}}">Перейти в обменник</button>' +
        '   <button type="button" class="btn btn-primary" data-bs-dismiss="modal" aria-hidden="true">Выбрать другой</button>' +
        '  </div>' +
        ' </div>' +
        '</div>' +
        '</form>' +
        '</div>';
    /**
     * Выводим алерт перехода на обменник в модальном окне
     * @param e
     * @param link
     */
    function alertMessage(e, link) {
        var $target = $(e.target);
        var $blockAlert = $('#exchanger-go-alert');
        var data = {
            link: link,
            message: $target.data('alert'),
            name: $('.name-table', $target).text().trim()
        };
        data.ignore = isGoAlertEnabled(data.name) ? 'checked' : '';
        if (data.ignore) {
            return $target.trigger('go_to.exSumo', data.link);
        }
        if ($blockAlert.length) {
            $('h2', $blockAlert).html(COMPONENTS.title.format(data));
            $('article', $blockAlert).html(COMPONENTS.article.format(data));
            $blockAlert.data('exchanger', data.name);
            $('[data-open]', $blockAlert).data('open', data.link);
            myModal.show();
        } else {
            $('body').append(TEMPLATE.format(data));
            myModal = new bootstrap.Modal(document.getElementById('go-alert-row-modal'), {
                keyboard: false
            });
            myModal.show();
        }
    }

    /**
     * Event handler for toggle checkbox of ignore alert
     */
    function toggleGoAlertDisable(e) {
        var exchanger = $('#exchanger-go-alert').data('exchanger');
        isGoAlertEnabled(exchanger) ? removeGoAlertDisable(exchanger) : addGoAlertDisable(exchanger);
        e.stopPropagation();
    }

    /**
     * Игнорит ли обменник алерт перехода
     * @param exchanger
     * @return {boolean}
     */
    function isGoAlertEnabled(exchanger) {
        var values = localStorage[GO_STORE] || '';
        return -1 < values.indexOf(exchanger);
    }

    /**
     * Добаляем обменник к игнорирующим алерт
     * @param exchanger
     */
    function addGoAlertDisable(exchanger) {
        var values = localStorage[GO_STORE] || '';
        if (-1 === values.indexOf(exchanger))
            localStorage[GO_STORE] = values + ',' + exchanger;
    }

    /**
     * Удаляем обменник из игнорирующих алерт
     * @param exchanger
     */
    function removeGoAlertDisable(exchanger) {
        var values = localStorage[GO_STORE] || '';
        localStorage[GO_STORE] = values.replace(exchanger, '').replace(',,', ',');
    }

    function removeAlertIntoFirst() {
        var $rows = $('#exchangesTable > tbody > tr');
        var rowsCount = $rows.length;
        var alertsCount = $rows.filter('.alert-row').length;
        if (6 > rowsCount && alertsCount === rowsCount) {
            $rows.filter(':first-child').removeClass('alert-row').data('alert', null);
        }
    }

    /* Подключаем события к модулю */
    $(document).on('go_alert.exSumo', alertMessage);
    $(document).on('change', '#exchanger-go-hide-for-exchanger', toggleGoAlertDisable);
    $(document).on('exchangetable.exSumo', removeAlertIntoFirst);
    $(document).trigger('exchangetable.exSumo');

})(jQuery);