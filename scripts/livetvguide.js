define(["tvguide"],function(tvguide){return function(view,params,tabContent){var guideInstance,self=this;self.renderTab=function(){guideInstance||(guideInstance=new tvguide({element:tabContent}))}}});