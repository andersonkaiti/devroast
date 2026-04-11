import { type BundledLanguage, bundledLanguages } from 'shiki'

const HLJS_TO_SHIKI: Record<string, string> = {
  javascript: 'js',
  typescript: 'ts',
  python: 'py',
  shell: 'bash',
  sh: 'bash',
  zsh: 'bash',
  yml: 'yaml',
  mysql: 'sql',
  postgresql: 'sql',
  postgres: 'sql',
  rs: 'rust',
  golang: 'go',
  cs: 'csharp',
  'c++': 'cpp',
  rb: 'ruby',
  kt: 'kotlin',
  objc: 'objc',
  'objective-c': 'objc',
  pl: 'perl',
  dockerfile: 'docker',
  md: 'markdown',
  tex: 'latex',
  patch: 'diff',
  gql: 'graphql',
  hbs: 'handlebars',
  jinja: 'jinja2',
  clj: 'clojure',
  hs: 'haskell',
  ml: 'ocaml',
  fs: 'fsharp',
  js: 'js',
  ts: 'ts',
  py: 'py',
  bash: 'bash',
  html: 'html',
  xml: 'xml',
  css: 'css',
  scss: 'scss',
  sass: 'sass',
  less: 'less',
  json: 'json',
  jsonc: 'jsonc',
  yaml: 'yaml',
  toml: 'toml',
  sql: 'sql',
  rust: 'rust',
  go: 'go',
  java: 'java',
  csharp: 'csharp',
  cpp: 'cpp',
  c: 'c',
  php: 'php',
  ruby: 'ruby',
  kotlin: 'kotlin',
  swift: 'swift',
  r: 'r',
  matlab: 'matlab',
  lua: 'lua',
  perl: 'perl',
  docker: 'docker',
  makefile: 'makefile',
  cmake: 'cmake',
  'gradle-kts': 'gradle-kts',
  'maven-pom': 'maven-pom',
  ini: 'ini',
  conf: 'conf',
  properties: 'properties',
  markdown: 'markdown',
  mdx: 'mdx',
  latex: 'latex',
  vim: 'vim',
  diff: 'diff',
  graphql: 'graphql',
  vue: 'vue',
  jsx: 'jsx',
  tsx: 'tsx',
  handlebars: 'handlebars',
  erb: 'erb',
  ejs: 'ejs',
  groovy: 'groovy',
  gradle: 'gradle',
  scala: 'scala',
  scheme: 'scheme',
  clojure: 'clojure',
  elisp: 'elisp',
  lisp: 'lisp',
  haskell: 'haskell',
  elm: 'elm',
  ocaml: 'ocaml',
  fsharp: 'fsharp',
}

export function mapLanguage(
  hljsLang: string | null | undefined,
): BundledLanguage {
  if (!hljsLang) return 'js'

  const normalized = hljsLang.toLowerCase().trim()
  return (HLJS_TO_SHIKI[normalized] || 'js') as BundledLanguage
}

export function formatLanguageName(lang: BundledLanguage | string): string {
  const nameMap: Record<string, string> = {
    js: 'JavaScript',
    ts: 'TypeScript',
    jsx: 'JSX',
    tsx: 'TSX',
    py: 'Python',
    bash: 'Bash',
    html: 'HTML',
    css: 'CSS',
    scss: 'SCSS',
    sass: 'Sass',
    less: 'Less',
    json: 'JSON',
    jsonc: 'JSONC',
    yaml: 'YAML',
    toml: 'TOML',
    xml: 'XML',
    sql: 'SQL',
    rust: 'Rust',
    go: 'Go',
    java: 'Java',
    csharp: 'C#',
    cpp: 'C++',
    c: 'C',
    php: 'PHP',
    ruby: 'Ruby',
    kotlin: 'Kotlin',
    swift: 'Swift',
    objc: 'Objective-C',
    r: 'R',
    matlab: 'MATLAB',
    lua: 'Lua',
    perl: 'Perl',
    docker: 'Docker',
    makefile: 'Makefile',
    cmake: 'CMake',
    gradle: 'Gradle',
    'gradle-kts': 'Gradle (Kotlin)',
    'maven-pom': 'Maven',
    ini: 'INI',
    conf: 'Conf',
    properties: 'Properties',
    markdown: 'Markdown',
    mdx: 'MDX',
    latex: 'LaTeX',
    vim: 'Vim',
    diff: 'Diff',
    graphql: 'GraphQL',
    vue: 'Vue',
    handlebars: 'Handlebars',
    jinja2: 'Jinja2',
    erb: 'ERB',
    ejs: 'EJS',
    groovy: 'Groovy',
    scala: 'Scala',
    scheme: 'Scheme',
    clojure: 'Clojure',
    elisp: 'Elisp',
    lisp: 'Lisp',
    haskell: 'Haskell',
    elm: 'Elm',
    ocaml: 'OCaml',
    fsharp: 'F#',
  }

  const normalized = String(lang).toLowerCase()
  return nameMap[normalized] || lang
}

export function getAllLanguages(): BundledLanguage[] {
  return Object.keys(bundledLanguages) as BundledLanguage[]
}

let cachedLanguageList: Array<{ id: BundledLanguage; name: string }> | null =
  null

export function getLanguageList(): Array<{
  id: BundledLanguage
  name: string
}> {
  if (cachedLanguageList) return cachedLanguageList

  cachedLanguageList = getAllLanguages()
    .map((lang) => ({ id: lang, name: formatLanguageName(lang) }))
    .sort((a, b) => a.name.localeCompare(b.name))

  return cachedLanguageList
}
