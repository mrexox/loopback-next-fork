---
lang: en
title: 'Summary'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI
sidebar: lb4_sidebar
permalink: /doc/en/lb4/core-tutorial-part11.html
---

As a summary, we have explained how various features in LoopBack core modules
can be useful for our developers to build a scalable Node.js application.

- [Inversion of Control](3-context-in-action.md) and
  [Dependency Injection](4-dependency-injection.md) serves as the foundation to
  manage artifacts within a Node.js application which keeps the construction of
  dependencies of a class separated from its behaviors.
- [Extension points and extension framework](5-extension-point-extension.md)
  help you to organize artifacts with loose coupling and promote extensibility.
- [Observers](7-observation.md) and [interceptors](6-interception.md) allows you
  to add logic as part of the application life cycle events.
- [Configuration](8-configuration.md) can be added to extension points,
  extensions and services which enables greater flexibility in your application.
- [Boot by convention](9-boot-by-convention.md) allows artifacts automatically
  discovered and loaded.

In addition, LoopBack can also be used as the framework to create microservices.
The [Twelve-Factor App](https://12factor.net) methodology promotes some key
architectural principles for building software-as-a-service applications. This
section shows how the criteria of Twelve-Factor are satisfied by Node.js
application powered by LoopBack.

- **Codebase**: LoopBack application code can be committed to GitHub for the
  version control.
- **Dependencies**: [Dependency injection](../../Dependency-injection.md) can be
  used to keep the construction of dependencies of a class or function separated
  from its behavior.

- **Config**: LoopBack provides context-based configuration and pluggable
  configuration resolver.

- **Backing services**: The concepts of services and datasources in LoopBack are
  the backing services for an application.

- **Build, release, run**: LoopBack applications which are scaffolded by the CLI
  contains npm scripts to build and run the applications.

- **Processes**: A LoopBack application can be deployed and run in a stateless
  Docker container. A `Dockerfile` is generated by default when scaffolding a
  LoopBack application.

- **Port binding**: Export services via port binding is possible through the
  HTTP/HTTPS server within a LoopBack application with additional
  configurations.

- **Disposability**: There are life cycle event observers and interceptors that
  you can add logic to maximize robustness.

--

Previous: [Part 10 - Advanced recipes](./10-advanced-recipes.md)
