/// <reference path="../define.ts"/>
/// <reference path="_template.ts"/>
/// <reference path="observer.ts"/>

/* VIEW */

module MODULE.VIEW {

  export class Main extends Template implements ViewInterface {
    
    //
    // $context
    // 
    // OK document
    // OK document & elements
    // OK element
    // NG elements

    constructor(private model_: ModelInterface, private controller_: ControllerInterface) {
      super(State.initiate);
    }

    private observer: ObserverInterface = new Observer(this.model_, this, this.controller_)
    
    private root_: boolean
    private parent_: ViewInterface
    private children_: ViewInterface[] = []

    context: HTMLElement
    substance: boolean
    setting: SettingInterface
    state(): State { return this.state_; }
    status: StatusInterface = {
      index: 0,
      count: 0,
      first: true,
      scroll: [],
      direction: 1,
      distance: 0,
      turn: false,
      end: false,
      param: undefined
    }

    private initiate_($context: JQuery, setting: SettingInterface, parent?: ViewInterface): boolean {

      // context build
      var root: Document = null,
          nodes: HTMLElement[] = [];
      $context = $context.map((i: number, element: HTMLElement): HTMLElement => {
        switch (true) {
          case document === <any>element:
          case window === <any>element:
            return !root ? root = <any>document : null;
          case this.model_.isDOM(element) && jQuery.contains(document.documentElement, element):
            return nodes.push(element), element;
        }
      });

      var context: HTMLElement = root ? <any>root : nodes[0];

      // context verify
      switch (false) {
        case !!root || 1 === nodes.length:
        case context === <any>document || jQuery.contains(document.documentElement, context):
          return;
      }

      // own instance
      this.root_ = !!root;
      this.parent_ = parent || null;
      this.context = <HTMLElement>context;
      this.substance = 1 === $context.length;
      this.setting = setting;
      this.status.param = setting.param;
      this.status.scroll = [0, 0];

      if (!setting.standby && this.substance && !jQuery(context).find(setting.trigger).length) {
        this.close();
        return;
      }

      this.observer.observe();
      this.model_.addView(this);

      SEAL(this);

      // child instance
      this.root_ &&
      jQuery.each(nodes, (i, element) => {
        var view = new View(this.model_, this.controller_);
        this.children_.push(view);
        view.open(jQuery(element), setting.clone(), this);
      });

      return true;
    }

    private terminate_(): boolean {
      this.state_ = State.terminate;

      jQuery.each(this.children_, (i: number, child: ViewInterface) => child.close());

      this.observer.release();

      var parent = this.parent_;
      this.parent_ = null;

      this.model_.removeView(this.setting.uid);

      parent && parent.correct();

      return true;
    }

    correct(): boolean {
      if (State.close === this.state()) { return false; }

      var error = false;
      var setting = this.setting;

      // children
      // - state
      this.children_ = jQuery.grep(this.children_, (child: ViewInterface, i: number) => {
        child.correct();
        switch (child.state()) {
          case State.crash:
          case State.close:
            child.close();
            error = error || 1 === this.children_.length;
            return false;
          default:
            return true;
        }
      });

      // self
      // - state
      switch (this.state()) {
        case State.crash:
          error = true;
          break;
      }
      // - observe
      error = error || State.open <= this.state() && setting.uid !== jQuery.data(this.context, setting.nss.data);
      error && this.close();


      return !error;
    }

    open($context: JQuery, setting: SettingInterface, parent?: ViewInterface): void {
      $context[DEF.NAME].close(setting.nss.event);
      if (this.initiate_($context, setting, parent)) {
        this.state_ = State.open;
      } else {
        this.close();
      }
    }

    close(): void {
      if (this.terminate_()) {
        this.state_ = State.close;
      } else {
        this.state_ = State.close;
        this.model_.removeView(this.setting.uid);
      }
    }

    process(customEvent: JQueryEventObject, nativeEvent: JQueryEventObject, container: EventTarget, activator: EventTarget, layer: number): void {
      if (!this.correct()) { return; }

      switch (this.state()) {
        case State.open:
          break;
        case State.pause:
          this.observer.reserve(customEvent, nativeEvent, container, activator, layer, false);
        default:
          return;
      }

      this.state_ = State.lock;
      this.model_.process(this, customEvent, nativeEvent, container, activator);
      this.state_ = State.open;
    }

    enable(): void {
      jQuery.each(this.children_, (i: number, child: ViewInterface) => child.enable());
      if (State.open !== this.state() && State.pause !== this.state()) { throw new Error('Enabling only while open or pause state.'); }
      this.state_ = State.open;
    }

    disable(): void {
      jQuery.each(this.children_, (i: number, child: ViewInterface) => child.disable());
      if (State.open !== this.state() && State.pause !== this.state()) { throw new Error('Disabling only while open or pause state.'); }
      this.state_ = State.pause;
    }
    
    dispatch(event: JQueryEventObject, params: any[]): void
    dispatch(eventType: string, params: any[]): void
    dispatch(event: any, params: any[]): void {
      jQuery.each(this.children_, (i: number, child: ViewInterface) => {
        if (event instanceof jQuery.Event && event.target === child.context) { return; }
        jQuery(child.context).trigger(event, params);
      });
    }

  }

}

module MODULE {
  export var View = VIEW.Main
}
