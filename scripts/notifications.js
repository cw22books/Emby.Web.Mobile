define(["libraryBrowser","listViewStyle"],function(libraryBrowser){function notifications(){var self=this;self.getNotificationsSummaryPromise=null,self.total=0,self.getNotificationsSummary=function(){var apiClient=window.ApiClient;if(apiClient)return self.getNotificationsSummaryPromise=self.getNotificationsSummaryPromise||apiClient.getNotificationSummary(Dashboard.getCurrentUserId()),self.getNotificationsSummaryPromise},self.updateNotificationCount=function(){if(Dashboard.getCurrentUserId()&&window.ApiClient){var promise=self.getNotificationsSummary();promise&&promise.then(function(summary){var btnNotificationsInner=document.querySelector(".btnNotificationsInner");btnNotificationsInner&&(btnNotificationsInner.classList.remove("levelNormal"),btnNotificationsInner.classList.remove("levelWarning"),btnNotificationsInner.classList.remove("levelError"),btnNotificationsInner.innerHTML=summary.UnreadCount,summary.UnreadCount&&btnNotificationsInner.classList.add("level"+summary.MaxUnreadNotificationLevel))})}},self.markNotificationsRead=function(ids,callback){ApiClient.markNotificationsRead(Dashboard.getCurrentUserId(),ids,!0).then(function(){self.getNotificationsSummaryPromise=null,self.updateNotificationCount(),callback&&callback()})},self.showNotificationsList=function(startIndex,limit,elem){refreshNotifications(startIndex,limit,elem,!0)}}function refreshNotifications(startIndex,limit,elem,showPaging){var apiClient=window.ApiClient;if(apiClient)return apiClient.getNotifications(Dashboard.getCurrentUserId(),{StartIndex:startIndex,Limit:limit}).then(function(result){listUnreadNotifications(result.Notifications,result.TotalRecordCount,startIndex,limit,elem,showPaging)})}function listUnreadNotifications(list,totalRecordCount,startIndex,limit,elem,showPaging){if(!totalRecordCount)return void elem.html('<p style="padding:.5em 1em;">'+Globalize.translate("LabelNoUnreadNotifications")+"</p>");Notifications.total=totalRecordCount;var html="";if(totalRecordCount>limit&&showPaging===!0){var query={StartIndex:startIndex,Limit:limit};html+=libraryBrowser.getQueryPagingHtml({startIndex:query.StartIndex,limit:query.Limit,totalRecordCount:totalRecordCount,showLimit:!1,updatePageSizeSetting:!1})}require(["humanedate"],function(){for(var i=0,length=list.length;i<length;i++){var notification=list[i];html+=getNotificationHtml(notification)}elem.html(html).trigger("create")})}function getNotificationHtml(notification){var itemHtml="";return notification.Url&&(itemHtml+='<a class="clearLink" href="'+notification.Url+'" target="_blank">'),itemHtml+='<div class="listItem">',itemHtml+="Error"==notification.Level?'<i class="listItemIcon md-icon" style="background:#cc3333;">error</i>':'<i class="listItemIcon md-icon">dvr</i>',itemHtml+='<div class="listItemBody three-line">',itemHtml+='<h3 class="listItemBodyText">',itemHtml+=notification.Name,itemHtml+="</h3>",itemHtml+='<div class="listItemBodyText secondary">',itemHtml+=humane_date(notification.Date),itemHtml+="</div>",notification.Description&&(itemHtml+='<div class="listItemBodyText secondary listItemBodyText-nowrap">',itemHtml+=notification.Description,itemHtml+="</div>"),itemHtml+="</div>",itemHtml+="</div>",notification.Url&&(itemHtml+="</a>"),itemHtml}function onWebSocketMessage(e,msg){"NotificationUpdated"!==msg.MessageType&&"NotificationAdded"!==msg.MessageType&&"NotificationsMarkedRead"!==msg.MessageType||(Notifications.getNotificationsSummaryPromise=null,Notifications.updateNotificationCount())}function initializeApiClient(apiClient){Events.off(apiClient,"websocketmessage",onWebSocketMessage),Events.on(apiClient,"websocketmessage",onWebSocketMessage)}window.Notifications=new notifications;var needsRefresh=!0;window.ApiClient&&initializeApiClient(window.ApiClient),Events.on(ConnectionManager,"apiclientcreated",function(e,apiClient){initializeApiClient(apiClient)}),Events.on(ConnectionManager,"localusersignedin",function(){needsRefresh=!0}),Events.on(ConnectionManager,"localusersignedout",function(){needsRefresh=!0}),pageClassOn("pageshow","type-interior",function(){needsRefresh&&Notifications.updateNotificationCount()})});