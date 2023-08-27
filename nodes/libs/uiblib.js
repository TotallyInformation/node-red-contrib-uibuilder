"use strict";const f=require("path"),b=require("fs-extra"),{nanoid:$}=require("nanoid");module.exports={instanceClose:function(t,r,e,n,u=null){const i=r.RED.log;i.trace(`[uibuilder:uiblib:instanceClose:${t.url}] Running instance close.`);const l=r.instances;try{if(r.deleteOnDelete[t.url]===!0){i.trace(`[uibuilder:uiblib:instanceClose] Deleting instance folder. URL: ${t.url}`),delete r.deleteOnDelete[t.url];//! TODO: Replace fs-extra
b.remove(f.join(r.rootFolder,t.url)).catch(s=>{i.error(`[uibuilder:uiblib:processClose] Deleting instance folder failed. URL=${t.url}, Error: ${s.message}`)})}delete l[t.id],t.statusDisplay.text="CLOSED",this.setNodeStatus(t),e.sendToFe({uibuilderCtrl:"shutdown"},t.url,r.ioChannels.control),e.removeNS(t)}catch(s){i.error(`[uibuilder:uiblib:instanceClose] Error in closure. Error: ${s.message}`,s)}u&&u()},getProps:function(t,r,e,n=[]){if(typeof e=="string"&&(e=[e]),!Array.isArray(e))return;let u;for(let i=0;i<e.length;i++)try{if(u=t.util.getMessageProperty(r,e[i]),typeof u<"u")break}catch{}return u||n},setNodeStatus:function(t){t.status(t.statusDisplay)},replaceTemplate:async function(t,r,e,n,u,i,l){const s={statusMessage:"Something went wrong!",status:500,json:void 0};if(r==="external"&&(!e||e.length===0)){const a=`External template selected but no template name provided. template=external, url=${t}, cmd=${n}`;return l.error(`[uibuilder:uiblib:replaceTemplate]. ${a}`),s.statusMessage=a,s.status=500,s}const c=f.join(i.rootFolder,t);if(e&&(e=e.trim()),e===void 0)throw new Error("extTemplate is undefined");if(r==="external"){const a=require("degit");i.degitEmitter=a(e,{cache:!1,force:!0,verbose:!1}),i.degitEmitter.on("info",o=>{l.trace(`[uibuilder:uiblib:replaceTemplate] Degit: '${e}' to '${c}': ${o.message}`)}),await i.degitEmitter.clone(c);const d=`Degit successfully copied template '${e}' to '${c}'.`;return l.info(`[uibuilder:uiblib:replaceTemplate] ${d} cmd=${n}`),s.statusMessage=d,s.status=200,s.json={url:t,template:r,extTemplate:e,cmd:n},s}else if(Object.prototype.hasOwnProperty.call(u,r)){const a={overwrite:!0,preserveTimestamps:!0},d=f.join(i.masterTemplateFolder,r);try{//! TODO: Replace fs-extra - https://github.com/jprichardson/node-fs-extra/blob/HEAD/docs/copy-sync.md
//! Must copy full folder - need to wait till node v16.7 - fs.cp/fs.cpSync
b.copySync(d,c,a);const o=`Successfully copied template ${r} to ${t}.`;return l.info(`[uibuilder:uiblib:replaceTemplate] ${o} cmd=replaceTemplate`),s.statusMessage=o,s.status=200,s.json={url:t,template:r,extTemplate:e,cmd:n},s}catch(o){const g=`Failed to copy template from '${d}' to '${c}'. url=${t}, cmd=${n}, ERR=${o.message}.`;return l.error(`[uibuilder:uiblib:replaceTemplate] ${g}`,o),s.statusMessage=g,s.status=500,s}}else{const a=`Template '${r}' does not exist. url=${t}, cmd=${n}.`;return l.error(`[uibuilder:uiblib:replaceTemplate] ${a}`),s.statusMessage=a,s.status=500,s}},getClientId:function(r){let e;if(r.headers.cookie){const n=r.headers.cookie.match(/uibuilder-client-id=(?<id>.{21})/);!n||!n.groups.id?e=$():e=n.groups.id}else e=$();return e}};
//# sourceMappingURL=uiblib.js.map
