define(["datetime","paper-icon-button-light","emby-button","listViewStyle"],function(datetime){function deleteSeriesTimer(context,id){require(["confirm"],function(confirm){confirm(Globalize.translate("MessageConfirmSeriesCancellation"),Globalize.translate("HeaderConfirmSeriesCancellation")).then(function(){Dashboard.showLoadingMsg(),ApiClient.cancelLiveTvSeriesTimer(id).then(function(){require(["toast"],function(toast){toast(Globalize.translate("MessageSeriesCancelled"))}),reload(context)})})})}function renderTimers(context,timers){var html="";timers.length&&(html+='<div class="paperList">');for(var i=0,length=timers.length;i<length;i++){var timer=timers[i];if(html+='<div class="listItem">',html+='<i class="md-icon listItemIcon">live_tv</i>',html+='<div class="listItemBody three-line">',html+='<a class="clearLink" href="livetvseriestimer.html?id='+timer.Id+'">',html+='<h3 class="listItemBodyText">',html+=timer.Name,html+="</h3>",html+='<div class="secondary">',timer.DayPattern)html+=timer.DayPattern;else{var days=timer.Days||[];html+=days.join(", ")}html+=timer.RecordAnyTime?" - "+Globalize.translate("LabelAnytime"):" - "+datetime.getDisplayTime(timer.StartDate),html+="</div>",html+='<div class="secondary">',timer.RecordAnyChannel?html+=Globalize.translate("LabelAllChannels"):timer.ChannelId&&(html+=timer.ChannelName),html+="</div>",html+="</a>",html+="</div>",html+='<button type="button" is="paper-icon-button-light" data-seriestimerid="'+timer.Id+'" title="'+Globalize.translate("ButtonCancelSeries")+'" class="btnCancelSeries autoSize"><i class="md-icon">cancel</i></button>',html+="</div>"}timers.length&&(html+="</div>");var elem=context.querySelector("#items");elem.innerHTML=html,timers.length&&elem.querySelector(".paperList").addEventListener("click",function(e){var btnCancelSeries=parentWithClass(e.target,"btnCancelSeries");btnCancelSeries&&deleteSeriesTimer(context,btnCancelSeries.getAttribute("data-seriestimerid"))}),Dashboard.hideLoadingMsg()}function parentWithClass(elem,className){for(;!elem.classList||!elem.classList.contains(className);)if(elem=elem.parentNode,!elem)return null;return elem}function reload(context){Dashboard.showLoadingMsg(),ApiClient.getLiveTvSeriesTimers(query).then(function(result){renderTimers(context,result.Items)})}var query={SortBy:"SortName",SortOrder:"Ascending"};return function(view,params,tabContent){var self=this;self.renderTab=function(){reload(tabContent)}}});