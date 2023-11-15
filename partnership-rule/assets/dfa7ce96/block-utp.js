/**
 *  
 */
var not_block_utp, passiveSupported;

(function($) {
    function handleButtonOnClick() {
        /* console.log("not_block_utp=" + not_utp); */
        if (not_block_utp !== '1') {
            not_block_utp = 1;
            document.cookie = "not_block_utp=1; path=/; max-age=7776000";
            const els = document.getElementsByTagName('body');
            if (undefined !== els && not_block_utp != '') {
                els[0].classList.add('not_block_utp');
            }
        }
    }
    var button = document.querySelector('#block-utp button.close');
    (button) ? button.addEventListener("click", handleButtonOnClick, (undefined !== passiveSupported) ? { passive: true } : false): null;

})(document);