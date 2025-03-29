declare module '*.scss' {
  const content: string
  export default content
}

declare module '*.html' {
  const content: (i18n: (key: string) => string) => string;
  export default content;
}
