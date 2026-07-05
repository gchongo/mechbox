/**
 * 解析帮助/说明文本中的 LaTeX（$...$ / $$...$$）与 **加粗**
 * @returns {{ type: 'text'|'bold'|'math', content: string, block?: boolean }[]}
 */
export function parseMathContent(input) {
  const source = input ?? ''
  if (!source) return []

  const result = []
  const mathRegex = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g
  let lastIndex = 0
  let match

  while ((match = mathRegex.exec(source)) !== null) {
    if (match.index > lastIndex) {
      pushTextAndBold(result, source.slice(lastIndex, match.index))
    }
    if (match[1] != null) {
      result.push({ type: 'math', content: match[1].trim(), block: true })
    } else {
      result.push({ type: 'math', content: match[2].trim(), block: false })
    }
    lastIndex = mathRegex.lastIndex
  }

  if (lastIndex < source.length) {
    pushTextAndBold(result, source.slice(lastIndex))
  }

  if (!result.length) {
    pushTextAndBold(result, source)
  }

  return result
}

function pushTextAndBold(result, chunk) {
  if (!chunk) return
  const boldRegex = /\*\*([^*]+)\*\*/g
  let lastIndex = 0
  let match
  let found = false

  while ((match = boldRegex.exec(chunk)) !== null) {
    found = true
    if (match.index > lastIndex) {
      result.push({ type: 'text', content: chunk.slice(lastIndex, match.index) })
    }
    result.push({ type: 'bold', content: match[1] })
    lastIndex = boldRegex.lastIndex
  }

  if (!found) {
    result.push({ type: 'text', content: chunk })
    return
  }

  if (lastIndex < chunk.length) {
    result.push({ type: 'text', content: chunk.slice(lastIndex) })
  }
}
