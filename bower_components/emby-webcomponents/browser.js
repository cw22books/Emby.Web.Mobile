define([],function(){function isTv(){var userAgent=navigator.userAgent.toLowerCase();return userAgent.indexOf("tv")!=-1||(userAgent.indexOf("samsungbrowser")!=-1||(userAgent.indexOf("nintendo")!=-1||(userAgent.indexOf("viera")!=-1||userAgent.indexOf("webos")!=-1)))}function isMobile(userAgent){for(var terms=["mobi","ipad","iphone","ipod","silk","gt-p1000","nexus 7","kindle fire","opera mini"],lower=userAgent.toLowerCase(),i=0,length=terms.length;i<length;i++)if(lower.indexOf(terms[i])!=-1)return!0;return!1}function isStyleSupported(prop,value){if(value=2===arguments.length?value:"inherit","CSS"in window&&"supports"in window.CSS)return window.CSS.supports(prop,value);if("supportsCSS"in window)return window.supportsCSS(prop,value);try{var camel=prop.replace(/-([a-z]|[0-9])/gi,function(all,letter){return(letter+"").toUpperCase()}),support=camel in el.style,el=document.createElement("div");return el.style.cssText=prop+":"+value,support&&""!==el.style[camel]}catch(err){return!1}}function hasKeyboard(browser){return!!browser.touch||(!!browser.xboxOne||(!!browser.ps4||(!!browser.edgeUwp||!!browser.tv)))}var uaMatch=function(ua){ua=ua.toLowerCase();var match=/(edge)[ \/]([\w.]+)/.exec(ua)||/(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua)||/(opr)(?:.*version|)[ \/]([\w.]+)/.exec(ua)||/(chrome)[ \/]([\w.]+)/.exec(ua)||/(safari)[ \/]([\w.]+)/.exec(ua)||/(firefox)[ \/]([\w.]+)/.exec(ua)||/(msie) ([\w.]+)/.exec(ua)||ua.indexOf("compatible")<0&&/(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua)||[],platform_match=/(ipad)/.exec(ua)||/(iphone)/.exec(ua)||/(android)/.exec(ua)||[],browser=match[1]||"";return"edge"==browser?platform_match=[""]:ua.indexOf("windows phone")!=-1||ua.indexOf("iemobile")!=-1?browser="msie":ua.indexOf("like gecko")!=-1&&ua.indexOf("webkit")==-1&&ua.indexOf("opera")==-1&&ua.indexOf("chrome")==-1&&ua.indexOf("safari")==-1&&(browser="msie"),"opr"==browser&&(browser="opera"),{browser:browser,version:match[2]||"0",platform:platform_match[0]||""}},userAgent=window.navigator.userAgent,matched=uaMatch(userAgent),browser={};return matched.browser&&(browser[matched.browser]=!0,browser.version=matched.version),matched.platform&&(browser[matched.platform]=!0),browser.chrome||browser.msie||browser.edge||browser.opera||userAgent.toLowerCase().indexOf("webkit")==-1||(browser.safari=!0),userAgent.toLowerCase().indexOf("playstation 4")!=-1&&(browser.ps4=!0,browser.tv=!0),isMobile(userAgent)&&(browser.mobile=!0),browser.xboxOne=userAgent.toLowerCase().indexOf("xbox")!=-1,browser.animate=null!=document.documentElement.animate,browser.tizen=userAgent.toLowerCase().indexOf("tizen")!=-1||userAgent.toLowerCase().indexOf("smarthub")!=-1,browser.web0s=userAgent.toLowerCase().indexOf("Web0S".toLowerCase())!=-1,browser.edgeUwp=browser.edge&&userAgent.toLowerCase().indexOf("msapphost")!=-1,browser.tv=isTv(),browser.operaTv=browser.tv&&userAgent.toLowerCase().indexOf("opr/")!=-1,isStyleSupported("display","flex")||(browser.noFlex=!0),(browser.mobile||browser.tv)&&(browser.slow=!0),("ontouchstart"in window||window.DocumentTouch&&document instanceof DocumentTouch)&&(browser.touch=!0),browser.keyboard=hasKeyboard(browser),browser});