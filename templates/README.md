<h1 align="center"><%= packageName %> </h1>
<p>
<% if (isProjectOnNpm) { -%>
  <a href="https://www.npmjs.com/package/<%= packageName %>" target="_blank">
    <img alt="Version" src="https://img.shields.io/npm/v/<%= packageName %>.svg">
  </a>
  <a href="https://www.npmjs.com/package/<%= packageName %>" target="_blank">
    <img alt="npm downloads" src="https://img.shields.io/npm/dt/<%= packageName %>?label=npm%20downloads&color=yellow">
  </a>
<% } -%>
<% if (projectVersion && isJSProject) { -%>
  <img alt="Version" src="https://img.shields.io/github/package-json/v/<%= authorGithubUsername %>/<%= packageName %>.svg" />
<% } -%>
<% if (isOpenSource && isInitDocker) { -%>
  <a href="https://hub.docker.com/r/<%= dockerUsername %>/<%= projectName %>" target="_blank">
    <img alt="Docker Pulls" src="https://img.shields.io/docker/pulls/<%= dockerUsername %>/<%= projectName %>">
  </a>
<% } -%>
<% if (isGithubRepos && isInitSemanticRelease) { -%>
  <a href="<%= repositoryUrl %>/actions?query=workflow%3ARelease" target="_blank">
    <img alt="GitHub Workflow Status" src="https://img.shields.io/github/actions/workflow/status/<%= authorGithubUsername %>/<%= projectName %>/release.yml?branch=master">
  </a>
<% } -%>
<% if (isProjectOnNpm) { -%>
  <img src="https://img.shields.io/node/v/<%= packageName %>" />
<% } -%>
<% if (!isProjectOnNpm && projectPrerequisites) { -%>
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
<% if (license) { -%>
  <a href="<%= licenseUrl ? licenseUrl : '#' %>" target="_blank">
    <img alt="License: <%= license %>" src="https://img.shields.io/github/license/<%= githubUsername %>/<%= projectName %>?color=yellow" />
  </a>
<% } -%>
</p>

<% if (projectDescription) { -%>

> <%= projectDescription %>
<% } -%>
<% if (projectHomepage) { -%>

## 🏠 主页

[<%= projectHomepage %>](<%= projectHomepage %>)

<% } -%>
<% if (projectPrerequisites && projectPrerequisites.length) { -%>

## 📦 依赖要求

<% projectPrerequisites.map(({ name, value }) => { -%>

- <%= name %> <%= value %>
<% }) -%>
<% } -%>
<% if (installCommand) { -%>

## 🚀 安装

```sh
<%= installCommand %>
```
<% } -%>
<% if (usage) { -%>

## 👨‍💻 使用

```sh
<%= usage %>
```
<% } -%>
<% if (devCommand) { -%>

## 🛠️ 开发

```sh
<%= devCommand %>
```
<% } -%>
<% if (buildCommand) { -%>

## 🔧 编译

```sh
<%= buildCommand %>
```
<% } -%>
<% if (testCommand) { -%>

## 🧪 测试

```sh
<%= testCommand %>
```
<% } -%>
<% if (lintCommand) { -%>

## 🔍 Lint

```sh
<%= lintCommand %>
```
<% } -%>
<% if (commitCommand) { -%>

## 💾 Commit

```sh
<%= commitCommand %>
```
<% } -%>


## 👤 作者

<% if (authorName) { %>
**<%= authorName %>**
<% } -%>

<% if (authorWebsite) { -%>
* Website: [<%= authorWebsite %>](<%= authorWebsite %>)

<% } -%>
<% if (githubUsername) { -%>
* GitHub: [@<%= githubUsername %>](https://github.com/<%= githubUsername %>)
<% } -%>
<% if (twitterUsername) { -%> 
* Twitter: [@<%= twitterUsername %>](https://twitter.com/<%= twitterUsername %>)
<% } -%>
<% if (weiboUsername) { -%> 
* Weibo: [@<%= weiboUsername %>](https://weibo.com/<%= weiboUsername %>)
<% } -%>

<% if (issuesUrl) { -%>

## 🤝 贡献

欢迎 贡献、提问或提出新功能！<br />如有问题请查看 [issues page](<%= issuesUrl %>). <br/><%= contributingUrl ? `贡献或提出新功能可以查看[contributing guide](${contributingUrl}).` : '' %>
<% } -%>

## 💰 支持

如果觉得这个项目有用的话请给一颗⭐️，非常感谢
<% if (isEnableSupport) { -%>

<% if (afdianUsername) { -%>
<a href="https://afdian.com/@<%= afdianUsername %>">
  <img src="https://oss.cmyr.dev/images/202306192324870.png" width="312px" height="78px" alt="在爱发电支持我">
</a>
<% } -%>

<% if (patreonUsername) { -%>
<a href="https://patreon.com/<%= patreonUsername %>">
    <img src="https://oss.cmyr.dev/images/202306142054108.svg" width="312px" height="78px" alt="become a patreon"/>
</a>
<% } -%>
<% } -%>
<% if (isEnableStarHistory) { -%>

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=<%= authorGithubUsername %>/<%= projectName %>&type=Date)](https://star-history.com/#<%= authorGithubUsername %>/<%= projectName %>&Date)
<% } -%>

<% if (license && licenseUrl) { -%>
## 📝 License

<% if (authorName && authorGithubUsername) { -%>
Copyright © <%= currentYear %> [<%= authorName %>](https://github.com/<%= authorGithubUsername %>).<br />
<% } -%>
This project is [<%= license %>](<%= licenseUrl %>) licensed.
<% } -%>

***
_This README was generated with ❤️ by [cmyr-template-cli](https://github.com/CaoMeiYouRen/cmyr-template-cli)_
