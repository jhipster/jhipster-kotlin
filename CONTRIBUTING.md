# We really love ❤ to have you as a contributor. 🎉🎉🎉 Thanks 🎉🎉🎉

## To run the application in development

### Step 1 ✌️ : to setup JHipster-Kotlin generator

`git clone https://github.com/jhipster/jhipster-kotlin`

`cd jhipster-kotlin`

`npm install | yarn`

`npm link | yarn link`

( 🏁 Kudos, you just setup JHipster-Kotlin and linked to it locally )

### Step 2 🤟 : before generating your application, go to your application folder

`yarn link "generator-jhipster-kotlin"`

or

`npm link "generator-jhipster-kotlin"`

( 🏁 Kudos, you have done it. It is the time to generate the application `khipster` )

✨✨✨✨ You are rocking ✨✨✨✨

Fix / Code / Document and create a pull request 💯

### Synchronizing generator-jhipster templates

Run:

```sh
khipster synchronize
```

In the conflict resolution, check diff and press `i` if the template is synchronized.
`i` choice will add that file to be ignored in `.yo-resolve` file.

When synchronization is done revert `.yo-resolve` file to the initial previous state.

Tips:

-   Avoid changing ejs flow control code for a cleaner diff against original java template
-   In the confict resolution diff, you can edit the original file and press `r` to recreate the diff.

### Regular Contributor Guidelines

These are some of the guidelines that we would like you to follow if you are a regular contributor to the project
or joined the [JHipster team](https://www.jhipster.tech/team/).

-   We recommend not committing directly to main, but always submit changes through PRs.
-   Before merging, try to get at least one review on the PR.
-   Add appropriate labels to issues and PRs that you create (if you have permission to do so).
-   Follow the project's [policies](https://www.jhipster.tech/policies/#-policies).
-   Follow the project's [Code of Conduct](https://github.com/jhipster/generator-jhipster/blob/main/CODE_OF_CONDUCT.md)
    and be polite and helpful to users when answering questions/bug reports and when reviewing PRs.
-   We work on our free time so we have no obligation nor commitment. Work/life balance is important, so don't
    feel tempted to put in all your free time fixing something.
