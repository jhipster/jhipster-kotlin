# We really love ❤ to have you as a contributor. 🎉🎉🎉 Thanks 🎉🎉🎉

## To run the application in development

### Step 1 ✌️ : to setup JHipster-Kotlin generator

`git clone https://github.com/jhipster/jhipster-kotlin`

`cd jhipster-kotlin`

`npm install`

`npm link -g`

( 🏁 Kudos, you just setup JHipster-Kotlin and created a global link to khipster executable )

## Generating samples

Create a new folder and generate an application sample using any of the following alternatives.

Default maven application:

```
khipster --defaults --skip-install
```

Default gradle application:

```
khipster --build gradle --defaults --skip-install
```

CI samples:

```
khipster generate-sample
```

Tips:

- Ktlint formatting is slow, disable with `--skip-ktlint-format`

## Synchronizing generator-jhipster templates

KHipster templates are convertions of generator-jhipster templates to kotlin.
Templates of both projects are written in [EJS](https://ejs.co/#docs).

KHipster templates are placed inside spring-boot's [templates](https://github.com/jhipster/jhipster-kotlin/tree/main/generators/spring-boot/templates) folder with an hierarchy based on generator-jhipster generators.
KHipster intercepts generator-jhipster writing tasks [replacing java templates with kotlin templates](https://github.com/jhipster/jhipster-kotlin/blob/fa0664034dda3d406dc0d11bff82d4ae1150e838/generators/spring-boot/generator.js#L52-L89).

To make easier to synchronize templates we provide a synchronize dev-blueprint which will place every copy every required template:

```sh
khipster synchronize
```

In the conflict resolution, check diff and press `i` if the template is synchronized.
`i` choice will add that file to be ignored in `.yo-resolve` file.

When synchronization is done revert `.yo-resolve` file to the initial previous state.

Tips:

- Avoid changing ejs flow control code for a cleaner diff against original java template
- In the confict resolution diff, you can edit the original file and press `r` to recreate the diff.

### Regular Contributor Guidelines

These are some of the guidelines that we would like you to follow if you are a regular contributor to the project
or joined the [JHipster team](https://www.jhipster.tech/team/).

- We recommend not committing directly to main, but always submit changes through PRs.
- Before merging, try to get at least one review on the PR.
- Add appropriate labels to issues and PRs that you create (if you have permission to do so).
- Follow the project's [policies](https://www.jhipster.tech/policies/#-policies).
- Follow the project's [Code of Conduct](https://github.com/jhipster/generator-jhipster/blob/main/CODE_OF_CONDUCT.md)
  and be polite and helpful to users when answering questions/bug reports and when reviewing PRs.
- We work on our free time so we have no obligation nor commitment. Work/life balance is important, so don't
  feel tempted to put in all your free time fixing something.
