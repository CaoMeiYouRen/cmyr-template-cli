<h1 align="center"><%= projectName %> </h1>
<p>
<% if (isProjectOnNpm) { -%>
  <a href="https://www.npmjs.com/package/<%= projectName %>" target="_blank">
    <img alt="Version" src="https://img.shields.io/npm/v/<%= projectName %>.svg">
  </a>
<% } -%>
<% if (projectVersion && !isProjectOnNpm) { -%>
  <img alt="Version" src="https://img.shields.io/badge/version-<%= projectVersion %>-blue.svg?cacheSeconds=2592000" />
<% } -%>
<% if (isGithubRepos && isInitSemanticRelease) { -%>
  <a href="<%= repositoryUrl %>/actions?query=workflow%3ARelease" target="_blank">
    <img alt="GitHub Workflow Status" src="https://img.shields.io/github/workflow/status/<%= authorGithubUsername %>/<%= projectName %>/Release">
  </a>
<% } -%>
<% if (projectPrerequisites) { -%>
<% projectPrerequisites.map(({ name, value }) => { -%>
  <img src="https://img.shields.io/badge/<%= name %>-<%= encodeURIComponent(value) %>-blue.svg" />
<% }) -%>
<% } -%>
<% if (projectDocumentationUrl) { -%>
  <a href="<%= projectDocumentationUrl %>" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
<% } -%>
<% if (isGithubRepos) { -%>
  <a href="<%= repositoryUrl %>/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  </a>
<% } -%>
<% if (licenseName) { -%>
  <a href="<%= licenseUrl ? licenseUrl : '#' %>" target="_blank">
    <img alt="License: <%= licenseName %>" src="https://img.shields.io/<%= `badge/License-${licenseName}-yellow.svg` %>" />
  </a>
<% } -%>
</p>

<% if (projectDescription) { -%>

> <%= projectDescription %>
<% } -%>
<% if (projectHomepage) { -%>

### 🏠 [主页](<%= projectHomepage %>)

[<%= projectHomepage %>](<%= projectHomepage %>)

<% } -%>
<% if (projectDemoUrl) { -%>

### ✨ [Demo](<%= projectDemoUrl %>)

[<%= projectDemoUrl %>](<%= projectDemoUrl %>)

<% } -%>
<% if (projectPrerequisites && projectPrerequisites.length) { -%>

## 依赖要求

<% projectPrerequisites.map(({ name, value }) => { -%>

- <%= name %> <%= value %>
<% }) -%>
<% } -%>
<% if (installCommand) { -%>

## 安装

```sh
<%= installCommand %>
```
<% } -%>
<% if (usage) { -%>

## 使用

```sh
<%= usage %>
```
<% } -%>
<% if (devCommand) { -%>

## 开发

```sh
<%= devCommand %>
```
<% } -%>
<% if (buildCommand) { -%>

## 编译

```sh
<%= buildCommand %>
```
<% } -%>
<% if (testCommand) { -%>

## 测试

```sh
<%= testCommand %>
```
<% } -%>
<% if (lintCommand) { -%>

## Lint

```sh
<%= lintCommand %>
```
<% } -%>
<% if (commitCommand) { -%>

## Commit

```sh
<%= commitCommand %>
```
<% } -%>

<% if (authorName || authorGithubUsername) { -%>

## 作者

<% if (authorName) { %>
👤 **<%= authorName %>**
<% } %>
<% if (authorWebsite) { -%>
* Website: [<%= authorWebsite %>](<%= authorWebsite %>)
<% } -%>
<% if (authorGithubUsername) { -%>
* GitHub: [@<%= authorGithubUsername %>](https://github.com/<%= authorGithubUsername %>)
<% } -%>
<% } %>
<% if (issuesUrl) { -%>

## 🤝贡献

欢迎 贡献、提问或提出新功能！<br />如有问题请查看 [issues page](<%= issuesUrl %>). <br/><%= contributingUrl ? `贡献或提出新功能可以查看[contributing guide](${contributingUrl}).` : '' %>
<% } -%>

## 💰支持

如果觉得这个项目有用的话请给一颗⭐️，非常感谢
<% if (isEnableAfdian) { -%>

<a href="https://afdian.net/@<%= authorName %>">
  <img src="https://cdn.jsdelivr.net/gh/CaoMeiYouRen/image-hosting-01@master/images/202112181214695.png">
</a>
<% } -%>
<% if (licenseName && licenseUrl) { -%>

## 📝 License

<% if (authorName && authorGithubUsername) { -%>
Copyright © <%= currentYear %> [<%= authorName %>](https://github.com/<%= authorGithubUsername %>).<br />
<% } -%>
This project is [<%= licenseName %>](<%= licenseUrl %>) licensed.
<% } -%>

***
_This README was generated with ❤️ by [cmyr-template-cli](https://github.com/CaoMeiYouRen/cmyr-template-cli)_
