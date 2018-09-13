const app = require('./')

describe('isWordASecret', () => {
  it('should flag these', () => {
    expect(app.isWordASecret('ZVyyCKt7i2JMtlaJgnYExjRyBlI1KOHbxiDcseWQ9at5uHFvQl')).toBe(true)
  })

  it('should not flag these', () => {
    expect(app.isWordASecret('dangerouslySetInnerHTML')).toBe(false)
  })
})
