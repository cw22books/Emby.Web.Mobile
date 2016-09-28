define(["listViewStyle"],function(){function parentWithClass(elem,className){for(;!elem.classList||!elem.classList.contains(className);)if(elem=elem.parentNode,!elem)return null;return elem}function reloadList(page){Dashboard.showLoadingMsg(),ApiClient.getSmartMatchInfos(query).then(function(infos){currentResult=infos,populateList(page,infos),Dashboard.hideLoadingMsg()},function(){Dashboard.hideLoadingMsg()})}function populateList(page,result){var infos=result.Items;infos.length>0&&(infos=infos.sort(function(a,b){return a=a.OrganizerType+" "+(a.DisplayName||a.ItemName),b=b.OrganizerType+" "+(b.DisplayName||b.ItemName),a==b?0:a<b?-1:1}));var html="";infos.length&&(html+='<div class="paperList">');for(var i=0,length=infos.length;i<length;i++){var info=infos[i];html+='<div class="listItem">',html+='<div class="listItemIconContainer">',html+='<i class="listItemIcon md-icon">folder</i>',html+="</div>",html+='<div class="listItemBody">',html+="<h2 class='listItemBodyText'>"+(info.DisplayName||info.ItemName)+"</h2>",html+="</div>",html+="</div>";var matchStringIndex=0;html+=info.MatchStrings.map(function(m){var matchStringHtml="";return matchStringHtml+='<div class="listItem">',matchStringHtml+='<div class="listItemBody" style="padding: .1em 1em .4em 5.5em; min-height: 1.5em;">',matchStringHtml+="<div class='listItemBodyText secondary'>"+m+"</div>",matchStringHtml+="</div>",matchStringHtml+='<button type="button" is="emby-button" class="btnDeleteMatchEntry" style="padding: 0;" data-index="'+i+'" data-matchindex="'+matchStringIndex+'" title="'+Globalize.translate("ButtonDelete")+'"><i class="md-icon">delete</i></button>',matchStringHtml+="</div>",matchStringIndex++,matchStringHtml}).join("")}infos.length&&(html+="</div>");var matchInfos=page.querySelector(".divMatchInfos");matchInfos.innerHTML=html}function getTabs(){return[{href:"autoorganizelog.html",name:Globalize.translate("TabActivityLog")},{href:"autoorganizetv.html",name:Globalize.translate("TabTV")},{href:"autoorganizesmart.html",name:Globalize.translate("TabSmartMatches")}]}var currentResult,query={StartIndex:0,Limit:1e5};return function(view,params){var divInfos=view.querySelector(".divMatchInfos");divInfos.addEventListener("click",function(e){var button=parentWithClass(e.target,"btnDeleteMatchEntry");if(button){var index=parseInt(button.getAttribute("data-index")),matchIndex=parseInt(button.getAttribute("data-matchindex")),info=currentResult.Items[index],entries=[{Name:info.ItemName,Value:info.MatchStrings[matchIndex]}];ApiClient.deleteSmartMatchEntries(entries).then(function(){reloadList(view)},Dashboard.processErrorResponse)}}),view.addEventListener("viewshow",function(e){LibraryMenu.setTabs("autoorganize",2,getTabs),Dashboard.showLoadingMsg(),reloadList(view)}),view.addEventListener("viewhide",function(e){currentResult=null})}});