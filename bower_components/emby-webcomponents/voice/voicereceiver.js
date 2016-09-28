define(["events"],function(events){function normalizeInput(text,options){if(options.requireNamedIdentifier){var srch="jarvis",index=text.toLowerCase().indexOf(srch);if(index==-1)return null;text=text.substring(index+srch.length)}return text}function listen(options){return new Promise(function(resolve,reject){cancelListener();var recognition=new(window.SpeechRecognition||window.webkitSpeechRecognition||window.mozSpeechRecognition||window.oSpeechRecognition||window.msSpeechRecognition);recognition.lang=options.lang,recognition.continuous=options.continuous||!1;var resultCount=0;recognition.onresult=function(event){if(console.log(event),event.results.length>0){var resultInput=event.results[resultCount][0].transcript||"";resultCount++,resultInput=normalizeInput(resultInput,options),resultInput&&(options.continuous?events.trigger(receiver,"input",[{text:resultInput}]):resolve(resultInput))}},recognition.onerror=function(){reject({error:event.error,message:event.message})},recognition.onnomatch=function(){reject({error:"no-match"})},currentRecognition=recognition,currentRecognition.start()})}function cancelListener(){currentRecognition&&(currentRecognition.abort(),currentRecognition=null)}var receiver={},currentRecognition=null;return receiver.listen=listen,receiver.cancel=cancelListener,receiver});