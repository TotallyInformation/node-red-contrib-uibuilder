---
created: 2024-06-24 15:56:07
updated: 2024-06-24 20:16:38
---

## Cloudflare Zero Trust Headers

cf-access-authenticated-user-email

## Testing

Here, I assume that your client device and your Node-RED server device are one and the same and that it is a Windows 11 desktop. This should work equally well on Linux or MacOS.

### Client: Use Cloudflare WARP

* Turn on Advanced > Configure Proxy Mode - set to 9999 (or other high port)
* Configure a spare browser to use as a SOCKS 5 proxy on `127.0.0.1:9999`, Set to proxy DNS.
* Turn on the connection
* Connect to [whatismyupaddress](https://whatismyipaddress.com/) or [what is my ip](https://whatismyip.org/)) and confirm that it states Cloudflare Inc. not your ISP.
* Access the route set up below using your configured browser.

This sends the browser's DNS and web traffic direct to Cloudflare through a tunnel rather than allowing internal access.

### Server: Use Cloudflared (CloudFlare Zero Trust)

* Install Cloudflared.
* Log onto the ZT portal and create a new tunnel.
* Follow the instructions on the resulting page.
* Should see the connector marked as connected.
* Create an **Public Hostname** route:
  * Public Hostnames
  * subdomain.domain/path - domain must already be defined to Cloudflare, optional subdomain must not be in use, path is optional
  * Service
    * type: http (or https depending on local Node-RED or proxy configuration)
    * url: LOCAL address, eg. localhost:1880
  * Optional app settings
    * e.g. add a custom host header
* If using UIBUILDER's custom ExpressJS web server
  * Select the existing tunnel, select the "Public Hostname" tab.
  * Create a new public hostname route for that as well (no 2nd tunnel is required).
  * The domain can be a different one as long as registered with Cloudflare. Or the same domain with different sub-domain and/or path.

Note that a ZT route can use WARP instead of Cloudflared. However, in this case, we are using WARP for the **outbound** connection.

* Add a ZT Application - self-hosted (must be using CF's DNS)
  * Don't forget to also add the 2nd sub-domain/path entry if using UIBUILDER's custom web server.



## Other

[App Launcher](https://totallyinfo.cloudflareaccess.com)
