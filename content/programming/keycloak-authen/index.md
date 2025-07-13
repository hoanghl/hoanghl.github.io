+++
title = "Ownership, pointer and reference"
date = 2025-02-23
description = " "
draft = false

[taxonomies]
tags = ["authentication","programming"]


[extra]
show_toc = true
show_copyright = false
show_comments = true
show_shares = false
keywords = "authentication,programming"
+++

Keycloak

primary target: get Bearer token

2 primary ways:
TODO: for each way, add example with python keycloak SDK

- Via OAuth: get code via authorization endpoint, then use code to get token from token endpoint:
  - This is standard way, available in Keycloak console -> Client -> Standard flow
  - URL: [Authorization code](https://www.keycloak.org/docs/25.0.6/securing_apps/index.html#authorization-code)
- Get directly token by providing the username and password:
  - to do this by ticking on Keycloak console -> clients -> Direct access grants
  - URL: https://www.keycloak.org/docs/25.0.6/securing_apps/index.html#authorization-code

For other method, please visit: https://www.keycloak.org/docs/25.0.6/securing_apps/index.html#authorization-code

TODO: Add sequence diagram to illustrate the flow: 3 actors: front-end, Keycloak and web server

2 essential endpoints (when hosting Keycloak, it already has 2 endpoints available):

- authorization endpoint: use to get authorization code with OAuth protocol
- token endpoint: get access endpoint and refresh endpoint

- access token: available by default in 5 min, after expired, ask Keycloak for new access token
- refresh token: instead of re-autheticate again as access token is expired, front-end uses this refresh token to connect directly with Keycloak and get new access token

TODO: Explore if the refresh token is also refreshed as asking for new access token using refresh token
