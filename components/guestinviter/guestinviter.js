define(["dialogHelper","jQuery","emby-input","emby-button","emby-checkbox","paper-icon-button-light","formDialogStyle"],function(dialogHelper,$){function renderLibrarySharingList(context,result){var folderHtml="";folderHtml+=result.Items.map(function(i){var currentHtml="",isChecked=!0,checkedHtml=isChecked?' checked="checked"':"";return currentHtml+='<label><input is="emby-checkbox" class="chkShareFolder" type="checkbox" data-folderid="'+i.Id+'"'+checkedHtml+"/><span>"+i.Name+"</span></label>"}).join(""),context.querySelector(".librarySharingList").innerHTML=folderHtml}function inviteUser(dlg){Dashboard.showLoadingMsg(),ApiClient.getJSON(ApiClient.getUrl("Channels",{})).then(function(channelsResult){var shareExcludes=$(".chkShareFolder",dlg).get().filter(function(i){return i.checked}).map(function(i){return i.getAttribute("data-folderid")});ApiClient.ajax({type:"POST",url:ApiClient.getUrl("Connect/Invite"),dataType:"json",data:{ConnectUsername:dlg.querySelector("#txtConnectUsername").value,EnabledLibraries:shareExcludes.join(","),SendingUserId:Dashboard.getCurrentUserId(),EnableLiveTv:!1}}).then(function(result){dlg.submitted=!0,dialogHelper.close(dlg),Dashboard.hideLoadingMsg(),showNewUserInviteMessage(dlg,result)},function(response){Dashboard.hideLoadingMsg(),response.status?404==response.status?require(["alert"],function(alert){alert({text:Globalize.translate("GuestUserNotFound")})}):showAccountErrorMessage():require(["alert"],function(alert){alert({text:Globalize.translate("DefaultErrorMessage")})})})})}function showAccountErrorMessage(){var html=Globalize.translate("ErrorAddingGuestAccount1",'<a href="https://emby.media/connect" target="_blank">https://emby.media/connect</a>');html+="<br/><br/>"+Globalize.translate("ErrorAddingGuestAccount2","apps@emby.media");var text=Globalize.translate("ErrorAddingGuestAccount1","https://emby.media/connect");text+="\n\n"+Globalize.translate("ErrorAddingGuestAccount2","apps@emby.media"),require(["alert"],function(alert){alert({text:text,html:html})})}function showNewUserInviteMessage(page,result){if(result.IsNewUserInvitation||result.IsPending){var message=result.IsNewUserInvitation?Globalize.translate("MessageInvitationSentToNewUser",result.GuestDisplayName):Globalize.translate("MessageInvitationSentToUser",result.GuestDisplayName);require(["alert"],function(alert){alert({text:message,title:Globalize.translate("HeaderInvitationSent")})})}}return{show:function(){return new Promise(function(resolve,reject){var xhr=new XMLHttpRequest;xhr.open("GET","components/guestinviter/guestinviter.template.html",!0),xhr.onload=function(e){var template=this.response,dlg=dialogHelper.createDialog({removeOnClose:!0,size:"small"});dlg.classList.add("ui-body-a"),dlg.classList.add("background-theme-a"),dlg.classList.add("formDialog");var html="";html+=Globalize.translateDocument(template),dlg.innerHTML=html,dialogHelper.open(dlg),dlg.addEventListener("close",function(){dlg.submitted?resolve():reject()}),dlg.querySelector(".btnCancel").addEventListener("click",function(e){dialogHelper.close(dlg)}),dlg.querySelector("form").addEventListener("submit",function(e){return inviteUser(dlg),e.preventDefault(),!1}),ApiClient.getJSON(ApiClient.getUrl("Library/MediaFolders",{IsHidden:!1})).then(function(result){renderLibrarySharingList(dlg,result)})},xhr.send()})}}});