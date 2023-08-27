"use strict";const R=require("express"),f=require("path"),g=require("fs-extra"),n=require("./web"),v=require("./socket"),c=require("./package-mgt"),b=require("./tilib"),M=new Error("uib.rootFolder is null"),p=R.Router();function $(s){const e={statusMessage:"",status:0};return s.url===void 0?(e.statusMessage="url parameter not provided",e.status=500,e):(s.url=s.url.trim(),s.url.length>20?(e.statusMessage=`url parameter is too long. Max 20 characters: ${s.url}`,e.status=500,e):s.url.length<1?(e.statusMessage="url parameter is empty, please provide a value",e.status=500,e):(s.url.includes("..")&&(e.statusMessage=`url parameter may not contain "..": ${s.url}`,e.status=500),e))}function y(s){const e={statusMessage:"",status:0},d=s.fname;return d===void 0?(e.statusMessage="file name not provided",e.status=500,e):d===""?(e.statusMessage="file name cannot be blank",e.status=500,e):d.length>255?(e.statusMessage=`file name is too long. Max 255 characters: ${s.fname}`,e.status=500,e):(d.includes("..")&&(e.statusMessage=`file name may not contain "..": ${s.fname}`,e.status=500),e)}function k(s){const e={statusMessage:"",status:0},d=s.folder;return d===void 0?(e.statusMessage="folder name not provided",e.status=500,e):d===""?(e.statusMessage="folder name cannot be blank",e.status=500,e):d.length>255?(e.statusMessage=`folder name is too long. Max 255 characters: ${d}`,e.status=500,e):(d.includes("..")&&(e.statusMessage=`folder name may not contain "..": ${d}`,e.status=500),e)}function A(s,e){if(s.rootFolder===null)throw M;const d=s.rootFolder,u=s.RED,a=u.log,t=n.dumpRoutes(!1),l=`${e}${s.nodeRoot.replace("/","")}${s.moduleName}`;let r={};try{r=Object.assign({},s),delete r.me,delete r.RED}catch(o){a.warn(`[uibuilder:apiv2:detailsPage] Could not parse uib object, some info will be missing. ${o.message}`)}let i=`
        <!doctype html><html lang="en"><head>
            <title>Uibuilder Index</title>
            <link rel="icon" href="${l}/common/images/node-blue.ico">
            <link type="text/css" rel="stylesheet" href="${l}/uib-brand.min.css" media="screen">
            <style type="text/css" rel="stylesheet" media="all">
                h2 { border-top:1px solid silver;margin-top:1em;padding-top:0.5em; }
                .col3i tbody>tr>:nth-child(3){ font-style:italic; }
            </style>
        </head><body class="uib"><div class="container">
            <h1>uibuilder Detailed Information Page</h1>
            <p>
                Note that this page is only accessible to users with Node-RED admin authority.
            </p>
    `;i+=`
            <h2>Index of uibuilder pages</h2>
            <p>'Folders' refer to locations on your Node-RED's server. 'Paths' refer to URL's in the browser.</p>
            <table class="uib-info-tb table table-sm">
                <thead><tr>
                    <th>URL</th>
                    <th title="Use this to search for the source node in the admin ui">Source Node Instance <a href="#i2"><sup>(2)</sup></th>
                    <th>Server Filing System Folder</th>
                </tr></thead><tbody>
    `,Object.keys(s.instances).forEach(o=>{i+=`
            <tr>
                <td><a href="${e}${b.urlJoin(s.nodeRoot,s.instances[o]).replace("/","")}" target="_blank">${s.instances[o]}</a></td>
                <td>${o}</td>
                <td>${f.join(d,s.instances[o])}</td>
            </tr>
        `}),i+=`
        </tbody></table>
        <p>Notes:</p>
        <ol>
            <li><a id="i1"></a>
                Each instance of uibuilder uses its own socket.io <i>namespace</i> that matches <code>httpNodeRoot/url</code>. 
                You can use this to manually send messages to your user interface.
            </li>
            <li><a id="i2"></a>
                Paste the Source Node Instance into the search feature in the Node-RED admin ui to find the instance.
                The "Filing System Folder" shows you where the front-end (client browser) code lives.
            </li>
        </ol>
    `,i+=`
        <h2>Vendor Client Libraries</h2>
        <p>
            You can include these libraries (packages) in any uibuilder served web page.
            Note though that you need to find out the correct file and relative folder either by looking on 
            your Node-RED server in the location shown or by looking at the packages source online.
        </p>
        <table class="uib-info-tb table table-sm">
            <thead><tr>
                <th>Package</th>
                <th>Version</th>
                <th>Browser Entry Point (est.) <a href="#vl1"><sup>(1)</sup></a> <a href="#vl2"><sup>(2)</sup></a></th>
                <th>Server Filing System Folder</th>
            </tr></thead><tbody>
    `;const h=c.uibPackageJson.uibuilder.packages;return Object.keys(h).forEach(o=>{const m=h[o];i+=`
            <tr>
                <td><a href="${m.homepage}" title="Click to go to package's home page">${o}</a></td>
                <td title="Installed Version, Version Spec='${m.spec}'">${m.installedVersion}</td>
                <td title="Use this in your front-end code">${m.url}</td>
                <td>${m.installFolder}</td>
            </tr>
        `}),i+=`
        </tbody></table>
        <p>Notes:</p>
        <ol>
            <li><a id="vl1"></a>
                Always use relative URL's. All vendor URL's start <code>../uibuilder/vendor/</code>, 
                all uibuilder and custom file URL's start <code>./</code>.<br>
                Using relative URL's saves you from needing to worry about http(s), ip names/addresses and port numbers.
            </li>
            <li><a id="vl2"></a>
                The 'Main Entry Point' shown is <i>usually</i> a JavaScript file that you will want in your index.html. 
                However, because this is reported by the authors of the package, it may refer to something completely different, 
                uibuilder has no way of knowing. Treat it as a hint rather than absolute truth. Check the packages documentation 
                for the correct library files to load.
            </li>
        </ol>
    `,i+=`
        <h2>Configuration</h2>

        <h3>uibuilder</h3>
        <table class="uib-info-tb table table-sm col3i">
            <tr>
                <th>uibuilder Version</th>
                <td>${s.version}</td>
                <td></td>
            </tr>
            <tr>
                <th>uib.rootFolder</th>
                <td>${d}</td>
                <td>All uibuilder data lives here</td>
            </tr>
            <tr>
                <th>uib.configFolder</th>
                <td>${s.configFolder}</td>
                <td>uibuilder Global Configuration Folder</td>
            </tr>
            <tr>
                <th>uib.commonFolder</th>
                <td>${s.commonFolder}</td>
                <td>Used for loading common resources between multiple uibuilder instances</td>
            </tr>
            <tr>
                <th>Common URL</th>
                <td>../${s.moduleName}/common</td>
                <td>The common folder maps to this URL</td>
            </tr>
            <tr title="">
                <th>uib_socketPath</th>
                <td>${v.uib_socketPath}</td>
                <td>Unique path given to Socket.IO to ensure isolation from other Nodes that might also use it</td>
            </tr>
            <tr>
                <th>uib.masterTemplateFolder</th>
                <td>${s.masterTemplateFolder}</td>
                <td>The built-in source templates, can be copied to any instance</td>
            </tr>
        </table>

        <h3>Configuration Files</h3>

        <p>All are kept in the master configuration folder: ${s.configFolder}</p>

        <dl style="margin-left:1em;">
            <dt>${s.sioUseMwName}</dt>
            <dd>Custom Socket.IO Middleware file, also uibMiddleware.js.</dd>
            <dt>uibMiddleware.js</dt>
            <dd>Custom ExpressJS Middleware file.</dd>
        </dl>

        <h4>Dump of all uib master configuration settings</h4>
        <pre>${b.syntaxHighlight(r)}</pre>

        <h4>Dump of all uib settings.js entries</h4>
        <pre>${b.syntaxHighlight(u.settings.uibuilder?u.settings.uibuilder:"NOT DEFINED")}</pre>

        <h3>Node-RED</h3>
        <p>See the <code>&lt;userDir&gt;/settings.js</code> file and the 
        <a href="https://nodered.org/docs/" target="_blank">Node-RED documentation</a> for details.</p>
        <table class="uib-info-tb table table-sm">
            <tr><th>userDir</th><td>${u.settings.userDir}</td></tr>
            <tr><th>httpNodeRoot</th><td>${s.nodeRoot}</td></tr>
            <tr><th>Node-RED Version</th><td>${u.settings.version}</td></tr>
            <tr><th>Min. Version Required by uibuilder</th><td>${s.me["node-red"].version}</td></tr>
        </table>

        <h3>Node.js</h3>
        <table class="uib-info-tb table table-sm">
            <tr><th>Version</th><td>${s.nodeVersion.join(".")}</td></tr>
            <tr><th>Min. version required by uibuilder</th><td>${s.me.engines.node}</td></tr>
        </table>
    `,i+=`
        <h2>ExpressJS Configuration</h2>
        <p>
            See the <a href="https://expressjs.com/en/api.html#app.settings.table" target="_blank">ExpressJS documentation</a> for details.
            Note that ExpressJS Views are not current used by uibuilder
        </p>
        <table class="uib-info-tb table table-sm">
            <tr><th>Views Folder</th><td>${n.app.get("views")}</td></tr>
            <tr><th>Views Engine</th><td>${n.app.get("view engine")}</td></tr>
            <tr><th>Views Cache</th><td>${n.app.get("view cache")}</td></tr>
        </table>
        <h3>app.locals</h3>
        <pre>${b.syntaxHighlight(n.app.locals)}</pre>
        <h3>app.mountpath</h3>
        <pre>${b.syntaxHighlight(n.app.mountpath)}</pre>
    `,i+=`
        <h2>uibuilder ExpressJS Routes</h2>
        <p>These tables show all of the web URL routes for uibuilder.</p>
        <h3>User-Facing Routes</h3>
        ${n.htmlBuildTable(n.routers.user,["name","desc","path","type","folder"])}
        <h4>ExpressJS technical route data for admin routes</h4>
        <h5>Application Routes (<code>../*</code>)</h5>
        ${n.htmlBuildTable(t.user.app,["name","path","folder","route"])}
        <h5>uibuilder generic Routes (<code>../uibuilder/*</code>)</h5>
        ${n.htmlBuildTable(t.user.uibRouter,["name","path","folder","route"])}
        <h5>Vendor Routes (<code>../uibuilder/vendor/*</code>)</h5>
        ${n.htmlBuildTable(t.user.vendorRouter,["name","path","folder","route"])}
        <hr>
        <h3>Per-Instance User-Facing Routes</h3>
    `,Object.keys(t.instances).forEach(o=>{i+=`
            <h4>${o}</h4>
            ${n.htmlBuildTable(n.routers.instances[o],["name","desc","path","type","folder"])}
            <h5>ExpressJS technical route data for <code>${o}</code> (<code>../${o}/*</code>)</h5>
            ${n.htmlBuildTable(t.instances[o],["name","path","folder","route"])}
        `}),i+=`
        <hr>
        <h3>Admin-Facing Routes</h3>
        ${n.htmlBuildTable(n.routers.admin,["name","desc","path","type","folder"])}
        <h4>ExpressJS technical route data for admin routes</h4>
        <h5>Node-RED Admin Routes (<code>../*</code>)</h5>
        <p>Note: Shows ALL Node-RED top-level admin routes, not just uibuilder</p>
        ${n.htmlBuildTable(t.admin.app,["name","path","folder","route"])}
        <h5>Admin uibuilder Routes (<code>../uibuilder/*</code>)</h5>
        ${n.htmlBuildTable(t.admin.admin,["name","path","folder","route"])}
        <h5>Admin v3 API Routes (<code>../uibuilder/admin</code>)</h5>
        <p>Note: This route uses the following methods: all, get, put, post, delete.</p>
        ${n.htmlBuildTable(t.admin.v3,["name","path","folder","route"])}
        <h5>Admin v2 API Routes (<code>../uibuilder/*</code>)</h5>
        ${n.htmlBuildTable(t.admin.v2,["name","path","folder","route"])}
    `,i+="</div></body></html>",i}function w(s,e){const d=s.RED;return p.get("/uibgetfile",function(u,a){const t=u.query,l=$(t);if(l.status!==0){e.error(`[uibuilder:apiv2:uibgetfile] Admin API. ${l.statusMessage}`),a.statusMessage=l.statusMessage,a.status(l.status).end();return}const r=y(t);if(r.status!==0){e.error(`[uibuilder:apiv2:uibgetfile] Admin API. ${r.statusMessage}. url=${t.url}`),a.statusMessage=r.statusMessage,a.status(r.status).end();return}const i=k(t);if(i.status!==0){e.error(`[uibuilder:apiv2:uibgetfile] Admin API. ${i.statusMessage}. url=${t.url}`),a.statusMessage=i.statusMessage,a.status(i.status).end();return}e.trace(`[uibuilder:apiv2:uibgetfile] Admin API. File get requested. url=${t.url}, file=${t.folder}/${t.fname}`),t.folder==="root"&&(t.folder="");const h=f.join(s.rootFolder,t.url,t.folder),o=f.join(h,u.query.fname);g.existsSync(o)?a.type("text/plain").sendFile(u.query.fname,{root:h,lastModified:!1,cacheControl:!1,dotfiles:"allow"}):(e.error(`[uibuilder:apiv2:uibgetfile] Admin API. File does not exist '${o}'. url=${t.url}`),a.statusMessage="File does not exist",a.status(500).end())}),p.post("/uibputfile",function(u,a){const t=u.body,l=$(t);if(l.status!==0){e.error(`[uibuilder:apiv2:uibputfile] Admin API v2. ${l.statusMessage}`),a.statusMessage=l.statusMessage,a.status(l.status).end();return}const r=y(t);if(r.status!==0){e.error(`[uibuilder:apiv2:uibputfile] Admin API. ${r.statusMessage}. url=${t.url}`),a.statusMessage=r.statusMessage,a.status(r.status).end();return}const i=k(t);if(i.status!==0){e.error(`[uibuilder:apiv2:uibputfile] Admin API. ${i.statusMessage}. url=${t.url}`),a.statusMessage=i.statusMessage,a.status(i.status).end();return}e.trace(`[uibuilder:apiv2:uibputfile] Admin API. File put requested. url=${t.url}, file=${t.folder}/${t.fname}, reload? ${t.reload}`),t.folder==="root"&&(t.folder=".");const h=f.join(s.rootFolder,t.url,t.folder,t.fname);g.writeFile(h,u.body.data,function(o,m){o?(e.error(`[uibuilder:apiv2:uibputfile] Admin API. File write FAIL. url=${t.url}, file=${t.folder}/${t.fname}`,o),a.statusMessage=o,a.status(500).end()):(e.trace(`[uibuilder:apiv2:uibputfile] Admin API. File write SUCCESS. url=${t.url}, file=${t.folder}/${t.fname}`),a.statusMessage="File written successfully",a.status(200).end(),t.reload==="true"&&v.sendToFe2({_uib:{reload:!0}},t.url))})}),p.get("/uibindex",function(u,a){e.trace("[uibindex] User Page/API. List all available uibuilder endpoints");const t=new URL(u.headers.referer);t.pathname="",s.customServer.port&&(t.port=s.customServer.port);const l=t.href;switch(u.query.type){case"json":{a.json(s.instances);break}case"urls":{a.json(Object.values(s.instances));break}default:{const r=A(s,l);a.send(r);break}}}),p.get("/uibvendorpackages",function(u,a){a.json(c.uibPackageJson.uibuilder.packages)}),p.get("/uibnpmmanage",function(u,a){const t=u.query;if(t.cmd===void 0){e.error("[uibuilder:apiv2:uibnpmmanage] uibuilder Admin API. No command provided for npm management."),a.statusMessage="npm command parameter not provided",a.status(500).end();return}switch(t.cmd){case"install":case"remove":case"update":break;default:e.error("[uibuilder:apiv2:uibnpmmanage] Admin API. Invalid command provided for npm management."),a.statusMessage="npm command parameter is invalid",a.status(500).end();return}if(t.package===void 0){e.error("[uibuilder:apiv2:uibnpmmanage] Admin API. package parameter not provided"),a.statusMessage="package parameter not provided",a.status(500).end();return}if(t.package.length>255){e.error("[uibuilder:apiv2:uibnpmmanage] Admin API. package name parameter is too long (>255 characters)"),a.statusMessage="package name parameter is too long. Max 255 characters",a.status(500).end();return}if(t.cmd!=="remove"){const r=$(t);if(r.status!==0){e.error(`[uibuilder:apiv2:uibnpmmanage] Admin API. ${r.statusMessage}`),a.statusMessage=r.statusMessage,a.status(r.status).end();return}}const l=d.settings.userDir;switch(e.info(`[uibuilder:apiv2:uibnpmmanage] Admin API. Running npm ${t.cmd} for package ${t.package} with tag/version '${t.tag}'`),g.removeSync(f.join(l,"package-lock.json")),t.cmd){case"update":case"install":{c.npmInstallPackage(t.url,t.package,t.tag).then(r=>(c.getUibRootPackageJson(),c.pkgsQuickUpd(),n.serveVendorPackages(),a.json({success:!0,result:[r,c.uibPackageJson.uibuilder.packages]}),!0)).catch(r=>(console.dir(r),e.warn(`[uibuilder:apiv2:uibnpmmanage:install] Admin API. ERROR Running: 
'${r.command}' 
${r.all}`),a.json({success:!1,result:r.all}),!1));break}case"remove":{c.npmRemovePackage(t.package).then(r=>(c.getUibRootPackageJson(),c.pkgsQuickUpd(),n.serveVendorPackages(),a.json({success:!0,result:r}),!0)).catch(r=>(e.warn(`[uibuilder:apiv2:uibnpmmanage:remove] Admin API. ERROR Running: 
'${r.command}' 
${r.all}`),a.json({success:!1,result:r.all}),!1));break}default:{e.error(`[uibuilder:apiv2:uibnpmmanage] Admin API. Command ${t.cmd} is not a valid command. Must be 'install', 'remove' or 'update'.`),a.statusMessage="No valid npm command available",a.status(500).end();break}}}),p}module.exports=w;
//# sourceMappingURL=admin-api-v2.js.map
