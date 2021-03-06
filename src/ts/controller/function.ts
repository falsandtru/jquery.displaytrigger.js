/// <reference path="../define.ts"/>
/// <reference path="../view/main.ts"/>

/* CONTROLLER */

module MODULE.CONTROLLER {

  export class Functions implements VISIBILITYTRIGGER.Method<Functions> {

    constructor() {
      FREEZE(this);
    }

    enable(bubbling?: boolean): JQueryVTStatic
    enable(key: string, bubbling?: boolean): JQueryVTStatic
    enable(key?: any, bubbling?: boolean): JQueryVTStatic {
      Model.singleton().lookup(<any>this, key, bubbling, (view: ViewInterface) => {
        view.enable();
      });
      return <any>this;
    }
    
    disable(bubbling?: boolean): JQueryVTStatic
    disable(key: string, bubbling?: boolean): JQueryVTStatic
    disable(key?: any, bubbling?: boolean): JQueryVTStatic {
      Model.singleton().lookup(<any>this, key, bubbling, (view: ViewInterface) => {
        view.disable();
      });
      return <any>this;
    }
    
    vtrigger(bubbling?: boolean): JQueryVTStatic
    vtrigger(key: string, bubbling?: boolean): JQueryVTStatic
    vtrigger(key?: any, bubbling?: boolean): JQueryVTStatic {
      Model.singleton().lookup(<any>this, key, bubbling, (view: ViewInterface) => {
        jQuery(view.context).trigger(view.setting.nss.event);
      });
      return <any>this;
    }
    
    open(setting: VTSetting): JQueryVTStatic {
      this instanceof jQuery ? (<any>this).end()[DEF.NAME](setting) : jQuery[DEF.NAME](setting);
      return <any>this;
    }
    
    close(bubbling?: boolean): JQueryVTStatic
    close(key: string, bubbling?: boolean): JQueryVTStatic
    close(key?: any, bubbling?: boolean): JQueryVTStatic {
      Model.singleton().lookup(<any>this, key, bubbling, (view: ViewInterface) => {
        view.close();
      });
      return <any>this;
    }

  }

}
