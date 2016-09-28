define(["dialogHelper","emby-checkbox","emby-input","emby-button","paper-icon-button-light","formDialogStyle"],function(dialogHelper){function onApiFailure(e){Dashboard.hideLoadingMsg(),require(["alert"],function(alert){alert({title:Globalize.translate("AutoOrganizeError"),text:Globalize.translate("ErrorOrganizingFileWithErrorCode",e.headers.get("X-Application-Error-Code"))})})}function initEpisodeForm(context,item){!item.ExtractedName||item.ExtractedName.length<3?context.querySelector(".fldRemember").classList.add("hide"):context.querySelector(".fldRemember").classList.remove("hide"),context.querySelector(".inputFile").innerHTML=item.OriginalFileName,context.querySelector("#txtSeason").value=item.ExtractedSeasonNumber,context.querySelector("#txtEpisode").value=item.ExtractedEpisodeNumber,context.querySelector("#txtEndingEpisode").value=item.ExtractedEndingEpisodeNumber,extractedName=item.ExtractedName,extractedYear=item.ExtractedYear,context.querySelector("#chkRememberCorrection").checked=!1,context.querySelector("#hfResultId").value=item.Id,ApiClient.getItems(null,{recursive:!0,includeItemTypes:"Series",sortBy:"SortName"}).then(function(result){existingSeriesHtml=result.Items.map(function(s){return'<option value="'+s.Id+'">'+s.Name+"</option>"}).join(""),existingSeriesHtml='<option value=""></option>'+existingSeriesHtml,context.querySelector("#selectSeries").innerHTML=existingSeriesHtml,ApiClient.getVirtualFolders().then(function(result){for(var seriesLocations=[],n=0;n<result.length;n++)for(var virtualFolder=result[n],i=0,length=virtualFolder.Locations.length;i<length;i++){var location={value:virtualFolder.Locations[i],display:virtualFolder.Name+": "+virtualFolder.Locations[i]};"tvshows"==virtualFolder.CollectionType&&seriesLocations.push(location)}seriesLocationsCount=seriesLocations.length;var seriesFolderHtml=seriesLocations.map(function(s){return'<option value="'+s.value+'">'+s.display+"</option>"}).join("");seriesLocations.length>1&&(seriesFolderHtml='<option value=""></option>'+seriesFolderHtml),context.querySelector("#selectSeriesFolder").innerHTML=seriesFolderHtml},onApiFailure)},onApiFailure)}function submitEpisodeForm(dlg){Dashboard.showLoadingMsg();var targetFolder,newProviderIds,newSeriesName,newSeriesYear,resultId=dlg.querySelector("#hfResultId").value,seriesId=dlg.querySelector("#selectSeries").value;"##NEW##"==seriesId&&null!=currentNewItem&&(seriesId=null,newProviderIds=JSON.stringify(currentNewItem.ProviderIds),newSeriesName=currentNewItem.Name,newSeriesYear=currentNewItem.ProductionYear,targetFolder=dlg.querySelector("#selectSeriesFolder").value);var options={SeriesId:seriesId,SeasonNumber:dlg.querySelector("#txtSeason").value,EpisodeNumber:dlg.querySelector("#txtEpisode").value,EndingEpisodeNumber:dlg.querySelector("#txtEndingEpisode").value,RememberCorrection:dlg.querySelector("#chkRememberCorrection").checked,NewSeriesProviderIds:newProviderIds,NewSeriesName:newSeriesName,NewSeriesYear:newSeriesYear,TargetFolder:targetFolder};ApiClient.performEpisodeOrganization(resultId,options).then(function(){Dashboard.hideLoadingMsg(),dlg.submitted=!0,dialogHelper.close(dlg)},onApiFailure)}function showNewSeriesDialog(dlg){return 0==seriesLocationsCount?void require(["alert"],function(alert){alert({title:Globalize.translate("AutoOrganizeError"),text:Globalize.translate("NoTvFoldersConfigured")})}):void require(["itemIdentifier"],function(itemIdentifier){itemIdentifier.showFindNew(extractedName,extractedYear,"Series",ApiClient.serverId()).then(function(newItem){if(null!=newItem){currentNewItem=newItem;var seriesHtml=existingSeriesHtml;seriesHtml=seriesHtml+'<option selected value="##NEW##">'+currentNewItem.Name+"</option>",dlg.querySelector("#selectSeries").innerHTML=seriesHtml,selectedSeriesChanged(dlg)}})})}function selectedSeriesChanged(dlg){var seriesId=dlg.querySelector("#selectSeries").value;"##NEW##"==seriesId?(dlg.querySelector(".fldSelectSeriesFolder").classList.remove("hide"),dlg.querySelector("#selectSeriesFolder").setAttribute("required","required")):(dlg.querySelector(".fldSelectSeriesFolder").classList.add("hide"),dlg.querySelector("#selectSeriesFolder").removeAttribute("required"))}var extractedName,extractedYear,currentNewItem,existingSeriesHtml,seriesLocationsCount=0;return{show:function(item){return new Promise(function(resolve,reject){extractedName=null,extractedYear=null,currentNewItem=null,existingSeriesHtml=null;var xhr=new XMLHttpRequest;xhr.open("GET","components/fileorganizer/fileorganizer.template.html",!0),xhr.onload=function(e){var template=this.response,dlg=dialogHelper.createDialog({removeOnClose:!0,size:"small"});dlg.classList.add("ui-body-a"),dlg.classList.add("background-theme-a"),dlg.classList.add("formDialog");var html="";html+=Globalize.translateDocument(template),dlg.innerHTML=html,dlg.querySelector(".formDialogHeaderTitle").innerHTML=Globalize.translate("FileOrganizeManually"),dialogHelper.open(dlg),dlg.addEventListener("close",function(){dlg.submitted?resolve():reject()}),dlg.querySelector(".btnCancel").addEventListener("click",function(e){dialogHelper.close(dlg)}),dlg.querySelector("form").addEventListener("submit",function(e){return submitEpisodeForm(dlg),e.preventDefault(),!1}),dlg.querySelector("#btnNewSeries").addEventListener("click",function(e){showNewSeriesDialog(dlg)}),dlg.querySelector("#selectSeries").addEventListener("change",function(e){selectedSeriesChanged(dlg)}),initEpisodeForm(dlg,item)},xhr.send()})}}});