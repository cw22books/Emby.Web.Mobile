define(["libraryBrowser","cardBuilder"],function(libraryBrowser,cardBuilder){return function(view,params,tabContent){function getPageData(){var key=getSavedQueryKey(),pageData=data[key];return pageData||(pageData=data[key]={query:{SortBy:"SortName",SortOrder:"Ascending",IncludeItemTypes:"Audio,MusicAlbum",Recursive:!0,Fields:"DateCreated,ItemCounts",StartIndex:0},view:libraryBrowser.getSavedView(key)||"PosterCard"},pageData.query.ParentId=params.topParentId,libraryBrowser.loadSavedQueryValues(key,pageData.query)),pageData}function getQuery(){return getPageData().query}function getSavedQueryKey(){return libraryBrowser.getSavedQueryKey("genres")}function getPromise(){Dashboard.showLoadingMsg();var query=getQuery();return ApiClient.getGenres(Dashboard.getCurrentUserId(),query)}function reloadItems(context,promise){var query=getQuery();promise.then(function(result){var html="",viewStyle=self.getCurrentViewStyle();"Thumb"==viewStyle?html=cardBuilder.getCardsHtml({items:result.Items,shape:"backdrop",preferThumb:!0,context:"music",showItemCounts:!0,centerText:!0,lazy:!0,overlayMoreButton:!0,showTitle:!0}):"ThumbCard"==viewStyle?html=cardBuilder.getCardsHtml({items:result.Items,shape:"backdrop",preferThumb:!0,context:"music",showItemCounts:!0,cardLayout:!0,showTitle:!0,lazy:!0}):"PosterCard"==viewStyle?html=cardBuilder.getCardsHtml({items:result.Items,shape:"auto",context:"music",showItemCounts:!0,lazy:!0,cardLayout:!0,showTitle:!0}):"Poster"==viewStyle&&(html=cardBuilder.getCardsHtml({items:result.Items,shape:"auto",context:"music",centerText:!0,showItemCounts:!0,lazy:!0,overlayMoreButton:!0,showTitle:!0}));var elem=context.querySelector("#items");elem.innerHTML=html,ImageLoader.lazyChildren(elem),libraryBrowser.saveQueryValues(getSavedQueryKey(),query),Dashboard.hideLoadingMsg()})}function fullyReload(){self.preRender(),self.renderTab()}var self=this,data={};self.getViewStyles=function(){return"Poster,PosterCard,Thumb,ThumbCard".split(",")},self.getCurrentViewStyle=function(){return getPageData(tabContent).view},self.setCurrentViewStyle=function(viewStyle){getPageData(tabContent).view=viewStyle,libraryBrowser.saveViewSetting(getSavedQueryKey(tabContent),viewStyle),fullyReload()},self.enableViewSelection=!0;var promise;self.preRender=function(){promise=getPromise()},self.renderTab=function(){reloadItems(tabContent,promise)};var btnSelectView=tabContent.querySelector(".btnSelectView");btnSelectView.addEventListener("click",function(e){libraryBrowser.showLayoutMenu(e.target,self.getCurrentViewStyle(),self.getViewStyles())}),btnSelectView.addEventListener("layoutchange",function(e){self.setCurrentViewStyle(e.detail.viewStyle)})}});