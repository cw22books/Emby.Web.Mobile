define(["dialogHelper","jQuery","emby-input","emby-button","emby-collapse","paper-icon-button-light","formDialogStyle"],function(dialogHelper,$){function updateUserInfo(user,newConnectUsername,actionCallback,noActionCallback){var currentConnectUsername=user.ConnectUserName||"",enteredConnectUsername=newConnectUsername,linkUrl=ApiClient.getUrl("Users/"+user.Id+"/Connect/Link");currentConnectUsername&&!enteredConnectUsername?ApiClient.ajax({type:"DELETE",url:linkUrl}).then(function(){Dashboard.alert({message:Globalize.translate("MessageEmbyAccontRemoved"),title:Globalize.translate("HeaderEmbyAccountRemoved"),callback:actionCallback})},function(){Dashboard.alert({message:Globalize.translate("ErrorRemovingEmbyConnectAccount")})}):currentConnectUsername!=enteredConnectUsername?ApiClient.ajax({type:"POST",url:linkUrl,data:{ConnectUsername:enteredConnectUsername},dataType:"json"}).then(function(result){var msgKey=result.IsPending?"MessagePendingEmbyAccountAdded":"MessageEmbyAccountAdded";Dashboard.alert({message:Globalize.translate(msgKey),title:Globalize.translate("HeaderEmbyAccountAdded"),callback:actionCallback})},function(){showEmbyConnectErrorMessage(".")}):noActionCallback&&noActionCallback()}function showEmbyConnectErrorMessage(username){var html,text;username?(html=Globalize.translate("ErrorAddingEmbyConnectAccount1",'<a href="https://emby.media/connect" target="_blank">https://emby.media/connect</a>'),html+="<br/><br/>"+Globalize.translate("ErrorAddingEmbyConnectAccount2","apps@emby.media"),text=Globalize.translate("ErrorAddingEmbyConnectAccount1","https://emby.media/connect"),text+="\n\n"+Globalize.translate("ErrorAddingEmbyConnectAccount2","apps@emby.media")):html=text=Globalize.translate("DefaultErrorMessage"),require(["alert"],function(alert){alert({text:text,html:html})})}return{show:function(){return new Promise(function(resolve,reject){var xhr=new XMLHttpRequest;xhr.open("GET","components/guestinviter/connectlink.template.html",!0),xhr.onload=function(e){var template=this.response,dlg=dialogHelper.createDialog({removeOnClose:!0,size:"small"});dlg.classList.add("ui-body-a"),dlg.classList.add("background-theme-a"),dlg.classList.add("formDialog");var html="";html+=Globalize.translateDocument(template),dlg.innerHTML=html,dialogHelper.open(dlg),dlg.addEventListener("close",function(){dlg.submitted?resolve():reject()}),dlg.querySelector(".btnCancel").addEventListener("click",function(e){dialogHelper.close(dlg)}),dlg.querySelector("form").addEventListener("submit",function(e){return ApiClient.getCurrentUser().then(function(user){updateUserInfo(user,dlg.querySelector("#txtConnectUsername").value,function(){dialogHelper.close(dlg)},function(){dialogHelper.close(dlg)})}),e.preventDefault(),!1})},xhr.send()})}}});