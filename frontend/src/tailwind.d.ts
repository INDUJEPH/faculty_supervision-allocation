declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '@tailwindcss/typography' {
  const content: any;
  export default content;
}

declare module 'tailwindcss-animate' {
  const content: any;
  export default content;
} 