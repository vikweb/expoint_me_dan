/**
 * Script for Module Tooltip / Widget TooltipWidget
 * Copyright (c) 2022 Vikweb.Net
 * email: viktor@vikweb.net
 **/

/**
 * Tooltip-info hide/show
 */
(function($) {

    /**
     * 
     * @param {type} container
     * @returns {undefined|Boolean}
     */
    function ajaxLoadTooltipInfo(container) {
        if (undefined !== $(container).attr('data-load') && (true === $(container).attr('data-load'))) {
            return false;
        }
        if (undefined === $(container).attr('data-xobmen')) {
            return false;
        }
        var xobmen = $(container).attr('data-xobmen');
        var emetalx = $(container).attr('data-emetalx');
        var emetaly = $(container).attr('data-emetaly');
        var preloader = '<span class="icon-preloader"></span>';

        $(container).attr({ 'data-load': true });
        $('.btn-info', container).html(preloader);
        var data = {
            'xobmen': xobmen,
            'emetalx': emetalx,
            'emetaly': emetaly,
            'pagename': $(location).attr('href'),
            'action': 'ex_info_xobmen_action',
            't': ((new Date()).getTime() / 10000 << 1) * 5000
                /* 10 seconds !! do not concatenate constants !!  */
        };

        $.ajax({
            type: 'POST',
            url: '/tooltip/ajax-start/',
            data: data,
            beforeSend: function() {
                $(container).addClass('update');
            },
            success: function(data) {
                if (data && data.indexOf('No change') && data.indexOf('0')) {
                    $('.btn-info', container).after(data);
                    $(container).trigger('restartTooltipster.Obmen');
                    $(container).trigger('ajaxLoadTooltipInfo.success');
                    /* кеширование */
                    addXobmenCache(xobmen, data);

                }
            },
            error: function(data) {
                $(container).removeClass('update');
                console.error('error ajax load url');
            }
        }).done(function(data) {
            $(container).attr({ 'data-load': false });
            $(container).removeClass('update');
            $('.btn-info', container).html('');
        });
        return false;
    }
    /**
     * 
     * @param {int} xobmen
     * @param {string} data
     */
    function addXobmenCache(xobmen, data) {

        if (hasXobmenCache(xobmen)) {
            return;
        }
        var html_base = $('#exchange_info_cache .base-tooltip-info#xobmen-0')[0].outerHTML;
        if (undefined === html_base) {
            return;
        }
        var block = $(html_base).attr('id', 'xobmen-' + xobmen);
        $('.tooltip', block).replaceWith(data);

        $('#exchange_info_cache .base-tooltip-info#xobmen-0').after(
            block
        );
    }
    /**
     * 
     * @param {int} xobmen
     * @returns {Boolean}
     */
    function hasXobmenCache(xobmen) {
        if ($('#exchange_info_cache .base-tooltip-info#xobmen-' + xobmen).is('.base-tooltip-info')) {
            return true;
        }
        return false;
    }
    /**
     * 
     * @param {int} xobmen
     * @returns {string}
     */
    function getXobmenCache(xobmen) {
        return $('#exchange_info_cache .base-tooltip-info#xobmen-' + xobmen).html();
    }
    /**
     * 
     */
    function callTooltipInfo() {
        if ($('#exchangesTable').is('#exchangesTable')) {
            var $tooltip = $('#exchangesTable .wrap-tooltip');
            /*hover*/

            $tooltip.mouseenter(function() {
                /* Если обьект уже есть то показываем и выходим */
                if ($('.tooltip', this).is('.tooltip')) {
                    $('.tooltip', this).show();
                    return;
                }
                var xobmen = $(this).attr('data-xobmen');
                if (hasXobmenCache(xobmen)) {
                    $('.btn-info', this).after(getXobmenCache(xobmen));
                    $(this).trigger('restartTooltipster.Obmen');
                    $(this).trigger('hasXobmenCache.Obmen');
                } else {
                    ajaxLoadTooltipInfo(this);
                }
            });
            /* no hover*/
            $tooltip.mouseleave(function() {
                if ($('.tooltip', this).is('.tooltip') && !$('.tooltip', this).is(':hidden')) {
                    $('.tooltip', this).hide();
                }
            });
        }
        if ($('#exchangersTable').is('#exchangersTable')) {
            var $tooltip = $('#exchangersTable .wrap-tooltip');
            /*hover*/
            $tooltip.mouseenter(function() {
                /*Если обьект уже есть то показываем и выходим */
                if ($('.tooltip', this).is('.tooltip')) {
                    $('.tooltip', this).show();
                    return;
                }
                var xobmen = $(this).attr('data-xobmen');
                if (hasXobmenCache(xobmen)) {
                    $('.btn-info', this).after(getXobmenCache(xobmen));
                    $(this).trigger('restartTooltipster.Obmen');
                } else {
                    ajaxLoadTooltipInfo(this);
                }
            });
            /* no hover */
            $tooltip.mouseleave(function() {
                if ($('.tooltip', this).is('.tooltip') && !$('.tooltip', this).is(':hidden')) {
                    $('.tooltip', this).hide();
                }
            });
        }
    }
    $(document).on('reinitialize.TooltipInfo', callTooltipInfo);
    $(document).trigger('reinitialize.TooltipInfo');
    /* add to ajax upload table obmen */
    $(document).on('exchangetable.exSumo', callTooltipInfo);

})(jQuery);

/**
 * Tooltip data-badge  hide/show
 */
(function($) {
    // удаление открытого тултипа в момент обновления страницы
    $(document).on('exchangetable.ajaxLoader.success', function() {
        $('.popover.show').each(function() {
            $(this).removeClass('show').hide();
        });
    });
    //restart tooltip data-badge popover
    function restartDataBageTooltip() {
        $('[data-bs-toggle="popover"]').each(function() {
            bootstrap.Popover.getOrCreateInstance(this);
        });
    }

    $(document).on('ajaxLoadTooltipInfo.success', restartDataBageTooltip);
    $(document).on('hasXobmenCache.Obmen', restartDataBageTooltip);

    //  $(document).on('exchangetable.ajaxLoader.beforeSend', restartDataBageTooltip);
    $(document).on('exchangetable.ajaxLoader.success', restartDataBageTooltip);

})(jQuery);