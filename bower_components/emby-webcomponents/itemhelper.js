define(["apphost"],function(appHost){function getDisplayName(item,options){if(!item)throw new Error("null item passed into getDisplayName");options=options||{};var name=("Program"==item.Type&&item.IsSeries?item.EpisodeTitle:item.Name)||"";if("TvChannel"==item.Type)return item.Number?item.Number+" "+name:name;if("Episode"==item.Type&&0==item.ParentIndexNumber)name=Globalize.translate("sharedcomponents#ValueSpecialEpisodeName",name);else if(("Episode"==item.Type||"Program"==item.Type)&&null!=item.IndexNumber&&null!=item.ParentIndexNumber){var displayIndexNumber=item.IndexNumber,number="E"+displayIndexNumber;options.includeParentInfo!==!1&&(number="S"+item.ParentIndexNumber+", "+number),item.IndexNumberEnd&&(displayIndexNumber=item.IndexNumberEnd,number+="-"+displayIndexNumber),name=name?number+" - "+name:number}return name}function supportsAddingToCollection(item){if("Timer"==item.Type)return!1;var invalidTypes=["Person","Genre","MusicGenre","Studio","GameGenre","BoxSet","Playlist","UserView","CollectionFolder","Audio","TvChannel","Program","MusicAlbum","Timer"];return!item.CollectionType&&invalidTypes.indexOf(item.Type)==-1&&"Photo"!=item.MediaType}function supportsAddingToPlaylist(item){return"Program"!=item.Type&&("Timer"!=item.Type&&(item.RunTimeTicks||item.IsFolder||"Genre"==item.Type||"MusicGenre"==item.Type||"MusicArtist"==item.Type))}function canEdit(user,itemType){return"UserRootFolder"!=itemType&&"UserView"!=itemType&&("Program"!=itemType&&!!user.Policy.IsAdministrator)}return{getDisplayName:getDisplayName,supportsAddingToCollection:supportsAddingToCollection,supportsAddingToPlaylist:supportsAddingToPlaylist,canIdentify:function(user,itemType){return!("Movie"!=itemType&&"Trailer"!=itemType&&"Series"!=itemType&&"Game"!=itemType&&"BoxSet"!=itemType&&"Person"!=itemType&&"Book"!=itemType&&"MusicAlbum"!=itemType&&"MusicArtist"!=itemType||!user.Policy.IsAdministrator)},canEdit:canEdit,canEditImages:function(user,itemType){return"UserView"==itemType?!!user.Policy.IsAdministrator:"Timer"!=itemType&&canEdit(user,itemType)},canSync:function(user,item){return!(user&&!user.Policy.EnableSync)&&item.SupportsSync},canShare:function(user,item){return"Timer"!=item.Type&&(user.Policy.EnablePublicSharing&&appHost.supports("sharing"))}}});