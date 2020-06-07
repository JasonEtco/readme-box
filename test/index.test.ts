import { ReadmeBox } from '../src'

describe('ReadmeBox', () => {
  it('works', () => {
    const readme = new ReadmeBox({
      owner: 'JasonEtco',
      repo: 'readme-box',
      token: '123abc'
    })

    expect(readme).toBeInstanceOf(ReadmeBox)
  })
})
