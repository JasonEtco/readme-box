export const ReadmeContent = `# Header

<!--START_SECTION:example-->
Old stuff...
<!--END_SECTION:example-->

More stuff...`

export const getReadme = {
  path: 'README.md',
  sha: '123abc',
  content: Buffer.from(ReadmeContent).toString('base64')
}
