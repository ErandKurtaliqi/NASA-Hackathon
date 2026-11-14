import { beforeMoonScope } from './moon-scope-contract.mjs'
// Historical route snapshots still protect all pre-existing content/layout.
// Only the newly authorized initial Apollo quiz accessibility attributes differ.
export function legacyApolloQuizMarkup(html) {
  if (!/id="apollo-(?:15|17)-rover-quiz-question"/.test(html)) return html
  return html
    .replace(/<span id="apollo-(?:15|17)-rover-quiz-position">/g, '<span>')
    .replace(/<h2 id="apollo-(?:15|17)-rover-quiz-question" tabindex="-1" class="[^"]*focusTarget[^"]*" aria-describedby="apollo-(?:15|17)-rover-quiz-position">/g, '<h2>')
    .replace(/(<div class="quiz-options">)([\s\S]*?)(<\/div>)/g, (_, start, options, end) => start + options.replaceAll(' type="button"', '') + end)
}

export function withBaselineApolloQuiz(source, baseline) {
  const extract = s => s.slice(s.indexOf('function QuizChapter('), s.indexOf('\n}', s.indexOf('function QuizChapter(')) + 2)
  const normalized = beforeMoonScope(source)
  return withoutApollo15ScrollPilot(withoutApollo17ScrollPilot(normalized)).replace("import apolloQuizStyles from './storytelling/ApolloQuiz.module.css'\n", '').replace(extract(normalized), extract(baseline))
}

// Only the isolated Apollo 15 branch is authorized to change. All shared
// completion handlers and the Apollo 17/Perseverance render paths stay protected.
export function withoutApollo15ScrollPilot(source) {
  return source.replace("import Apollo15ScrollStory from './storytelling/Apollo15ScrollStory'\n", '')
    .replace("import type { ReactNode } from 'react'\n", '')
    .replace(/  if\(story.id==='apollo-15-rover'\)\{\n    if\(index>unlockedIndex\)[\s\S]*?\n  }\n(?=  \/\/ The shell owns main)/, '')
}


// Apollo 17 now has its own authorized presentation. Remove only that seam
// when comparing protected shared completion logic with historical checkpoints.
export function withoutApollo17ScrollPilot(source) {
  return source.replace("import Apollo17ScrollStory from './storytelling/Apollo17ScrollStory'\n", '')
    .replace(/  if\(story.id==='apollo-17-rover'\)\{\n    if\(index>unlockedIndex\)[\s\S]*?\n  }\n(?=  \/\/ The shell owns main)/, '')
}
