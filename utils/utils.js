const readingTime = (blog) => {
  const noOfWords = blog.trim().split(/\s+/).length;
  const wordsPerMinute = noOfWords / 200;
  const estimatedTime = Math.round(wordsPerMinute)
  return estimatedTime === 0 ? 1 : estimatedTime;
}

module.exports = readingTime;