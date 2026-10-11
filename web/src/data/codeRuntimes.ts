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

export interface CodeContract {
  signature: string;
  testCall: string;
}

export function getCodeContract(problem: Problem): CodeContract {
  const starter = problem.starterCode ?? "";
  const functionMatch = starter.match(/function\s+([A-Za-z_$][\w$]*)\s*\(([^)]*)\)/);
  const logMatches = [...starter.matchAll(/console\.log\((.+)\);?/g)];
  const loggedExpression = logMatches[logMatches.length - 1]?.[1]?.replace(/\);$/, ")");

  return {
    signature: functionMatch
      ? `${functionMatch[1]}(${functionMatch[2].trim()})`
      : "Complete the provided program",
    testCall: loggedExpression ?? "Use the named values shown in the starter code",
  };
}

function commentLines(problem: Problem, marker: string) {
  const starterContract = problem.starterCode
    ? ["", "Exercise contract and test data:", ...problem.starterCode.split("\n")]
    : [];
  return [
    problem.title,
    problem.prompt,
    `Expected output: ${problem.expectedOutput ?? "See prompt"}`,
    ...starterContract,
  ]
    .map((line) => `${marker} ${line}`)
    .join("\n");
}

function problemSignals(problem: Problem) {
  return `${problem.id} ${problem.title} ${problem.prompt} ${problem.starterCode ?? ""}`.toLowerCase();
}

function matches(signal: string, pattern: RegExp) {
  return pattern.test(signal);
}

function cppHeaders(problem: Problem) {
  const signal = problemSignals(problem);
  const headers = new Set(["iostream"]);
  if (matches(signal, /array|values|items|indices|triplet|window|coins|children|graph|tree|list/)) headers.add("vector");
  if (matches(signal, /sort|sorted|three.?sum|next greater|minimum|maximum|reverse/)) headers.add("algorithm");
  if (matches(signal, /frequency|hash|two.?sum|counts|memo|latest index|group/)) headers.add("unordered_map");
  if (matches(signal, /unique|consecutive|visited|cycle|reachability/)) headers.add("unordered_set");
  if (matches(signal, /stack|parenthes|bracket|undo|histogram/)) headers.add("stack");
  if (matches(signal, /queue|breadth|bfs|level.?order|requests|scheduling/)) headers.add("queue");
  if (matches(signal, /text|word|string|character|path|url|fruit|request|job|email/)) headers.add("string");
  return [...headers].sort().map((header) => `#include <${header}>`).join("\n");
}

function cHeaders(problem: Problem) {
  const signal = problemSignals(problem);
  const headers = new Set(["stdio.h"]);
  if (matches(signal, /true|false|boolean|balanced|contains|path|palindrome|pair|cycle/)) headers.add("stdbool.h");
  if (matches(signal, /text|word|string|character|path|url/)) headers.add("string.h");
  if (matches(signal, /linked|node|tree|graph|dynamic|allocate/)) headers.add("stdlib.h");
  return [...headers].sort().map((header) => `#include <${header}>`).join("\n");
}

function pythonImports(problem: Problem) {
  const signal = problemSignals(problem);
  const imports: string[] = [];
  if (matches(signal, /frequency|counts/)) imports.push("Counter");
  if (matches(signal, /group|graph/)) imports.push("defaultdict");
  if (matches(signal, /queue|breadth|bfs|level.?order|requests/)) imports.push("deque");
  return imports.length ? `from collections import ${imports.join(", ")}\n\n` : "";
}

function javaImports(problem: Problem) {
  const signal = problemSignals(problem);
  const imports: string[] = [];
  if (matches(signal, /frequency|hash|two.?sum|counts|memo|group/)) imports.push("HashMap", "Map");
  if (matches(signal, /unique|consecutive|visited|cycle|reachability/)) imports.push("HashSet", "Set");
  if (matches(signal, /stack|queue|breadth|bfs|parenthes|bracket|level.?order/)) imports.push("ArrayDeque", "Deque");
  if (matches(signal, /sort|sorted|three.?sum|reverse/)) imports.push("Arrays");
  return [...new Set(imports)].map((name) => `import java.util.${name};`).join("\n");
}

function rustImports(problem: Problem) {
  const signal = problemSignals(problem);
  const imports: string[] = [];
  if (matches(signal, /frequency|hash|two.?sum|counts|memo|group/)) imports.push("HashMap");
  if (matches(signal, /unique|consecutive|visited|cycle|reachability/)) imports.push("HashSet");
  if (matches(signal, /queue|breadth|bfs|level.?order|requests/)) imports.push("VecDeque");
  return imports.length ? `use std::collections::{${imports.join(", ")}};\n\n` : "";
}

function arraySumStarter(language: CodeLanguage): string | null {
  switch (language) {
    case "javascript":
    case "typescript":
      return null;
    case "python":
      return "def sum(values):\n    # Return the total of every value\n    pass\n\nvalues = [1, 2, 3, 4]\nprint(sum(values))";
    case "c":
      return "#include <stdio.h>\n\nint sum(const int values[], int length) {\n    // Return the total of every value\n    return 0;\n}\n\nint main(void) {\n    int values[] = {1, 2, 3, 4};\n    int length = sizeof(values) / sizeof(values[0]);\n    printf(\"%d\\n\", sum(values, length));\n    return 0;\n}";
    case "cpp":
      return "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint sum(const vector<int>& values) {\n    // Return the total of every value\n    return 0;\n}\n\nint main() {\n    vector<int> values = {1, 2, 3, 4};\n    cout << sum(values) << endl;\n    return 0;\n}";
    case "java":
      return "class Main {\n    static int sum(int[] values) {\n        // Return the total of every value\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        int[] values = {1, 2, 3, 4};\n        System.out.println(sum(values));\n    }\n}";
    case "go":
      return "package main\n\nimport \"fmt\"\n\nfunc sum(values []int) int {\n    // Return the total of every value\n    return 0\n}\n\nfunc main() {\n    values := []int{1, 2, 3, 4}\n    fmt.Println(sum(values))\n}";
    case "rust":
      return "fn sum(values: &[i32]) -> i32 {\n    // Return the total of every value\n    0\n}\n\nfn main() {\n    let values = [1, 2, 3, 4];\n    println!(\"{}\", sum(&values));\n}";
    case "react":
      return "function sum(values) {\n  // Return the total of every value\n}\n\nfunction Exercise() {\n  const values = [1, 2, 3, 4];\n  return <output>{sum(values)}</output>;\n}\n\nconst view = Exercise();\nconsole.log(view.props.children[0]);";
    case "csharp":
      return "using System;\n\nclass Program {\n    static int Sum(int[] values) {\n        // Return the total of every value\n        return 0;\n    }\n\n    static void Main() {\n        int[] values = { 1, 2, 3, 4 };\n        Console.WriteLine(Sum(values));\n    }\n}";
    case "kotlin":
      return "fun sum(values: IntArray): Int {\n    // Return the total of every value\n    return 0\n}\n\nfun main() {\n    val values = intArrayOf(1, 2, 3, 4)\n    println(sum(values))\n}";
    case "php":
      return "<?php\nfunction sumValues(array $values): int {\n    // Return the total of every value\n    return 0;\n}\n\n$values = [1, 2, 3, 4];\necho sumValues($values) . PHP_EOL;";
    case "ruby":
      return "def sum(values)\n  # Return the total of every value\nend\n\nvalues = [1, 2, 3, 4]\nputs sum(values)";
  }
}

export function createStarterCode(problem: Problem, language: CodeLanguage): string {
  const jsStarter = problem.starterCode ?? "// Write your solution here\n";
  if (problem.id === "array-sum") {
    const translatedStarter = arraySumStarter(language);
    if (translatedStarter) return translatedStarter;
  }
  switch (language) {
    case "javascript": case "typescript": return jsStarter;
    case "python": return `${commentLines(problem, "#")}\n\n${pythonImports(problem)}def solve():\n    # Write your solution here\n    pass\n\nprint(solve())`;
    case "c": return `${commentLines(problem, "//")}\n\n${cHeaders(problem)}\n\nint main(void) {\n    // Write your solution here\n    return 0;\n}`;
    case "cpp": return `${commentLines(problem, "//")}\n\n${cppHeaders(problem)}\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}`;
    case "java": return `${commentLines(problem, "//")}\n\n${javaImports(problem)}${javaImports(problem) ? "\n\n" : ""}class Main {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}`;
    case "go": return `${commentLines(problem, "//")}\n\npackage main\n\nimport "fmt"\n\nfunc main() {\n    // Write your solution here\n    fmt.Println("TODO")\n}`;
    case "rust": return `${commentLines(problem, "//")}\n\n${rustImports(problem)}fn main() {\n    // Write your solution here\n    println!("TODO");\n}`;
    case "react": return `${commentLines(problem, "//")}\n\nfunction Exercise() {\n  const answer = "TODO";\n  return <output>{answer}</output>;\n}\n\nconst view = Exercise();\nconsole.log(view.props.children[0]);`;
    case "csharp": return `${commentLines(problem, "//")}\n\nusing System;${matches(problemSignals(problem), /array|values|items|list|map|set|stack|queue|tree|graph/) ? "\nusing System.Collections.Generic;" : ""}\n\nclass Program {\n    static void Main() {\n        // Write your solution here\n    }\n}`;
    case "kotlin": return `${commentLines(problem, "//")}\n\nfun main() {\n    // Write your solution here\n}`;
    case "php": return `<?php\n${commentLines(problem, "//")}\n\n// Write your solution here\n`;
    case "ruby": return `${commentLines(problem, "#")}\n\n${problem.expectedOutput?.trim().match(/^[{[]/) ? "require \"json\"\n" : ""}${matches(problemSignals(problem), /unique|consecutive|visited|cycle/) ? "require \"set\"\n" : ""}\n# Write your solution here`;
  }
}
