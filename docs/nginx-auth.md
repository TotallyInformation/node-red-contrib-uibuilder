
## Basic authentication

When web server asks for an auth, the browser gets a HTTP 401 code and prompts the user for username and password.

If the correct details provided, the server returns the expected content. The client does not get any authorisation headers. Add a custom header with the `$remote_user` NGINX variable if you want to pass the logged in username to the client.

Otherwise the 401 Authorization Required page is returned.

https://nginx.org/en/docs/http/ngx_http_auth_basic_module.html

### Example config

```conf
  location /authbasic/ {
    # sudo htpasswd -c /etc/nginx/.htpasswd me # thisisme
    satisfy all;
    auth_basic "Auth Basic"; # relm, any text you like
    auth_basic_user_file /etc/nginx/.htpasswd;
    add_header X-JK-Proxy "Basic Auth Test";
    add_header X-JK-User $remote_user;  # Returns the logged in username

    # proxy_set_header Authorization ""; # If you don't want the upstream to receive the auth
    proxy_pass https://localhost:1880/authbasic/;
  }
```

## Digest authentication

Not considered secure enough for inclusion in the default NGINX build.

https://www.nginx.com/resources/wiki/modules/auth_digest/

## Sub-request authentication
