"use strict";var k=Object.create;var $=Object.defineProperty;var E=Object.getOwnPropertyDescriptor;var F=Object.getOwnPropertyNames;var I=Object.getPrototypeOf,j=Object.prototype.hasOwnProperty;var C=(c,e,s,t)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of F(e))!j.call(c,r)&&r!==s&&$(c,r,{get:()=>e[r],enumerable:!(t=E(e,r))||t.enumerable});return c};var x=(c,e,s)=>(s=c!=null?k(I(c)):{},C(e||!c||!c.__esModule?$(s,"default",{value:c,enumerable:!0}):s,c));const d=require("path"),b=require("fs"),v=require("fast-glob"),D=require("serve-index"),l=require("express"),f=require("./tilib"),A=require("./uiblib"),R=require("./package-mgt.js"),P=require("./socket.js"),{mylog:O}=require("./tilib"),w="index.html";class V{#e=!1;RED;uib;log;app;server;masterStatic;instanceRouters={};routers={admin:[],user:[],instances:{},config:{}};constructor(){this.dummyMiddleware=function(e,s,t){t()}}setup(e){if(!e)throw new Error("[uibuilder:web.js:setup] Called without required uib parameter or uib is undefined.");if(e.RED===null)throw new Error("[uibuilder:web.js:setup] uib.RED is null");if(this.#e===!0){e.RED.log.warn("[uibuilder:web:setup] Setup has already been called, it cannot be called again.");return}const s=this.RED=e.RED;this.uib=e;const t=this.log=e.RED.log;t.trace("[uibuilder:web:setup] Web setup start"),s.settings.httpRoot===void 0?this.uib.httpRoot="":this.uib.httpRoot=s.settings.httpRoot,this.routers.config={httpRoot:this.uib.httpRoot,httpAdminRoot:this.RED.settings.httpAdminRoot},this.#e=!0,this._adminApiSetup(),this._setMasterStaticFolder(),this._webSetup(),t.trace("[uibuilder:web:setup] Web setup end")}_adminApiSetup(){if(this.#e!==!0){this.log.warn("[uibuilder:web.js:_adminApiSetup] Cannot run. Setup has not been called.");return}this.adminRouter=l.Router({mergeParams:!0}),this.adminRouterV3=require("./admin-api-v3")(this.uib,this.log),this.adminRouter.use("/admin",this.adminRouterV3),this.routers.admin.push({name:"Admin API v3",path:`${this.RED.settings.httpAdminRoot}uibuilder/admin`,desc:"Consolidated admin APIs used by the uibuilder Editor panel",type:"Router"});const e=d.join(__dirname,"..","..","docs");this.adminRouter.use("/docs",l.static(e,this.uib.staticOpts)),this.routers.admin.push({name:"Documentation",path:`${this.RED.settings.httpAdminRoot}uibuilder/docs`,desc:"Documentation website powered by Docsify",type:"Static",folder:e}),this.adminRouter.use("/techdocs",l.static(e,this.uib.staticOpts)),this.routers.admin.push({name:"Tech Docs",path:`${this.RED.settings.httpAdminRoot}uibuilder/techdocs`,desc:"Documentation website powered by Docsify",type:"Static",folder:e}),this.adminRouterV2=require("./admin-api-v2")(this.uib,this.log),this.routers.admin.push({name:"Admin API v2",path:`${this.RED.settings.httpAdminRoot}uibuilder/*`,desc:"Various older admin APIs used by the uibuilder Editor panel",type:"Router"}),this.RED.httpAdmin.use("/uibuilder",this.adminRouter,this.adminRouterV2)}_webSetup(){if(this.#e!==!0){this.log.warn("[uibuilder:web.js:_webSetup] Cannot run. Setup has not been called.");return}const e=this.uib,s=this.RED,t=this.log;if(t.trace("[uibuilder:web:_webSetup] Configuring ExpressJS"),e.customServer.isCustom===!0){require("dns").lookup(e.customServer.hostName,4,function(i,o){i&&t.error("[uibuilder:web.js:_websetup] DNS lookup failed.",i),e.customServer.host=o,t.trace(`[uibuilder:web:_webSetup] Using custom ExpressJS server at ${e.customServer.type}://${o}:${e.customServer.port}`)});const r=require("express");if(this.app=r(),Object.keys(e.customServer.serverOptions).forEach(i=>{this.app.set(i,e.customServer.serverOptions[i])}),e.customServer.type==="https")if(s.settings.uibuilder&&s.settings.uibuilder.https)try{this.server=require("https").createServer(s.settings.uibuilder.https,this.app)}catch(i){throw new Error(`[uibuilder:web:webSetup:CreateServer]
	 Cannot create uibuilder custom ExpressJS server.
	 Check uibuilder.https in settings.js,
	 make sure the key and cert files exist and are accessible.
	 ${i.message}
 
 `)}else if(s.settings.https!==void 0)this.server=require("https").createServer(s.settings.https,this.app);else throw new Error(`[uibuilder:web:webSetup:CreateServer]
	 Cannot create uibuilder custom ExpressJS server using NR https settings.
	 Check https property in settings.js,
	 make sure the key and cert files exist and are accessible.
 
 `);else this.server=require("http").createServer(this.app);this.server.on("error",i=>{i.code==="EADDRINUSE"?(this.server.close(),t.error(`[uibuilder:web:webSetup:CreateServer] ERROR: Port ${e.customServer.port} is already in use. Cannot create uibuilder server, use a different port number and restart Node-RED`)):t.error(`[uibuilder:web:webSetup:CreateServer] ERROR: ExpressJS error. Cannot create uibuilder server. ${i.message}`,i)}),this.server.listen(e.customServer.port,()=>{})}else t.trace(`[uibuilder:web:_webSetup] Using Node-RED ExpressJS server at ${s.settings.https?"https":"http"}://${s.settings.uiHost}:${s.settings.uiPort}${e.nodeRoot===""?"/":e.nodeRoot}`),this.app=s.httpNode,this.server=s.server;if(e.rootFolder===null)throw new Error("uib.rootFolder is null");if(e.customServer.serverOptions.views?t.trace(`[uibuilder:web:_webSetup] ExpressJS Views folder is '${e.customServer.serverOptions.views}'`):(this.app.set("views",d.join(e.rootFolder,"views")),t.trace(`[uibuilder:web:_webSetup] ExpressJS Views folder set to '${d.join(e.rootFolder,"views")}'`)),this.app.use(l.json()),this.app.use(l.urlencoded({extended:!0})),this.uibRouter=l.Router({mergeParams:!0}),this._serveUserUibIndex(),this.masterStatic!==void 0&&(this.uibRouter.use(l.static(this.masterStatic,e.staticOpts)),t.trace(`[uibuilder:web:_webSetup] Master Static Folder '${this.masterStatic}' added to uib router ('_httpNodeRoot_/uibuilder/')`)),this.serveVendorPackages(),this.serveVendorSocketIo(),this.servePing(),e.commonFolder===null)throw new Error("uib.commonFolder is null");this.uibRouter.use(f.urlJoin(e.commonFolderName),l.static(e.commonFolder,e.staticOpts)),this.routers.user.push({name:"Central Common Resources",path:`${this.uib.httpRoot}/uibuilder/${e.commonFolderName}/*`,desc:"Common resource library",type:"Static",folder:e.commonFolder}),this.app.use(f.urlJoin(e.moduleName),this.uibRouter)}_serveUserUibIndex(){this.uibRouter.get("/apps",(e,s,t)=>{let r=`
                <!doctype html><html lang="en"><head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <title>App Index</title>
                    <link rel="icon" href="../uibuilder/images/node-blue.ico">
                    <link type="text/css" rel="stylesheet" href="../uibuilder/uib-brand.min.css">
                    <style>
                        li > div {
                            border-left:5px solid var(--surface5);
                            padding-left: 5px;
                        }
                    </style>
                </head><body class="uib"><div class="container">
                    <h1>List of available apps</h1>
                    <div><ul>
            `;if(Object.keys(this.uib.instances).length===0)r+="<p>Instance list not yet ready, please try again</p>";else for(let[i,o]of Object.entries(this.uib.apps)){const a=o.title.length===0?"":`: ${o.title}`,n=o.descr.length===0?"":`<div>${o.descr}</div>`;r+=`
                        <li>
                            <a href="../${i}">${i}${a}</a>${n}
                        </li>
                    `}r+=`
                    </ul></div>
                </div></body></html>
            `,s.statusMessage="Instances listed",s.status(200).send(r)}),this.routers.user.push({name:"Endpoints",path:`${this.uib.httpRoot}/uibuilder/endpoints`,desc:"List of all uibuilder endpoints",type:"Get"})}_setMasterStaticFolder(){if(this.#e!==!0){this.log.warn("[uibuilder:web.js:_setMasterStaticFolder] Cannot run. Setup has not been called.");return}const e=this.uib,s=this.log;try{b.accessSync(d.join(e.masterStaticFeFolder,w),b.constants.R_OK),s.trace(`[uibuilder:web:setMasterStaticFolder] Using master production build folder. ${e.masterStaticFeFolder}`),this.masterStatic=e.masterStaticFeFolder}catch{throw new Error(`setMasterStaticFolder: Cannot serve master production build folder. ${e.masterStaticFeFolder}`)}}serveVendorSocketIo(){if(this.#e!==!0){this.log.warn("[uibuilder:web.js:serveVendorSocketIo] Cannot run. Setup has not been called.");return}let e=R.getPackagePath2("socket.io-client",[d.join(__dirname,"..",".."),this.uib.rootFolder,this.RED.settings.userDir]);if(e===null)try{e=d.join(d.dirname(require.resolve("socket.io-client")),"..")}catch(s){this.log.error(`[uibuilder:web:serveVendorSocketIo] Cannot find socket.io-client. ${s.message}`)}if(this.vendorRouter===void 0)throw new Error("this.vendorRouter is undefined");e!==null?(e+="/dist",this.vendorRouter.use("/socket.io-client",l.static(e,this.uib.staticOpts)),this.routers.user.push({name:"Socket.IO Client",path:`${this.uib.httpRoot}/uibuilder/vendor/socket.io-client/*`,desc:"Socket.IO Clients",type:"Static",folder:e})):this.log.error(`[uibuilder:web.js:serveVendorSocketIo] Cannot find installation of Socket.IO Client. It should be in userDir (${this.RED.settings.userDir}) but is not. Check that uibuilder is installed correctly. Run 'npm ls socket.io-client'.`)}serveVendorPackages(){if(this.#e!==!0){this.log.warn("[uibuilder:web.js:serveVendorPackages] Cannot run. Setup has not been called.");return}const e=this.log;if(this.uibRouter===void 0)throw new Error("this.uibRouter is undefined");e.trace("[uibuilder:web:serveVendorPackages] Serve Vendor Packages started");const s=R.uibPackageJson;if(s===null)throw new Error("web.js:serveVendorPackages: pj is null");if(s.dependencies===void 0)throw new Error("web.js:serveVendorPackages: pj.dependencies is undefined");this.vendorRouter=l.Router({mergeParams:!0}),this.vendorRouter.myname="uibVendorRouter",this.uibRouter.stack.some((t,r,i)=>t.regexp.toString()==="/^\\/vendor\\/?(?=\\/|$)/i"?(i.splice(r,1),!0):!1),this.routers.user.some((t,r,i)=>t.name==="Vendor Routes"?(i.splice(r,1),!0):!1),this.uibRouter.use("/vendor",this.vendorRouter),this.routers.user.push({name:"Vendor Routes",path:`${this.uib.httpRoot}/uibuilder/vendor/*`,desc:"Front-end libraries are mounted under here",type:"Router"}),e.trace(`[uibuilder:web:serveVendorPackages] Vendor Router created at '${this.uib.httpRoot}/uibuilder/vendor/*.`),Object.keys(s.dependencies).forEach(t=>{if(s.uibuilder===void 0||s.uibuilder.packages===void 0)throw new Error("web.js:serveVendorPackages: pj.uibuilder or pj.uibuilder.packages is undefined");const r=s.uibuilder.packages[t];if(this.vendorRouter===void 0)throw new Error("web.js:serveVendorPackages: this.vendorRouter is undefined");if(r.installFolder===void 0||r.packageUrl===void 0)throw new Error("web.js:serveVendorPackages: pkgDetails.installFolder or pkgDetails.packageUrl is undefined");r.missing||(this.vendorRouter.use(r.packageUrl,l.static(r.installFolder,this.uib.staticOpts)),e.trace(`[uibuilder:web:serveVendorPackages] Vendor Route added for '${t}'. Fldr: '${r.installFolder}', URL: '${this.uib.httpRoot}/uibuilder/vendor/${r.packageUrl}/'. `))}),e.trace("[uibuilder:web:serveVendorPackages] Serve Vendor Packages end")}servePing(){if(this.uibRouter===void 0)throw new Error("this.uibRouter is undefined");this.uibRouter.get("/ping",(e,s)=>{s.status(204).end()}),this.routers.user.push({name:"Ping",path:`${this.uib.httpRoot}/uibuilder/ping`,desc:"Ping/keep-alive endpoint, returns 201",type:"Endpoint"})}get isConfigured(){return this.#e}removeRouter(e){this.app._router.stack.forEach((s,t,r)=>{s.regexp.toString()===`/^\\/${e}\\/?(?=\\/|$)/i`&&r.splice(t,1)})}instanceSetup(e){if(this.uib.RED===null)throw new Error("this.uib.RED is null");this.uib.RED.log.trace(`[uibuilder:web.js:instanceSetup] Setup for URL: ${e.url}`);const s=this.uib,t=this.log;if(this.routers.instances[e.url]=[],this.removeRouter(e.url),e.commonStaticLoaded=!1,this.instanceRouters[e.url]=l.Router({mergeParams:!0}),this.routers.instances[e.url].push({name:"Instance Rooter",path:`${this.uib.httpRoot}/${e.url}/`,desc:"Other routes hang off this",type:"Router",folder:"--"}),this.addBeaconRoute(e),this.addMiddlewareFile(e),this.addMasterMiddleware(e),s.instanceApiAllowed===!0?this.addInstanceApiRouter(e):t.trace(`[uibuilder:webjs:instanceSetup] Instance API's not permitted. '${e.url}'`),this.addInstanceCustomRoutes(e),s.rootFolder===null)throw new Error("uib.rootFolder has no value");const r=s.rootFolder;if(this.instanceRouters[e.url].use((i,o,a)=>{const n=d.join(r,e.url,"views"),u=d.parse(i.path);let h=d.join(n,u.base);if(this.app.get("view engine")&&(h=d.join(n,`${u.name}.ejs`),b.existsSync(h))){try{o.render(d.join(r,e.url,"views",u.name),{_env:e.context().global.get("_env")})}catch{o.sendFile(u.base,{root:n})}return}return a()}),this.instanceRouters[e.url].use(this.setupInstanceStatic(e)),this.masterStatic!==void 0&&(this.instanceRouters[e.url].use(l.static(this.masterStatic,s.staticOpts)),this.routers.instances[e.url].push({name:"Master Code",path:`${this.uib.httpRoot}/${e.url}/`,desc:"Built-in FE code, same for all instances",type:"Static",folder:this.masterStatic})),e.showfolder===!0&&(this.instanceRouters[e.url].use("/idx",D(e.customFolder,{icons:!0,view:"details"}),l.static(e.customFolder,s.staticOpts)),this.routers.instances[e.url].push({name:"Index Lister",path:`${this.uib.httpRoot}/${e.url}/idx`,desc:"Custom pages to list server files",type:"ServeIndex",folder:e.customFolder})),s.commonFolder===null)throw new Error("uib.commonFolder is null");this.instanceRouters[e.url].use(f.urlJoin(s.commonFolderName),l.static(s.commonFolder,s.staticOpts)),this.routers.instances[e.url].push({name:"Common Code",path:`${this.uib.httpRoot}/${e.url}/common/`,desc:"Shared FE code, same for all instances",type:"Static",folder:s.commonFolder}),this.app.use(f.urlJoin(e.url),this.instanceRouters[e.url])}addMiddlewareFile(e){const s=this.uib,t=this.log;if(s.configFolder===null)throw new Error("uib.configFolder is null");const r=d.join(s.configFolder,"uibMiddleware.js");try{const i=require(r);typeof i=="function"?(this.instanceRouters[e.url].use(i),t.trace(`[uibuilder:web:addMiddlewareFile:${e.url}] uibuilder common Middleware file loaded. Path: ${r}`),this.routers.instances[e.url].push({name:"Common Middleware",path:`${this.uib.httpRoot}/${e.url}/`,desc:"Optional middleware, same for all instances",type:"Handler",folder:r})):t.trace(`[uibuilder:web:addMiddlewareFile:${e.url}] uibuilder common Middleware file not loaded, not a function. Type: ${typeof i}, Path: ${r}`)}catch(i){t.trace(`[uibuilder:web:addMiddlewareFile:${e.url}] uibuilder common Middleware file failed to load. Path: ${r}, Reason: ${i.message}`)}}addMasterMiddleware(e){const s=this.uib;let t;s.nodeRoot===""||s.nodeRoot==="/"?t=`/${e.url}/`:t=`${s.nodeRoot}${e.url}/`;const r=s.customServer.type==="https",i=this;function o(a,n,u){const h=A.getClientId(a);n.header({"X-XSS-Protection":"1;mode=block","X-Content-Type-Options":"nosniff","x-powered-by":"uibuilder","uibuilder-namespace":e.url,"uibuilder-node":e.id}).cookie("uibuilder-namespace",e.url,{path:t,sameSite:!0,expires:0,secure:r}).cookie("uibuilder-client-id",h,{path:t,sameSite:!0,expires:0,secure:r}).cookie("uibuilder-webRoot",s.nodeRoot.replace(/\//g,""),{path:t,sameSite:!0,expires:0,secure:r}),u()}this.instanceRouters[e.url].use(o),i.routers.instances[e.url].push({name:"uib Internal Middleware",path:`${i.uib.httpRoot}/${e.url}/`,desc:"Master middleware, same for all instances",type:"Handler",folder:"(internal)"})}setupInstanceStatic(e){const s=this.uib,t=this.log;let r=e.sourceFolder;if(e.sourceFolder===void 0)try{b.accessSync(d.join(e.customFolder,"dist",w),b.constants.R_OK),r="dist",t.trace(`[uibuilder:web:setupInstanceStatic:${e.url}] Using local dist folder`)}catch(o){t.trace(`[uibuilder:web:setupInstanceStatic:${e.url}] Dist folder not in use or not accessible. Using local src folder. ${o.message}`),r="src"}const i=d.join(e.customFolder,r);try{b.mkdirSync(i,{recursive:!0}),t.trace(`[uibuilder:web:setupInstanceStatic:${e.url}] Using local ${r} folder`)}catch(o){e.warn(`[uibuilder:web:setupInstanceStatic:${e.url}] Cannot create or access ${i} folder, no pages can be shown. Error: ${o.message}`)}return b.existsSync(d.join(i,w))||e.warn(`[uibuilder:web:setupInstanceStatic:${e.url}] Cannot show default page, index.html does not exist in ${i}.`),this.routers.instances[e.url].push({name:"Front-end user code",path:`${s.httpRoot}/${e.url}/`,desc:"Your own FE Code",type:"Static",folder:i}),l.static(i,s.staticOpts)}addInstanceApiRouter(e){const s=this.uib,t=this.log;v.sync(`${s.rootFolder}/${e.url}/api/*.js`).forEach(i=>{let o;try{o=require(i)}catch(u){return t.error(`[uibuilder:webjs:addInstanceApiRouter] Could not require instance API file. API not added. '${e.url}', '${i}'. ${u.message}`),!1}if(o&&typeof o=="function"){t.trace(`[uibuilder:webjs:addInstanceApiRouter] ${e.url} function api added`),this.instanceRouters[e.url].use("/api",o);return}let a;try{a=Object.keys(o)}catch(u){return t.error(`[uibuilder:webjs:addInstanceApiRouter] Could not understand API file properties - is it an object? It must be an object or a function, see the docs for details. '${e.url}', '${i}'. ${u.message}`),!1}let n;o.path?n=o.path:n="/api/*",o.apiSetup&&typeof o.apiSetup=="function"&&o.apiSetup(e,s),a.forEach(u=>{u==="path"||u==="apiSetup"||typeof o[u]=="function"&&(t.trace(`[uibuilder:webjs:addInstanceApiRouter] ${e.url} api added. ${u}, ${n}`),this.instanceRouters[e.url][u](n,o[u]))})})}showInstanceDetails(e,s){const t=this.uib,r=this.RED,i=r.settings.userDir;let o="";if(!e.headers.referer)throw new Error("req.headers.referer does not exist");const a=new URL(e.headers.referer);a.pathname="",t.customServer&&t.customServer.port&&t.customServer.port!=r.settings.uiPort&&(a.port=t.customServer.port.toString());const n=a.href,u=`${n}${t.nodeRoot.replace("/","")}${s.url}`,h=["id","type","name","wires","_wireCount","credentials","topic","url","fwdInMessages","allowScripts","allowStyles","copyIndex","showfolder","sessionLength","tokenAutoExtend","customFolder","ioClientsCount","rcvMsgCount","ioNamespace"],m=P.getNs(s.url);o+=`
            <!doctype html><html lang="en"><head>
                <title>uibuilder Instance Debug Page</title>
                <link rel="icon" href="${u}/common/images/node-blue.ico">
                <link type="text/css" rel="stylesheet" href="${u}/uib-brand.min.css" media="screen">
                <style type="text/css" rel="stylesheet" media="all">
                    h2 { border-top:1px solid silver;margin-top:1em;padding-top:0.5em; }
                    .col3i tbody>tr>:nth-child(3){ font-style:italic; }
                </style>
            </head><body class="uib"><div class="container">
                <h1>uibuilder Instance Debug Page</h1>
                <p>
                    Note that this page is only accessible to users with Node-RED admin authority.
                </p>
                <h2>Instance Information for '${s.url}'</h2>
                <table class="uib-info-tb">
                    <tbody>
                        <tr>
                            <th>The node id for this instance</th>
                            <td>${s.id}<br>
                                This can be used to search for the node in the Editor.
                            </td>
                        </tr>
                        <tr>
                            <th>Filing system path to front-end resources</th>
                            <td>${s.customFolder}<br>
                                Contains all of your UI code and other resources.
                                Folders and files can be viewed, edited, created and deleted using the "Edit Files" button.
                                You <b>MUST</b> keep at least the <code>src</code> and <code>dist</code> folders otherwise things may not work.
                            </td>
                        </tr>
                        <tr>
                            <th>URL for the front-end resources</th>
                            <td><a href="${n}${f.urlJoin(t.nodeRoot,s.url).replace("/","")}" target="_blank">.${f.urlJoin(t.nodeRoot,s.url)}/</a><br>Index.html page will be shown if you click.</td>
                        </tr>
                        <tr>
                            <th>Node-RED userDir folder</th>
                            <td>${i}<br>
                                Also the location for any installed vendor resources (installed library packages)
                                and your other nodes.
                            </td>
                        </tr>
                        <tr>
                            <th>URL for vendor resources</th>
                            <td>../uibuilder/vendor/<br>
                                See the <a href="../../uibindex" target="_blank">Detailed Information Page</a> for more details.
                            </td>
                        </tr>
                        <tr>
                            <th>Filing system path to common (shared) front-end resources</th>
                            <td>${t.commonFolder}<br>
                                Resource files in this folder are accessible from the main URL.
                            </td>
                        </tr>
                        <tr>
                            <th>Filing system path to common uibuilder configuration resource files</th>
                            <td>${t.configFolder}<br>
                                Contains the package list, master package list, authentication and authorisation middleware.
                            </td>
                        </tr>
                        <tr>
                            <th>Filing system path to uibuilder master template files</th>
                            <td>${t.masterTemplateFolder}<br>
                                These are copied to any new instance of the uibuilder node.
                                If you keep the copy flag turned on they are re-copied if deleted.
                            </td>
                        </tr>
                        <tr>
                            <th>uibuilder version</th>
                            <td>${t.version}</td>
                        </tr>
                        <tr>
                            <th>Node-RED version</th>
                            <td>${r.settings.version}<br>
                                Minimum version required by uibuilder is ${t.me["node-red"].version}
                            </td>
                        </tr>
                        <tr>
                            <th>Node.js version</th>
                            <td>${t.nodeVersion.join(".")}<br>
                                Minimum version required by uibuilder is ${t.me.engines.node}
                            </td>
                        </tr>
                    </tbody>
                </table>
                <h2>Node Instance Configuration Items</h2>
                <p>
                    Shows the internal configuration.
                </p>
                <table class="uib-info-tb">
                    <tbody>
        `,h.sort().forEach(g=>{let p=s[g];g==="ioNamespace"&&(p=m.name),g==="ioClientsCount"&&(p=m.sockets.size);try{p!==null&&p.constructor.name==="Object"&&(p=JSON.stringify(p))}catch(S){p!==void 0&&r.log.warn(`[uibuilder:webjs:showInstanceDetails] ${s.id}, ${a}: Item '${g}' failed to stringify. ${S.message}`)}o+=`
                        <tr>
                            <th>${g}</th>
                            <td>${p}</td>
                        </tr>
            `}),o+=`
                    </tbody>
                </table>
                <div></div>
        `;const y=Object.values(this.dumpInstanceRoutes(!1,s.url))[0];return o+=`
            <h4>Instance Routes for ${s.url}</h4>
            ${this.htmlBuildTable(this.routers.instances[s.url],["name","desc","path","type","folder"])}
            <h5>ExpressJS technical route data for <code>${s.url}</code> (<code>../${s.url}/*</code>)</h5>
            ${this.htmlBuildTable(y,["name","path","folder","route"])}
            `,o+=`
            </body></html>

        `,o}addBeaconRoute(e){const s=this.uib,t=this.log;if(s.configFolder===null)throw new Error("uib.configFolder is null");const r="/_clientLog";this.instanceRouters[e.url].post(r,l.text(),(i,o)=>{t.trace(`[uibuilder:web:addLogRoute:${e.url}] POST to client logger: ${i.body}`),o.status(204);const a=i.body.split("::");let n="debug",u=i.body;a.length>1&&(n=a.shift(),u=a.join("::")),t[n](`[uibuilder:clientLog:${e.url}] ${u}`);let h;try{h=i.headers.cookie.split(";").filter(m=>m.trim().startsWith("uibuilder-client-id="))[0].replace("uibuilder-client-id=","").trim()}catch{}e.send([null,{uibuilderCtrl:"client beacon log",topic:e.topic||void 0,payload:u,logLevel:n,ip:i.headers["x-real-ip"]||i.headers["x-forwarded-for"]||i.socket.remoteAddress,clientId:h,url:e.url}])}),t.trace(`[uibuilder:web:addLogRoute:${e.url}] Client Beacon Log route added`),this.routers.instances[e.url].push({name:"Client Log",path:r,desc:"Client beacon log back to Node-RED",type:"POST",folder:"N/A"})}addInstanceCustomRoutes(e){const s=this.uib,t=this.log;v.sync(`${s.rootFolder}/${e.url}/routes/*.js`).forEach(i=>{let o={},a=[];try{o=require(i),a=Object.keys(o)}catch(n){return t.error(`[uibuilder:webjs:addInstanceCustomRoutes:${e.url}] Could not require instance route file. '${i}'. ${n.message}`),!1}a.forEach(n=>{const u=o[n];u.method&&u.path&&u.callback?(t.trace(`[uibuilder:webjs:addInstanceApiRouter:${e.url}] Custom route added. '${i}', '${n}'`),this.instanceRouters[e.url][u.method](u.path,u.callback),this.routers.instances[e.url].push({name:`Custom route: ${n}`,path:`${this.uib.httpRoot}/${e.url}${u.path}`,desc:`Custom route from '${i}'`,type:u.method.toUpperCase(),folder:i})):t.warn(`[uibuilder:webjs:addInstanceApiRouter:${e.url}] Cannot add route from '${i}'. '${n}' has invalid data. Ensure it has 'method', 'path' and 'callback' properties.`)})})}summariseRoute(e,s){if(e.name==="query"||e.name==="expressInit")return;const t={name:e.name,path:e.regexp.toString().replace("/^\\","").replace("\\/?(?=\\/|$)/i","/").replace("\\/?$/i","/").replace("/^\\/?$/i","/").replace("//?(?=/|$)/i","/").replace(/\\/g,"").replace("/(?:([^/]+?))/","/")};e.route!==void 0&&(e.route.stack[0].method?t.route=`${e.route.stack[0].method}:${e.route.stack[0].regexp}`:t.route=Object.keys(e.route.methods).join(","));const r=R.uibPackageJson.uibuilder.packages;t.path&&t.path==="/common/"?t.folder=this.uib.commonFolder:t.path&&t.path==="/?(?=/|$)/i"?(t.path="/",t.folder="(route applied direct)"):r[t.path.slice(1,-1)]&&(t.folder=r[t.path.slice(1,-1)].installFolder),s.push(t)}dumpInstanceRoutes(e=!0,s=null){const t={};let r=[];return s===null?r=Object.keys(this.instanceRouters):r=[s],r.forEach(i=>{t[i]=[];for(const o of this.instanceRouters[i].stack)this.summariseRoute(o,t[i]);t[i].length===0&&(t[i]=[{name:"No routes"}])}),e&&(console.log(` 
---- Per-Instance User Facing Routes ----`),Object.keys(this.instanceRouters).forEach(i=>{console.log(`>> User Instance Routes ${this.uib.nodeRoot}/${i}/* >>`),console.table(t[i])})),t}dumpAdminRoutes(e=!0){const s={app:[],admin:[],v3:[],v2:[]};for(const t of this.RED.httpAdmin._router.stack)this.summariseRoute(t,s.app);if(this.adminRouter)for(const t of this.adminRouter.stack)this.summariseRoute(t,s.admin);if(this.adminRouterV3)for(const t of this.adminRouterV3.stack)this.summariseRoute(t,s.v3);if(this.adminRouterV2)for(const t of this.adminRouterV2.stack)this.summariseRoute(t,s.v2);if(e){console.log(` 
---- Admin Facing Routes ----`);const t=this.RED.settings.httpAdminRoot;console.log(`>> App Admin Routes ${t}* >>`),console.table(s.app),console.log(`>> Admin uib Routes ${t}${this.uib.moduleName}/* >>`),console.table(s.admin),console.log(`>> Admin v3 Routes ${t}${this.uib.moduleName}/admin >>`),console.table(s.v3),console.log(`>> Admin v2 Routes ${t}${this.uib.moduleName}/ >>`),console.table(s.v2)}return s}dumpUserRoutes(e=!0){const s={app:[],uibRouter:[],vendorRouter:[]};for(const t of this.app._router.stack)this.summariseRoute(t,s.app);if(this.uibRouter)for(const t of this.uibRouter.stack)this.summariseRoute(t,s.uibRouter);if(this.vendorRouter)for(const t of this.vendorRouter.stack)this.summariseRoute(t,s.vendorRouter);return e&&(console.log(` 
---- User Facing Routes ----`),console.log(`>> User App Routes ${this.uib.nodeRoot}/* >>`),console.table(s.app),console.log(`>> User uib Routes ${this.uib.nodeRoot}/${this.uib.moduleName}/* >>`),console.table(s.uibRouter),console.log(`>> User vendor Routes ${this.uib.nodeRoot}/${this.uib.moduleName}/vendor/* >>`),console.table(s.vendorRouter)),s}dumpRoutes(e=!0){const s={user:{app:[],uibRouter:[],vendorRouter:[]},admin:{app:[],admin:[],v3:[],v2:[]},instances:{}};return e&&console.log(`
 
[uibuilder:web.js:dumpRoutes] Showing all ExpressJS Routes for uibuilder.
`),s.user=this.dumpUserRoutes(e),s.instances=this.dumpInstanceRoutes(e),s.admin=this.dumpAdminRoutes(e),e&&console.log(`
---- ---- ---- ----
 
`),s}dumpExpressReqAppRes(e,s){const t=O,r=e;t(">> REQ >>",{baseUrl:r.baseUrl,body:r.body,cookies:r.cookies,fresh:r.fresh,hostname:r.hostname,httpVersion:r.httpVersion,ip:r.ip,ips:r.ips,method:r.method,orginalUrl:r.originalUrl,params:r.params,path:r.path,protocol:r.protocol,query:r.query,route:r.route,secure:r.secure,stale:r.stale,subdomains:r.subdomains,url:r.url,xhr:r.xhr})}htmlBuildTable(e,s){s||(s=Object.keys(e[0]));let t='<div class="table-responsive"><table  class="uib-info-tb table table-sm"><thead><tr>';const r=o=>o.replace(/[&<>'"]/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[a]);function i(o,a){let n="<td>";return n+=a[o]?r(a[o]):" ",n+="</td>",n}s.forEach(o=>{t+="<th>",t+=o,t+="</th>"}),t+="</tr></thead>";for(const o of e){t+="<tr>";for(const a of s)t+=i(a,o);t+="</tr>"}return t+="</table></div>",t}}const U=new V;module.exports=U;
//# sourceMappingURL=web.js.map
