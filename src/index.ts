import { request } from '@octokit/request'

interface ReadmeBoxOpts {
  owner: string
  repo: string
  token: string
  branch?: string
}

interface UpdateSectionOpts extends ReadmeBoxOpts {
  section: string
  message?: string
}

interface ReplaceSectionOpts {
  section: string
  newContents: string
  oldContents: string
}

export class ReadmeBox {
  public owner: string
  public repo: string
  public token: string
  public branch: string
  private request: typeof request

  constructor(opts: ReadmeBoxOpts) {
    this.owner = opts.owner
    this.repo = opts.repo
    this.token = opts.token
    this.branch = opts.branch || 'master'

    this.request = request.defaults({
      headers: {
        authorization: `token ${this.token}`
      }
    })
  }

  static async updateSection(newContents: string, opts: UpdateSectionOpts) {
    const box = new ReadmeBox(opts)

    // Get the README
    const { content, sha, path } = await box.getReadme()

    // Replace the old contents with the new
    const replaced = box.replaceSection({
      section: opts.section,
      oldContents: content,
      newContents
    })

    // Actually update the README
    return box.updateReadme({
      content: replaced,
      message: opts.message,
      sha,
      path
    })
  }

  async getReadme() {
    const { data } = await this.request('GET /repos/:owner/:repo/readme', {
      owner: this.owner,
      repo: this.repo
    })

    // The API returns the blob as base64 encoded, we need to decode it
    const encoded = data.content
    const decoded = Buffer.from(encoded, 'base64').toString('utf8')

    return {
      content: decoded,
      sha: data.sha,
      path: data.path
    }
  }

  async updateReadme(opts: {
    content: string
    sha: string
    path?: string
    message?: string
  }) {
    return this.request('PUT /repos/:owner/:repo/contents/:path', {
      owner: this.owner,
      repo: this.repo,
      content: opts.content,
      path: opts.path || 'README.md',
      message: opts.message || 'Updating the README!',
      sha: opts.sha,
      branch: 'master'
    })
  }

  getSection(section: string, content: string) {
    const reg = this.createRegExp(section)
    const match = content.match(reg)
    return match?.groups?.content
  }

  replaceSection(opts: ReplaceSectionOpts) {
    const reg = this.createRegExp(opts.section)

    if (!reg.test(opts.oldContents)) {
      throw new Error(
        `Contents do not contain start/end comments for section "${opts.section}"`
      )
    }

    return opts.oldContents.replace(reg, opts.newContents)
  }

  private createRegExp(section: string) {
    const START_COMMENT = `<!--START_SECTION:${section}-->`
    const END_COMMENT = `<!--END_SECTION:${section}-->`
    return new RegExp(`${START_COMMENT}(?<content>[\\s\\S]+)${END_COMMENT}`)
  }
}
