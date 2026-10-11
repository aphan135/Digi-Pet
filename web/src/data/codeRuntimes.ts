import type { Problem } from "../types";

export type CodeLanguage =
  | "javascript" | "typescript" | "python" | "c" | "cpp" | "java" | "go"
  | "rust" | "react" | "csharp" | "kotlin" | "php" | "ruby";

export interface RuntimeVersion {
  label: string;
  languageId: number;
}

export interface RuntimeOption {
  label: string;
  extension: string;
  versions: RuntimeVersion[];
}

export const codeRuntimes: Record<CodeLanguage, RuntimeOption> = {
  javascript: { label: "JavaScript", extension: "js", versions: [
    { label: "Node.js 18.15", languageId: 93 }, { label: "Node.js 20.17", languageId: 97 },
    { label: "Node.js 22.08", languageId: 102 },
  ] },
  typescript: { label: "TypeScript", extension: "ts", versions: [
    { label: "TypeScript 3.7", languageId: 74 }, { label: "TypeScript 5.0", languageId: 94 },
    { label: "TypeScript 5.6", languageId: 101 },
  ] },
  python: { label: "Python", extension: "py", versions: [
    { label: "Python 3.11", languageId: 92 }, { label: "Python 3.12", languageId: 100 },
    { label: "Python 3.13", languageId: 109 },
  ] },
  c: { label: "C", extension: "c", versions: [
    { label: "GCC 9.2", languageId: 50 }, { label: "GCC 14.1", languageId: 103 },
    { label: "Clang 19.1", languageId: 110 },
  ] },
  cpp: { label: "C++", extension: "cpp", versions: [
    { label: "GCC 7.4", languageId: 52 }, { label: "GCC 9.2", languageId: 54 },
    { label: "GCC 14.1", languageId: 105 },
  ] },
  java: { label: "Java", extension: "java", versions: [
    { label: "OpenJDK 13", languageId: 62 }, { label: "OpenJDK 17", languageId: 91 },
  ] },
  go: { label: "Go", extension: "go", versions: [
    { label: "Go 1.18", languageId: 95 }, { label: "Go 1.22", languageId: 106 },
    { label: "Go 1.23", languageId: 107 },
  ] },
  rust: { label: "Rust", extension: "rs", versions: [
    { label: "Rust 1.40", languageId: 73 }, { label: "Rust 1.85", languageId: 108 },
  ] },
  react: { label: "React / JSX", extension: "jsx", versions: [
    { label: "React 18 syntax", languageId: 102 }, { label: "React 19 syntax", languageId: 102 },
  ] },
  csharp: { label: "C#", extension: "cs", versions: [{ label: "Mono 6.6", languageId: 51 }] },
  kotlin: { label: "Kotlin", extension: "kt", versions: [
    { label: "Kotlin 1.3", languageId: 78 }, { label: "Kotlin 2.1", languageId: 111 },
  ] },
  php: { label: "PHP", extension: "php", versions: [
    { label: "PHP 7.4", languageId: 68 }, { label: "PHP 8.3", languageId: 98 },
  ] },
  ruby: { label: "Ruby", extension: "rb", versions: [{ label: "Ruby 2.7", languageId: 72 }] },
};

export const codeLanguageEntries = Object.entries(codeRuntimes) as [CodeLanguage, RuntimeOption][];

function commentLines(problem: Problem, marker: string) {
  return [problem.title, problem.prompt, `Expected output: ${problem.expectedOutput ?? "See prompt"}`]
    .map((line) => `${marker} ${line}`)
    .join("\n");
}

export function createStarterCode(problem: Problem, language: CodeLanguage): string {
  const jsStarter = problem.starterCode ?? "// Write your solution here\n";
  switch (language) {
    case "javascript": case "typescript": return jsStarter;
    case "python": return `${commentLines(problem, "#")}\n\ndef solve():\n    # Write your solution here\n    pass\n\nprint(solve())`;
    case "c": return `${commentLines(problem, "//")}\n\n#include <stdio.h>\n\nint main(void) {\n    // Write your solution here\n    return 0;\n}`;
    case "cpp": return `${commentLines(problem, "//")}\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}`;
    case "java": return `${commentLines(problem, "//")}\n\nclass Main {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}`;
    case "go": return `${commentLines(problem, "//")}\n\npackage main\n\nimport "fmt"\n\nfunc main() {\n    // Write your solution here\n    fmt.Println("TODO")\n}`;
    case "rust": return `${commentLines(problem, "//")}\n\nfn main() {\n    // Write your solution here\n    println!("TODO");\n}`;
    case "react": return `${commentLines(problem, "//")}\n\nfunction Exercise() {\n  const answer = "TODO";\n  return <output>{answer}</output>;\n}\n\nconst view = Exercise();\nconsole.log(view.props.children[0]);`;
    case "csharp": return `${commentLines(problem, "//")}\n\nusing System;\n\nclass Program {\n    static void Main() {\n        // Write your solution here\n    }\n}`;
    case "kotlin": return `${commentLines(problem, "//")}\n\nfun main() {\n    // Write your solution here\n}`;
    case "php": return `<?php\n${commentLines(problem, "//")}\n\n// Write your solution here\n`;
    case "ruby": return `${commentLines(problem, "#")}\n\n# Write your solution here`;
  }
}
