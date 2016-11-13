define(["browser"],function(browser){"use strict";function htmlMediaRenderer(options){function onEnded(){destroyCustomTrack(this),Events.trigger(self,"ended")}function onTimeUpdate(){if("video"==options.type){var timeMs=1e3*this.currentTime;timeMs+=(currentPlayOptions.startTimeTicksOffset||0)/1e4,updateSubtitleText(timeMs)}Events.trigger(self,"timeupdate")}function onVolumeChange(){Events.trigger(self,"volumechange")}function onOneAudioPlaying(e){var elem=e.target;elem.removeEventListener("playing",onOneAudioPlaying),document.querySelector(".mediaPlayerAudioContainer").classList.add("hide")}function onPlaying(){Events.trigger(self,"playing")}function onPlay(){Events.trigger(self,"play")}function onPause(){Events.trigger(self,"pause")}function onClick(){Events.trigger(self,"click")}function onDblClick(){Events.trigger(self,"dblclick")}function onError(e){destroyCustomTrack(this);var elem=e.target,errorCode=elem.error?elem.error.code:"";console.log("Media element error code: "+errorCode),Events.trigger(self,"error")}function onLoadedMetadata(e){var elem=e.target;elem.removeEventListener("loadedmetadata",onLoadedMetadata),hlsPlayer||elem.play()}function requireHlsPlayer(callback){require(["hlsjs"],function(hls){window.Hls=hls,callback()})}function onOneVideoPlaying(e){var element=e.target;element.removeEventListener("playing",onOneVideoPlaying),self.setCurrentTrackElement(subtitleTrackIndexToSetOnPlaying);var requiresNativeControls=!self.enableCustomVideoControls();if(requiresNativeControls&&element.setAttribute("controls","controls"),requiresSettingStartTimeOnStart){var startPositionInSeekParam=currentPlayOptions.startPositionInSeekParam;if(startPositionInSeekParam&&currentSrc.indexOf(".m3u8")!=-1){var delay=browser.safari?2500:0;delay?setTimeout(function(){element.currentTime=startPositionInSeekParam},delay):element.currentTime=startPositionInSeekParam}}}function createAudioElement(){var elem=document.querySelector(".mediaPlayerAudio");if(!elem){var html="",requiresControls=!MediaPlayer.canAutoPlayAudio();html+=requiresControls?'<div class="mediaPlayerAudioContainer" style="position: fixed;top: 40%;text-align: center;left: 0;right: 0;z-index:999999;"><div class="mediaPlayerAudioContainerInner">':'<div class="mediaPlayerAudioContainer hide" style="padding: 1em;background: #222;"><div class="mediaPlayerAudioContainerInner">',html+='<audio class="mediaPlayerAudio" controls>',html+="</audio></div></div>",document.body.insertAdjacentHTML("beforeend",html),elem=document.querySelector(".mediaPlayerAudio")}return elem.addEventListener("playing",onOneAudioPlaying),elem.addEventListener("timeupdate",onTimeUpdate),elem.addEventListener("ended",onEnded),elem.addEventListener("volumechange",onVolumeChange),elem.addEventListener("error",onError),elem.addEventListener("pause",onPause),elem.addEventListener("play",onPlay),elem.addEventListener("playing",onPlaying),elem}function enableHlsPlayer(src,item,mediaSource){return(!src||src.indexOf(".m3u8")!=-1)&&(!!MediaPlayer.canPlayHls()&&(null!=window.MediaSource&&((!MediaPlayer.canPlayNativeHls()||!mediaSource.RunTimeTicks)&&((!browser.edge||!browser.mobile)&&!browser.safari))))}function getCrossOriginValue(mediaSource){return"anonymous"}function createVideoElement(){var html="",requiresNativeControls=!self.enableCustomVideoControls(),poster=!browser.safari&&options.poster?' poster="'+options.poster+'"':"";html+=requiresNativeControls&&AppInfo.isNativeApp&&browser.android?'<video class="itemVideo" id="itemVideo" preload="metadata" autoplay="autoplay"'+poster+" webkit-playsinline>":requiresNativeControls?'<video class="itemVideo" id="itemVideo" preload="metadata" autoplay="autoplay"'+poster+' controls="controls" webkit-playsinline>':'<video class="itemVideo" id="itemVideo" preload="metadata" autoplay="autoplay"'+poster+" webkit-playsinline>",html+="</video>";var elem=document.querySelector("#videoPlayer #videoElement");elem.insertAdjacentHTML("afterbegin",html);var itemVideo=elem.querySelector(".itemVideo");return itemVideo.addEventListener("loadedmetadata",onLoadedMetadata),itemVideo.addEventListener("timeupdate",onTimeUpdate),itemVideo.addEventListener("ended",onEnded),itemVideo.addEventListener("volumechange",onVolumeChange),itemVideo.addEventListener("play",onPlay),itemVideo.addEventListener("pause",onPause),itemVideo.addEventListener("playing",onPlaying),itemVideo.addEventListener("click",onClick),itemVideo.addEventListener("dblclick",onDblClick),itemVideo.addEventListener("error",onError),itemVideo}function setTracks(elem,tracks){var html=tracks.map(function(t){var defaultAttribute=t.isDefault?" default":"",label=t.language||"und";return'<track id="textTrack'+t.index+'" label="'+label+'" kind="subtitles" src="'+t.url+'" srclang="'+t.language+'"'+defaultAttribute+"></track>"}).join("");elem.innerHTML=html}function enableNativeTrackSupport(track){if(browser.firefox&&(currentSrc||"").toLowerCase().indexOf(".m3u8")!=-1)return!1;if(track){var format=(track.format||"").toLowerCase();if("ssa"==format||"ass"==format)return!1}return!0}function destroyCustomTrack(videoElement,isPlaying){window.removeEventListener("resize",onVideoResize),window.removeEventListener("orientationchange",onVideoResize);var videoSubtitlesElem=document.querySelector(".videoSubtitles");if(videoSubtitlesElem&&videoSubtitlesElem.parentNode.removeChild(videoSubtitlesElem),isPlaying)for(var allTracks=videoElement.textTracks,i=0;i<allTracks.length;i++){var currentTrack=allTracks[i];currentTrack.label.indexOf("manualTrack")!=-1&&(currentTrack.mode="disabled")}customTrackIndex=-1,currentSubtitlesElement=null,currentTrackEvents=null,currentClock=null;var renderer=currentAssRenderer;renderer&&renderer.setEnabled(!1),currentAssRenderer=null}function fetchSubtitles(track){return ApiClient.ajax({url:track.url.replace(".vtt",".js"),type:"GET",dataType:"json"})}function setTrackForCustomDisplay(videoElement,track){return track?void(customTrackIndex!=track.index&&(destroyCustomTrack(videoElement,!0),customTrackIndex=track.index,renderTracksEvents(videoElement,track),lastCustomTrackMs=0)):void destroyCustomTrack(videoElement,!0)}function renderWithLibjass(videoElement,track){var rendererSettings={};require(["libjass"],function(libjass){libjass.ASS.fromUrl(track.url).then(function(ass){var clock=currentClock=new libjass.renderers.ManualClock,renderer=new libjass.renderers.WebRenderer(ass,clock,videoElement.parentNode.parentNode,rendererSettings);currentAssRenderer=renderer,renderer.addEventListener("ready",function(){try{renderer.resize(videoElement.offsetWidth,videoElement.offsetHeight,0,0),window.removeEventListener("resize",onVideoResize),window.addEventListener("resize",onVideoResize),window.removeEventListener("orientationchange",onVideoResize),window.addEventListener("orientationchange",onVideoResize)}catch(ex){}})})})}function onVideoResize(){var renderer=currentAssRenderer;if(renderer){var videoElement=mediaElement,width=videoElement.offsetWidth,height=videoElement.offsetHeight;console.log("videoElement resized: "+width+"x"+height),renderer.resize(width,height,0,0)}}function renderTracksEvents(videoElement,track){var format=(track.format||"").toLowerCase();if("ssa"==format||"ass"==format)return void renderWithLibjass(videoElement,track);for(var trackElement=null,expectedId="manualTrack"+track.index,allTracks=videoElement.textTracks,i=0;i<allTracks.length;i++){var currentTrack=allTracks[i];if(currentTrack.label==expectedId){trackElement=currentTrack;break}currentTrack.mode="disabled"}trackElement?trackElement.mode="showing":(trackElement=videoElement.addTextTrack("subtitles","manualTrack"+track.index,track.language||"und"),trackElement.label="manualTrack"+track.index,fetchSubtitles(track).then(function(data){console.log("downloaded "+data.TrackEvents.length+" track events"),data.TrackEvents.forEach(function(trackEvent){trackElement.addCue(new(window.VTTCue||window.TextTrackCue)(trackEvent.StartPositionTicks/1e7,trackEvent.EndPositionTicks/1e7,trackEvent.Text.replace(/\\N/gi,"\n")))}),trackElement.mode="showing"}))}function updateSubtitleText(timeMs){var clock=currentClock;clock&&clock.seek(timeMs/1e3);var trackEvents=currentTrackEvents;if(trackEvents){if(!currentSubtitlesElement){var videoSubtitlesElem=document.querySelector(".videoSubtitles");videoSubtitlesElem||(videoSubtitlesElem=document.createElement("div"),videoSubtitlesElem.classList.add("videoSubtitles"),videoSubtitlesElem.innerHTML='<div class="videoSubtitlesInner"></div>',document.body.appendChild(videoSubtitlesElem)),currentSubtitlesElement=videoSubtitlesElem.querySelector(".videoSubtitlesInner")}if(!(lastCustomTrackMs>0&&Math.abs(lastCustomTrackMs-timeMs)<500)){lastCustomTrackMs=(new Date).getTime();for(var positionTicks=1e4*timeMs,i=0,length=trackEvents.length;i<length;i++){var caption=trackEvents[i];if(positionTicks>=caption.StartPositionTicks&&positionTicks<=caption.EndPositionTicks)return currentSubtitlesElement.innerHTML=caption.Text,void currentSubtitlesElement.classList.remove("hide")}currentSubtitlesElement.innerHTML="",currentSubtitlesElement.classList.add("hide")}}}function replaceQueryString(url,param,value){var re=new RegExp("([?|&])"+param+"=.*?(&|$)","i");return url.match(re)?url.replace(re,"$1"+param+"="+value+"$2"):value?url.indexOf("?")==-1?url+"?"+param+"="+value:url+"&"+param+"="+value:url}var mediaElement,_currentTime,self=this;self.currentTime=function(val){if(mediaElement)return null!=val?void(mediaElement.currentTime=val/1e3):_currentTime?1e3*_currentTime:1e3*(mediaElement.currentTime||0)},self.duration=function(val){if(mediaElement){var duration=mediaElement.duration;if(duration&&!isNaN(duration)&&duration!=Number.POSITIVE_INFINITY&&duration!=Number.NEGATIVE_INFINITY)return 1e3*duration}return null},self.stop=function(){if(destroyCustomTrack(mediaElement),mediaElement&&(mediaElement.pause(),hlsPlayer)){_currentTime=mediaElement.currentTime;try{hlsPlayer.destroy()}catch(err){console.log(err)}hlsPlayer=null}},self.pause=function(){mediaElement&&mediaElement.pause()},self.unpause=function(){mediaElement&&mediaElement.play()},self.volume=function(val){if(mediaElement)return null!=val?void(mediaElement.volume=val):mediaElement.volume};var currentSrc;self.setCurrentSrc=function(streamInfo,item,mediaSource,tracks){var elem=mediaElement;if(!elem)return currentSrc=null,void(currentPlayOptions=null);if(currentPlayOptions=streamInfo,!streamInfo)return currentSrc=null,elem.src=null,elem.src="",void(browser.safari&&(elem.src="files/dummy.mp4",elem.play()));elem.crossOrigin=getCrossOriginValue(mediaSource);var val=streamInfo.url;AppInfo.isNativeApp&&browser.safari&&(val=val.replace("file://","")),requiresSettingStartTimeOnStart=!1;var startTime=streamInfo.startPositionInSeekParam,playNow=!1;if("audio"==elem.tagName.toLowerCase())elem.src=val,playNow=!0;else{elem.removeEventListener("playing",onOneVideoPlaying),elem.addEventListener("playing",onOneVideoPlaying),hlsPlayer&&(hlsPlayer.destroy(),hlsPlayer=null),startTime&&(requiresSettingStartTimeOnStart=!0),tracks=tracks||[],currentTrackList=tracks;for(var currentTrackIndex=-1,i=0,length=tracks.length;i<length;i++)if(tracks[i].isDefault){currentTrackIndex=tracks[i].index;break}subtitleTrackIndexToSetOnPlaying=currentTrackIndex,enableHlsPlayer(val,item,mediaSource)?(setTracks(elem,tracks),requireHlsPlayer(function(){var hls=new Hls;hls.loadSource(val),hls.attachMedia(elem),hls.on(Hls.Events.MANIFEST_PARSED,function(){elem.play()}),hls.on(Hls.Events.ERROR,function(event,data){if(data.fatal)switch(data.type){case Hls.ErrorTypes.NETWORK_ERROR:console.log("fatal network error encountered, try to recover"),hls.startLoad();break;case Hls.ErrorTypes.MEDIA_ERROR:console.log("fatal media error encountered, try to recover"),hls.recoverMediaError();break;default:hls.destroy()}}),hlsPlayer=hls})):(elem.src=val,elem.autoplay=!0,setTracks(elem,tracks),elem.addEventListener("loadedmetadata",onLoadedMetadata),playNow=!0),currentSrc=val,self.setCurrentTrackElement(currentTrackIndex)}currentSrc=val,playNow&&elem.play()},self.currentSrc=function(){if(mediaElement)return currentSrc},self.paused=function(){return!!mediaElement&&mediaElement.paused},self.cleanup=function(destroyRenderer){self.setCurrentSrc(null),_currentTime=null;var elem=mediaElement;elem&&("AUDIO"==elem.tagName?(elem.removeEventListener("timeupdate",onTimeUpdate),elem.removeEventListener("ended",onEnded),elem.removeEventListener("volumechange",onVolumeChange),elem.removeEventListener("playing",onOneAudioPlaying),elem.removeEventListener("play",onPlay),elem.removeEventListener("pause",onPause),elem.removeEventListener("playing",onPlaying),elem.removeEventListener("error",onError)):(elem.removeEventListener("loadedmetadata",onLoadedMetadata),elem.removeEventListener("playing",onOneVideoPlaying),elem.removeEventListener("timeupdate",onTimeUpdate),elem.removeEventListener("ended",onEnded),elem.removeEventListener("volumechange",onVolumeChange),elem.removeEventListener("play",onPlay),elem.removeEventListener("pause",onPause),elem.removeEventListener("playing",onPlaying),elem.removeEventListener("click",onClick),elem.removeEventListener("dblclick",onDblClick),elem.removeEventListener("error",onError)),"audio"!=elem.tagName.toLowerCase()&&elem.parentNode&&elem.parentNode.removeChild(elem))},self.supportsTextTracks=function(){return null==supportsTextTracks&&(supportsTextTracks=null!=document.createElement("video").textTracks),supportsTextTracks};var currentSubtitlesElement,currentTrackEvents,currentClock,currentAssRenderer,customTrackIndex=-1,lastCustomTrackMs=0;self.setCurrentTrackElement=function(streamIndex){console.log("Setting new text track index to: "+streamIndex);var track=streamIndex==-1?null:currentTrackList.filter(function(t){return t.index==streamIndex})[0];enableNativeTrackSupport(track)?setTrackForCustomDisplay(mediaElement,null):(setTrackForCustomDisplay(mediaElement,track),streamIndex=-1,track=null);for(var expectedId="textTrack"+streamIndex,trackIndex=streamIndex!=-1&&track?currentTrackList.indexOf(track):-1,modes=["disabled","showing","hidden"],allTracks=mediaElement.textTracks,i=0;i<allTracks.length;i++){var currentTrack=allTracks[i];console.log("currentTrack id: "+currentTrack.id);var mode;if(console.log("expectedId: "+expectedId+"--currentTrack.Id:"+currentTrack.id),browser.msie||browser.edge)mode=trackIndex==i?1:0;else{if(currentTrack.label.indexOf("manualTrack")!=-1)continue;mode=currentTrack.id==expectedId?1:0}console.log("Setting track "+i+" mode to: "+mode);var useNumericMode=!1;!isNaN(currentTrack.mode),useNumericMode?currentTrack.mode=mode:currentTrack.mode=modes[mode]}},self.updateTextStreamUrls=function(startPositionTicks){if(self.supportsTextTracks()){var i,allTracks=mediaElement.textTracks;for(i=0;i<allTracks.length;i++){var track=allTracks[i];try{for(;track.cues.length;)track.removeCue(track.cues[0])}catch(e){console.log("Error removing cue from textTrack")}}var trackElements=mediaElement.querySelectorAll("track");for(i=0;i<trackElements.length;i++){var trackElement=trackElements[i];trackElement.src=replaceQueryString(trackElement.src,"startPositionTicks",startPositionTicks)}}},self.enableCustomVideoControls=function(){return AppInfo.isNativeApp&&browser.safari?navigator.userAgent.toLowerCase().indexOf("ipad")==-1:self.canAutoPlayVideo()},self.canAutoPlayVideo=function(){return!!AppInfo.isNativeApp||!browser.mobile},self.init=function(){return Promise.resolve()},mediaElement="audio"==options.type?createAudioElement():createVideoElement()}var supportsTextTracks,hlsPlayer,requiresSettingStartTimeOnStart,subtitleTrackIndexToSetOnPlaying,currentTrackList,currentPlayOptions;window.AudioRenderer||(window.AudioRenderer=function(options){return options=options||{},options.type="audio",new htmlMediaRenderer(options)}),window.VideoRenderer||(window.VideoRenderer=function(options){return options=options||{},options.type="video",new htmlMediaRenderer(options)})});