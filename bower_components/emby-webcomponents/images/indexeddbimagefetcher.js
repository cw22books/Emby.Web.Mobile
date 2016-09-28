define(["cryptojs-md5"],function(){function createObjectStore(dataBase){dataBase.createObjectStore(imagesTableName,{keyPath:"id"}),db=dataBase}function revoke(url){}function loadImage(elem,url){return"IMG"!==elem.tagName?(elem.style.backgroundImage="url('"+url+"')",revoke(url),Promise.resolve(elem)):(elem.setAttribute("src",url),revoke(url),Promise.resolve(elem))}function getCacheKey(url){var index=url.indexOf("://");return index!=-1&&(url=url.substring(index+3),index=url.indexOf("/"),index!=-1&&(url=url.substring(index+1))),CryptoJS.MD5(url).toString()}function getFromDb(key){return new Promise(function(resolve,reject){var transaction=db.transaction(imagesTableName,"read"),request=transaction.objectStore(imagesTableName).get(key);request.onsuccess=function(event){var imgFile=event.target.result,URL=window.URL||window.webkitURL,imgURL=URL.createObjectURL(imgFile);resolve(imgURL)},request.onerror=reject})}function saveImageToDb(blob,key,resolve){var transaction=db.transaction(imagesTableName,"readwrite"),URL=(transaction.objectStore(imagesTableName).put({id:key,data:blob}),window.URL||window.webkitURL),imgURL=URL.createObjectURL(blob);resolve(imgURL)}function getImageUrl(originalUrl){var key=getCacheKey(originalUrl);return getFromDb(key).catch(function(){return new Promise(function(resolve,reject){var xhr=new XMLHttpRequest;xhr.open("GET",originalUrl,!0),xhr.responseType="blob",xhr.addEventListener("load",function(){200===xhr.status?saveImageToDb(xhr.response,key,resolve):reject()},!1),xhr.onerror=reject,xhr.send()})})}var db,indexedDB=window.indexedDB||window.webkitIndexedDB||window.mozIndexedDB||window.OIndexedDB||window.msIndexedDB,dbVersion=1,imagesTableName="images",request=indexedDB.open("imagesDb2",dbVersion);return request.onupgradeneeded=function(){createObjectStore(request.result)},request.onsuccess=function(event){console.log("Success creating/accessing IndexedDB database");var localDb=request.result;if(localDb.onerror=function(event){console.log("Error creating/accessing IndexedDB database")},localDb.setVersion)if(localDb.version!=dbVersion){var setVersion=localDb.setVersion(dbVersion);setVersion.onsuccess=function(){createObjectStore(localDb)}}else db=localDb;else db=localDb},{loadImage:function(elem,url){return db?getImageUrl(url).then(function(localUrl){return loadImage(elem,localUrl)},function(){return loadImage(elem,url)}):loadImage(elem,url)}}});