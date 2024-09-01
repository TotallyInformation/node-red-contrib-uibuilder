---
title: Using NGNX to secure uibuilder apps
description: |
  An outline on securing uibuilder web UI's using NGINX as a reverse proxy server.
created: 2022-02-18 16:05:17
updated: 2024-03-23 16:53:34
---

> [!NOTE]
> This page is DRAFT. I realise that it will confuse more than help as it stands. However, if you can be bothered to read through it a couple of times, you will realise that it already gives you many pointers on how to secure a uibuilder front-end web app using NGINX. Indeed it gives lots of information for securing any web site or web app using NGINX. 😁<br>I will be creating a step-by-step guide at some point and that should help simplify things.

> [!WARNING]
> This page is offered as a set of ideas for securing Node-RED and uibuilder using NGINX, it comes with no guarantee or warrantee of accuracy or security.

Please refer to the [Securing uib web apps page](Programming/uibuilder/docs/security/security.md) for an overview of security, terminology and securing uibuilder and Node-RED.

This page does not attempt to be a full tutorial about creating a secure front-end for Node-RED and uibuilder. It simply presents the things you need to think about and will want to implement to meet basic and more advanced security.

You may also wish to refer to the web page [wallarm/awesome-nginx-security: 🔥 A curated list of awesome links related to application security related to the environments with NGINX or Kubernetes Ingres Controller (based on NGINX)](https://github.com/wallarm/awesome-nginx-security) for lots of other useful information about NGINX and web security.


## Installation

Securing any web server or proxy is a non-trivial excercise. Therefore, this may be a good reason to pick up a pre-configured Docker image.

Otherwise, some of the step-by-step guides given below contain details on installation of NGINX and any other tools required.

[Nginx Proxy Manager](https://nginxproxymanager.com/guide/) is an example of an NGINX Docker image. This also includes an admin web interface that lets you change the configuration as needed. I've not tried it and can't say how good or secure it is.

The most secure NGINX installation will see you compiling your own version of NGINX.

### Compiling a custom version

This certainly gives you a much more secure installation.

[How To Secure Nginx with NAXSI on Ubuntu 16.04 | DigitalOcean](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-naxsi-on-ubuntu-16-04) has a suitable step-by-step guide on doing this.

Things to think about:

* Remove any modules you know you won't need (e.g. fastcgi which you probably won't use when just working with Node-RED and node.js, mail modules, etc)
* Include any useful additional modules (such as LUA for scripting). The NAXSI WAP module would be a great addition.
* Set the desired user and group for running NGINX. The default install uses `nginx`/`nginx` but some people prefer the older style `www-data`/`www-data`.

> [!NOTE]
> Do remember that, if you go down this route, you need to make sure that you periodically udpate the sources and recompile to ensure that you stay current. Don't skip this or you will end up with an old version with security issues.

## Basic Security

> [!TIP]
> The [OWASP org](https://owasp.org/) produce international standards for securing web (and other application) servers from all manner of threats. Wherever possible, you should use guides, tutorials, and tools that implement their standards. Security threats change over time so it is important that your web security is able to also change with minimal input from yourself. See [bunkerity/bunkerized-nginx: 🛡️ Make your web services secure by default !](https://github.com/bunkerity/bunkerized-nginx) as an example (I've not tried this at the time of writing so please test it carefully)

There are a great many good tutorials and configuration guides on securing NGINX and making it into a secure reverse proxy for microservice applications such as Node-RED. Please refer to those for step-by-step guides.

Some example guides:

* [Nginx Server Security: Nginx Hardening Guide](https://beaglesecurity.com/blog/article/nginx-server-security.html)
* [Top 25 Nginx Web Server Best Security Practices - nixCraft](https://www.cyberciti.biz/tips/linux-unix-bsd-nginx-webserver-security.html)
* [How to Build a Tough NGINX Server in 15 Steps | UpGuard](https://www.upguard.com/blog/how-to-build-a-tough-nginx-server-in-15-steps)
* [The most important steps to take to make an nginx server more secure – DreamHost Knowledge Base](https://help.dreamhost.com/hc/en-us/articles/222784068-The-most-important-steps-to-take-to-make-an-nginx-server-more-secure)

### HTTPS/WSS (TLS Encryption)

**HTTPS** access (and matching WSS access for websockets) should always be configured. This should always be step #1. It is sensible to set this up and check that it is working correctly before doing anything else. **Never** deploy other security, identity, authentication or authorisation settings unless TLS is correctly configured and you can _only_ access the web service via HTTPS/WSS.

You should also configure the TLS versions and ciphers allowed because they can become insecure over time. TLS session caching and Diffie-Hellman parameters should also be set. Needless to say, you should ensure that any non-secure connection should be automatically redirected to a secure one. Please refer to the current OWASP recommendations for security settings as they may change from time-to-time. Some general references are provided in the references section below.

In order to implement HTTPS, you need a Public Certificate and Private Key. There are many ways to generate and manage these. For low-cost and non-enterprise use, Let's Encrypt is a good choice. Whatever you use, you need to end up with two files. The public certificate file and the private key file. The private key **must** be carefully protected. If it is compromised, you will need to re-create a new pair of files. The public certificate file will be presented to client applications.

### Web Application Firewall (WAF)

A WAF adds many protections for both known and unknown threats to web applications. The most comprehensive free WAF for NGINX is `libmodsecurity` (also known as "ModSecurity v3"). OWASP publish an actively maintained set of rules for this WAF and so it is highly recommended. Please see the [references](#references) section below for details.

However, ModSecurity can be rather daunting and may feel excessive for a small project with low-value. If this is the case, you may wish to look at an alternative WAF called [Naxsi](https://github.com/nbs-system/naxsi). Noting that it is not possible to use Naxsi on a Windows server.


## Identity & Authentication

### HTTP Basic Authentication

NGINX can use HTTP Basic Authentication either via core configuration or via Apache style `.htpasswd` files (for static web pages). A user experiences a standard browser pop box to enter a user id and password. 

_Note that this is not a recommended approach in general as it provides very limited security. However, it is better than nothing._

Logins can be configured by URL path if needed. Users and passwords are set using a command-line utility. If needed, a simple Node-RED flow could be created for self-service user setup.

No active session management is possible with this approach.

* [How To Set Up Basic HTTP Authentication With Nginx on Ubuntu 14.04 | DigitalOcean](https://www.digitalocean.com/community/tutorials/how-to-set-up-basic-http-authentication-with-nginx-on-ubuntu-14-04).
* [How to Set Up Basic HTTP Authentication in NGINX – CloudSavvy IT](https://www.cloudsavvyit.com/1355/how-to-setup-basic-http-authentication-on-nginx/).
* [Module ngx_http_auth_basic_module](http://nginx.org/en/docs/http/ngx_http_auth_basic_module.html).

### OAuth 2.0

NGINX can use the [OAuth 2.0](https://oauth.net/2/) standard using the [OpenID Connect](https://openid.net/connect/) (OIDC) identity layer. Identity specialist vendor Okta has a good explanation of OAuth and OIDC: [An Illustrated Guide to OAuth and OpenID Connect | Okta Developer](https://developer.okta.com/blog/2019/10/21/illustrated-guide-to-oauth-and-oidc).

To use OAuth, you need an OAuth provider. These fall into 3 main camps. Public cloud, Private cloud and private service. [Public Cloud OAuth provider](https://en.wikipedia.org/wiki/List_of_OAuth_providers) examples are Google, GitHub, Apple, Amazon - there are many, many others. Private Cloud providers include Auth0, Okata, Microsoft Azure Active Directory. There aren't so many examples of private service tools but they include [ory/hydra](https://github.com/ory/hydra), [panva/node-oidc-provider](https://github.com/panva/node-oidc-provider), [oauthjs/node-oauth2-server](https://github.com/oauthjs/node-oauth2-server).

Despite the apparent complexity, much of this is simply learning the terminology. OAuth and OIDC are battle tested, enterprise-grade standards that are flexible and secure. 

Implementing OIDC in NGINX isn't hard and allowing the use of 3rd-party credentials such as those from Google, etc would mean that you only needed to say which user ids you want to allow in, you wouldn't have to mange the id's themselves. For more control, use a private cloud provider such as [Auth0](https://auth0.com/).

Auth0 have a free plan that allows unlimited logins with up to 7,000 active users. There are also many guides and tutorials for setting up NGINX with Auth0.

[An Introduction to OAuth 2 | DigitalOcean](https://www.digitalocean.com/community/tutorials/an-introduction-to-oauth-2)

### Sub-request Module

[http_auth_request_module](http://nginx.org/en/docs/http/ngx_http_auth_request_module.html) - client authorization based on the result of a subrequest. If the subrequest returns a 2xx response code, the access is allowed. If it returns 401 or 403, the access is denied. This module is already statically compiled in to most implementations. Run the command `sudo nginx -V` to find out.

Although called an authorisation module, this core module can be used for authentication. It can also be combined with other core modules for basic auth, JWT, etc. See the docs for details.

### HTTP Access Module

[Module ngx_http_access_module](http://nginx.org/en/docs/http/ngx_http_access_module.html) -  allows limiting access to certain client addresses. This module is built-in to NGINX.

```nginx
# Inside the appropriate server block, this will only allow IPv4 access from
# a device on the local network - but not from the router
location / {
   deny  192.168.1.1;
   allow 192.168.1.0/24;
   deny  all;
}
```

Combine with the GEO module to get more flexibility.

If you have a VPN of some kind, check on the IP addresses it gives out and allow those as well.

Here is an alternative (and overly simplistic) example that allows only from 1 device or if the browser client provides basic auth.

```nginx
location /mysecureap/ {
   satisfy any;

   allow 192.168.1.111;
   deny  all;

   auth_basic           "My slightly secured site";
   auth_basic_user_file conf/htpasswd;
}
```

### HTTP Auth JWT Module

[Module ngx_http_auth_jwt_module](http://nginx.org/en/docs/http/ngx_http_auth_jwt_module.html) - implements client authorization by validating the provided JSON Web Token (JWT) using the specified keys. The module supports JSON Web Signature (JWS), JSON Web Encryption (JWE) (1.19.7), and Nested JWT (1.21.0). The module can be used for OpenID Connect authentication.

### Other Authentication Modules

* [sto/ngx_http_auth_pam_module](https://github.com/sto/ngx_http_auth_pam_module) - provides PAM (Pluggable Authentication Modules) OS-level authentication on Linux servers. Alternatively [veruu/ngx_form_auth](https://github.com/veruu/ngx_form_auth).
* [HTTP Digest](https://www.nginx.com/resources/wiki/modules/auth_digest/) - Simple, minimal security authentication that is supported in all browsers.
* [kvspb/nginx-auth-ldap](https://github.com/kvspb/nginx-auth-ldap) - LDAP authentication module for nginx
* [openresty/encrypted-session-nginx-module](https://github.com/openresty/encrypted-session-nginx-module) - encrypt and decrypt nginx variable values. Can be used for simple authentication.

There is an open source PAM module for NGINX .

## Authorisation

This is a bit beyond the scope of this page. However, it is worth noting that OAuth/OIDC has the capability of providing authorisation tags.

## Node-RED and uibuilder specifics

### Node-RED settings

Set the following in Node-RED's settings.js file for best security:

```js
   // Only allows a direct connection to Node-RED on local device. 
   // Any external access HAS to go through the Proxy.
   uiHost: '127.0.0.1',

   httpServerOptions: {
      // http://expressjs.com/en/api.html#trust.proxy.options.table
      // Set to true or a list of IP's of trusted proxy servers
      'trust proxy': '127.0.0.1/8, ::1/128', 
   },
},
```

### Websockets

Both Node-RED and uibuilder make extensive use of websockets for communication between front-end web pages (Editor, Dashboard, uib pages, etc) and the Node-RED back-end server. So you need to configure NGINX to proxy these requests in addition to HTTP(S) requests. Websockets use the `WS:` protocol. `WSS:` is the TLS secured version of the protocol.

To get NGINX to act as a websocket proxy, you need to configure it to handle both the `upgrade` and `connection` headers. Example:

```nginx
# Proxy https://my.public.domain/red/ to http://localhost:1880/
location  /red/ {
   proxy_pass http://localhost:1880/;
   proxy_set_header X-Real-IP $remote_addr;
   proxy_set_header Host $host;
   proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

   proxy_http_version 1.1;
   proxy_set_header Upgrade $http_upgrade;
   proxy_set_header Connection "upgrade";
}
# If using uib custom server, proxy https://my.public.domain/myapp/ to http://localhost:3001/myuiburl/
# NOTE: This might not be 100% correct, I've not tested it yet.
location  /myapp/ {
   proxy_pass http://localhost:3001/myuiburl/;
   proxy_set_header X-Real-IP $remote_addr;
   proxy_set_header Host $host;
   proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

   proxy_http_version 1.1;
   proxy_set_header Upgrade $http_upgrade;
   proxy_set_header Connection "upgrade";
}
```

See [Using NGINX as a WebSocket Proxy](https://www.nginx.com/blog/websocket-nginx/) for more detail.

### HTTP Methods

Many NGINX security guides will recommend restricting what HTTP methods are allowed (GET, PUT, etc). It should be noded that Node-RED allows many different methods to be used (for example in http-in nodes). In addition, uibuilder also uses an extended set of methods for its API's (GET, PUT, POST, and DELETE). So care should be taken if restricting allowed methods.

### Getting Node-RED to pay attention

When running behind a proxy, the ExpressJS server that Node-RED and uibuilder use may not get expected values. See [Express behind proxies](http://expressjs.com/en/guide/behind-proxies.html) for details. For this reason ExpressJS has a `trust proxy` setting. This can be set in Node-RED's `settings.js` file as:

```js
   //...
   httpServerOptions: {
      // See http://expressjs.com/en/api.html#trust.proxy.options.table for what this can be set to
      'trust proxy': true,
   },
   //...
```

If using uibuilder's custom ExpressJS server feature, you can set the options as:

```js
   //...
   uibuilder: {
      /** Optional HTTP PORT. If set and different to Node-RED's uiPort, 
       *  uibuilder will create a separate webserver for its own use. */
      port: process.env.UIBPORT || 3001,

      /** Only used if a custom ExpressJS server in use (see port above)
       * Optional: Default will be the same as Node-RED. @type {('http'|'https')} */
      customType: 'https',
      
      /** Only required if type is https, http2. Defines the cert & key. See Node-RED https settings for more details.
       * If not defined, will use Node-RED's https properties. @type {Object<Buffer,Buffer>} */
      // https: {
      //     key: 'keyname.key',
      //     cert: 'fullchain.cer'
      // },
      
      serverOptions: {
         // See http://expressjs.com/en/api.html#trust.proxy.options.table for what this can be set to
         'trust proxy': true,
      },
   },
   //...
```

### Getting Node-RED to STOP paying attention (to anything other than the proxy)

If you want to prevent any access to Node-RED and uibuilder apps from anything other than the NGINX proxy - which is generally a good idea - If the proxy is running on the same device as Node-RED, simply change the `uiHost` property in the Node-RED `settings.js` file to `127.0.0.1`. 

If the proxy is running on a different device, you can't do the above. Instead use a local firewall (e.g. IPTABLES on Linux) and prevent any incoming HTTP(s) and WS(S) traffic other than from the proxy server.

## References

* [Top 25 Nginx Web Server Best Security Practices - nixCraft](https://www.cyberciti.biz/tips/linux-unix-bsd-nginx-webserver-security.html)
* [Nginx Server Security: Nginx Hardening Guide](https://beaglesecurity.com/blog/article/nginx-server-security.html)
* [How to Build a Tough NGINX Server in 15 Steps | UpGuard](https://www.upguard.com/blog/how-to-build-a-tough-nginx-server-in-15-steps)
* [nginx configuration for improved security(and performance). [GitHub Gist]](https://gist.github.com/plentz/6737338)
* [The most important steps to take to make an nginx server more secure – DreamHost Knowledge Base](https://help.dreamhost.com/hc/en-us/articles/222784068-The-most-important-steps-to-take-to-make-an-nginx-server-more-secure)
* [Celebrazio: Nginx for reverse proxying and authentication for backends](https://www.celebrazio.net/tech/web/nginx_rev_auth_1.html) ([Part 2](https://www.celebrazio.net/tech/web/nginx_rev_auth_2.html)) - uses Auth0.
* [Common Nginx misconfigurations that leave your web server open to attack - Detectify Blog](https://blog.detectify.com/2020/11/10/common-nginx-misconfigurations/)
* [Nginx server security - hardening Nginx configuration](https://www.acunetix.com/blog/web-security-zone/hardening-nginx/)

* Node-RED and NGINX
  * [NGINX & Proxying Node RED · TotallyInformation/node-red-contrib-uibuilder Wiki](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/NGINX-%26-Proxying-Node-RED)
  * [Node-red server with nginx reverse proxy howto guide - FAQs - Node-RED Forum](https://discourse.nodered.org/t/node-red-server-with-nginx-reverse-proxy-howto-guide/27397)


* Web Application Firewalls
  * [Use a web application firewall (WAF) - The GDS Way](https://gds-way.cloudapps.digital/standards/web-application-firewall.html#why-you-should-use-a-waf)
  * [Nginx with libmodsecurity and OWASP ModSecurity Core Rule Set on Ubuntu 16.04](https://www.howtoforge.com/tutorial/nginx-with-libmodsecurity-and-owasp-modsecurity-core-rule-set-on-ubuntu-1604/)
  * [SpiderLabs/ModSecurity](https://github.com/SpiderLabs/ModSecurity) - an open source, cross platform web application firewall (WAF) engine for Apache, IIS and Nginx
  * [SpiderLabs/ModSecurity-nginx: ModSecurity v3 Nginx Connector](https://github.com/SpiderLabs/ModSecurity-nginx) - Connector between NGINX and libmodsecurity. (ModSecurity v3).
  * [OWASP ModSecurity Core Rule Set | OWASP Foundation](https://owasp.org/www-project-modsecurity-core-rule-set/)
  * [Nginx + ModSecurity and OWASP CRS - Mkyong.com](https://mkyong.com/nginx/nginx-modsecurity-and-owasp-crs/)
  * [UKHomeOffice/docker-nginx-proxy: A generic WAF proxy layer](https://github.com/UKHomeOffice/docker-nginx-proxy)

* [ose-documentation/ose-web-tls-cipher-order-nginx.md at main · InternetSociety/ose-documentation](https://github.com/InternetSociety/ose-documentation/blob/main/ose-web-tls-cipher-order-nginx.md)

## Additional Information

* [Safely accessing Node-RED over the Internet](https://discourse.nodered.org/t/safely-accessing-node-red-over-the-internet/45024) is an FAQ thread in the Node-RED Discourse forum. 
* How to set up Node-RED to use TLS is documented in the [Runtime Configuration](https://nodered.org/docs/user-guide/runtime/configuration#runtime-configuration) document.
* "[How to create secure certificates](https://it.knightnet.org.uk/kb/nr-qa/https-valid-certificates/)" for use with TLS is an article on my blog.
* Some ideas on ["safely" exposing Node-RED to the Internet](https://github.com/node-red/cookbook.nodered.org/wiki/How-to-safely-expose-Node-RED-to-the-Internet) are documented in the WIKI for the Node-RED Cookbook.
* "[How to secure Node-RED](https://it.knightnet.org.uk/kb/nr-qa/securing-node-red/)" is another of my blog articles (only a draft though I'm afraid). It provides some security background.
* Node-RED security is documented in the [Securing Node-RED](https://nodered.org/docs/user-guide/runtime/securing-node-red) doc.
  Note that this documentation has no bearing on uibuilder security.
