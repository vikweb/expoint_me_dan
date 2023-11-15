/**
 * Обработка вызова попаб для предложения сделать вовзратный кешбек
 */
var logger;
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
    var trNode = { xname: '', cashback: 0 };
    var onTimeout = false;

    function showPopup() {
        var h = "Обменник " + trNode.xname + " поддерживает кэшбек. <a href='/chto-takoe-keshbjek/#login_popup'>Зарегистрируйтесь</a> или <a href='/chto-takoe-keshbjek/#login_popup'>авторизуйтесь</a>, чтобы получить " + trNode.cashback + " от нашей прибыли. Оставьте отзыв об обменнике и мы удвоим ваш кэшбек.";
        var h2 = "Обменник " + trNode.xname + " поддерживает кэшбек. <a href='/cashback/'>Оставьте заявку</a>, чтобы получить " + trNode.cashback + " от нашей прибыли. Оставьте отзыв об обменнике и мы удвоим ваш кэшбек.";
        var isAuth = getCookie('isAuth');
        var ht = (+isAuth === 1) ? h2 : h;
        (!!logger) && logger.trace('showPopup', isAuth, ht);
        alertMessage({
            titleText: 'Не забудьте получить кэшбек',
            html: ht,
            footer: '<a class="link-cashback" href="/chto-takoe-keshbjek/">Что такое кэшбек?</a>'
        });
        dataLayer.push({ 'event': 'Cashback Popup' });
    };

    function startTimeoutPopub() {
        if (trNode.cashback !== 0) {
            stopTimeoutPopub();
            onTimeout = setTimeout(showPopup, 30000);
            (!!logger) && logger.trace('startTimeoutPopub-Start', onTimeout);
        };
    };

    function stopTimeoutPopub() {
        if (onTimeout) {
            (!!logger) && logger.trace('stopTimeoutPopub', onTimeout);
            clearTimeout(onTimeout);
            onTimeout = false;
        }
    }

    /**
     * Обработка события клика при переходе на обменник
     * @param e
     * @return {boolean|*}
     */
    function clickExchangeForPopub(e) {
        if ($(this).is('button')) {
            var trElement=$(this).closest("tr");
            trNode.xname = trElement.find('.name-table').text();
            trNode.cashback=trElement.attr('data-cashback');     
        } else {
            trNode.xname = $(this).find('.name-table').text();
            trNode.cashback=$(this).attr('data-cashback');     
        }
        if (trNode.cashback.length) {
            startTimeoutPopub();
        }
        return false;
    };

    var TEMPLATE =
        '<div class="modal fade"  tabindex="-1" id="go-alert-cashback-modal">' +
        '<div class="modal-dialog modal-dialog-centered">' +
        ' <div class="modal-content">' +
        '  <div class="modal-header">' +
        '   <h5 class="modal-title">{{titleText}}</h5>' +
        '   <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>' +
        '  </div>' +
        '  <div class="modal-body">' +
        '   <article>{{html}}</article>' +
        '   </label>' +
        '  </div>' +
        '  <div class="modal-footer">' +
        '  {{footer}}' +
        '  </div>' +
        ' </div>' +
        '</div>' +
        '</div>';
    /**
     * Выводим алерт перехода на обменник в модальном окне
     * @param e
     * @param link
     */
    function alertMessage(data) {
        var $blockAlert = $('#go-alert-cashback-modal');
        if (!$blockAlert.length) {
            $('body').append(TEMPLATE.format(data));
            myModal = new bootstrap.Modal(document.getElementById('go-alert-cashback-modal'), {
                keyboard: false
            });
        }
        $('.modal-title', $blockAlert).html(data.titleText);
        $('.modal-body article', $blockAlert).html(data.html);
        $('.modal-footer', $blockAlert).html(data.footer);
        myModal.show();
    }
    if ($('table [data-open]').is('tr')) {
        $(document).on('click', '[data-open]', clickExchangeForPopub);
        $(document).on('mousemove keydown scroll', stopTimeoutPopub);
    }

})(jQuery);