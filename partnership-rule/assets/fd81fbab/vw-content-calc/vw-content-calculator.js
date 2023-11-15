  /**
   * Расчитываем коммисси для строчки таблицы
   * сделано на основе calcCommission()
   * 
   * @param give    Значение для хочу отдать
   * @param get     Значение для хочу получить
   * @param tableItem  Данные из строчки таблицы
   * @param isGive     Включен ли радио на Give
   * @return {[number, number]}
   */
  function calcCommissionTableOne(give, get, tableItem, isGive) {


      tableItem.fromfee = tableItem.fromfee.replace('%', ' %').replace('  ', ' ');
      tableItem.tofee = tableItem.tofee.replace('%', ' %').replace('  ', ' ');

      var fromfee = tableItem.fromfee.split(' ');
      var tofee = tableItem.tofee.split(' ');
      var sysFee = ((tableItem.commission) ? 1 + tableItem.commission / 100 : 1);
      // базовые значения
      var koef = +tableItem.koef;
      var giveVal = +give;
      var getVal = +get;


      /* console.log('calcComParams', give,get,koef,"|",tableItem.give, tableItem.get, tableItem.fromfee,tableItem.tofee,tableItem.commission,"|", fromfee,tofee,sysFee);*/

      var fromCom = 0;
      var toCom = 0;
      var sysCom = 0;
      /** Минимальную комиссию не учитываем. Она указывается с кодом национальной валюты. Преобразование попугаев не возможно **/

      // считаем текущие комиссии в денежном эквиваленте которые будут вычитаться
      if (fromfee[0]) {
          fromCom = (fromfee[1] && '%' === fromfee[1]) ? +fromfee[0] * giveVal / 100 : +fromfee[0];
          giveVal = +giveVal + fromCom;
      }
      if (sysFee !== 1) {
          sysCom = (giveVal * sysFee) - giveVal;
          //добавляем коэфициент системы и вычисляем новый курс
          giveVal = giveVal + sysCom;
      }
      if (tofee[0]) {
          toCom = (tofee[1] && '%' === tofee[1]) ? +tofee[0] * getVal / 100 : +tofee[0];
          getVal = getVal - toCom;
          getVal = getVal < 0 ? 0 : getVal;
      }
      if (!(fromCom || toCom || sysCom)) {
          //    return [giveVal, getVal];
      }
      /* уменьшаем результат на сумму комиссии */
      var newKoef = getVal / giveVal;

      /*console.log('comissions', {'fromfee':fromfee, 'tofee':tofee, 'sysFee':sysFee},{'fromCom':fromCom, 'toCom':toCom, 'sysCom':sysCom}, {'giveVal':giveVal ,'getVal':getVal,'newKoef':newKoef});*/

      if (+give == 1 && tableItem.give == 1) {
          giveVal = 1;
          getVal = 1 * newKoef;
      } else if (+get == 1 && tableItem.get == 1) {
          getVal = 1;
          giveVal = (newKoef != 0) ? 1 / newKoef : 0;
      } else {

          if (isGive) {
              giveVal = +give;
              getVal = give * newKoef;
          } else {
              getVal = +get;
              giveVal = (newKoef != 0) ? getVal / newKoef : 0;
          }
      }

      /* console.log('результат', give,get,koef,"|",giveVal,getVal, newKoef ); */

      return [giveVal < 0 ? 0 : giveVal, getVal < 0 ? 0 : getVal];
  }
  /**
   * Конвертор формата числа для таблицы
   * переделано с prepareNumber()
   * @global precision
   * @param num
   * @param roundUpNum
   * @return {string|number}
   */
  function prepareNumberTableOne(num, roundUpNum) {
      var fixed = parseFloat(num);
      roundUpNum = roundUpNum || 0;

      // noinspection EqualityComparisonWithCoercionJS
      var isFixed = (Math.round(fixed) === fixed);
      fixed = isFixed ? +parseInt(fixed) : +fixed;
      var maf = (fixed == 1) ? 0 : (1000 >= fixed ? roundUpNum : (100000 >= fixed ? 2 : 0));
      var mif = (maf > 2 && fixed > (1 / (10 * maf / 2))) ? +maf : maf;

      /*  console.log('prepare', num, roundUpNum, "|", isFixed, fixed, mif, maf, "|", fixed.toLocaleString('ru-RU', {
        maximumFractionDigits: maf,
        minimumFractionDigits: mif
    }).replace(',', '.'));
*/

      // noinspection EqualityComparisonWithCoercionJS
      return fixed.toLocaleString('ru-RU', {
          maximumFractionDigits: maf,
          minimumFractionDigits: mif
      }).replace(',', '.');
  }
  /**
   * Динамическое заполнение таблиц курсов для работы с а/б тестами
   * переделано с setValues
   * @global precision
   * @global firstRoundUpNum
   * @global changeRoundUpNum
   * @global tableData
   * @param give
   * @param get
   * @param isGive
   */
  function setValuesTableOne(give, get, isGive) {
      var commissions = +$('#calcCommissions').prop('checked');
      var topCommissions = +$('#calcTopCommissions').prop('checked');
      var visibleCount = 0;

      var $singleRows = jQuery('table#exchangesTable tr:not(.titles)');

      var isInputSet = true;
      var giveRoundUpNum = (undefined !== firstRoundUpNum) ? firstRoundUpNum : precision;
      var getRoundUpNum = (undefined !== changeRoundUpNum) ? changeRoundUpNum : precision;

      var hasCalculatorVisible = $('#tab-calc').hasClass('active');

      /** Заполняем таблицу с курсами **/
      $singleRows.each(
          function(idx, r) {
              if ($(r).is('.titles')) { return; }
              if ($('.banner-cell', r).is('.banner-cell')) { return; }
              var isTopRow = idx === 0;
              var row = jQuery(r);

              idx = +$(r).attr('data-open').match(/go=\d+/gi)[0].replace(/go=/g, '');

              var tableItem = tableData[idx];
              var cells = row.children();
              var koef = tableItem.get / tableItem.give;
              var giveVal = 0;
              var getVal = 0;
              var sysFee = commissions ? 1 - tableItem.commission / 100 : 1;
              var minGiveGetVal = 0;


              /** Пишем в placeholder значения по умолчанию **/
              if (isTopRow) {
                  jQuery('input#giveVal').attr('placeholder', 1 === +tableItem.give ? 1 : '');
                  jQuery('input#getVal').attr('placeholder', 1 === +tableItem.get ? 1 : '');
              }

              /** Калькулирем значений для строчки  **/
              if (isGive ? give > 0 : get > 0) {
                  isInputSet = true;
                  if (isGive) {
                      giveVal = +give;
                      getVal = giveVal * koef;
                  } else {
                      getVal = +get;
                      giveVal = getVal / (koef);

                  }
              } else {
                  isInputSet = false;
                  getVal = +tableItem.get;
                  giveVal = +tableItem.give;
              }
              /** Считаем комиссии **/
              if (topCommissions || commissions && hasCalculatorVisible) {
                  var coms = calcCommissionTableOne(giveVal, getVal, tableItem, isGive);
                  giveVal = coms[0];
                  getVal = coms[1];
              }
              /** если не включен калькулятор выводим средневзвешенный курс  */
              if (!hasCalculatorVisible) {
                  giveVal = +tableItem.feeEGive;
                  getVal = +tableItem.feeEGet;
              }
              /* console.log( give,get,koef,"|",tableItem.give, tableItem.get, tableItem.commission, "|",giveVal,getVal ); */
              /** end Считаем комиссии **/

              /** Заполняем таблицу **/
              $('var', cells[1]).html(prepareNumberTableOne(giveVal, giveRoundUpNum));
              $('var', cells[2]).html(prepareNumberTableOne(getVal, getRoundUpNum));

              /** Тушим / прячем строки **/
              row.removeClass('disabled').removeClass('maxamount').removeClass('minamount').removeClass('rezerv');
              if (hasCalculatorVisible && isInputSet && tableItem) {

                  if (tableItem.minamount && +giveVal < +prepareNumberTableOne(tableItem.minamount, giveRoundUpNum)) {
                      row.addClass('disabled').addClass('minamount');
                  }

                  if (tableItem.maxamount && +giveVal > +prepareNumberTableOne(tableItem.maxamount, giveRoundUpNum)) {
                      row.addClass('disabled').addClass('maxamount');
                  }

                  if (+tableItem.rezerv < +getVal) {
                      row.addClass('disabled').addClass('rezerv');
                  }
              }
              /** Счётчик видимых строк **/
              visibleCount++;
          }
      ); //end $singleRows.each

      /** Запускаем сортировку таблицы с курсами **/
      if ($singleRows.length > 1) {
          $(document).trigger('tableSort');
      }
      /** Добавление в таблице  обмена надписи  если сумма слишком большая и нет предложений**/
      if ($singleRows.length > 0) {
          jQuery('#exchangesTableValueToBig').remove();
          if (jQuery('table#exchangesTable tbody tr:not(.disabled)').length < 1) {
              jQuery('table#exchangesTable')
                  .after('<div id="exchangesTableValueToBig" style="text-align: center; padding: 10px;">К сожалению вы не можете сразу обменять такую сумму, но вы можете сделать это дробно, попробуйте уменьшить сумму</div>');
          }
      } else {
          jQuery('#exchangesTableValueToBig').remove();
      }

  }


  /**
   * Обработка мелких действий на страницах с валютными парами
   */
  (function($) {


      // Не отрабатываем если другие шаблоны
      if (undefined == window.isObmenCalculatorScript || !window.isObmenCalculatorScript) return false;

      function calcInit() {
          $('#getBlock .label-field').html(changeFullName);
          $('#giveBlock .label-field').html(firstFullName);
          callRefresh();
      }

      /**
       * Переключение блоков give / get
       */
      function giveGet() {
          var isVisible = $(this).is('#giveRadio:checked'),
              methods = ['hide', 'show'];
          $('#getBlock')[methods[+!isVisible]]();
          $('#giveBlock')[methods[+isVisible]]();
      }


      /**
       * Вызов рефреша таблиц
       */
      function callRefresh() {
          /*   console.log('callRefresh',
                 jQuery('input#giveVal').val(),
                 jQuery('input#getVal').val(),
                 (jQuery('#giveBlock').css('display') !== 'none'),
                 ($('#calcCommissions').prop('checked'))); */

          setValuesTableOne(
              jQuery('input#giveVal').val().replace(',', '.'),
              jQuery('input#getVal').val().replace(',', '.'),
              jQuery('#giveBlock').css('display') !== 'none'
          );
      }


      $(document).on('reinitialize.exSumo', callRefresh);
      $('#giveRadio,#getRadio').on('change', giveGet).on('change', callRefresh);
      $('#giveVal,#getVal').on('blur input change', callRefresh);
      $('#updateTableButton').on('click', callRefresh);
      $('#calcCommissions').on('change', callRefresh);

      calcInit();

  })(jQuery);