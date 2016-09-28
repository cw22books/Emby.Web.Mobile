define(["datetime","imageLoader","connectionManager","itemHelper","mediaInfo","focusManager","indicators","globalize","layoutManager","apphost","dom","emby-button","css!./card","paper-icon-button-light","clearButtonStyle"],function(datetime,imageLoader,connectionManager,itemHelper,mediaInfo,focusManager,indicators,globalize,layoutManager,appHost,dom){function htmlEncode(value){return value.replace(/&/g,"&amp;").replace(SURROGATE_PAIR_REGEXP,function(value){var hi=value.charCodeAt(0),low=value.charCodeAt(1);return"&#"+(1024*(hi-55296)+(low-56320)+65536)+";"}).replace(NON_ALPHANUMERIC_REGEXP,function(value){return"&#"+value.charCodeAt(0)+";"}).replace(/</g,"&lt;").replace(/>/g,"&gt;")}function getCardsHtml(items,options){var apiClient=connectionManager.currentApiClient();1==arguments.length&&(options=arguments[0],items=options.items);var html=buildCardsHtmlInternal(items,apiClient,options);return html}function getPostersPerRow(shape,screenWidth){switch(shape){case"portrait":return screenWidth>=2200?10:screenWidth>=2100?9:screenWidth>=1600?8:screenWidth>=1400?7:screenWidth>=1200?6:screenWidth>=800?5:screenWidth>=640?4:3;case"square":return screenWidth>=2100?9:screenWidth>=1800?8:screenWidth>=1400?7:screenWidth>=1200?6:screenWidth>=900?5:screenWidth>=700?4:screenWidth>=500?3:2;case"banner":return screenWidth>=2200?4:screenWidth>=1200?3:screenWidth>=800?2:1;case"backdrop":return screenWidth>=2500?6:screenWidth>=2100?5:screenWidth>=1200?4:screenWidth>=770?3:screenWidth>=420?2:1;case"smallBackdrop":return screenWidth>=1440?8:screenWidth>=1100?6:screenWidth>=800?5:screenWidth>=600?4:screenWidth>=540?3:screenWidth>=420?2:1;case"overflowPortrait":return screenWidth>=1e3?100/23:screenWidth>=640?100/36:2.5;case"overflowSquare":return screenWidth>=1e3?100/22:screenWidth>=640?100/30:100/42;case"overflowBackdrop":return screenWidth>=1e3?2.5:screenWidth>=640?100/60:100/84;default:return 4}}function isResizable(windowWidth){var screen=window.screen;if(screen){var screenWidth=screen.availWidth;if(screenWidth-windowWidth>20)return!0}return!1}function getImageWidth(shape){var screenWidth=dom.getWindowSize().innerWidth;if(isResizable(screenWidth)){var roundScreenTo=100;screenWidth=Math.ceil(screenWidth/roundScreenTo)*roundScreenTo}window.screen&&(screenWidth=Math.min(screenWidth,screen.availWidth||screenWidth));var imagesPerRow=getPostersPerRow(shape,screenWidth),shapeWidth=screenWidth/imagesPerRow;return Math.round(shapeWidth)}function setCardData(items,options){options.shape=options.shape||"auto";var primaryImageAspectRatio=imageLoader.getPrimaryImageAspectRatio(items),isThumbAspectRatio=primaryImageAspectRatio&&Math.abs(primaryImageAspectRatio-1.777777778)<.3,isSquareAspectRatio=primaryImageAspectRatio&&Math.abs(primaryImageAspectRatio-1)<.33||primaryImageAspectRatio&&Math.abs(primaryImageAspectRatio-1.3333334)<.01;"auto"!=options.shape&&"autohome"!=options.shape&&"autooverflow"!=options.shape&&"autoVertical"!=options.shape||(options.preferThumb===!0||isThumbAspectRatio?options.shape="autooverflow"==options.shape?"overflowBackdrop":"backdrop":isSquareAspectRatio?(options.coverImage=!0,options.shape="autooverflow"==options.shape?"overflowSquare":"square"):primaryImageAspectRatio&&primaryImageAspectRatio>1.9?(options.shape="banner",options.coverImage=!0):primaryImageAspectRatio&&Math.abs(primaryImageAspectRatio-.6666667)<.2?options.shape="autooverflow"==options.shape?"overflowPortrait":"portrait":options.shape=options.defaultShape||("autooverflow"==options.shape?"overflowSquare":"square")),"auto"==options.preferThumb&&(options.preferThumb="backdrop"==options.shape||"overflowBackdrop"==options.shape),options.uiAspect=getDesiredAspect(options.shape),options.primaryImageAspectRatio=primaryImageAspectRatio,!options.width&&options.widths&&(options.width=options.widths[options.shape]),options.rows&&"number"!=typeof options.rows&&(options.rows=options.rows[options.shape]),layoutManager.tv&&("backdrop"==options.shape?options.width=options.width||500:"portrait"==options.shape?options.width=options.width||243:"square"==options.shape&&(options.width=options.width||243)),options.width=options.width||getImageWidth(options.shape)}function buildCardsHtmlInternal(items,apiClient,options){var isVertical;if("autoVertical"==options.shape&&(isVertical=!0),setCardData(items,options),"Genres"==options.indexBy)return buildCardsByGenreHtmlInternal(items,apiClient,options);var className="card";options.shape&&(className+=" "+options.shape+"Card");for(var currentIndexValue,hasOpenRow,hasOpenSection,html="",itemsInRow=0,sectionTitleTagName=options.sectionTitleTagName||"div",i=0,length=items.length;i<length;i++){var item=items[i];if(options.indexBy){var newIndexValue="";if("PremiereDate"==options.indexBy){if(item.PremiereDate)try{newIndexValue=datetime.toLocaleDateString(datetime.parseISO8601Date(item.PremiereDate),{weekday:"long",month:"long",day:"numeric"})}catch(err){}}else"Genres"==options.indexBy?newIndexValue=item.Name:"ProductionYear"==options.indexBy?newIndexValue=item.ProductionYear:"CommunityRating"==options.indexBy&&(newIndexValue=item.CommunityRating?Math.floor(item.CommunityRating)+(item.CommunityRating%1>=.5?.5:0)+"+":null);newIndexValue!=currentIndexValue&&(hasOpenRow&&(html+="</div>",hasOpenRow=!1,itemsInRow=0),hasOpenSection&&(html+="</div>",isVertical&&(html+="</div>"),hasOpenSection=!1),html+=isVertical?'<div class="verticalSection">':'<div class="horizontalSection">',html+="<"+sectionTitleTagName+' class="sectionTitle">'+newIndexValue+"</"+sectionTitleTagName+">",isVertical&&(html+='<div class="itemsContainer vertical-wrap">'),currentIndexValue=newIndexValue,hasOpenSection=!0)}options.rows&&0==itemsInRow&&(hasOpenRow&&(html+="</div>",hasOpenRow=!1),html+='<div class="cardColumn">',hasOpenRow=!0);var cardClass=className;html+=buildCard(i,item,apiClient,options,cardClass),itemsInRow++,options.rows&&itemsInRow>=options.rows&&(html+="</div>",hasOpenRow=!1,itemsInRow=0)}return hasOpenRow&&(html+="</div>"),hasOpenSection&&(html+="</div>",isVertical&&(html+="</div>")),html}function buildCardsByGenreHtmlInternal(items,apiClient,options){var className="card";options.shape&&(className+=" "+options.shape+"Card");for(var html="",loopItems=options.genres,i=0,length=loopItems.length;i<length;i++){var item=loopItems[i],genreLower=item.Name.toLowerCase(),renderItems=items.filter(function(currentItem){return currentItem.Genres.filter(function(g){return g.toLowerCase()==genreLower}).length>0});if(renderItems.length){html+='<div class="horizontalSection focuscontainer-down">',html+='<div class="sectionTitle">'+item.Name+"</div>";var showMoreButton=!1;renderItems.length>options.indexLimit&&(renderItems.length=Math.min(renderItems.length,options.indexLimit),showMoreButton=!0);var itemsInRow=0,hasOpenRow=!1;html+=renderItems.map(function(renderItem){var currentItemHtml="";options.rows&&0==itemsInRow&&(hasOpenRow&&(currentItemHtml+="</div>",hasOpenRow=!1),currentItemHtml+='<div class="cardColumn">',hasOpenRow=!0);var cardClass=className;return currentItemHtml+=buildCard(i,renderItem,apiClient,options,cardClass),itemsInRow++,options.rows&&itemsInRow>=options.rows&&(currentItemHtml+="</div>",hasOpenRow=!1,itemsInRow=0),currentItemHtml}).join(""),showMoreButton&&(html+='<div class="listItemsMoreButtonContainer">',html+='<button is="emby-button" class="listItemsMoreButton raised" data-parentid="'+options.parentId+'" data-indextype="Genres" data-indexvalue="'+item.Id+'">'+globalize.translate("sharedcomponents#More")+"</button>",html+="</div>"),html+="</div>",html+="</div>"}}return html}function getDesiredAspect(shape){if(shape){if(shape=shape.toLowerCase(),shape.indexOf("portrait")!=-1)return 2/3;if(shape.indexOf("backdrop")!=-1)return 16/9;if(shape.indexOf("square")!=-1)return 1}return null}function getCardImageUrl(item,apiClient,options){var imageItem=item.ProgramInfo||item;item=imageItem;var width=options.width,height=null,primaryImageAspectRatio=imageLoader.getPrimaryImageAspectRatio([item]),forceName=!1,imgUrl=null,coverImage=!1;if(options.preferThumb&&item.ImageTags&&item.ImageTags.Thumb)imgUrl=apiClient.getScaledImageUrl(item.Id,{type:"Thumb",maxWidth:width,tag:item.ImageTags.Thumb});else if(options.preferBanner&&item.ImageTags&&item.ImageTags.Banner)imgUrl=apiClient.getScaledImageUrl(item.Id,{type:"Banner",maxWidth:width,tag:item.ImageTags.Banner});else if(options.preferThumb&&item.SeriesThumbImageTag&&options.inheritThumb!==!1)imgUrl=apiClient.getScaledImageUrl(item.SeriesId,{type:"Thumb",maxWidth:width,tag:item.SeriesThumbImageTag});else if(options.preferThumb&&item.ParentThumbItemId&&options.inheritThumb!==!1)imgUrl=apiClient.getScaledImageUrl(item.ParentThumbItemId,{type:"Thumb",maxWidth:width,tag:item.ParentThumbImageTag});else if(options.preferThumb&&item.BackdropImageTags&&item.BackdropImageTags.length)imgUrl=apiClient.getScaledImageUrl(item.Id,{type:"Backdrop",maxWidth:width,tag:item.BackdropImageTags[0]}),forceName=!0;else if(item.ImageTags&&item.ImageTags.Primary){if(height=width&&primaryImageAspectRatio?Math.round(width/primaryImageAspectRatio):null,imgUrl=apiClient.getScaledImageUrl(item.Id,{type:"Primary",maxHeight:height,maxWidth:width,tag:item.ImageTags.Primary}),options.preferThumb&&options.showTitle!==!1&&(forceName=!0),primaryImageAspectRatio){var uiAspect=getDesiredAspect(options.shape);uiAspect&&(coverImage=Math.abs(primaryImageAspectRatio-uiAspect)<=.2)}}else if(item.PrimaryImageTag){if(height=width&&primaryImageAspectRatio?Math.round(width/primaryImageAspectRatio):null,imgUrl=apiClient.getScaledImageUrl(item.Id||item.ItemId,{type:"Primary",maxHeight:height,maxWidth:width,tag:item.PrimaryImageTag}),options.preferThumb&&options.showTitle!==!1&&(forceName=!0),primaryImageAspectRatio){var uiAspect=getDesiredAspect(options.shape);uiAspect&&(coverImage=Math.abs(primaryImageAspectRatio-uiAspect)<=.2)}}else if(item.ParentPrimaryImageTag)imgUrl=apiClient.getScaledImageUrl(item.ParentPrimaryImageItemId,{type:"Primary",maxWidth:width,tag:item.ParentPrimaryImageTag});else if(item.AlbumId&&item.AlbumPrimaryImageTag){if(width=primaryImageAspectRatio?Math.round(height*primaryImageAspectRatio):null,imgUrl=apiClient.getScaledImageUrl(item.AlbumId,{type:"Primary",maxHeight:height,maxWidth:width,tag:item.AlbumPrimaryImageTag}),primaryImageAspectRatio){var uiAspect=getDesiredAspect(options.shape);uiAspect&&(coverImage=Math.abs(primaryImageAspectRatio-uiAspect)<=.2)}}else"Season"==item.Type&&item.ImageTags&&item.ImageTags.Thumb?imgUrl=apiClient.getScaledImageUrl(item.Id,{type:"Thumb",maxWidth:width,tag:item.ImageTags.Thumb}):item.BackdropImageTags&&item.BackdropImageTags.length?imgUrl=apiClient.getScaledImageUrl(item.Id,{type:"Backdrop",maxWidth:width,tag:item.BackdropImageTags[0]}):item.ImageTags&&item.ImageTags.Thumb?imgUrl=apiClient.getScaledImageUrl(item.Id,{type:"Thumb",maxWidth:width,tag:item.ImageTags.Thumb}):item.SeriesThumbImageTag&&options.inheritThumb!==!1?imgUrl=apiClient.getScaledImageUrl(item.SeriesId,{type:"Thumb",maxWidth:width,tag:item.SeriesThumbImageTag}):item.ParentThumbItemId&&options.inheritThumb!==!1&&(imgUrl=apiClient.getScaledImageUrl(item.ParentThumbItemId,{type:"Thumb",maxWidth:width,tag:item.ParentThumbImageTag}));return{imgUrl:imgUrl,forceName:forceName,coverImage:coverImage}}function getRandomInt(min,max){return Math.floor(Math.random()*(max-min+1))+min}function getDefaultColorIndex(str){if(str){for(var charIndex=Math.floor(str.length/2),character=String(str.substr(charIndex,1).charCodeAt()),sum=0,i=0;i<character.length;i++)sum+=parseInt(character.charAt(i));var index=String(sum).substr(-1);return index%numRandomColors+1}return getRandomInt(1,numRandomColors)}function getDefaultColorClass(str){return"defaultCardColor"+getDefaultColorIndex(str)}function getCardTextLines(lines,cssClass,forceLines,isOuterFooter,cardLayout){var i,length,html="",valid=0;for(i=0,length=lines.length;i<length;i++){var text=lines[i];1==i&&isOuterFooter&&(cssClass+=" cardText-secondary"),isOuterFooter&&cardLayout&&(cssClass+=" cardText-rightmargin"),text&&(html+="<div class='"+cssClass+"'>",html+=text,html+="</div>",valid++)}if(forceLines)for(;valid<length;)html+="<div class='"+cssClass+"'>&nbsp;</div>",valid++;return html}function getCardFooterText(item,apiClient,options,showTitle,forceName,overlayText,imgUrl,footerClass,progressHtml,isOuterFooter){var html="",showOtherText=isOuterFooter?!overlayText:overlayText;if(isOuterFooter&&options.cardLayout&&!layoutManager.tv)if("logo"==options.cardFooterAside);else if("none"!=options.cardFooterAside){var moreIcon="dots-horiz"==appHost.moreIcon?"&#xE5D3;":"&#xE5D4;";html+='<button is="paper-icon-button-light" class="itemAction btnCardOptions autoSize" data-action="menu"><i class="md-icon">'+moreIcon+"</i></button>"}var cssClass=options.centerText&&!options.cardLayout?"cardText cardTextCentered":"cardText",lines=[];if(showOtherText){var parentTitleUnderneath="MusicAlbum"==item.Type||"Audio"==item.Type||"MusicVideo"==item.Type;if((options.showParentTitle||options.showParentTitleOrTitle)&&!parentTitleUnderneath)if(isOuterFooter&&"Episode"==item.Type&&item.SeriesName&&item.SeriesId)lines.push(getTextActionButton({Id:item.SeriesId,Name:item.SeriesName,Type:"Series",IsFolder:!0}));else{var parentTitle=item.EpisodeTitle?item.Name:item.SeriesName||item.Album||item.AlbumArtist||item.GameSystem||"";(parentTitle||options.showParentTitle)&&lines.push(parentTitle)}}if(showTitle||forceName||options.showParentTitleOrTitle&&!lines.length){var name="auto"!=options.showTitle||item.IsFolder||"Photo"!=item.MediaType?itemHelper.getDisplayName(item):"";lines.push(htmlEncode(name))}if(showOtherText){if(options.showParentTitle&&parentTitleUnderneath&&(isOuterFooter&&item.AlbumArtists&&item.AlbumArtists.length?(item.AlbumArtists[0].Type="MusicArtist",item.AlbumArtists[0].IsFolder=!0,lines.push(getTextActionButton(item.AlbumArtists[0]))):lines.push(item.EpisodeTitle?item.Name:item.SeriesName||item.Album||item.AlbumArtist||item.GameSystem||"")),options.showItemCounts){var itemCountHtml=getItemCountsHtml(options,item);lines.push(itemCountHtml)}if(options.textLines)for(var additionalLines=options.textLines(item),i=0,length=additionalLines.length;i<length;i++)lines.push(additionalLines[i]);if(options.showSongCount){var songLine="";item.SongCount&&(songLine=1==item.SongCount?globalize.translate("sharedcomponents#ValueOneSong"):globalize.translate("sharedcomponents#ValueSongCount",item.SongCount)),lines.push(songLine)}if(options.showPremiereDate)if(item.PremiereDate)try{lines.push(getPremiereDateText(item))}catch(err){lines.push("")}else lines.push("");if(options.showYear&&lines.push(item.ProductionYear||""),options.showRuntime&&(item.RunTimeTicks?lines.push(datetime.getDisplayRunningTime(item.RunTimeTicks)):lines.push("")),options.showChannelName&&lines.push(item.ChannelName||""),options.showAirTime){var airTimeText;if(item.StartDate)try{var date=datetime.parseISO8601Date(item.StartDate);airTimeText=datetime.toLocaleDateString(date,{weekday:"short",month:"short",day:"numeric"}),airTimeText+=" "+datetime.getDisplayTime(date),item.EndDate&&(date=datetime.parseISO8601Date(item.EndDate),airTimeText+=" - "+datetime.getDisplayTime(date))}catch(e){console.log("Error parsing date: "+item.PremiereDate)}lines.push(airTimeText||"")}if(options.showCurrentProgram&&"TvChannel"==item.Type&&(item.CurrentProgram?lines.push(item.CurrentProgram.Name):lines.push("")),options.showSeriesYear&&("Continuing"==item.Status?lines.push(globalize.translate("sharedcomponents#SeriesYearToPresent",item.ProductionYear||"")):lines.push(item.ProductionYear||"")),options.showProgramAirInfo){var text;if(item.StartDate){var startDate=datetime.parseISO8601Date(item.StartDate,!0);text=datetime.toLocaleDateString(startDate,{weekday:"short",month:"short",day:"numeric"})+" "+datetime.getDisplayTime(startDate)}else text="";if(lines.push(text||"&nbsp;"),item.ChannelId){var channelText=item.ChannelName;lines.push(getTextActionButton({Id:item.ChannelId,Name:item.ChannelName,Type:"TvChannel",MediaType:item.MediaType,IsFolder:!1},channelText))}else lines.push(item.ChannelName||"&nbsp;")}}return(showTitle||!imgUrl)&&forceName&&overlayText&&1==lines.length&&(lines=[]),html+=getCardTextLines(lines,cssClass,!options.overlayText,isOuterFooter,options.cardLayout),progressHtml&&(html+=progressHtml),html&&(html='<div class="'+footerClass+'">'+html,html+="</div>"),html}function getTextActionButton(item,text){text||(text=itemHelper.getDisplayName(item));var html='<button data-id="'+item.Id+'" data-type="'+item.Type+'" data-mediatype="'+item.MediaType+'" data-channelid="'+item.ChannelId+'" data-isfolder="'+item.IsFolder+'" type="button" class="itemAction textActionButton" data-action="link">';return html+=text,html+="</button>"}function getItemCountsHtml(options,item){var childText,counts=[];if("Playlist"==item.Type){if(childText="",item.CumulativeRunTimeTicks){var minutes=item.CumulativeRunTimeTicks/6e8;minutes=minutes||1,childText+=globalize.translate("ValueMinutes",Math.round(minutes))}else childText+=globalize.translate("ValueMinutes",0);counts.push(childText)}else"Genre"==item.Type||"Studio"==item.Type?(item.MovieCount&&(childText=1==item.MovieCount?globalize.translate("sharedcomponents#ValueOneMovie"):globalize.translate("sharedcomponents#ValueMovieCount",item.MovieCount),counts.push(childText)),item.SeriesCount&&(childText=1==item.SeriesCount?globalize.translate("sharedcomponents#ValueOneSeries"):globalize.translate("sharedcomponents#ValueSeriesCount",item.SeriesCount),counts.push(childText)),item.EpisodeCount&&(childText=1==item.EpisodeCount?globalize.translate("sharedcomponents#ValueOneEpisode"):globalize.translate("sharedcomponents#ValueEpisodeCount",item.EpisodeCount),counts.push(childText)),item.GameCount&&(childText=1==item.GameCount?globalize.translate("sharedcomponents#ValueOneGame"):globalize.translate("sharedcomponents#ValueGameCount",item.GameCount),counts.push(childText))):"GameGenre"==item.Type?item.GameCount&&(childText=1==item.GameCount?globalize.translate("sharedcomponents#ValueOneGame"):globalize.translate("sharedcomponents#ValueGameCount",item.GameCount),counts.push(childText)):"MusicGenre"==item.Type||"MusicArtist"==options.context?(item.AlbumCount&&(childText=1==item.AlbumCount?globalize.translate("sharedcomponents#ValueOneAlbum"):globalize.translate("sharedcomponents#ValueAlbumCount",item.AlbumCount),counts.push(childText)),item.SongCount&&(childText=1==item.SongCount?globalize.translate("sharedcomponents#ValueOneSong"):globalize.translate("sharedcomponents#ValueSongCount",item.SongCount),counts.push(childText)),item.MusicVideoCount&&(childText=1==item.MusicVideoCount?globalize.translate("sharedcomponents#ValueOneMusicVideo"):globalize.translate("sharedcomponents#ValueMusicVideoCount",item.MusicVideoCount),counts.push(childText))):"Series"==item.Type&&(childText=1==item.RecursiveItemCount?globalize.translate("sharedcomponents#ValueOneEpisode"):globalize.translate("sharedcomponents#ValueEpisodeCount",item.RecursiveItemCount),counts.push(childText));return counts.join(", ")}function buildCard(index,item,apiClient,options,className){var action=options.action||"link",scalable=options.scalable!==!1;scalable&&(className+=" scalableCard "+options.shape+"Card-scalable");var imgInfo=getCardImageUrl(item,apiClient,options),imgUrl=imgInfo.imgUrl,forceName=imgInfo.forceName||!imgUrl,showTitle="auto"==options.showTitle||(options.showTitle||"PhotoAlbum"==item.Type||"Folder"==item.Type),overlayText=options.overlayText;forceName&&!options.cardLayout&&null==overlayText&&(overlayText=!0);var cardImageContainerClass="cardImageContainer";(options.coverImage||imgInfo.coverImage)&&(cardImageContainerClass+=" coveredImage","Photo"!=item.MediaType&&"PhotoAlbum"!=item.Type&&"Folder"!=item.Type&&"Program"!=item.Type||(cardImageContainerClass+=" coveredImage-noScale")),imgUrl||(cardImageContainerClass+=" "+getDefaultColorClass(item.Name));var separateCardBox=scalable,cardBoxClass=options.cardLayout?"cardBox visualCardBox":"cardBox";cardBoxClass+=layoutManager.tv?" cardBox-focustransform":" cardBox-mobile";var footerCssClass,progressHtml=indicators.getProgressBarHtml(item),innerCardFooter="",footerOverlayed=!1;overlayText?(footerCssClass=progressHtml?"innerCardFooter fullInnerCardFooter":"innerCardFooter",innerCardFooter+=getCardFooterText(item,apiClient,options,showTitle,forceName,overlayText,imgUrl,footerCssClass,progressHtml,!1),footerOverlayed=!0):progressHtml&&(innerCardFooter+='<div class="innerCardFooter fullInnerCardFooter innerCardFooterClear">',innerCardFooter+=progressHtml,innerCardFooter+="</div>",progressHtml="");var mediaSourceCount=item.MediaSourceCount||1;mediaSourceCount>1&&(innerCardFooter+='<div class="mediaSourceIndicator">'+mediaSourceCount+"</div>");var outerCardFooter="";overlayText||footerOverlayed||(footerCssClass=options.cardLayout?"cardFooter visualCardBox-cardFooter":"cardFooter transparent",outerCardFooter=getCardFooterText(item,apiClient,options,showTitle,forceName,overlayText,imgUrl,footerCssClass,progressHtml,!0)),outerCardFooter&&!options.cardLayout&&options.allowBottomPadding!==!1&&(cardBoxClass+=" cardBox-bottompadded"),separateCardBox||(cardImageContainerClass+=" "+cardBoxClass);var overlayButtons="";if(!layoutManager.tv){var overlayPlayButton=options.overlayPlayButton;if(null!=overlayPlayButton||options.overlayMoreButton||options.cardLayout||(overlayPlayButton="Video"==item.MediaType),!overlayPlayButton||item.IsPlaceHolder||"Virtual"==item.LocationType&&item.MediaType&&"Program"!=item.Type||"Person"==item.Type||"Full"!=item.PlayAccess||(overlayButtons+='<button is="paper-icon-button-light" class="cardOverlayButton itemAction autoSize" data-action="playmenu" onclick="return false;"><i class="md-icon">play_arrow</i></button>'),options.overlayMoreButton){var moreIcon="dots-horiz"==appHost.moreIcon?"&#xE5D3;":"&#xE5D4;";overlayButtons+='<button is="paper-icon-button-light" class="cardOverlayButton itemAction autoSize" data-action="menu" onclick="return false;"><i class="md-icon">'+moreIcon+"</i></button>"}}options.showChildCountIndicator&&item.ChildCount&&(className+=" groupedCard");var cardImageContainerOpen,cardImageContainerClose="",cardBoxClose="",cardContentClose="",cardScalableClose="";if(separateCardBox){var cardContentOpen;layoutManager.tv?(cardContentOpen='<div class="cardContent">',cardContentClose="</div>"):(cardContentOpen='<button type="button" class="clearButton cardContent itemAction" data-action="'+action+'">',cardContentClose="</button>"),cardImageContainerOpen=imgUrl?'<div class="'+cardImageContainerClass+' lazy" data-src="'+imgUrl+'">':'<div class="'+cardImageContainerClass+'">';var cardScalableClass=options.cardLayout?"cardScalable visualCardBox-cardScalable":"cardScalable";cardImageContainerOpen='<div class="'+cardBoxClass+'"><div class="'+cardScalableClass+'"><div class="cardPadder-'+options.shape+'"></div>'+cardContentOpen+cardImageContainerOpen,cardBoxClose="</div>",cardScalableClose="</div>",cardImageContainerClose="</div>"}else overlayButtons&&!separateCardBox?(cardImageContainerClass+=" cardImageContainerClass-button",cardImageContainerOpen=imgUrl?'<button type="button" data-action="'+action+'" class="itemAction '+cardImageContainerClass+' lazy" data-src="'+imgUrl+'">':'<button type="button" data-action="'+action+'" class="itemAction '+cardImageContainerClass+'">',cardImageContainerClose="</button>",className+=" forceRelative"):(cardImageContainerOpen=imgUrl?'<div class="'+cardImageContainerClass+' lazy" data-src="'+imgUrl+'">':'<div class="'+cardImageContainerClass+'">',cardImageContainerClose="</div>");var indicatorsHtml="";if(indicatorsHtml+=indicators.getSyncIndicator(item),indicatorsHtml+=indicators.getTimerIndicator(item),indicatorsHtml+=options.showGroupCount?indicators.getChildCountIndicatorHtml(item,{minCount:1}):indicators.getPlayedIndicatorHtml(item),indicatorsHtml&&(cardImageContainerOpen+='<div class="cardIndicators '+options.shape+'CardIndicators">'+indicatorsHtml+"</div>"),!imgUrl){var defaultName="Program"==item.Type?item.Name:itemHelper.getDisplayName(item);cardImageContainerOpen+='<div class="cardText cardCenteredText">'+defaultName+"</div>"}var tagName=!layoutManager.tv&&scalable||overlayButtons?"div":"button",prefix=(item.SortName||item.Name||"")[0];prefix&&(prefix=prefix.toUpperCase());var timerAttributes="";item.TimerId&&(timerAttributes+=' data-timerid="'+item.TimerId+'"'),item.SeriesTimerId&&(timerAttributes+=' data-seriestimerid="'+item.SeriesTimerId+'"');var actionAttribute;"button"==tagName?(className+=" itemAction",actionAttribute=' data-action="'+action+'"'):actionAttribute="","MusicAlbum"!=item.Type&&"MusicArtist"!=item.Type&&"Audio"!=item.Type&&(className+=" card-withuserdata");var positionTicksData=item.UserData&&item.UserData.PlaybackPositionTicks?' data-positionticks="'+item.UserData.PlaybackPositionTicks+'"':"",collectionIdData=options.collectionId?' data-collectionid="'+options.collectionId+'"':"",playlistIdData=options.playlistId?' data-playlistid="'+options.playlistId+'"':"",mediaTypeData=item.MediaType?' data-mediatype="'+item.MediaType+'"':"",collectionTypeData=item.CollectionType?' data-collectiontype="'+item.CollectionType+'"':"",channelIdData=item.ChannelId?' data-channelid="'+item.ChannelId+'"':"",contextData=options.context?' data-context="'+options.context+'"':"";return"<"+tagName+' data-index="'+index+'"'+timerAttributes+actionAttribute+' data-isfolder="'+(item.IsFolder||!1)+'" data-serverid="'+item.ServerId+'" data-id="'+(item.Id||item.ItemId)+'" data-type="'+item.Type+'"'+mediaTypeData+collectionTypeData+channelIdData+positionTicksData+collectionIdData+playlistIdData+contextData+' data-prefix="'+prefix+'" class="'+className+'"> '+cardImageContainerOpen+innerCardFooter+cardImageContainerClose+cardContentClose+overlayButtons+cardScalableClose+outerCardFooter+cardBoxClose+"</"+tagName+">"}function buildCards(items,options){if(document.body.contains(options.itemsContainer)){if(options.parentContainer){if(!items.length)return void options.parentContainer.classList.add("hide");options.parentContainer.classList.remove("hide")}var apiClient=connectionManager.currentApiClient(),html=buildCardsHtmlInternal(items,apiClient,options);html?(options.itemsContainer.cardBuilderHtml!=html&&(options.itemsContainer.innerHTML=html,items.length<50?options.itemsContainer.cardBuilderHtml=html:options.itemsContainer.cardBuilderHtml=null),imageLoader.lazyChildren(options.itemsContainer)):(options.itemsContainer.innerHTML=html,options.itemsContainer.cardBuilderHtml=null),options.autoFocus&&focusManager.autoFocus(options.itemsContainer,!0),"Genres"==options.indexBy&&options.itemsContainer.addEventListener("click",onItemsContainerClick)}}function parentWithClass(elem,className){for(;!elem.classList||!elem.classList.contains(className);)if(elem=elem.parentNode,!elem)return null;return elem}function onItemsContainerClick(e){var listItemsMoreButton=parentWithClass(e.target,"listItemsMoreButton");if(listItemsMoreButton){var value=listItemsMoreButton.getAttribute("data-indexvalue"),parentid=listItemsMoreButton.getAttribute("data-parentid");Emby.Page.showGenre({ParentId:parentid,Id:value})}}function ensureIndicators(card,indicatorsElem){if(indicatorsElem)return indicatorsElem;if(indicatorsElem=card.querySelector(".cardIndicators"),!indicatorsElem){var cardImageContainer=card.querySelector(".cardImageContainer");indicatorsElem=document.createElement("div"),indicatorsElem.classList.add("cardIndicators"),cardImageContainer.appendChild(indicatorsElem)}return indicatorsElem}function updateUserData(card,userData){var indicatorsElem,type=card.getAttribute("data-type"),enableCountIndicator="Series"==type||"BoxSet"==type||"Season"==type;if(userData.Played){var playedIndicator=card.querySelector(".playedIndicator");playedIndicator||(playedIndicator=document.createElement("div"),playedIndicator.classList.add("playedIndicator"),indicatorsElem=ensureIndicators(card,indicatorsElem),indicatorsElem.appendChild(playedIndicator)),playedIndicator.innerHTML='<i class="md-icon">check</i>'}else{var playedIndicator=card.querySelector(".playedIndicator");playedIndicator&&playedIndicator.parentNode.removeChild(playedIndicator)}if(userData.UnplayedItemCount){var countIndicator=card.querySelector(".countIndicator");countIndicator||(countIndicator=document.createElement("div"),countIndicator.classList.add("countIndicator"),indicatorsElem=ensureIndicators(card,indicatorsElem),indicatorsElem.appendChild(countIndicator)),countIndicator.innerHTML=userData.UnplayedItemCount}else if(enableCountIndicator){var countIndicator=card.querySelector(".countIndicator");countIndicator&&countIndicator.parentNode.removeChild(countIndicator)}var progressHtml=indicators.getProgressBarHtml({Type:type,UserData:userData,MediaType:"Video"});if(progressHtml){var itemProgressBar=card.querySelector(".itemProgressBar");if(!itemProgressBar){itemProgressBar=document.createElement("div"),itemProgressBar.classList.add("itemProgressBar");var innerCardFooter=card.querySelector(".innerCardFooter");if(!innerCardFooter){innerCardFooter=document.createElement("div"),innerCardFooter.classList.add("innerCardFooter");var cardImageContainer=card.querySelector(".cardImageContainer");cardImageContainer.appendChild(innerCardFooter)}innerCardFooter.appendChild(itemProgressBar)}itemProgressBar.innerHTML=progressHtml}else{var itemProgressBar=card.querySelector(".itemProgressBar");itemProgressBar&&itemProgressBar.parentNode.removeChild(itemProgressBar)}}function onUserDataChanged(userData,scope){for(var cards=(scope||document.body).querySelectorAll('.card-withuserdata[data-id="'+userData.ItemId+'"]'),i=0,length=cards.length;i<length;i++)updateUserData(cards[i],userData)}function onTimerCreated(programId,newTimerId,itemsContainer){for(var cells=itemsContainer.querySelectorAll('.card[data-id="'+programId+'"]'),i=0,length=cells.length;i<length;i++){var cell=cells[i],icon=cell.querySelector(".timerIndicator");if(!icon){var indicatorsElem=ensureIndicators(cell);indicatorsElem.insertAdjacentHTML("beforeend",'<i class="md-icon timerIndicator indicatorIcon">&#xE061;</i>')}cell.setAttribute("data-timerid",newTimerId)}}function onTimerCancelled(id,itemsContainer){for(var cells=itemsContainer.querySelectorAll('.card[data-timerid="'+id+'"]'),i=0,length=cells.length;i<length;i++){var cell=cells[i],icon=cell.querySelector(".timerIndicator");icon&&icon.parentNode.removeChild(icon),cell.removeAttribute("data-timerid")}}function onSeriesTimerCancelled(id,itemsContainer){for(var cells=itemsContainer.querySelectorAll('.card[data-seriestimerid="'+id+'"]'),i=0,length=cells.length;i<length;i++){var cell=cells[i],icon=cell.querySelector(".timerIndicator");icon&&icon.parentNode.removeChild(icon),cell.removeAttribute("data-seriestimerid")}}var SURROGATE_PAIR_REGEXP=/[\uD800-\uDBFF][\uDC00-\uDFFF]/g,NON_ALPHANUMERIC_REGEXP=/([^\#-~| |!])/g,numRandomColors=5;return{getCardsHtml:getCardsHtml,buildCards:buildCards,onUserDataChanged:onUserDataChanged,getDefaultColorClass:getDefaultColorClass,onTimerCreated:onTimerCreated,onTimerCancelled:onTimerCancelled,onSeriesTimerCancelled:onSeriesTimerCancelled}});