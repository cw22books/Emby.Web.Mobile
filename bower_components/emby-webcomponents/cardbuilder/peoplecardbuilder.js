define(["imageLoader","itemShortcuts","connectionManager","layoutManager"],function(imageLoader,itemShortcuts,connectionManager,layoutManager){function buildPeopleCardsHtml(people,options){var className="card "+(options.shape||"portrait")+"Card personCard";(options.block||options.rows)&&(className+=" block");for(var html="",itemsInRow=0,serverId=options.serverId,apiClient=connectionManager.getApiClient(serverId),i=0,length=people.length;i<length;i++){options.rows&&0==itemsInRow&&(html+='<div class="cardColumn">');var person=people[i];html+=buildPersonCard(person,apiClient,serverId,options,className),itemsInRow++,options.rows&&itemsInRow>=options.rows&&(itemsInRow=0,html+="</div>")}return html}function getImgUrl(person,maxWidth,apiClient){return person.PrimaryImageTag?apiClient.getScaledImageUrl(person.Id,{maxWidth:maxWidth,tag:person.PrimaryImageTag,type:"Primary"}):null}function buildPersonCard(person,apiClient,serverId,options,className){className+=" itemAction scalableCard personCard-scalable",className+=" "+(options.shape||"portrait")+"Card-scalable";var imgUrl=getImgUrl(person,options.width,apiClient),cardImageContainerClass="cardImageContainer";options.coverImage&&(cardImageContainerClass+=" coveredImage");var cardImageContainer=imgUrl?'<div class="'+cardImageContainerClass+' lazy" data-src="'+imgUrl+'">':'<div class="'+cardImageContainerClass+'">';imgUrl||(cardImageContainer+='<i class="md-icon cardImageIcon">person</i>');var nameHtml="";nameHtml+='<div class="cardText">'+person.Name+"</div>",nameHtml+=person.Role?'<div class="cardText cardText-secondary">as '+person.Role+"</div>":person.Type?'<div class="cardText cardText-secondary">'+Globalize.translate("core#"+person.Type)+"</div>":'<div class="cardText cardText-secondary">&nbsp;</div>';var cardBoxCssClass="visualCardBox cardBox";layoutManager.tv&&(cardBoxCssClass+=" cardBox-focustransform");var html='<button type="button" data-isfolder="'+person.IsFolder+'" data-type="'+person.Type+'" data-action="link" data-id="'+person.Id+'" data-serverid="'+serverId+'" raised class="'+className+'"> <div class="'+cardBoxCssClass+'"><div class="cardScalable visualCardBox-cardScalable"><div class="cardPadder-portrait"></div><div class="cardContent">'+cardImageContainer+'</div></div></div><div class="cardFooter visualCardBox-cardFooter">'+nameHtml+"</div></div></button>";return html}function buildPeopleCards(items,options){if(options.parentContainer){if(!document.body.contains(options.parentContainer))return;if(!items.length)return void options.parentContainer.classList.add("hide");options.parentContainer.classList.remove("hide")}var html=buildPeopleCardsHtml(items,options);options.itemsContainer.innerHTML=html,imageLoader.lazyChildren(options.itemsContainer),itemShortcuts.off(options.itemsContainer),itemShortcuts.on(options.itemsContainer)}return{buildPeopleCards:buildPeopleCards}});