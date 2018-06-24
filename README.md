
<div align="center">
	<a href="https://github.com/jhipster/jhipster-kotlin">
		<img width="160" height="200" src="https://github.com/jhipster/jhipster-kotlin/blob/master/logo-khipster.png">
	</a>
</div>

# Greetings, Kotlin Hipster!

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url-main]
[![Dependency Status][daviddm-image]][daviddm-url]

A Kotlin application generator based on JHipster.

To generate application run

`jhipster --blueprint kotlin`

# To run the application in development

Step 1 : to setup JHipster locally

`git clone https://github.com/jhipster/generator-jhipster`

`cd generator-jhipster`

`npm install | yarn`

`npm link | yarn link`

Step 2 : to setup KHipster generator

`git clone https://github.com/jhipster/jhipster-kotlin`

`cd jhipster-kotlin`

`npm install | yarn`

`npm link | yarn link`

`npm link generator-jhipster | yarn link generator-jhipster`

Step 3 : before generating your application, go to your application folder

`yarn link "generator-jhipster" && yarn link "generator-jhipster-kotlin"`

or

`npm link "generator-jhipster" && npm link "generator-jhipster-kotlin"`


Conversations are happening at [here](https://jhipster-kotlin.slack.com)


#### Kotlin conversion is in progress...


PRS are welcome :bowtie:

Wide testing is needed :eyeglasses:


[khipster-image]: https://raw.githubusercontent.com/sendilkumarn/jhipster-kotlin-artwork/master/logo-khipster.png
[npm-image]: https://badge.fury.io/js/generator-jhipster-kotlin.svg
[npm-url]: https://npmjs.org/package/generator-jhipster-kotlin
[travis-image]: https://travis-ci.org/jhipster/jhipster-kotlin.svg?branch=master
[travis-url-main]: https://travis-ci.org/jhipster/jhipster-kotlin
[daviddm-image]: https://david-dm.org/jhipster/generator-jhipster-kotlin.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/jhipster/generator-jhipster-kotlin
