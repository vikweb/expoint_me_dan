var logger;
$(function () {
    $('[data-bs-toggle="popover"]').popover();

});

(function($, doc) {


    new function Sorter() {
        var _this = this;

        /**
         * Селектор обрабатываемых таблиц
         * @memberOf Sorter
         * @type {string}
         */
        this.targetNode = '#exchangesTable,#exchangersTable';

        /**
         * Индекс колонки
         * @memberOf Sorter
         * @type {numbers|null}
         */
        this.index = null;

        /**
         * Направление сортировки
         * @memberOf Sorter
         * @type {numbers|null}
         */
        this.dir = 0;

        /**
         * Добавляет в хедер таблицы стрелочки и обновляет сортировку в таблице.
         * @memberOf Sorter
         */
        this.create = function() {
            if (!$('.sortArrows').length) {
                $('tr.titles th', _this.targetNode).append('<span class="sortArrows"><span class="sortArrow"></span><span class="sortArrow"></span></span>');
            }

            if (_this.index !== null && _this.dir !== null) {
                $('tr.titles th', _this.targetNode).eq(_this.index).find('.sortArrow').addClass('sortArrow_no_active').eq(_this.dir).addClass('sortArrow_active').removeClass('sortArrow_no_active');
            }

            _this.sort();
        };

        /**
         * Обрабатывает клик по стрелках
         * @memberOf Sorter
         * @param e Event
         */
        this.choice = function(e) {
            var active = $('.sortArrow_active').removeClass('sortArrow_active');
            $('.sortArrow').removeClass('sortArrow_no_active');
            var active_index = active.closest('th').index();
            var target = $(e.target);
            _this.index = target.closest('th').index();

            if (active_index === _this.index) {
                _this.dir = +!_this.dir;
            }

            target.find('.sortArrow').addClass('sortArrow_no_active');
            target.find('.sortArrow').eq(_this.dir).addClass('sortArrow_active');

            _this.sort();

        };


        /**
         * Возвращает значение целевой ячейки
         * @memberOf Sorter
         * @param row
         * @param index
         * @return string|float
         */
        this.getCellValue = function(row, index) {
            var $c,
                $row = $(row).children('td'),
                $cell = $row.eq(index);
            // Выборка для пустого значения
            if (0 === $cell.length) return 0;
            // Выборка для цифр с разделителем "запятая"
            var value = $cell.text().replace(/\s/g, '').replace(',', '.');
            // Выборка для первой заглавной колонки
            if (!index && ($c = $cell.find('.name-table'))) value = '_' + ($cell = $c).text();
            // Выборка для значения в data-value
            if ($cell.data('value')) value = '' + $cell.data('value');
            // Выборка для метки data-compare="string"
            if ('string' === $cell.data('compare')) return '_' + value;
            // Выборка для отзывов
            if (-1 !== value.indexOf('/') && $row.length - 2 <= index)
                value = value.split('/')[this.dir] * 1000000 + +value.split('/')[+!this.dir];
            // Приведение к числу
            if (!isNaN(parseFloat(value))) value = parseFloat(value);
            return value;
        };

        /**
         * Сортирует таблицу
         * @memberOf Sorter
         */
        this.sort = function() {
            if (null === _this.index || null === _this.dir) return;
            var table = $('tbody', _this.targetNode);
            var rows = table.find('tr:not(.titles)');
            rows = rows.toArray().sort(function(a, b) {
                var valA = _this.getCellValue(a, _this.index),
                    valB = _this.getCellValue(b, _this.index);
                if ($.isNumeric(valA) && $.isNumeric(valB) && 0 === valA - valB) {
                    valA = valA / (+_this.getCellValue(a, _this.index + 1) || 1);
                    valB = valB / (+_this.getCellValue(b, _this.index + 1) || 1);
                }

                return $.isNumeric(valA) && $.isNumeric(valB) || !valA.localeCompare ? valA - valB : valA.localeCompare(valB);
            });
            _this.dir && (rows = rows.reverse());
            rows.forEach(function(row) {
                return table.append(row);
            });
            _this.addBanner();
        };
        /** Переносим баннер на правильное место после сортировки
         * @memberOf Sorter
         */
        this.addBanner = function() {
            if (null === _this.index || null === _this.dir) return;
            var table = $('tbody', _this.targetNode);
            var bannerRow = table.find('tr.banner-row')[0];
            $('tr.banner-row').remove();
            if ($(table).find('tr').length > 10) {
                $(bannerRow).insertAfter($(table).find('tr:nth-child(6)'));
            }
        };


        /** Определяем начальную сортировку и сортировку при смене направления расчёта
         * @memberOf Sorter
         */
        this.defaults = function(e) {
            if ('getRadio' === e.target.id && (_this.index === 2 || _this.index === null)) {
                _this.dir = 0;
                $('tr.titles th', _this.targetNode).eq(1).click();
            }

            if ('giveRadio' === e.target.id && (_this.index === 1 || _this.index === null)) {
                _this.dir = 1;
                $('tr.titles th', _this.targetNode).eq(2).click();
            }
        };

        /** Подписываем на события **/
        $(doc).ajaxStop(this.create);
        $(document).on('tableSort', this.create);
        $(document).on('load', this.create);
        $(this.create);
        $(document).on('click', _this.targetNode.split(',').map(function(a) { return a + ' thead tr.titles th' }).join(','), this.choice);
        $('#giveRadio,#getRadio').on('click', this.defaults);
    }();
})(jQuery, document);



/**
 * Dynamic content update for /obmen/
 */
jQuery(function() {

    /* Не отрабатываем если другие шаблоны */
    if (!window.isTableExchangePagesScript) return false;
    var ajaxUrl = '/contenttable/ajax-start' + window.location.pathname;
    var ajax_loader = [];
    var ajax_blocks = [
        '#obmen-list-block',
        '[data-action][data-timeout][data-href]'
    ].join(',');

    /**
     * this does initialization of methods in the container to update the contents in the container
     * @param container 
     */
    function initAjax(container) {
        container = $(container).get(0);
        container.ajaxLoader = container.ajaxLoader || ajaxLoader;
        if (undefined === container.autoReload) {
            container.autoReload = autoReload;
            container.timeout_id = false;
        }
        return container;
    }

    /**
     * this will do a table overload every 10 seconds
     * @param start true|false
     */
    function autoReload(start) {
        var container = this;
        var url = $(container).attr('data-href');
        var waitTime = $(container).attr('data-timeout');

        if (!!start) {
            if (container.timeout_id) {
                clearTimeout(container.timeout_id);
                container.timeout_id = false;
            }

            container.ajaxLoader();
        }

        if (container.timeout_id || undefined === waitTime) {
            return;
        }

        container.timeout_id = setTimeout(function() {
            container.autoReload(true);
        }, waitTime);
    }

    /**
     * ajax request for updating subpages in a specific div
     */
    function ajaxLoader() {
        var container = this;

        if (undefined !== $(container).attr('data-load') && (true == $(container).attr('data-load'))) {
            return;
        }
        if (undefined === $(container).attr('data-href')) {
            return;
        }
        var url = $(container).attr('data-href');
        var ex_obmen_action = $(container).attr('data-action');
        var ex_obmen_status = $(container).find('[data-status]').attr('data-status');
        ajax_loader[url] = container;
        $(container).addClass('update');
        $(container).attr({ 'data-load': true });

        var data = {
            'pagename': url,
            'action': 'ex_obmen_action',
            'obmen_action': ex_obmen_action,
            'obmen_status': ex_obmen_status,
            't': ((new Date()).getTime() / 10000 << 1) * 5000 // 10 seconds !! do not concatenate constants !!
        };

        $.ajax({
            type: 'POST',
            url: ajaxUrl,
            data: data,
            beforeSend: function() {
                $(document).trigger('exchangetable.ajaxLoader.beforeSend');
                if ($('.titles', container).find('.icon-preloader').is('.icon-preloader')) {
                    $('.titles', container).find('.icon-preloader').show();
                } else if (!$('#tab-table').is('.data-empty')) {
                    $(container).html('Загрузка...');
                }
            },
            success: function(data) {
                if (data && data.indexOf('No change')) {
                    $(container).html(data);
                    $(document).trigger('reinitialize.exSumo');
                    $(document).trigger('restartstickyTableHeaders.exSumo');
                    $(document).trigger('addBanner.Obmen');
                    $(container).trigger('restartTooltipster.Obmen');
                }
                if ($('.titles', container).find('.icon-preloader').is('.icon-preloader')) {
                    $('.titles', container).find('.icon-preloader').hide();
                }
                $(document).trigger('exchangetable.ajaxLoader.success');
            },
            error: function(data) {
                console.error('error ajax load url');
            }
        }).done(function(data) {
            $(container).attr({ 'data-load': false });
            $(container).removeClass('update');
            container.ajaxDone();
            $(document).trigger('exchangetable.exSumo');
        });
        return false;
    }

    /**
     * this will do the processing of the start of the transition inside the page of the currency pair
     * @param {jquery} $container_id
     * @param {boolean} start
     */
    function startLoadExchange($container_id, start) {
        $container_id.find('.titles .icon-preloader').hide();
        $container_id.each(function(i, el) {
            if (!$(this).is('[data-href]')) { return; }
            initAjax(this);
            this.ajaxDone = function() {};
            this.autoReload(start);
        });
    }
    /* this will start when the page loads */
    startLoadExchange($(ajax_blocks), false);
});

/**
 * Мodule go-to
 */
(function($) {

    /**
     * Переход на страницу обменника со страницы рейтинга
     * @param e
     * @return {boolean|*}
     */
    function goTo(e) {

        if(e.target.classList.contains('data-badge')) return;

        var $this = $(this);
        var link = $this.data('open');
        var message = $this.data('alert');
        var xv = 20, params = { order_price: '20', currency: "RUB" };
        if ($this.find('[data-xv]').is('[data-xv]')) {
            xv = $this.find('[data-xv]').eq(0).data('xv');
            params = { order_price: xv, currency: "RUB" };
        }
        var target = 'exchange_transition';
        if (message) {
            return $this.trigger('go_alert.exSumo', link);
        }
        switch (location.pathname) {
            case '/':
                target = 'main_transition';
                break;
            case '/exchanger/':
                target = 'exlist_transition'
                break;
            default:
        } 
        try {
            (!!logger)&&logger.console(['ym()',target, params]);
            ym(50526853, 'reachGoal', target, params);
        } catch {
            console.log('no send ym()');
        }
        $this.trigger('go_to.exSumo', link);
        e.stopPropagation();
        e.preventDefault();
        return false;
    }

    function goToNewWindow(e, link) {
        if (link && link.indexOf('go=')!== -1) {
			var d = Math.floor(Date.now() / 42);
			if (link.indexOf('&dp=') === -1) { 
				link += '&d='+d;
			} else { 
				link = link.replace(/([?&])d=.*?(&|$)/, '$d='+d+'$2');
			}
			$(e.target).attr('data-click', d); 
			$(e.target).trigger('open_link.go_to.exSumo',link);
		} 
		(!!logger) && logger.console(link);  
        link && link.length > 3 && window.open(link);
    }

    /* Подключаем события к модулю go-to */
    $(document).on('go_to.exSumo', goToNewWindow);
    $(document).on('click', '[data-open]', goTo);


    /* Обрывает переход по обменнику, если был клик по иконкам под названием обменника для таблицы "index_table" и "obmen-table" */
    const clickAreaIconBreakGoTo = document.querySelectorAll('.list-group-custom .wrap-badge');
    clickAreaIconBreakGoTo.forEach(element => {
        element.addEventListener('click', function (e){
            e.stopPropagation();
            e.preventDefault();
            return false;
        });
    });




})(jQuery);