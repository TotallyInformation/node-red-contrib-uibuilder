---
title: NGINX Example Config
description: |
  An example of a reasonably secure configuration for Node-RED and UIBUILDER.
created: 2022-02-21 13:05:38
lastUpdated: 2023-09-30 13:06:35
updated: 2023-12-30 17:01:41
---

!> Status: Incomplete

Please read the [Securing uib web apps](security.md) and [Securing apps using NGINX](uib-security-nginx.md) pages before trying this configuration.

!> This is not offered with any kind of guarantee or warrantee that it will be secure or even whether it will work. It merely offers some suggestions that you may wish to look at.

This example assumes you are running NGINX from a direct installation (as per the [Installing nginx](https://nginx.org/en/docs/install.html) guide). Not as a Docker install. It also assumes you are running on a version of Linux with `systemd`.

## How to configure

On Linux, with a direct install of NGINX Open Source edition, you should be able to find any configuration files in the `/etc/nginx/conf.d` folder. By default, the files and folder are owned by the `root` user.

Take note of the `default.conf` file, you may wish to comment out part or all of that. The Example below assumes that you have commented out the default entries or deleted the file.

The example config below should be put in another file such as `red.conf` in the same folder.

Note also that there are some default static pages in the `/usr/share/nginx/html/` folder. It is recommended that you edit these. At least remove everything from the `index.html` and `50x.html` page that Identifies NGINX and anything to do with who the server belongs to then leave that page as the default so that it will be presented if a route hasn't been covered by something more specific. You may also want to add a default `404.html` page. See the default conf to add a 404 default, you could choose to return the default index.html page for anything not found.

If changes are made to any of the conf files, you will need to restart the server using the command `sudo nginx -s reload`.

## `nginx.conf` file

Unlike the example files below, this lives in `/usr/share/nginx/`. You should edit this file if you want to load additional modules to NGINX.

## Example `default.conf` file

```nginx
# read more here http://tautt.com/best-nginx-configuration-for-security/

# don't send the nginx version number in error pages and Server header
server_tokens off;

# don't allow the browser to render the page inside an frame or iframe and avoid clickjacking http://en.wikipedia.org/wiki/Clickjacking
# if you need to allow [i]frames, you can use SAMEORIGIN or even set an uri with ALLOW-FROM uri https://developer.mozilla.org/en-US/docs/HTTP/X-Frame-Options
add_header X-Frame-Options SAMEORIGIN;

# when serving user-supplied content, include a X-Content-Type-Options: nosniff header along with the Content-Type: header,
# to disable content-type sniffing on some browsers.
# https://www.owasp.org/index.php/List_of_useful_HTTP_headers
# currently suppoorted in IE > 8 http://blogs.msdn.com/b/ie/archive/2008/09/02/ie8-security-part-vi-beta-2-update.aspx
# http://msdn.microsoft.com/en-us/library/ie/gg622941(v=vs.85).aspx
# 'soon' on Firefox https://bugzilla.mozilla.org/show_bug.cgi?id=471020
add_header X-Content-Type-Options nosniff;

# This header enables the Cross-site scripting (XSS) filter built into most recent web browsers.
# It's usually enabled by default anyway, so the role of this header is to re-enable the filter for 
# this particular website if it was disabled by the user.
# https://www.owasp.org/index.php/List_of_useful_HTTP_headers
add_header X-XSS-Protection "1; mode=block";

# with Content Security Policy (CSP) enabled(and a browser that supports it(http://caniuse.com/#feat=contentsecuritypolicy),
# you can tell the browser that it can only download content from the domains you explicitly allow
# http://www.html5rocks.com/en/tutorials/security/content-security-policy/
# https://www.owasp.org/index.php/Content_Security_Policy
# I need to change our application code so we can increase security by disabling 'unsafe-inline' 'unsafe-eval'
# directives for css and js(if you have inline css or js, you will need to keep it too).
# more: http://www.html5rocks.com/en/tutorials/security/content-security-policy/#inline-code-considered-harmful
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://ssl.google-analytics.com https://assets.zendesk.com https://connect.facebook.net; img-src 'self' https://ssl.google-analytics.com https://s-static.ak.facebook.com https://assets.zendesk.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://assets.zendesk.com; font-src 'self' https://themes.googleusercontent.com; frame-src https://assets.zendesk.com https://www.facebook.com https://s-static.ak.facebook.com https://tautt.zendesk.com; object-src 'none'";

# Default server entry
server {

    listen 80;
    listen [::]:80;
    server_name  localhost;

    # You should always have an access log for security and audit
    access_log  /var/log/nginx/host.access.log  main;

    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
    }

    error_page  404  /404.html;

    # redirect server error pages to the static page /50x.html
    #
    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }

    # proxy the PHP scripts to Apache listening on 127.0.0.1:80
    #
    #location ~ \.php$ {
    #    proxy_pass   http://127.0.0.1;
    #}

    # pass the PHP scripts to FastCGI server listening on 127.0.0.1:9000
    #
    #location ~ \.php$ {
    #    root           html;
    #    fastcgi_pass   127.0.0.1:9000;
    #    fastcgi_index  index.php;
    #    fastcgi_param  SCRIPT_FILENAME  /scripts$fastcgi_script_name;
    #    include        fastcgi_params;

    #}


    # deny access to .htaccess files, if Apache's document root
    # concurs with nginx's one
    #
    #location ~ /\.ht {
    #    deny  all;
    #}
}
```

## Example Node-RED & uibuilder config file `red.conf`

```

```
