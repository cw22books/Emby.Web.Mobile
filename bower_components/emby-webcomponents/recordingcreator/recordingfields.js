define(["globalize","connectionManager","require","loading","apphost","dom","recordingHelper","events","paper-icon-button-light","emby-button"],function(globalize,connectionManager,require,loading,appHost,dom,recordingHelper,events){function getRegistration(apiClient,programId,feature){return loading.show(),apiClient.getJSON(apiClient.getUrl("LiveTv/Registration",{ProgramId:programId,Feature:feature})).then(function(result){return loading.hide(),result},function(){return loading.hide(),{TrialVersion:!0,IsValid:!0,IsRegistered:!1}})}function showConvertRecordingsUnlockMessage(context,apiClient){apiClient.getPluginSecurityInfo().then(function(regInfo){regInfo.IsMBSupporter?context.querySelector(".convertRecordingsContainer").classList.add("hide"):context.querySelector(".convertRecordingsContainer").classList.remove("hide")},function(){context.querySelector(".convertRecordingsContainer").classList.remove("hide")})}function showSeriesRecordingFields(context,programId,apiClient){getRegistration(apiClient,programId,"seriesrecordings").then(function(regInfo){regInfo.IsRegistered?(context.querySelector(".supporterContainer").classList.add("hide"),context.querySelector(".convertRecordingsContainer").classList.add("hide")):(context.querySelector(".supporterContainerText").innerHTML=globalize.translate("sharedcomponents#MessageActiveSubscriptionRequiredSeriesRecordings"),context.querySelector(".supporterContainer").classList.remove("hide"),context.querySelector(".convertRecordingsContainer").classList.add("hide"))})}function getDvrFeatureCode(){return appHost.dvrFeatureCode||"dvr"}function showSingleRecordingFields(context,programId,apiClient){getRegistration(apiClient,programId,getDvrFeatureCode()).then(function(regInfo){regInfo.IsRegistered?(context.querySelector(".supporterContainer").classList.add("hide"),showConvertRecordingsUnlockMessage(context,apiClient)):(context.querySelector(".supporterContainerText").innerHTML=globalize.translate("sharedcomponents#DvrSubscriptionRequired"),context.querySelector(".supporterContainer").classList.remove("hide"),context.querySelector(".convertRecordingsContainer").classList.add("hide"))})}function showRecordingFieldsContainer(context,programId,apiClient){getRegistration(apiClient,programId,getDvrFeatureCode()).then(function(regInfo){regInfo.IsRegistered?context.querySelector(".recordingFields").classList.remove("hide"):context.querySelector(".recordingFields").classList.add("hide")})}function loadData(parent,program,apiClient){program.IsSeries?parent.querySelector(".recordSeriesContainer").classList.remove("hide"):parent.querySelector(".recordSeriesContainer").classList.add("hide"),null!=program.SeriesTimerId?showSeriesRecordingFields(parent,program.Id,apiClient):showSingleRecordingFields(parent,program.Id,apiClient),program.SeriesTimerId?(parent.querySelector(".btnManageSeriesRecording").classList.remove("visibilityHide"),parent.querySelector(".seriesRecordingButton .recordingIcon").classList.add("recordingIcon-active"),parent.querySelector(".seriesRecordingButton .buttonText").innerHTML=globalize.translate("sharedcomponents#CancelSeries")):(parent.querySelector(".btnManageSeriesRecording").classList.add("visibilityHide"),parent.querySelector(".seriesRecordingButton .recordingIcon").classList.remove("recordingIcon-active"),parent.querySelector(".seriesRecordingButton .buttonText").innerHTML=globalize.translate("sharedcomponents#RecordSeries")),program.TimerId?(parent.querySelector(".btnManageRecording").classList.remove("visibilityHide"),parent.querySelector(".singleRecordingButton .recordingIcon").classList.add("recordingIcon-active"),parent.querySelector(".singleRecordingButton .buttonText").innerHTML=globalize.translate("sharedcomponents#DoNotRecord")):(parent.querySelector(".btnManageRecording").classList.add("visibilityHide"),parent.querySelector(".singleRecordingButton .recordingIcon").classList.remove("recordingIcon-active"),parent.querySelector(".singleRecordingButton .buttonText").innerHTML=globalize.translate("sharedcomponents#Record"))}function fetchData(instance){var options=instance.options,apiClient=connectionManager.getApiClient(options.serverId);return showRecordingFieldsContainer(options.parent,options.programId,apiClient),apiClient.getLiveTvProgram(options.programId,apiClient.getCurrentUserId()).then(function(program){instance.TimerId=program.TimerId,instance.SeriesTimerId=program.SeriesTimerId,loadData(options.parent,program,apiClient)})}function recordingEditor(options){this.options=options,this.embed()}function onSupporterButtonClick(){appHost.supports("externalpremium")&&shell.openUrl("https://emby.media/premiere")}function onManageRecordingClick(e){var options=this.options;if(this.TimerId){var self=this;require(["recordingEditor"],function(recordingEditor){recordingEditor.show(self.TimerId,options.serverId,{enableCancel:!1}).then(function(){self.changed=!0})})}}function onManageSeriesRecordingClick(e){var options=this.options;if(this.SeriesTimerId){var self=this;require(["seriesRecordingEditor"],function(seriesRecordingEditor){seriesRecordingEditor.show(self.SeriesTimerId,options.serverId,{enableCancel:!1}).then(function(){self.changed=!0})})}}function onRecordChange(e){this.changed=!0;var self=this,options=this.options,apiClient=connectionManager.getApiClient(options.serverId),button=dom.parentWithTag(e.target,"BUTTON"),isChecked=!button.querySelector("i").classList.contains("recordingIcon-active");isChecked?this.TimerId||(loading.show(),recordingHelper.createRecording(apiClient,options.programId,!1).then(function(){events.trigger(self,"recordingchanged"),fetchData(self),loading.hide()})):this.TimerId&&(loading.show(),recordingHelper.cancelTimer(apiClient,this.TimerId,!0).then(function(){events.trigger(self,"recordingchanged"),fetchData(self),loading.hide()}))}function sendToast(msg){require(["toast"],function(toast){toast(msg)})}function onRecordSeriesChange(e){this.changed=!0;var self=this,options=this.options,apiClient=connectionManager.getApiClient(options.serverId),button=dom.parentWithTag(e.target,"BUTTON"),isChecked=!button.querySelector("i").classList.contains("recordingIcon-active");if(isChecked){if(showSeriesRecordingFields(options.parent,options.programId,apiClient),!this.SeriesTimerId){var promise=this.TimerId?recordingHelper.changeRecordingToSeries(apiClient,this.TimerId,options.programId):recordingHelper.createRecording(apiClient,options.programId,!0);promise.then(function(){fetchData(self)})}}else showSingleRecordingFields(options.parent,options.programId,apiClient),this.SeriesTimerId&&apiClient.cancelLiveTvSeriesTimer(this.SeriesTimerId).then(function(){sendToast(globalize.translate("sharedcomponents#RecordingCancelled")),fetchData(self)})}return recordingEditor.prototype.embed=function(){var self=this;return new Promise(function(resolve,reject){require(["text!./recordingfields.template.html"],function(template){var options=self.options,context=options.parent;context.innerHTML=globalize.translateDocument(template,"sharedcomponents");for(var supporterButtons=context.querySelectorAll(".btnSupporter"),i=0,length=supporterButtons.length;i<length;i++)appHost.supports("externalpremium")?supporterButtons[i].classList.remove("hide"):supporterButtons[i].classList.add("hide"),supporterButtons[i].addEventListener("click",onSupporterButtonClick);context.querySelector(".singleRecordingButton").addEventListener("click",onRecordChange.bind(self)),context.querySelector(".seriesRecordingButton").addEventListener("click",onRecordSeriesChange.bind(self)),context.querySelector(".btnManageRecording").addEventListener("click",onManageRecordingClick.bind(self)),context.querySelector(".btnManageSeriesRecording").addEventListener("click",onManageSeriesRecordingClick.bind(self)),fetchData(self).then(resolve)})})},recordingEditor.prototype.hasChanged=function(){return this.changed},recordingEditor.prototype.refresh=function(){fetchData(this)},recordingEditor.prototype.destroy=function(){},recordingEditor});