/// <reference path="./yubinbango-core/yubinbango-core.ts"/>
module YubinBango {
  export class OldFunction {
    prev = '';
    onSuccess;
    getAddr(yubin7, fn) {
      return new YubinBango.Core().getAddr(yubin7, fn);
    }
    zip2addr(postalcode01, postalcode02, region, locality?, street?, extended?, afocus?) {
      let elms = {};
      elms['postalcode01'] = (postalcode01)?  this.getElementByName(postalcode01) : undefined;
      elms['postalcode02'] = (postalcode02)? this.getElementByName(postalcode02, elms['postalcode01']): undefined;
      elms['region'] = (region)? this.getElementByName(region, elms['postalcode01']) : undefined;
      elms['locality'] = (locality)? this.getElementByName(locality, elms['postalcode01']) : undefined;
      elms['street'] = (street)? this.getElementByName(street, elms['postalcode01']) : undefined;
      elms['extended'] = (extended)? this.getElementByName(extended, elms['postalcode01']) : undefined;
      elms['ffocus'] = (afocus === undefined)? true : afocus;
      if (elms['postalcode01'] && elms['region'] ) {
        let a = (elms['postalcode01'])? elms['postalcode01'].value : '';
        let b = (elms['postalcode02'])? elms['postalcode02'].value : '';
        let yubin7 = a + b;
        if (yubin7) {
          this.getAddr(yubin7, (address)=>{ this.apply(elms, address); });
        }
      }
    }
    apply(elms, addr){
      let cursor = elms['locality'];
      if (elms['region'].type == 'select-one' || elms['region'].type == 'select-multiple') {
        // 都道府県プルダウンの場合
        let opts = elms['region'].options;
        for (var i = 0; i < opts.length; i++) {
          var vpref = opts[i].value;
          var tpref = opts[i].text;
          opts[i].selected = (vpref == addr.region_id || vpref == addr.region || tpref == addr.region);
        }
      } else {
        if (elms['region'].name == elms['locality'].name) {
          // 都道府県名＋市区町村名＋町域名合体の場合
          addr.locality = addr.region + addr.locality;
        } else {
          // 都道府県名テキスト入力の場合
          elms['region'].value = addr.region;
        }
      }
      switch (this.getFormsType(elms)) {
        case 2:
          elms['locality'].value = addr.locality + addr.street + addr.extended;
          break;
        case 1:
          elms['locality'].value = addr.locality;
          elms['street'].value = addr.street + addr.extended;
          break;
        case 0:
          elms['locality'].value = addr.locality;
          elms['street'].value = addr.street;
          elms['extended'].value = addr.extended;
          break;
        default:
          elms['locality'].value = addr.locality;
          elms['street'].value = addr.street;
          elms['extended'].value = addr.extended;
          break;
      }
      if (typeof this.onSuccess === 'function') this.onSuccess();

      // patch from http://iwa-ya.sakura.ne.jp/blog/2006/10/20/050037
      // update http://www.kawa.net/works/ajax/AjaxZip2/AjaxZip2.html#com-2006-12-15T04:41:22Z
      if (!elms['ffocus']) return;
      if (!cursor) return;
      if (!cursor.value) return;
      let len = cursor.value.length;
      cursor.focus();
      if (cursor.createTextRange) {
        let range = cursor.createTextRange();
        range.move('character', len);
        range.select();
      } else if (cursor.setSelectionRange) {
        cursor.setSelectionRange(len, len);
      }
    }
    getElementByName(elem, sibling?) {
      if (typeof (elem) == 'string') {
        let list = document.getElementsByName(elem);
        if (!list) return null;
        if (list.length > 1 && sibling && sibling.form) {
          let form = sibling.form.elements;
          for (let i = 0; i < form.length; i++) {
            if (form[i].name == elem) {
              return form[i];
            }
          }
        } else {
          return list[0];
        }
      }
      return elem;
    }
    ckFormsType(elm, val:string){
      if(!elm[val]){return 1}else{return 0}
    }
    getFormsType(elm){
      return ['extended','street','locality'].map((val:string)=>{return this.ckFormsType(elm,val)}).reduce((a,b)=>{return a+b});
    }
  }
}
let AjaxZip3 = new YubinBango.OldFunction();
