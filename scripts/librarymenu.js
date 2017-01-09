define(["layoutManager","viewManager","libraryBrowser","embyRouter","playbackManager","paper-icon-button-light","material-icons"],function(layoutManager,viewManager,libraryBrowser,embyRouter,playbackManager){"use strict";function renderHeader(){var html="";html+='<div class="primaryIcons">';var backIcon=browserInfo.safari?"chevron_left":"&#xE5C4;";html+='<button type="button" is="paper-icon-button-light" class="headerButton headerButtonLeft headerBackButton hide"><i class="md-icon">'+backIcon+"</i></button>",html+='<button type="button" is="paper-icon-button-light" class="headerButton mainDrawerButton barsMenuButton headerButtonLeft hide"><i class="md-icon">menu</i></button>',html+='<button type="button" is="paper-icon-button-light" class="headerButton headerAppsButton barsMenuButton headerButtonLeft"><i class="md-icon">home</i></button>',html+='<h3 class="libraryMenuButtonText headerButton">'+Globalize.translate("ButtonHome")+"</h3>",html+='<div class="viewMenuSecondary">',html+='<span class="headerSelectedPlayer"></span>',html+='<button is="paper-icon-button-light" class="btnCast headerButton-btnCast headerButton headerButtonRight hide autoSize"><i class="md-icon">cast</i></button>',html+='<button type="button" is="paper-icon-button-light" class="headerButton headerButtonRight headerSearchButton hide autoSize"><i class="md-icon">search</i></button>',html+='<button is="paper-icon-button-light" class="headerButton headerButtonRight headerVoiceButton hide autoSize"><i class="md-icon">mic</i></button>',html+='<button is="paper-icon-button-light" class="headerButton headerButtonRight btnNotifications"><div class="btnNotificationsInner">0</div></button>',html+='<button is="paper-icon-button-light" class="headerButton headerButtonRight headerUserButton autoSize"><i class="md-icon">person</i></button>',browserInfo.mobile||(html+='<button is="paper-icon-button-light" class="headerButton headerButtonRight dashboardEntryHeaderButton autoSize" onclick="return LibraryMenu.onSettingsClicked(event);"><i class="md-icon">settings</i></button>'),html+="</div>",html+="</div>",html+='<div class="viewMenuBarTabs">',html+="</div>";var viewMenuBar=document.createElement("div");viewMenuBar.classList.add("viewMenuBar"),viewMenuBar.innerHTML=html,document.querySelector(".skinHeader").appendChild(viewMenuBar),lazyLoadViewMenuBarImages(),document.dispatchEvent(new CustomEvent("headercreated",{})),bindMenuEvents()}function lazyLoadViewMenuBarImages(){require(["imageLoader"],function(imageLoader){imageLoader.lazyChildren(document.querySelector(".viewMenuBar"))})}function onBackClick(){embyRouter.back()}function updateUserInHeader(user){var header=document.querySelector(".viewMenuBar");if(header){var hasImage,headerUserButton=header.querySelector(".headerUserButton");if(user&&user.name&&user.imageUrl){var userButtonHeight=26,url=user.imageUrl;user.supportsImageParams&&(url+="&height="+Math.round(userButtonHeight*Math.max(window.devicePixelRatio||1,2))),headerUserButton&&(updateHeaderUserButton(headerUserButton,url),hasImage=!0)}headerUserButton&&!hasImage&&updateHeaderUserButton(headerUserButton,null),user&&updateLocalUser(user.localUser),requiresUserRefresh=!1}}function updateHeaderUserButton(headerUserButton,src){src?(headerUserButton.classList.add("headerUserButtonRound"),headerUserButton.classList.remove("autoSize"),headerUserButton.innerHTML='<img src="'+src+'" />'):(headerUserButton.classList.remove("headerUserButtonRound"),headerUserButton.classList.add("autoSize"),headerUserButton.innerHTML='<i class="md-icon">person</i>')}function updateLocalUser(user){var header=document.querySelector(".viewMenuBar"),headerSearchButton=header.querySelector(".headerSearchButton"),btnCast=header.querySelector(".btnCast"),dashboardEntryHeaderButton=header.querySelector(".dashboardEntryHeaderButton");user?(btnCast.classList.remove("hide"),headerSearchButton&&headerSearchButton.classList.remove("hide"),dashboardEntryHeaderButton&&(user.Policy.IsAdministrator?dashboardEntryHeaderButton.classList.remove("hide"):dashboardEntryHeaderButton.classList.add("hide")),require(["apphost"],function(apphost){apphost.supports("voiceinput")?header.querySelector(".headerVoiceButton").classList.add("hide"):header.querySelector(".headerVoiceButton").classList.add("hide")})):(btnCast.classList.add("hide"),header.querySelector(".headerVoiceButton").classList.add("hide"),headerSearchButton&&headerSearchButton.classList.add("hide"),dashboardEntryHeaderButton&&dashboardEntryHeaderButton.classList.add("hide"))}function showVoice(){require(["voiceDialog"],function(voiceDialog){voiceDialog.showDialog()})}function showSearch(){Dashboard.navigate("search.html")}function onHeaderUserButtonClick(e){Dashboard.showUserFlyout(e.target)}function onHeaderAppsButtonClick(){Dashboard.navigate("home.html")}function bindMenuEvents(){mainDrawerButton=document.querySelector(".mainDrawerButton"),mainDrawerButton&&mainDrawerButton.addEventListener("click",toggleMainDrawer);var headerBackButton=document.querySelector(".headerBackButton");headerBackButton&&headerBackButton.addEventListener("click",onBackClick);var headerVoiceButton=document.querySelector(".headerVoiceButton");headerVoiceButton&&headerVoiceButton.addEventListener("click",showVoice);var headerSearchButton=document.querySelector(".headerSearchButton");headerSearchButton&&headerSearchButton.addEventListener("click",showSearch);var headerUserButton=document.querySelector(".headerUserButton");headerUserButton&&headerUserButton.addEventListener("click",onHeaderUserButtonClick);var headerAppsButton=document.querySelector(".headerAppsButton");headerAppsButton&&headerAppsButton.addEventListener("click",onHeaderAppsButtonClick);var viewMenuBar=document.querySelector(".viewMenuBar");initHeadRoom(viewMenuBar),viewMenuBar.querySelector(".btnNotifications").addEventListener("click",function(){Dashboard.navigate("notificationlist.html")})}function getItemHref(item,context){return libraryBrowser.getHref(item,context)}function toggleMainDrawer(){navDrawerInstance.isVisible?closeMainDrawer():openMainDrawer()}function openMainDrawer(){navDrawerInstance.open(),lastOpenTime=(new Date).getTime()}function onMainDrawerOpened(){browserInfo.mobile&&document.body.classList.add("bodyWithPopupOpen")}function closeMainDrawer(){navDrawerInstance.close()}function onMainDrawerSelect(e){navDrawerInstance.isVisible?onMainDrawerOpened():document.body.classList.remove("bodyWithPopupOpen")}function refreshLibraryInfoInDrawer(user,drawer){var html="";html+='<div style="height:.5em;"></div>';var homeHref=window.ApiClient?"home.html":"selectserver.html?showuser=1";html+='<a class="lnkMediaFolder sidebarLink" href="'+homeHref+'" onclick="return LibraryMenu.onLinkClicked(event, this);">',html+="<div style=\"background-image:url('css/images/mblogoicon.png');width:28px;height:28px;background-size:contain;background-repeat:no-repeat;background-position:center center;border-radius:1000px;vertical-align:middle;margin:0 1.25em 0 1.55em;display:inline-block;\"></div>",html+=Globalize.translate("ButtonHome"),html+="</a>",html+='<a class="sidebarLink lnkMediaFolder" data-itemid="remote" href="nowplaying.html" onclick="return LibraryMenu.onLinkClicked(event, this);"><i class="md-icon sidebarLinkIcon">tablet_android</i><span class="sidebarLinkText">'+Globalize.translate("ButtonRemote")+"</span></a>",html+='<div class="sidebarDivider"></div>',html+='<div class="libraryMenuOptions">',html+="</div>";var localUser=user.localUser;localUser&&localUser.Policy.IsAdministrator&&(html+='<div class="adminMenuOptions">',html+='<div class="sidebarDivider"></div>',html+='<div class="sidebarHeader">',html+=Globalize.translate("HeaderAdmin"),html+="</div>",html+='<a class="sidebarLink lnkMediaFolder lnkManageServer" data-itemid="dashboard" href="#"><i class="md-icon sidebarLinkIcon">dashboard</i><span class="sidebarLinkText">'+Globalize.translate("ButtonManageServer")+"</span></a>",html+='<a class="sidebarLink lnkMediaFolder editorViewMenu" data-itemid="editor" onclick="return LibraryMenu.onLinkClicked(event, this);" href="edititemmetadata.html"><i class="md-icon sidebarLinkIcon">mode_edit</i><span class="sidebarLinkText">'+Globalize.translate("MetadataManager")+"</span></a>",browserInfo.mobile||(html+='<a class="sidebarLink lnkMediaFolder" data-itemid="reports" onclick="return LibraryMenu.onLinkClicked(event, this);" href="reports.html"><i class="md-icon sidebarLinkIcon">insert_chart</i><span class="sidebarLinkText">'+Globalize.translate("ButtonReports")+"</span></a>"),html+="</div>"),html+='<div class="userMenuOptions">',html+='<div class="sidebarDivider"></div>',user.localUser&&AppInfo.isNativeApp&&browserInfo.android&&(html+='<a class="sidebarLink lnkMediaFolder lnkMySettings" onclick="return LibraryMenu.onLinkClicked(event, this);" href="mypreferencesmenu.html"><i class="md-icon sidebarLinkIcon">settings</i><span class="sidebarLinkText">'+Globalize.translate("ButtonSettings")+"</span></a>"),html+='<a class="sidebarLink lnkMediaFolder lnkManageOffline" data-itemid="manageoffline" onclick="return LibraryMenu.onLinkClicked(event, this);" href="mysync.html?mode=offline"><i class="md-icon sidebarLinkIcon">file_download</i><span class="sidebarLinkText">'+Globalize.translate("ManageOfflineDownloads")+"</span></a>",html+='<a class="sidebarLink lnkMediaFolder lnkSyncToOtherDevices" data-itemid="syncotherdevices" onclick="return LibraryMenu.onLinkClicked(event, this);" href="mysync.html"><i class="md-icon sidebarLinkIcon">sync</i><span class="sidebarLinkText">'+Globalize.translate("SyncToOtherDevices")+"</span></a>",Dashboard.isConnectMode()&&(html+='<a class="sidebarLink lnkMediaFolder" data-itemid="selectserver" onclick="return LibraryMenu.onLinkClicked(event, this);" href="selectserver.html?showuser=1"><i class="md-icon sidebarLinkIcon">wifi</i><span class="sidebarLinkText">'+Globalize.translate("ButtonSelectServer")+"</span></a>"),user.localUser&&(html+='<a class="sidebarLink lnkMediaFolder" data-itemid="logout" onclick="return LibraryMenu.onLogoutClicked(this);" href="#"><i class="md-icon sidebarLinkIcon">lock</i><span class="sidebarLinkText">'+Globalize.translate("ButtonSignOut")+"</span></a>"),html+="</div>",navDrawerScrollContainer.innerHTML=html;var lnkManageServer=navDrawerScrollContainer.querySelector(".lnkManageServer");lnkManageServer&&lnkManageServer.addEventListener("click",onManageServerClicked)}function refreshDashboardInfoInDrawer(page,user){loadNavDrawer().then(function(){navDrawerScrollContainer.querySelector(".adminDrawerLogo")?updateDashboardMenuSelectedItem():createDashboardMenu(page)})}function updateDashboardMenuSelectedItem(){for(var links=navDrawerScrollContainer.querySelectorAll(".sidebarLink"),i=0,length=links.length;i<length;i++){var link=links[i],selected=!1,pageIds=link.getAttribute("data-pageids");if(pageIds&&(selected=pageIds.split(",").indexOf(viewManager.currentView().id)!=-1),selected){link.classList.add("selectedSidebarLink");var title="";link=link.querySelector("span")||link;var secondaryTitle=(link.innerText||link.textContent).trim();title+=secondaryTitle,LibraryMenu.setTitle(title)}else link.classList.remove("selectedSidebarLink")}}function createDashboardMenu(){var html="";html+='<a class="adminDrawerLogo clearLink" href="home.html">',html+='<img src="css/images/logo.png" />',html+="</a>",html+=Dashboard.getToolsMenuHtml(),html=html.split("href=").join('onclick="return LibraryMenu.onLinkClicked(event, this);" href='),navDrawerScrollContainer.innerHTML=html,updateDashboardMenuSelectedItem()}function onSidebarLinkClick(){var section=this.getElementsByClassName("sectionName")[0],text=section?section.innerHTML:this.innerHTML;LibraryMenu.setTitle(text)}function getUserViews(apiClient,userId){return apiClient.getUserViews({},userId).then(function(result){for(var items=result.Items,list=[],i=0,length=items.length;i<length;i++){var view=items[i];if(list.push(view),"livetv"==view.CollectionType){view.ImageTags={},view.icon="live_tv",view.onclick="LibraryBrowser.showTab('livetv.html', 0);";var guideView=Object.assign({},view);guideView.Name=Globalize.translate("ButtonGuide"),guideView.ImageTags={},guideView.icon="dvr",guideView.url="livetv.html?tab=1",guideView.onclick="LibraryBrowser.showTab('livetv.html', 1);",list.push(guideView)}}return list})}function showBySelector(selector,show){var elem=document.querySelector(selector);elem&&(show?elem.classList.remove("hide"):elem.classList.add("hide"))}function updateLibraryMenu(user){if(!user)return showBySelector(".lnkManageOffline",!1),showBySelector(".lnkSyncToOtherDevices",!1),void showBySelector(".userMenuOptions",!1);user.Policy.EnableSync?showBySelector(".lnkSyncToOtherDevices",!0):showBySelector(".lnkSyncToOtherDevices",!1),require(["apphost"],function(appHost){user.Policy.EnableSync&&appHost.supports("sync")?showBySelector(".lnkManageOffline",!0):showBySelector(".lnkManageOffline",!1)});var userId=Dashboard.getCurrentUserId(),apiClient=window.ApiClient,libraryMenuOptions=document.querySelector(".libraryMenuOptions");libraryMenuOptions&&getUserViews(apiClient,userId).then(function(result){var items=result,html="";html+='<div class="sidebarHeader">',html+=Globalize.translate("HeaderMedia"),html+="</div>",html+=items.map(function(i){var icon="folder",color="inherit",itemId=i.Id;"channels"==i.CollectionType?itemId="channels":"livetv"==i.CollectionType&&(itemId="livetv"),"photos"==i.CollectionType?(icon="photo_library",color="#009688"):"music"==i.CollectionType||"musicvideos"==i.CollectionType?(icon="library_music",color="#FB8521"):"books"==i.CollectionType?(icon="library_books",color="#1AA1E1"):"playlists"==i.CollectionType?(icon="view_list",color="#795548"):"games"==i.CollectionType?(icon="games",color="#F44336"):"movies"==i.CollectionType?(icon="video_library",color="#CE5043"):"channels"==i.CollectionType||"Channel"==i.Type?(icon="videocam",color="#E91E63"):"tvshows"==i.CollectionType?(icon="tv",color="#4CAF50"):"livetv"==i.CollectionType&&(icon="live_tv",color="#293AAE"),icon=i.icon||icon;var onclick=i.onclick?" function(){"+i.onclick+"}":"null";return'<a data-itemid="'+itemId+'" class="lnkMediaFolder sidebarLink" onclick="return LibraryMenu.onLinkClicked(event, this, '+onclick+');" href="'+getItemHref(i,i.CollectionType)+'"><i class="md-icon sidebarLinkIcon" style="color:'+color+'">'+icon+'</i><span class="sectionName">'+i.Name+"</span></a>"}).join(""),libraryMenuOptions.innerHTML=html;for(var elem=libraryMenuOptions,sidebarLinks=elem.querySelectorAll(".sidebarLink"),i=0,length=sidebarLinks.length;i<length;i++)sidebarLinks[i].removeEventListener("click",onSidebarLinkClick),sidebarLinks[i].addEventListener("click",onSidebarLinkClick)})}function onManageServerClicked(){closeMainDrawer(),Dashboard.navigate("dashboard.html")}function getTopParentId(){return getParameterByName("topParentId")||null}function getNavigateDelay(){return browserInfo.mobile?320:200}function updateCastIcon(){var context=document,btnCast=context.querySelector(".btnCast");if(btnCast){var info=playbackManager.getPlayerInfo();info&&!info.isLocalPlayer?(btnCast.querySelector("i").icon="cast_connected",btnCast.classList.add("btnActiveCast"),context.querySelector(".headerSelectedPlayer").innerHTML=info.deviceName||info.name):(btnCast.querySelector("i").innerHTML="cast",btnCast.classList.remove("btnActiveCast"),context.querySelector(".headerSelectedPlayer").innerHTML="")}}function updateLibraryNavLinks(page){var i,length,isLiveTvPage=page.classList.contains("liveTvPage"),isChannelsPage=page.classList.contains("channelsPage"),isEditorPage=page.classList.contains("metadataEditorPage"),isReportsPage=page.classList.contains("reportsPage"),isMySyncPage=page.classList.contains("mySyncPage"),id=isLiveTvPage||isChannelsPage||isEditorPage||isReportsPage||isMySyncPage||page.classList.contains("allLibraryPage")?"":getTopParentId()||"",elems=document.getElementsByClassName("lnkMediaFolder");for(i=0,length=elems.length;i<length;i++){var lnkMediaFolder=elems[i],itemId=lnkMediaFolder.getAttribute("data-itemid");isChannelsPage&&"channels"==itemId?lnkMediaFolder.classList.add("selectedMediaFolder"):isLiveTvPage&&"livetv"==itemId?lnkMediaFolder.classList.add("selectedMediaFolder"):isEditorPage&&"editor"==itemId?lnkMediaFolder.classList.add("selectedMediaFolder"):isReportsPage&&"reports"==itemId?lnkMediaFolder.classList.add("selectedMediaFolder"):isMySyncPage&&"manageoffline"==itemId&&window.location.href.toString().indexOf("mode=offline")!=-1?lnkMediaFolder.classList.add("selectedMediaFolder"):isMySyncPage&&"syncotherdevices"==itemId&&window.location.href.toString().indexOf("mode=offline")==-1?lnkMediaFolder.classList.add("selectedMediaFolder"):id&&itemId==id?lnkMediaFolder.classList.add("selectedMediaFolder"):lnkMediaFolder.classList.remove("selectedMediaFolder")}}function onWebSocketMessage(e,data){var msg=data;"UserConfigurationUpdated"===msg.MessageType&&msg.Data.Id==Dashboard.getCurrentUserId()}function updateViewMenuBar(page){var viewMenuBar=document.querySelector(".viewMenuBar");viewMenuBar&&(page.classList.contains("standalonePage")?viewMenuBar.classList.add("hide"):viewMenuBar.classList.remove("hide"),page.classList.contains("type-interior")&&!layoutManager.mobile?viewMenuBar.classList.add("headroomDisabled"):viewMenuBar.classList.remove("headroomDisabled")),requiresUserRefresh&&ConnectionManager.user(window.ApiClient).then(updateUserInHeader)}function updateTitle(page){var title=page.getAttribute("data-title");title&&LibraryMenu.setTitle(title)}function updateBackButton(page){var backButton=document.querySelector(".headerBackButton");backButton&&("true"==page.getAttribute("data-backbutton")&&embyRouter.canGoBack()?backButton.classList.remove("hide"):backButton.classList.add("hide"))}function initHeadRoom(elem){require(["headroom-window"],function(headroom){headroom.add(elem)})}function initializeApiClient(apiClient){Events.off(apiClient,"websocketmessage",onWebSocketMessage),Events.on(apiClient,"websocketmessage",onWebSocketMessage)}function setDrawerClass(page){var admin=!1;page||(page=viewManager.currentView()),page&&page.classList.contains("type-interior")&&(admin=!0);var enableNavDrawer=admin||enableLibraryNavDrawer;enableNavDrawer&&loadNavDrawer().then(function(){admin?(navDrawerElement.classList.add("adminDrawer"),navDrawerElement.classList.remove("darkDrawer")):(navDrawerElement.classList.add("darkDrawer"),navDrawerElement.classList.remove("adminDrawer"))})}function refreshLibraryDrawer(user){enableLibraryNavDrawer&&loadNavDrawer().then(function(){var promise=user?Promise.resolve(user):ConnectionManager.user(window.ApiClient);promise.then(function(user){refreshLibraryInfoInDrawer(user),updateLibraryMenu(user.localUser)})})}function getNavDrawerOptions(){var drawerWidth=screen.availWidth-50;drawerWidth=Math.max(drawerWidth,240),drawerWidth=Math.min(drawerWidth,260);var disableEdgeSwipe=!1;return browserInfo.safari&&(disableEdgeSwipe=!0),{target:navDrawerElement,onChange:onMainDrawerSelect,width:drawerWidth,disableEdgeSwipe:disableEdgeSwipe}}function loadNavDrawer(){return navDrawerInstance?Promise.resolve(navDrawerInstance):new Promise(function(resolve,reject){navDrawerElement=document.querySelector(".mainDrawer"),navDrawerScrollContainer=navDrawerElement.querySelector(".scrollContainer"),require(["navdrawer"],function(navdrawer){navDrawerInstance=new navdrawer(getNavDrawerOptions()),navDrawerElement.classList.remove("hide"),resolve(navDrawerInstance)})})}var navDrawerElement,navDrawerScrollContainer,navDrawerInstance,mainDrawerButton,enableBottomTabs=AppInfo.isNativeApp,enableLibraryNavDrawer=!enableBottomTabs,requiresUserRefresh=!0,lastOpenTime=(new Date).getTime();return window.LibraryMenu={getTopParentId:getTopParentId,onLinkClicked:function(event,link,action){return 1!=event.which||((new Date).getTime()-lastOpenTime>200&&setTimeout(function(){closeMainDrawer(),setTimeout(function(){action?action():Dashboard.navigate(link.href)},getNavigateDelay())},50),event.stopPropagation(),event.preventDefault(),!1)},onLogoutClicked:function(){return(new Date).getTime()-lastOpenTime>200&&(closeMainDrawer(),setTimeout(function(){Dashboard.logout()},getNavigateDelay())),!1},onHardwareMenuButtonClick:function(){toggleMainDrawer()},onSettingsClicked:function(event){return 1!=event.which||(Dashboard.navigate("dashboard.html"),!1)},setTabs:function(type,selectedIndex,builder){var viewMenuBarTabs;return type?(viewMenuBarTabs=document.querySelector(".viewMenuBarTabs"),LibraryMenu.tabType||viewMenuBarTabs.classList.remove("hide"),void require(["emby-tabs","emby-button"],function(){if(LibraryMenu.tabType!=type){var index=0;return viewMenuBarTabs.innerHTML='<div is="emby-tabs"><div class="emby-tabs-slider">'+builder().map(function(t){var tabClass=selectedIndex==index?"emby-tab-button emby-tab-button-active":"emby-tab-button",tabHtml='<button onclick="Dashboard.navigate(this.getAttribute(\'data-href\'));" data-href="'+t.href+'" is="emby-button" class="'+tabClass+'" data-index="'+index+'"><div class="emby-button-foreground">'+t.name+"</div></button>";return index++,tabHtml}).join("")+"</div></div>",document.body.classList.add("withTallToolbar"),void(LibraryMenu.tabType=type)}viewMenuBarTabs.querySelector('[is="emby-tabs"]').selectedIndex(selectedIndex),LibraryMenu.tabType=type})):void(LibraryMenu.tabType&&(document.body.classList.remove("withTallToolbar"),viewMenuBarTabs=document.querySelector(".viewMenuBarTabs"),viewMenuBarTabs.innerHTML="",viewMenuBarTabs.classList.add("hide"),LibraryMenu.tabType=null))},setTitle:function(title){var html=title,page=viewManager.currentView();if(page){var helpUrl=page.getAttribute("data-helpurl");helpUrl&&(html+='<a href="'+helpUrl+'" target="_blank" class="clearLink" style="margin-left:2em;" title="'+Globalize.translate("ButtonHelp")+'"><button is="emby-button" type="button" class="button-accent-flat button-flat" style="margin:0;font-weight:normal;font-size:14px;padding:.25em;display:block;align-items:center;"><i class="md-icon">info</i><span>'+Globalize.translate("ButtonHelp")+"</span></button></a>")}var libraryMenuButtonText=document.querySelector(".libraryMenuButtonText");libraryMenuButtonText&&(libraryMenuButtonText.innerHTML=html),document.title=title||"Emby"},setTransparentMenu:function(transparent){var viewMenuBar=document.querySelector(".viewMenuBar");viewMenuBar&&(transparent?viewMenuBar.classList.add("semiTransparent"):viewMenuBar.classList.remove("semiTransparent"))}},pageClassOn("pagebeforeshow","page",function(e){var page=this;page.classList.contains("withTabs")||LibraryMenu.setTabs(null)}),pageClassOn("pageshow","page",function(e){var page=this,isDashboardPage=page.classList.contains("type-interior");isDashboardPage?(mainDrawerButton&&mainDrawerButton.classList.remove("hide"),refreshDashboardInfoInDrawer(page)):(mainDrawerButton&&(enableLibraryNavDrawer?mainDrawerButton.classList.remove("hide"):mainDrawerButton.classList.add("hide")),(navDrawerElement&&navDrawerElement.classList.contains("adminDrawer")||!navDrawerElement&&enableLibraryNavDrawer)&&refreshLibraryDrawer()),setDrawerClass(page),updateViewMenuBar(page),e.detail.isRestored||window.scrollTo(0,0),updateTitle(page),updateBackButton(page),page.classList.contains("libraryPage")?(document.body.classList.add("libraryDocument"),document.body.classList.remove("dashboardDocument"),document.body.classList.remove("hideMainDrawer")):isDashboardPage?(document.body.classList.remove("libraryDocument"),document.body.classList.add("dashboardDocument"),document.body.classList.remove("hideMainDrawer")):(document.body.classList.remove("libraryDocument"),document.body.classList.remove("dashboardDocument"),document.body.classList.add("hideMainDrawer")),updateLibraryNavLinks(page)}),window.ApiClient&&initializeApiClient(window.ApiClient),renderHeader(),Events.on(ConnectionManager,"apiclientcreated",function(e,apiClient){initializeApiClient(apiClient)}),Events.on(ConnectionManager,"localusersignedin",function(e,user){setDrawerClass(),ConnectionManager.user(ConnectionManager.getApiClient(user.ServerId)).then(function(user){refreshLibraryDrawer(user),updateUserInHeader(user)})}),Events.on(ConnectionManager,"localusersignedout",updateUserInHeader),Events.on(playbackManager,"playerchange",updateCastIcon),setDrawerClass(),enableBottomTabs&&require(["appfooter-shared","dockedtabs"],function(footer,dockedtabs){new dockedtabs({appFooter:footer})}),LibraryMenu});