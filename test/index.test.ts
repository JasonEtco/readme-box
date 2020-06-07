import nock from 'nock'
import { ReadmeBox, UpdateSectionOpts } from '../src'
import * as fixtures from './fixtures'

describe('ReadmeBox', () => {
  let opts: UpdateSectionOpts
  let updateFileContentsParams: any

  beforeEach(() => {
    opts = {
      owner: 'JasonEtco',
      repo: 'readme-box',
      token: '123abc',
      section: 'example'
    }

    nock('https://api.github.com')
      .get(`/repos/${opts.owner}/${opts.repo}/readme`)
      .reply(200, fixtures.getReadme)
      .put(`/repos/${opts.owner}/${opts.repo}/contents/README.md`)
      .reply(200, (_, body) => {
        updateFileContentsParams = body
      })
  })

  afterEach(() => {
    nock.cleanAll()
  })

  it('runs a test', () => {
    const readme = new ReadmeBox(opts)
    expect(readme).toBeInstanceOf(ReadmeBox)
  })

  describe('.updateSection', () => {
    it('calls the API requests and updates the section of the README', async () => {
      await ReadmeBox.updateSection('New content!', opts)
      expect(nock.isDone()).toBe(true)
      expect(updateFileContentsParams.content).toBe(
        fixtures.ReadmeContent.replace('Old stuff...', 'New content!')
      )
    })
  })
})
