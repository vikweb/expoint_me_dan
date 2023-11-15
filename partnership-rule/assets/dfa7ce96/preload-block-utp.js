 var not_utp = ''; {
     let m = document.cookie.match(new RegExp("(?:^|; )" + 'not_block_utp' + "=([^;]*)"));
     not_utp = (m != undefined) ? decodeURIComponent(m[1]) : '';
     const els = document.getElementsByTagName('body');
     /* console.log("not_block_utp=" + not_utp); */
     if (undefined !== els && not_utp == '1') {
         els[0].classList.add('not-utp');
         document.cookie = "not_block_utp=1; path=/; max-age=7776000";
     }
 }