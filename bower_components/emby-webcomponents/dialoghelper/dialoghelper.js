define(["historyManager","focusManager","browser","layoutManager","inputManager","dom","css!./dialoghelper.css","scrollStyles"],function(historyManager,focusManager,browser,layoutManager,inputManager,dom){function enableAnimation(){return!!browser.animate||!!browser.edge}function removeCenterFocus(dlg){layoutManager.tv&&(dlg.classList.contains("smoothScrollX")?centerFocus(dlg,!0,!1):dlg.classList.contains("smoothScrollY")&&centerFocus(dlg,!1,!1))}function dialogHashHandler(dlg,hash,resolve){function onHashChange(e){var isBack=self.originalUrl==window.location.href;!isBack&&isOpened(dlg)||window.removeEventListener("popstate",onHashChange),isBack&&(self.closedByBack=!0,closeDialog(dlg))}function onBackCommand(e){"back"==e.detail.command&&(self.closedByBack=!0,e.preventDefault(),e.stopPropagation(),closeDialog(dlg))}function onDialogClosed(){if(isHistoryEnabled(dlg)||inputManager.off(dlg,onBackCommand),window.removeEventListener("popstate",onHashChange),removeBackdrop(dlg),dlg.classList.remove("opened"),removeScrollLockOnClose&&document.body.classList.remove("noScroll"),!self.closedByBack&&isHistoryEnabled(dlg)){var state=history.state||{};state.dialogId==hash&&history.back()}if(layoutManager.tv&&activeElement.focus(),"false"!=dlg.getAttribute("data-removeonclose")){removeCenterFocus(dlg);var dialogContainer=dlg.dialogContainer;dialogContainer?(dialogContainer.parentNode.removeChild(dialogContainer),dlg.dialogContainer=null):dlg.parentNode.removeChild(dlg)}setTimeout(function(){resolve({element:dlg,closedByBack:self.closedByBack})},1)}var self=this;self.originalUrl=window.location.href;var activeElement=document.activeElement,removeScrollLockOnClose=!1;dlg.addEventListener("close",onDialogClosed);var center=!dlg.classList.contains("dialog-fixedSize");center&&dlg.classList.add("centeredDialog"),dlg.classList.remove("hide"),addBackdropOverlay(dlg),dlg.classList.add("opened"),dlg.dispatchEvent(new CustomEvent("open",{bubbles:!1,cancelable:!1})),"true"!=dlg.getAttribute("data-lockscroll")||document.body.classList.contains("noScroll")||(document.body.classList.add("noScroll"),removeScrollLockOnClose=!0),animateDialogOpen(dlg),isHistoryEnabled(dlg)?(historyManager.pushState({dialogId:hash},"Dialog",hash),window.addEventListener("popstate",onHashChange)):inputManager.on(dlg,onBackCommand)}function addBackdropOverlay(dlg){var backdrop=document.createElement("div");backdrop.classList.add("dialogBackdrop");var backdropParent=dlg.dialogContainer||dlg;backdropParent.parentNode.insertBefore(backdrop,backdropParent),dlg.backdrop=backdrop,setTimeout(function(){backdrop.classList.add("dialogBackdropOpened")},0),dom.addEventListener(dlg.dialogContainer||backdrop,"click",function(e){e.target==dlg.dialogContainer&&close(dlg)},{passive:!0})}function isHistoryEnabled(dlg){return"true"==dlg.getAttribute("data-history")}function open(dlg){globalOnOpenCallback&&globalOnOpenCallback(dlg);var parent=dlg.parentNode;parent&&parent.removeChild(dlg);var dialogContainer=document.createElement("div");return dialogContainer.classList.add("dialogContainer"),dialogContainer.appendChild(dlg),dlg.dialogContainer=dialogContainer,document.body.appendChild(dialogContainer),new Promise(function(resolve,reject){new dialogHashHandler(dlg,"dlg"+(new Date).getTime(),resolve)})}function isOpened(dlg){return!dlg.classList.contains("hide")}function close(dlg){isOpened(dlg)&&(isHistoryEnabled(dlg)?history.back():closeDialog(dlg))}function scaleUp(elem,onFinish){var keyframes=[{transform:"scale(0)",offset:0},{transform:"none",offset:1}],timing=elem.animationConfig.entry.timing;return elem.animate(keyframes,timing).onfinish=onFinish}function slideUp(elem,onFinish){var keyframes=[{transform:"translate3d(0,30%,0)",opacity:0,offset:0},{transform:"none",opacity:1,offset:1}],timing=elem.animationConfig.entry.timing;return elem.animate(keyframes,timing).onfinish=onFinish}function fadeIn(elem,onFinish){var keyframes=[{opacity:"0",offset:0},{opacity:"1",offset:1}],timing=elem.animationConfig.entry.timing;return elem.animate(keyframes,timing).onfinish=onFinish}function scaleDown(elem){var keyframes=[{transform:"none",opacity:1,offset:0},{transform:"scale(0)",opacity:0,offset:1}],timing=elem.animationConfig.exit.timing;return elem.animate(keyframes,timing)}function fadeOut(elem){var keyframes=[{opacity:"1",offset:0},{opacity:"0",offset:1}],timing=elem.animationConfig.exit.timing;return elem.animate(keyframes,timing)}function slideDown(elem,onFinish){var keyframes=[{transform:"none",opacity:1,offset:0},{transform:"translate3d(0,30%,0)",opacity:0,offset:1}],timing=elem.animationConfig.entry.timing;return elem.animate(keyframes,timing)}function closeDialog(dlg){if(!dlg.classList.contains("hide")){dlg.dispatchEvent(new CustomEvent("closing",{bubbles:!1,cancelable:!1}));var onAnimationFinish=function(){focusManager.popScope(dlg),dlg.classList.add("hide"),dlg.close?dlg.close():dlg.dispatchEvent(new CustomEvent("close",{bubbles:!1,cancelable:!1}))};if(!dlg.animationConfig)return void onAnimationFinish();var animation;if("fadeout"==dlg.animationConfig.exit.name)animation=fadeOut(dlg);else if("scaledown"==dlg.animationConfig.exit.name)animation=scaleDown(dlg);else{if("slidedown"!=dlg.animationConfig.exit.name)return void onAnimationFinish();animation=slideDown(dlg)}animation.onfinish=onAnimationFinish}}function animateDialogOpen(dlg){var onAnimationFinish=function(){focusManager.pushScope(dlg),"true"==dlg.getAttribute("data-autofocus")&&focusManager.autoFocus(dlg)};return dlg.animationConfig?void("fadein"==dlg.animationConfig.entry.name?fadeIn(dlg,onAnimationFinish):"scaleup"==dlg.animationConfig.entry.name?scaleUp(dlg,onAnimationFinish):"slideup"==dlg.animationConfig.entry.name&&slideUp(dlg,onAnimationFinish)):void onAnimationFinish()}function shouldLockDocumentScroll(options){return null!=options.lockScroll?options.lockScroll:"fullscreen"==options.size||(!!options.size||browser.touch)}function removeBackdrop(dlg){var backdrop=dlg.backdrop;backdrop&&(dlg.backdrop=null,backdrop.classList.remove("dialogBackdropOpened"),setTimeout(function(){backdrop.parentNode.removeChild(backdrop)},300))}function centerFocus(elem,horiz,on){require(["scrollHelper"],function(scrollHelper){var fn=on?"on":"off";scrollHelper.centerFocus[fn](elem,horiz)})}function createDialog(options){options=options||{};var dlg=document.createElement("div");dlg.classList.add("focuscontainer"),dlg.classList.add("hide"),shouldLockDocumentScroll(options)&&dlg.setAttribute("data-lockscroll","true"),options.enableHistory!==!1&&historyManager.enableNativeHistory()&&dlg.setAttribute("data-history","true"),options.modal!==!1&&dlg.setAttribute("modal","modal"),options.autoFocus!==!1&&dlg.setAttribute("data-autofocus","true");var defaultEntryAnimation="scaleup",entryAnimation=options.entryAnimation||defaultEntryAnimation,defaultExitAnimation="scaledown",exitAnimation=options.exitAnimation||defaultExitAnimation,entryAnimationDuration=options.entryAnimationDuration||("fullscreen"!==options.size?180:280),exitAnimationDuration=options.exitAnimationDuration||("fullscreen"!==options.size?180:280);return dlg.animationConfig={entry:{name:entryAnimation,node:dlg,timing:{duration:entryAnimationDuration,easing:"ease-out"}},exit:{name:exitAnimation,node:dlg,timing:{duration:exitAnimationDuration,easing:"ease-out",fill:"both"}}},enableAnimation()||(dlg.animationConfig=null),dlg.classList.add("dialog"),options.scrollX?(dlg.classList.add("smoothScrollX"),layoutManager.tv&&centerFocus(dlg,!0,!0)):options.scrollY!==!1&&(dlg.classList.add("smoothScrollY"),layoutManager.tv&&centerFocus(dlg,!1,!0)),options.removeOnClose&&dlg.setAttribute("data-removeonclose","true"),options.size&&(dlg.classList.add("dialog-fixedSize"),dlg.classList.add("dialog-"+options.size)),dlg}var globalOnOpenCallback;return{open:open,close:close,createDialog:createDialog,setOnOpen:function(val){globalOnOpenCallback=val}}});