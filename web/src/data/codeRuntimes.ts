import type { Problem } from "../types";
import { codeSpecs, type CodeSpec, type CycleValue, type NaryValue, type ParamType, type TreeValue } from "./codeSpecs";

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

export function getCodeSpec(problem: Problem): CodeSpec | undefined {
  return codeSpecs[problem.id];
}

export function getCodeContract(problem: Problem): CodeContract {
  const spec = getCodeSpec(problem);
  if (spec) {
    return {
      signature: `${spec.fn}(${spec.params.map((p) => `${p.name}: ${typeLabel(p.type)}`).join(", ")}) -> ${typeLabel(spec.returns)}`,
      testCall: `${spec.fn}(${argsOf(spec).map((p) => displayValue(p.type, p.value)).join(", ")})`,
    };
  }
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

export function createStarterCode(problem: Problem, language: CodeLanguage): string {
  const spec = getCodeSpec(problem);
  if (spec) return renderers[language](spec);
  // ponytail: only non-coding problems land here, and they use the written-answer panel
  if (language === "javascript" || language === "typescript" || language === "react") {
    return problem.starterCode || "// Write your solution here\n";
  }
  const marker = language === "python" || language === "ruby" ? "#" : "//";
  const header = [problem.title, problem.prompt, `Expected output: ${problem.expectedOutput ?? "See prompt"}`]
    .map((line) => `${marker} ${line}`)
    .join("\n");
  return `${language === "php" ? "<?php\n" : ""}${header}\n\n${marker} Write your solution here\n`;
}

// ---------------------------------------------------------------------------
// Shared helpers

type Arg = { name: string; type: ParamType; value: unknown };

const DRIVER_NOTE = "Test driver: builds the example input and prints your result";
const ARRAY_TYPES: ParamType[] = ["int[]", "string[]", "int[][]", "string[][]"];

function argsOf(spec: CodeSpec): Arg[] {
  return spec.params.map((param, index) => ({ ...param, value: spec.args[index] }));
}

function uses(spec: CodeSpec, ...types: ParamType[]) {
  return [spec.returns, ...spec.params.map((param) => param.type)].some((type) => types.includes(type));
}

function usesList(spec: CodeSpec) {
  return uses(spec, "ListNode", "CycleList");
}

const isArray = (type: ParamType) => ARRAY_TYPES.includes(type);
const snake = (name: string) => name.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`);
const pascal = (name: string) => name[0].toUpperCase() + name.slice(1);
const quote = (value: unknown) => JSON.stringify(value);

function list(values: unknown[], render: (value: never) => string, open = "[", close = "]") {
  return `${open}${values.map((value) => render(value as never)).join(", ")}${close}`;
}

function jsonLiteral(value: unknown): string {
  return Array.isArray(value) ? list(value, jsonLiteral) : quote(value);
}

function listArgs(type: ParamType, value: unknown): CycleValue {
  return type === "CycleList" ? (value as CycleValue) : { list: value as number[], pos: -1 };
}

function treeLiteral(
  value: TreeValue | null | undefined,
  make: (val: number, left: string, right: string, isLeaf: boolean) => string,
  empty: string,
): string {
  if (!value) return empty;
  const isLeaf = !value.left && !value.right;
  return make(value.val, treeLiteral(value.left, make, empty), treeLiteral(value.right, make, empty), isLeaf);
}

function naryLiteral(value: NaryValue, make: (val: number, children: string[]) => string): string {
  return make(value.val, value.children.map((child) => naryLiteral(child, make)));
}

function typeLabel(type: ParamType) {
  return type === "CycleList" ? "ListNode" : type === "NaryNode" ? "Node" : type;
}

function displayValue(type: ParamType, value: unknown): string {
  if (type === "ListNode") return jsonLiteral(value);
  if (type === "CycleList") {
    const { list: values, pos } = value as CycleValue;
    return `${jsonLiteral(values)} (tail -> index ${pos})`;
  }
  if (type === "TreeNode") {
    // LeetCode level-order form, trailing nulls trimmed.
    const out: (number | null)[] = [];
    const queue: (TreeValue | null | undefined)[] = [value as TreeValue];
    while (queue.length) {
      const node = queue.shift();
      out.push(node ? node.val : null);
      if (node) queue.push(node.left ?? null, node.right ?? null);
    }
    while (out[out.length - 1] === null) out.pop();
    return jsonLiteral(out);
  }
  if (type === "NaryNode") {
    return naryLiteral(value as NaryValue, (val, children) => children.length ? `${val} -> ${list(children, String)}` : String(val));
  }
  return jsonLiteral(value);
}

function program(...sections: (string | false)[]) {
  return `${sections.filter(Boolean).join("\n\n")}\n`;
}

// ---------------------------------------------------------------------------
// JavaScript, TypeScript, React

function jsFamily(spec: CodeSpec, mode: "js" | "ts" | "react") {
  const ts = mode === "ts";
  const nodeClass = ts ? "_Node" : "Node";
  const nodeType = (name: string) => (ts ? `${name} | null` : name);
  const types: Record<ParamType, string> = {
    int: "number", bool: "boolean", string: "string", "int[]": "number[]", "string[]": "string[]",
    "int[][]": "number[][]", "string[][]": "string[][]", ListNode: nodeType("ListNode"),
    CycleList: nodeType("ListNode"), TreeNode: nodeType("TreeNode"), NaryNode: nodeType(nodeClass),
  };
  const defaults: Record<ParamType, string> = {
    int: "0", bool: "false", string: '""', "int[]": "[]", "string[]": "[]", "int[][]": "[]",
    "string[][]": "[]", ListNode: "null", CycleList: "null", TreeNode: "null", NaryNode: "null",
  };
  const a = (annotation: string) => (ts ? annotation : "");

  const classes = [
    usesList(spec) && (ts
      ? `class ListNode {\n  val: number;\n  next: ListNode | null;\n  constructor(val?: number, next?: ListNode | null) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}`
      : `class ListNode {\n  constructor(val = 0, next = null) {\n    this.val = val;\n    this.next = next;\n  }\n}`),
    uses(spec, "TreeNode") && (ts
      ? `class TreeNode {\n  val: number;\n  left: TreeNode | null;\n  right: TreeNode | null;\n  constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}`
      : `class TreeNode {\n  constructor(val = 0, left = null, right = null) {\n    this.val = val;\n    this.left = left;\n    this.right = right;\n  }\n}`),
    uses(spec, "NaryNode") && (ts
      ? `class _Node {\n  val: number;\n  children: _Node[];\n  constructor(val?: number, children?: _Node[]) {\n    this.val = val === undefined ? 0 : val;\n    this.children = children === undefined ? [] : children;\n  }\n}`
      : `class Node {\n  constructor(val = 0, children = []) {\n    this.val = val;\n    this.children = children;\n  }\n}`),
  ].filter(Boolean).join("\n\n");

  const params = spec.params.map((p) => `${p.name}${a(`: ${types[p.type]}`)}`).join(", ");
  const jsDoc = ts ? "" : `/**\n${spec.params.map((p) => ` * @param {${types[p.type]}} ${p.name}`).join("\n")}\n * @return {${types[spec.returns]}}\n */\n`;
  const stub = `${jsDoc}function ${spec.fn}(${params})${a(`: ${types[spec.returns]}`)} {\n  // Write your solution here\n${ts ? `  return ${defaults[spec.returns]};\n` : ""}}`;

  const helpers = [
    usesList(spec) && `function buildList(values${a(": number[]")}, pos${a(": number")} = -1)${a(": ListNode | null")} {\n  const nodes = values.map((val) => new ListNode(val));\n  for (let i = 1; i < nodes.length; i++) nodes[i - 1].next = nodes[i];\n  if (pos >= 0 && nodes.length) nodes[nodes.length - 1].next = nodes[pos];\n  return nodes.length ? nodes[0] : null;\n}`,
    spec.returns === "ListNode" && `function listToArray(head${a(": ListNode | null")})${a(": number[]")} {\n  const values${a(": number[]")} = [];\n  for (let node = head; node; node = node.next) values.push(node.val);\n  return values;\n}`,
  ].filter(Boolean).join("\n\n");

  const literal = (arg: Arg): string => {
    if (arg.type === "ListNode" || arg.type === "CycleList") {
      const { list: values, pos } = listArgs(arg.type, arg.value);
      return `buildList(${jsonLiteral(values)}${pos >= 0 ? `, ${pos}` : ""})`;
    }
    if (arg.type === "TreeNode") {
      return treeLiteral(arg.value as TreeValue, (val, left, right, leaf) => leaf ? `new TreeNode(${val})` : `new TreeNode(${val}, ${left}, ${right})`, "null");
    }
    if (arg.type === "NaryNode") {
      return naryLiteral(arg.value as NaryValue, (val, children) => `new ${nodeClass}(${val}${children.length ? `, ${list(children, String)}` : ""})`);
    }
    return jsonLiteral(arg.value);
  };
  const indent = mode === "react" ? "  " : "";
  const locals = argsOf(spec).map((arg) => `${indent}const ${arg.name}${a(`: ${types[arg.type]}`)} = ${literal(arg)};`).join("\n");
  const call = `${spec.fn}(${spec.params.map((p) => p.name).join(", ")})`;
  const printed = spec.returns === "ListNode"
    ? "JSON.stringify(listToArray(result))"
    : isArray(spec.returns) ? "JSON.stringify(result)" : "result";

  const driver = mode === "react"
    ? `function Exercise() {\n${locals}\n  const result = ${call};\n  return <output>{${printed}}</output>;\n}\n\nconst view = Exercise();\nconsole.log(view.props.children[0]);`
    : `${locals}\nconst result = ${call};\nconsole.log(${printed});`;

  return program(classes, stub, `// ---- ${DRIVER_NOTE} ----`, helpers, driver);
}

// ---------------------------------------------------------------------------
// Python

function python(spec: CodeSpec) {
  const types: Record<ParamType, string> = {
    int: "int", bool: "bool", string: "str", "int[]": "List[int]", "string[]": "List[str]",
    "int[][]": "List[List[int]]", "string[][]": "List[List[str]]", ListNode: "Optional[ListNode]",
    CycleList: "Optional[ListNode]", TreeNode: "Optional[TreeNode]", NaryNode: "'Node'",
  };
  const signatureTypes = [...spec.params.map((p) => types[p.type]), types[spec.returns]].join(" ");
  const typing = ["List", "Optional"].filter((name) => signatureTypes.includes(`${name}[`));

  const classes = [
    usesList(spec) && "class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next",
    uses(spec, "TreeNode") && "class TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right",
    uses(spec, "NaryNode") && "class Node:\n    def __init__(self, val=None, children=None):\n        self.val = val\n        self.children = children if children is not None else []",
  ].filter(Boolean).join("\n\n\n");

  const params = spec.params.map((p) => `, ${p.name}: ${types[p.type]}`).join("");
  const stub = `class Solution:\n    def ${spec.fn}(self${params}) -> ${types[spec.returns]}:\n        # Write your solution here\n        pass`;

  const helpers = [
    usesList(spec) && "def build_list(values, pos=-1):\n    nodes = [ListNode(val) for val in values]\n    for current, following in zip(nodes, nodes[1:]):\n        current.next = following\n    if pos >= 0 and nodes:\n        nodes[-1].next = nodes[pos]\n    return nodes[0] if nodes else None",
    spec.returns === "ListNode" && "def list_to_array(head):\n    values = []\n    while head:\n        values.append(head.val)\n        head = head.next\n    return values",
  ].filter(Boolean).join("\n\n\n");

  const literal = (arg: Arg): string => {
    if (arg.type === "ListNode" || arg.type === "CycleList") {
      const { list: values, pos } = listArgs(arg.type, arg.value);
      return `build_list(${jsonLiteral(values)}${pos >= 0 ? `, ${pos}` : ""})`;
    }
    if (arg.type === "TreeNode") {
      return treeLiteral(arg.value as TreeValue, (val, left, right, leaf) => leaf ? `TreeNode(${val})` : `TreeNode(${val}, ${left}, ${right})`, "None");
    }
    if (arg.type === "NaryNode") {
      return naryLiteral(arg.value as NaryValue, (val, children) => `Node(${val}${children.length ? `, ${list(children, String)}` : ""})`);
    }
    return jsonLiteral(arg.value);
  };
  const needsJson = isArray(spec.returns) || spec.returns === "ListNode";
  const printed = spec.returns === "bool" ? "str(result).lower()"
    : spec.returns === "ListNode" ? 'json.dumps(list_to_array(result), separators=(",", ":"))'
    : needsJson ? 'json.dumps(result, separators=(",", ":"))' : "result";
  const driver = [
    needsJson && "import json\n",
    ...argsOf(spec).map((arg) => `${arg.name} = ${literal(arg)}`),
    `result = Solution().${spec.fn}(${spec.params.map((p) => p.name).join(", ")})`,
    `print(${printed})`,
  ].filter(Boolean).join("\n");

  return program(
    typing.length > 0 && `from typing import ${typing.join(", ")}`,
    classes,
    stub,
    `# ---- ${DRIVER_NOTE} ----`,
    helpers,
    driver,
  );
}

// ---------------------------------------------------------------------------
// Java

function java(spec: CodeSpec) {
  const paramTypes: Record<ParamType, string> = {
    int: "int", bool: "boolean", string: "String", "int[]": "int[]", "string[]": "String[]",
    "int[][]": "int[][]", "string[][]": "List<List<String>>", ListNode: "ListNode", CycleList: "ListNode",
    TreeNode: "TreeNode", NaryNode: "Node",
  };
  const returnTypes: Record<ParamType, string> = {
    ...paramTypes, "string[]": "List<String>", "int[][]": "List<List<Integer>>",
  };
  const defaults: Record<ParamType, string> = {
    int: "0", bool: "false", string: '""', "int[]": "new int[0]", "string[]": "new ArrayList<>()",
    "int[][]": "new ArrayList<>()", "string[][]": "new ArrayList<>()", ListNode: "null", CycleList: "null",
    TreeNode: "null", NaryNode: "null",
  };

  const classes = [
    usesList(spec) && "class ListNode {\n    int val;\n    ListNode next;\n    ListNode() {}\n    ListNode(int val) { this.val = val; }\n    ListNode(int val, ListNode next) { this.val = val; this.next = next; }\n}",
    uses(spec, "TreeNode") && "class TreeNode {\n    int val;\n    TreeNode left;\n    TreeNode right;\n    TreeNode() {}\n    TreeNode(int val) { this.val = val; }\n    TreeNode(int val, TreeNode left, TreeNode right) {\n        this.val = val;\n        this.left = left;\n        this.right = right;\n    }\n}",
    uses(spec, "NaryNode") && "class Node {\n    public int val;\n    public List<Node> children = new ArrayList<>();\n    public Node() {}\n    public Node(int val) { this.val = val; }\n    public Node(int val, List<Node> children) {\n        this.val = val;\n        this.children = children;\n    }\n}",
  ].filter(Boolean).join("\n\n");

  const params = spec.params.map((p) => `${paramTypes[p.type]} ${p.name}`).join(", ");
  const stub = `class Solution {\n    public ${returnTypes[spec.returns]} ${spec.fn}(${params}) {\n        // Write your solution here\n        return ${defaults[spec.returns]};\n    }\n}`;

  const literal = (arg: Arg): string => {
    switch (arg.type) {
      case "int[]": return list(arg.value as number[], String, "new int[]{", "}");
      case "string[]": return list(arg.value as string[], quote, "new String[]{", "}");
      case "int[][]": return list(arg.value as number[][], (row: number[]) => list(row, String, "{", "}"), "new int[][]{", "}");
      case "ListNode": case "CycleList": {
        const { list: values, pos } = listArgs(arg.type, arg.value);
        return `buildList(${list(values, String, "new int[]{", "}")}, ${pos})`;
      }
      case "TreeNode":
        return treeLiteral(arg.value as TreeValue, (val, left, right, leaf) => leaf ? `new TreeNode(${val})` : `new TreeNode(${val}, ${left}, ${right})`, "null");
      case "NaryNode":
        return naryLiteral(arg.value as NaryValue, (val, children) => children.length ? `new Node(${val}, ${list(children, String, "List.of(", ")")})` : `new Node(${val})`);
      default: return quote(arg.value);
    }
  };
  const join = 'Collectors.joining(",", "[", "]")';
  const printers: Partial<Record<ParamType, string>> = {
    "int[]": `Arrays.stream(result).mapToObj(String::valueOf).collect(${join})`,
    "string[]": `result.stream().map(s -> "\\"" + s + "\\"").collect(${join})`,
    "int[][]": `result.stream().map(row -> row.stream().map(Object::toString).collect(${join})).collect(${join})`,
    "string[][]": `result.stream().map(row -> row.stream().map(s -> "\\"" + s + "\\"").collect(${join})).collect(${join})`,
    ListNode: `Arrays.stream(listToArray(result)).mapToObj(String::valueOf).collect(${join})`,
  };
  const helpers = [
    usesList(spec) && "    static ListNode buildList(int[] values, int pos) {\n        ListNode[] nodes = new ListNode[values.length];\n        for (int i = 0; i < values.length; i++) nodes[i] = new ListNode(values[i]);\n        for (int i = 1; i < nodes.length; i++) nodes[i - 1].next = nodes[i];\n        if (pos >= 0 && nodes.length > 0) nodes[nodes.length - 1].next = nodes[pos];\n        return nodes.length > 0 ? nodes[0] : null;\n    }",
    spec.returns === "ListNode" && "    static int[] listToArray(ListNode head) {\n        List<Integer> values = new ArrayList<>();\n        for (ListNode node = head; node != null; node = node.next) values.add(node.val);\n        return values.stream().mapToInt(Integer::intValue).toArray();\n    }",
  ].filter(Boolean).join("\n\n");
  const locals = argsOf(spec).map((arg) => `        ${paramTypes[arg.type]} ${arg.name} = ${literal(arg)};`).join("\n");
  const main = `    public static void main(String[] args) {\n${locals}\n        ${returnTypes[spec.returns]} result = new Solution().${spec.fn}(${spec.params.map((p) => p.name).join(", ")});\n        System.out.println(${printers[spec.returns] ?? "result"});\n    }`;

  return program(
    "import java.util.*;\nimport java.util.stream.*;",
    classes,
    stub,
    `// ---- ${DRIVER_NOTE} ----`,
    `public class Main {\n${[helpers, main].filter(Boolean).join("\n\n")}\n}`,
  );
}

// ---------------------------------------------------------------------------
// C#

function csharp(spec: CodeSpec) {
  const paramTypes: Record<ParamType, string> = {
    int: "int", bool: "bool", string: "string", "int[]": "int[]", "string[]": "string[]",
    "int[][]": "int[][]", "string[][]": "IList<IList<string>>", ListNode: "ListNode", CycleList: "ListNode",
    TreeNode: "TreeNode", NaryNode: "Node",
  };
  const returnTypes: Record<ParamType, string> = {
    ...paramTypes, "string[]": "IList<string>", "int[][]": "IList<IList<int>>",
  };
  const defaults: Record<ParamType, string> = {
    int: "0", bool: "false", string: '""', "int[]": "new int[0]", "string[]": "new List<string>()",
    "int[][]": "new List<IList<int>>()", "string[][]": "new List<IList<string>>()", ListNode: "null",
    CycleList: "null", TreeNode: "null", NaryNode: "null",
  };

  const classes = [
    usesList(spec) && "public class ListNode {\n    public int val;\n    public ListNode next;\n    public ListNode(int val = 0, ListNode next = null) {\n        this.val = val;\n        this.next = next;\n    }\n}",
    uses(spec, "TreeNode") && "public class TreeNode {\n    public int val;\n    public TreeNode left;\n    public TreeNode right;\n    public TreeNode(int val = 0, TreeNode left = null, TreeNode right = null) {\n        this.val = val;\n        this.left = left;\n        this.right = right;\n    }\n}",
    uses(spec, "NaryNode") && "public class Node {\n    public int val;\n    public IList<Node> children;\n    public Node(int val = 0, IList<Node> children = null) {\n        this.val = val;\n        this.children = children ?? new List<Node>();\n    }\n}",
  ].filter(Boolean).join("\n\n");

  const method = pascal(spec.fn);
  const params = spec.params.map((p) => `${paramTypes[p.type]} ${p.name}`).join(", ");
  const stub = `public class Solution {\n    public ${returnTypes[spec.returns]} ${method}(${params}) {\n        // Write your solution here\n        return ${defaults[spec.returns]};\n    }\n}`;

  const literal = (arg: Arg): string => {
    switch (arg.type) {
      case "int[]": return list(arg.value as number[], String, "new int[] {", "}");
      case "string[]": return list(arg.value as string[], quote, "new string[] {", "}");
      case "int[][]": return list(arg.value as number[][], (row: number[]) => list(row, String, "new int[] {", "}"), "new int[][] { ", " }");
      case "ListNode": case "CycleList": {
        const { list: values, pos } = listArgs(arg.type, arg.value);
        return `BuildList(${list(values, String, "new int[] {", "}")}, ${pos})`;
      }
      case "TreeNode":
        return treeLiteral(arg.value as TreeValue, (val, left, right, leaf) => leaf ? `new TreeNode(${val})` : `new TreeNode(${val}, ${left}, ${right})`, "null");
      case "NaryNode":
        return naryLiteral(arg.value as NaryValue, (val, children) => children.length ? `new Node(${val}, ${list(children, String, "new List<Node> { ", " }")})` : `new Node(${val})`);
      default: return quote(arg.value);
    }
  };
  const quoted = '"\\"" + s + "\\""';
  const printers: Partial<Record<ParamType, string>> = {
    bool: 'result ? "true" : "false"',
    "int[]": '"[" + string.Join(",", result) + "]"',
    "string[]": `"[" + string.Join(",", result.Select(s => ${quoted})) + "]"`,
    "int[][]": '"[" + string.Join(",", result.Select(row => "[" + string.Join(",", row) + "]")) + "]"',
    "string[][]": `"[" + string.Join(",", result.Select(row => "[" + string.Join(",", row.Select(s => ${quoted})) + "]")) + "]"`,
    ListNode: '"[" + string.Join(",", ListToArray(result)) + "]"',
  };
  const helpers = [
    usesList(spec) && "    static ListNode BuildList(int[] values, int pos) {\n        var nodes = values.Select(val => new ListNode(val)).ToArray();\n        for (int i = 1; i < nodes.Length; i++) nodes[i - 1].next = nodes[i];\n        if (pos >= 0 && nodes.Length > 0) nodes[nodes.Length - 1].next = nodes[pos];\n        return nodes.Length > 0 ? nodes[0] : null;\n    }",
    spec.returns === "ListNode" && "    static List<int> ListToArray(ListNode head) {\n        var values = new List<int>();\n        for (var node = head; node != null; node = node.next) values.Add(node.val);\n        return values;\n    }",
  ].filter(Boolean).join("\n\n");
  const locals = argsOf(spec).map((arg) => `        ${paramTypes[arg.type]} ${arg.name} = ${literal(arg)};`).join("\n");
  const main = `    static void Main() {\n${locals}\n        ${returnTypes[spec.returns]} result = new Solution().${method}(${spec.params.map((p) => p.name).join(", ")});\n        Console.WriteLine(${printers[spec.returns] ?? "result"});\n    }`;

  return program(
    "using System;\nusing System.Collections.Generic;\nusing System.Linq;",
    classes,
    stub,
    `// ---- ${DRIVER_NOTE} ----`,
    `class Program {\n${[helpers, main].filter(Boolean).join("\n\n")}\n}`,
  );
}

// ---------------------------------------------------------------------------
// Kotlin

function kotlin(spec: CodeSpec) {
  const VAL = "`val`";
  const paramTypes: Record<ParamType, string> = {
    int: "Int", bool: "Boolean", string: "String", "int[]": "IntArray", "string[]": "Array<String>",
    "int[][]": "Array<IntArray>", "string[][]": "List<List<String>>", ListNode: "ListNode?", CycleList: "ListNode?",
    TreeNode: "TreeNode?", NaryNode: "Node?",
  };
  const returnTypes: Record<ParamType, string> = {
    ...paramTypes, "string[]": "List<String>", "int[][]": "List<List<Int>>",
  };
  const defaults: Record<ParamType, string> = {
    int: "0", bool: "false", string: '""', "int[]": "intArrayOf()", "string[]": "listOf()",
    "int[][]": "listOf()", "string[][]": "listOf()", ListNode: "null", CycleList: "null",
    TreeNode: "null", NaryNode: "null",
  };

  const classes = [
    usesList(spec) && `class ListNode(var ${VAL}: Int) {\n    var next: ListNode? = null\n}`,
    uses(spec, "TreeNode") && `class TreeNode(var ${VAL}: Int, var left: TreeNode? = null, var right: TreeNode? = null)`,
    uses(spec, "NaryNode") && `class Node(var ${VAL}: Int, var children: List<Node?> = listOf())`,
  ].filter(Boolean).join("\n\n");

  const params = spec.params.map((p) => `${p.name}: ${paramTypes[p.type]}`).join(", ");
  const stub = `class Solution {\n    fun ${spec.fn}(${params}): ${returnTypes[spec.returns]} {\n        // Write your solution here\n        return ${defaults[spec.returns]}\n    }\n}`;

  const literal = (arg: Arg): string => {
    switch (arg.type) {
      case "int[]": return list(arg.value as number[], String, "intArrayOf(", ")");
      case "string[]": return list(arg.value as string[], quote, "arrayOf(", ")");
      case "int[][]": return list(arg.value as number[][], (row: number[]) => list(row, String, "intArrayOf(", ")"), "arrayOf(", ")");
      case "ListNode": case "CycleList": {
        const { list: values, pos } = listArgs(arg.type, arg.value);
        return `buildList(${list(values, String, "intArrayOf(", ")")}${pos >= 0 ? `, ${pos}` : ""})`;
      }
      case "TreeNode":
        return treeLiteral(arg.value as TreeValue, (val, left, right, leaf) => leaf ? `TreeNode(${val})` : `TreeNode(${val}, ${left}, ${right})`, "null");
      case "NaryNode":
        return naryLiteral(arg.value as NaryValue, (val, children) => children.length ? `Node(${val}, ${list(children, String, "listOf(", ")")})` : `Node(${val})`);
      default: return quote(arg.value);
    }
  };
  const join = 'joinToString(",", "[", "]")';
  const quoted = '{ "\\"" + it + "\\"" }';
  const printers: Partial<Record<ParamType, string>> = {
    "int[]": `result.${join}`,
    "string[]": `result.${join} ${quoted}`,
    "int[][]": `result.${join} { row -> row.${join} }`,
    "string[][]": `result.${join} { row -> row.${join} ${quoted} }`,
    ListNode: `listToArray(result).${join}`,
  };
  const helpers = [
    usesList(spec) && "fun buildList(values: IntArray, pos: Int = -1): ListNode? {\n    val nodes = values.map { ListNode(it) }\n    for (i in 1 until nodes.size) nodes[i - 1].next = nodes[i]\n    if (pos >= 0 && nodes.isNotEmpty()) nodes.last().next = nodes[pos]\n    return nodes.firstOrNull()\n}",
    spec.returns === "ListNode" && `fun listToArray(head: ListNode?): IntArray {\n    val values = mutableListOf<Int>()\n    var node = head\n    while (node != null) {\n        values.add(node.${VAL})\n        node = node.next\n    }\n    return values.toIntArray()\n}`,
  ].filter(Boolean).join("\n\n");
  const locals = argsOf(spec).map((arg) => `    val ${arg.name}: ${paramTypes[arg.type]} = ${literal(arg)}`).join("\n");
  const main = `fun main() {\n${locals}\n    val result = Solution().${spec.fn}(${spec.params.map((p) => p.name).join(", ")})\n    println(${printers[spec.returns] ?? "result"})\n}`;

  return program(classes, stub, `// ---- ${DRIVER_NOTE} ----`, helpers, main);
}

// ---------------------------------------------------------------------------
// Go

function go(spec: CodeSpec) {
  const types: Record<ParamType, string> = {
    int: "int", bool: "bool", string: "string", "int[]": "[]int", "string[]": "[]string",
    "int[][]": "[][]int", "string[][]": "[][]string", ListNode: "*ListNode", CycleList: "*ListNode",
    TreeNode: "*TreeNode", NaryNode: "*Node",
  };
  const defaults: Record<ParamType, string> = {
    int: "0", bool: "false", string: '""', "int[]": "nil", "string[]": "nil", "int[][]": "nil",
    "string[][]": "nil", ListNode: "nil", CycleList: "nil", TreeNode: "nil", NaryNode: "nil",
  };
  const needsJson = isArray(spec.returns) || spec.returns === "ListNode";

  const structs = [
    usesList(spec) && "type ListNode struct {\n    Val  int\n    Next *ListNode\n}",
    uses(spec, "TreeNode") && "type TreeNode struct {\n    Val   int\n    Left  *TreeNode\n    Right *TreeNode\n}",
    uses(spec, "NaryNode") && "type Node struct {\n    Val      int\n    Children []*Node\n}",
  ].filter(Boolean).join("\n\n");

  const params = spec.params.map((p) => `${p.name} ${types[p.type]}`).join(", ");
  const stub = `func ${spec.fn}(${params}) ${types[spec.returns]} {\n    // Write your solution here\n    return ${defaults[spec.returns]}\n}`;

  const literal = (arg: Arg): string => {
    switch (arg.type) {
      case "int[]": return list(arg.value as number[], String, "[]int{", "}");
      case "string[]": return list(arg.value as string[], quote, "[]string{", "}");
      case "int[][]": return list(arg.value as number[][], (row: number[]) => list(row, String, "{", "}"), "[][]int{", "}");
      case "ListNode": case "CycleList": {
        const { list: values, pos } = listArgs(arg.type, arg.value);
        return `buildList(${list(values, String, "[]int{", "}")}, ${pos})`;
      }
      case "TreeNode":
        return treeLiteral(arg.value as TreeValue, (val, left, right) => {
          const fields = [`Val: ${val}`, left !== "nil" && `Left: ${left}`, right !== "nil" && `Right: ${right}`];
          return `&TreeNode{${fields.filter(Boolean).join(", ")}}`;
        }, "nil");
      case "NaryNode":
        return naryLiteral(arg.value as NaryValue, (val, children) => children.length ? `&Node{Val: ${val}, Children: ${list(children, String, "[]*Node{", "}")}}` : `&Node{Val: ${val}}`);
      default: return quote(arg.value);
    }
  };
  const helpers = [
    usesList(spec) && "func buildList(values []int, pos int) *ListNode {\n    nodes := make([]*ListNode, len(values))\n    for i, val := range values {\n        nodes[i] = &ListNode{Val: val}\n        if i > 0 {\n            nodes[i-1].Next = nodes[i]\n        }\n    }\n    if len(nodes) == 0 {\n        return nil\n    }\n    if pos >= 0 {\n        nodes[len(nodes)-1].Next = nodes[pos]\n    }\n    return nodes[0]\n}",
    spec.returns === "ListNode" && "func listToArray(head *ListNode) []int {\n    values := []int{}\n    for node := head; node != nil; node = node.Next {\n        values = append(values, node.Val)\n    }\n    return values\n}",
  ].filter(Boolean).join("\n\n");
  const locals = argsOf(spec).map((arg) => `    ${arg.name} := ${literal(arg)}`).join("\n");
  const call = `${spec.fn}(${spec.params.map((p) => p.name).join(", ")})`;
  const print = needsJson
    ? `    out, _ := json.Marshal(${spec.returns === "ListNode" ? "listToArray(result)" : "result"})\n    fmt.Println(string(out))`
    : "    fmt.Println(result)";
  const main = `func main() {\n${locals}\n    result := ${call}\n${print}\n}`;

  return program(
    `package main\n\nimport (\n${needsJson ? '    "encoding/json"\n' : ""}    "fmt"\n)`,
    structs,
    stub,
    `// ---- ${DRIVER_NOTE} ----`,
    helpers,
    main,
  );
}

// ---------------------------------------------------------------------------
// Rust

function rust(spec: CodeSpec) {
  const cycle = uses(spec, "CycleList");
  const types: Record<ParamType, string> = {
    int: "i32", bool: "bool", string: "String", "int[]": "Vec<i32>", "string[]": "Vec<String>",
    "int[][]": "Vec<Vec<i32>>", "string[][]": "Vec<Vec<String>>", ListNode: "Option<Box<ListNode>>",
    CycleList: "Option<Rc<RefCell<ListNode>>>", TreeNode: "Option<Box<TreeNode>>", NaryNode: "Node",
  };
  const paramType = (type: ParamType) => (type === "NaryNode" ? "&Node" : types[type]);
  const defaults: Record<ParamType, string> = {
    int: "0", bool: "false", string: "String::new()", "int[]": "vec![]", "string[]": "vec![]",
    "int[][]": "vec![]", "string[][]": "vec![]", ListNode: "None", CycleList: "None", TreeNode: "None",
    NaryNode: "None",
  };

  const structs = [
    cycle && "use std::cell::RefCell;\nuse std::rc::Rc;",
    usesList(spec) && `pub struct ListNode {\n    pub val: i32,\n    pub next: ${cycle ? "Option<Rc<RefCell<ListNode>>>" : "Option<Box<ListNode>>"},\n}`,
    uses(spec, "TreeNode") && "pub struct TreeNode {\n    pub val: i32,\n    pub left: Option<Box<TreeNode>>,\n    pub right: Option<Box<TreeNode>>,\n}",
    uses(spec, "NaryNode") && "pub struct Node {\n    pub val: i32,\n    pub children: Vec<Node>,\n}",
  ].filter(Boolean).join("\n\n");

  const fn = snake(spec.fn);
  const params = spec.params.map((p) => `${snake(p.name)}: ${paramType(p.type)}`).join(", ");
  const stub = `struct Solution;\n\nimpl Solution {\n    pub fn ${fn}(${params}) -> ${types[spec.returns]} {\n        // Write your solution here\n        ${defaults[spec.returns]}\n    }\n}`;

  const literal = (arg: Arg): string => {
    switch (arg.type) {
      case "string": return `String::from(${quote(arg.value)})`;
      case "int[]": return list(arg.value as number[], String, "vec![", "]");
      case "string[]": return list(arg.value as string[], (s: string) => `${quote(s)}.to_string()`, "vec![", "]");
      case "int[][]": return list(arg.value as number[][], (row: number[]) => list(row, String, "vec![", "]"), "vec![", "]");
      case "ListNode": return `build_list(&${jsonLiteral(arg.value)})`;
      case "CycleList": {
        const { list: values, pos } = arg.value as CycleValue;
        return `build_cycle_list(&${jsonLiteral(values)}, ${pos})`;
      }
      case "TreeNode":
        return treeLiteral(arg.value as TreeValue, (val, left, right) => `tree(${val}, ${left}, ${right})`, "None");
      case "NaryNode":
        return naryLiteral(arg.value as NaryValue, (val, children) => `node(${val}, ${list(children, String, "vec![", "]")})`);
      default: return quote(arg.value);
    }
  };
  const joined = (expr: string, item: string, inner: string) =>
    `format!("[{}]", ${expr}.iter().map(|${item}| ${inner}).collect::<Vec<String>>().join(","))`;
  const quoted = (item: string) => `format!("\\"{}\\"", ${item})`;
  const printers: Partial<Record<ParamType, string>> = {
    "int[]": joined("result", "x", "x.to_string()"),
    "string[]": joined("result", "x", quoted("x")),
    "int[][]": joined("result", "row", joined("row", "x", "x.to_string()")),
    "string[][]": joined("result", "row", joined("row", "x", quoted("x"))),
    ListNode: joined("list_to_vec(&result)", "x", "x.to_string()"),
  };
  const helpers = [
    uses(spec, "ListNode") && "fn build_list(values: &[i32]) -> Option<Box<ListNode>> {\n    let mut head = None;\n    for &val in values.iter().rev() {\n        head = Some(Box::new(ListNode { val, next: head }));\n    }\n    head\n}",
    cycle && "fn build_cycle_list(values: &[i32], pos: i32) -> Option<Rc<RefCell<ListNode>>> {\n    let nodes: Vec<Rc<RefCell<ListNode>>> = values\n        .iter()\n        .map(|&val| Rc::new(RefCell::new(ListNode { val, next: None })))\n        .collect();\n    for pair in nodes.windows(2) {\n        let (current, following) = (&pair[0], &pair[1]);\n        current.borrow_mut().next = Some(Rc::clone(following));\n    }\n    if let (Some(last), true) = (nodes.last(), pos >= 0) {\n        let start = &nodes[pos as usize];\n        last.borrow_mut().next = Some(Rc::clone(start));\n    }\n    nodes.first().cloned()\n}",
    spec.returns === "ListNode" && "fn list_to_vec(mut node: &Option<Box<ListNode>>) -> Vec<i32> {\n    let mut values = vec![];\n    while let Some(current) = node {\n        values.push(current.val);\n        node = &current.next;\n    }\n    values\n}",
    uses(spec, "TreeNode") && "fn tree(val: i32, left: Option<Box<TreeNode>>, right: Option<Box<TreeNode>>) -> Option<Box<TreeNode>> {\n    Some(Box::new(TreeNode { val, left, right }))\n}",
    uses(spec, "NaryNode") && "fn node(val: i32, children: Vec<Node>) -> Node {\n    Node { val, children }\n}",
  ].filter(Boolean).join("\n\n");
  const locals = argsOf(spec).map((arg) => `    let ${snake(arg.name)}: ${types[arg.type]} = ${literal(arg)};`).join("\n");
  const callArgs = spec.params.map((p) => (p.type === "NaryNode" ? `&${snake(p.name)}` : snake(p.name))).join(", ");
  const main = `fn main() {\n${locals}\n    let result = Solution::${fn}(${callArgs});\n    println!("{}", ${printers[spec.returns] ?? "result"});\n}`;

  return program(structs, stub, `// ---- ${DRIVER_NOTE} ----`, helpers, main);
}

// ---------------------------------------------------------------------------
// C (LeetCode conventions: arrays come with sizes, returned arrays report returnSize)

function c(spec: CodeSpec) {
  const returnTypes: Record<ParamType, string> = {
    int: "int", bool: "bool", string: "char*", "int[]": "int*", "string[]": "char**", "int[][]": "int**",
    "string[][]": "char***", ListNode: "struct ListNode*", CycleList: "struct ListNode*",
    TreeNode: "struct TreeNode*", NaryNode: "struct Node*",
  };
  const paramDecl = (name: string, type: ParamType) => {
    switch (type) {
      case "int": return `int ${name}`;
      case "string": return `char* ${name}`;
      case "int[]": return `int* ${name}, int ${name}Size`;
      case "string[]": return `char** ${name}, int ${name}Size`;
      case "int[][]": return `int** ${name}, int ${name}Size, int* ${name}ColSize`;
      default: return `${returnTypes[type]} ${name}`;
    }
  };
  const returns1d = spec.returns === "int[]" || spec.returns === "string[]";
  const returns2d = spec.returns === "int[][]" || spec.returns === "string[][]";
  const extraParams = returns2d ? ["int* returnSize", "int** returnColumnSizes"] : returns1d ? ["int* returnSize"] : [];
  const params = [...spec.params.map((p) => paramDecl(p.name, p.type)), ...extraParams].join(", ");
  const body = returns2d
    ? "    *returnSize = 0;\n    *returnColumnSizes = NULL;\n    return NULL;"
    : returns1d ? "    *returnSize = 0;\n    return NULL;"
    : `    return ${({ int: "0", bool: "false", string: '""' } as Record<string, string>)[spec.returns] ?? "NULL"};`;
  const note = returns2d
    ? "/**\n * Return an array of arrays of size *returnSize.\n * The sizes of the arrays are returned as *returnColumnSizes array.\n * Note: Both returned array and *columnSizes array must be malloced, assume caller calls free().\n */\n"
    : returns1d ? "/**\n * Note: The returned array must be malloced, assume caller calls free().\n */\n" : "";
  const stub = `${note}${returnTypes[spec.returns]} ${spec.fn}(${params}) {\n    // Write your solution here\n${body}\n}`;

  const structs = [
    usesList(spec) && "struct ListNode {\n    int val;\n    struct ListNode* next;\n};",
    uses(spec, "TreeNode") && "struct TreeNode {\n    int val;\n    struct TreeNode* left;\n    struct TreeNode* right;\n};",
    uses(spec, "NaryNode") && "struct Node {\n    int val;\n    int numChildren;\n    struct Node** children;\n};",
  ].filter(Boolean).join("\n\n");

  const helpers = [
    usesList(spec) && "struct ListNode* buildList(int* values, int size, int pos) {\n    struct ListNode* head = NULL;\n    struct ListNode* tail = NULL;\n    struct ListNode* cycleStart = NULL;\n    for (int i = 0; i < size; i++) {\n        struct ListNode* node = malloc(sizeof(struct ListNode));\n        node->val = values[i];\n        node->next = NULL;\n        if (i == pos) cycleStart = node;\n        if (tail) tail->next = node; else head = node;\n        tail = node;\n    }\n    if (tail) tail->next = cycleStart;\n    return head;\n}",
    uses(spec, "TreeNode") && "struct TreeNode* newTreeNode(int val, struct TreeNode* left, struct TreeNode* right) {\n    struct TreeNode* node = malloc(sizeof(struct TreeNode));\n    node->val = val;\n    node->left = left;\n    node->right = right;\n    return node;\n}",
    uses(spec, "NaryNode") && "struct Node* newNode(int val, int numChildren, struct Node** children) {\n    struct Node* node = malloc(sizeof(struct Node));\n    node->val = val;\n    node->numChildren = numChildren;\n    node->children = malloc(sizeof(struct Node*) * (numChildren > 0 ? numChildren : 1));\n    for (int i = 0; i < numChildren; i++) node->children[i] = children[i];\n    return node;\n}",
  ].filter(Boolean).join("\n\n");

  const locals: string[] = [];
  const callArgs: string[] = [];
  for (const arg of argsOf(spec)) {
    const { name, type, value } = arg;
    switch (type) {
      case "int": locals.push(`    int ${name} = ${value};`); callArgs.push(name); break;
      case "string": locals.push(`    char ${name}[] = ${quote(value)};`); callArgs.push(name); break;
      case "int[]": {
        const values = value as number[];
        locals.push(values.length ? `    int ${name}[] = ${list(values, String, "{", "}")};` : `    int ${name}[1] = {0};`);
        callArgs.push(name, String(values.length));
        break;
      }
      case "string[]": {
        const values = value as string[];
        locals.push(`    char* ${name}[] = ${list(values, quote, "{", "}")};`);
        callArgs.push(name, String(values.length));
        break;
      }
      case "int[][]": {
        const rows = value as number[][];
        rows.forEach((row, index) => locals.push(`    int ${name}${index}[] = ${list(row, String, "{", "}")};`));
        locals.push(`    int* ${name}[] = ${list(rows.map((_, index) => `${name}${index}`), String, "{", "}")};`);
        locals.push(`    int ${name}ColSize[] = ${list(rows.map((row) => row.length), String, "{", "}")};`);
        callArgs.push(name, String(rows.length), `${name}ColSize`);
        break;
      }
      case "ListNode": case "CycleList": {
        const { list: values, pos } = listArgs(type, value);
        locals.push(`    struct ListNode* ${name} = buildList(${list(values, String, "(int[]){", "}")}, ${values.length}, ${pos});`);
        callArgs.push(name);
        break;
      }
      case "TreeNode":
        locals.push(`    struct TreeNode* ${name} = ${treeLiteral(value as TreeValue, (val, left, right) => `newTreeNode(${val}, ${left}, ${right})`, "NULL")};`);
        callArgs.push(name);
        break;
      case "NaryNode":
        locals.push(`    struct Node* ${name} = ${naryLiteral(value as NaryValue, (val, children) => children.length ? `newNode(${val}, ${children.length}, ${list(children, String, "(struct Node*[]){", "}")})` : `newNode(${val}, 0, NULL)`)};`);
        callArgs.push(name);
        break;
      default:
        locals.push(`    // unsupported parameter type ${type}`);
    }
  }
  if (returns1d || returns2d) {
    locals.push("    int returnSize = 0;");
    callArgs.push("&returnSize");
  }
  if (returns2d) {
    locals.push("    int* returnColumnSizes = NULL;");
    callArgs.push("&returnColumnSizes");
  }
  const call = `    ${returnTypes[spec.returns]} result = ${spec.fn}(${callArgs.join(", ")});`;
  const item = spec.returns.startsWith("string") ? '"\\"%s\\""' : '"%d"';
  const sep = spec.returns.startsWith("string") ? '",\\"%s\\""' : '",%d"';
  let print: string;
  if (returns1d) {
    print = `    printf("[");\n    for (int i = 0; i < returnSize; i++) printf(i ? ${sep} : ${item}, result[i]);\n    printf("]\\n");`;
  } else if (returns2d) {
    print = `    printf("[");\n    for (int i = 0; i < returnSize; i++) {\n        printf(i ? ",[" : "[");\n        for (int j = 0; j < returnColumnSizes[i]; j++) printf(j ? ${sep} : ${item}, result[i][j]);\n        printf("]");\n    }\n    printf("]\\n");`;
  } else if (spec.returns === "ListNode") {
    print = '    printf("[");\n    for (struct ListNode* node = result; node; node = node->next) printf(node == result ? "%d" : ",%d", node->val);\n    printf("]\\n");';
  } else if (spec.returns === "bool") {
    print = '    printf("%s\\n", result ? "true" : "false");';
  } else if (spec.returns === "string") {
    print = '    printf("%s\\n", result);';
  } else {
    print = '    printf("%d\\n", result);';
  }
  const main = `int main(void) {\n${locals.join("\n")}\n${call}\n${print}\n    return 0;\n}`;

  return program(
    "#include <stdbool.h>\n#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>",
    structs,
    stub,
    `// ---- ${DRIVER_NOTE} ----`,
    helpers,
    main,
  );
}

// ---------------------------------------------------------------------------
// C++

function cpp(spec: CodeSpec) {
  const types: Record<ParamType, string> = {
    int: "int", bool: "bool", string: "string", "int[]": "vector<int>", "string[]": "vector<string>",
    "int[][]": "vector<vector<int>>", "string[][]": "vector<vector<string>>", ListNode: "ListNode*",
    CycleList: "ListNode*", TreeNode: "TreeNode*", NaryNode: "Node*",
  };
  const paramType = (type: ParamType) => (isArray(type) ? `${types[type]}&` : types[type]);
  const defaults: Partial<Record<ParamType, string>> = { int: "0", bool: "false", string: '""' };

  const structs = [
    usesList(spec) && "struct ListNode {\n    int val;\n    ListNode *next;\n    ListNode() : val(0), next(nullptr) {}\n    ListNode(int x) : val(x), next(nullptr) {}\n    ListNode(int x, ListNode *next) : val(x), next(next) {}\n};",
    uses(spec, "TreeNode") && "struct TreeNode {\n    int val;\n    TreeNode *left;\n    TreeNode *right;\n    TreeNode() : val(0), left(nullptr), right(nullptr) {}\n    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}\n};",
    uses(spec, "NaryNode") && "class Node {\npublic:\n    int val;\n    vector<Node*> children;\n\n    Node() {}\n    Node(int _val) { val = _val; }\n    Node(int _val, vector<Node*> _children) {\n        val = _val;\n        children = _children;\n    }\n};",
  ].filter(Boolean).join("\n\n");

  const params = spec.params.map((p) => `${paramType(p.type)} ${p.name}`).join(", ");
  const fallback = spec.returns === "ListNode" ? "nullptr" : "{}";
  const stub = `class Solution {\npublic:\n    ${types[spec.returns]} ${spec.fn}(${params}) {\n        // Write your solution here\n        return ${defaults[spec.returns] ?? fallback};\n    }\n};`;

  const literal = (arg: Arg): string => {
    switch (arg.type) {
      case "int[]": return list(arg.value as number[], String, "{", "}");
      case "string[]": return list(arg.value as string[], quote, "{", "}");
      case "int[][]": return list(arg.value as number[][], (row: number[]) => list(row, String, "{", "}"), "{", "}");
      case "ListNode": case "CycleList": {
        const { list: values, pos } = listArgs(arg.type, arg.value);
        return `buildList(${list(values, String, "{", "}")}${pos >= 0 ? `, ${pos}` : ""})`;
      }
      case "TreeNode":
        return treeLiteral(arg.value as TreeValue, (val, left, right, leaf) => leaf ? `new TreeNode(${val})` : `new TreeNode(${val}, ${left}, ${right})`, "nullptr");
      case "NaryNode":
        return naryLiteral(arg.value as NaryValue, (val, children) => children.length ? `new Node(${val}, ${list(children, String, "{", "}")})` : `new Node(${val})`);
      default: return quote(arg.value);
    }
  };
  const needsJson = isArray(spec.returns) || spec.returns === "ListNode";
  const helpers = [
    needsJson && "string toJson(int value) { return to_string(value); }\nstring toJson(const string& value) { return \"\\\"\" + value + \"\\\"\"; }\n\ntemplate <typename T>\nstring toJson(const vector<T>& values) {\n    string out = \"[\";\n    for (size_t i = 0; i < values.size(); i++) {\n        if (i) out += \",\";\n        out += toJson(values[i]);\n    }\n    return out + \"]\";\n}",
    usesList(spec) && "ListNode* buildList(vector<int> values, int pos = -1) {\n    vector<ListNode*> nodes;\n    for (int val : values) nodes.push_back(new ListNode(val));\n    for (size_t i = 1; i < nodes.size(); i++) nodes[i - 1]->next = nodes[i];\n    if (pos >= 0 && !nodes.empty()) nodes.back()->next = nodes[pos];\n    return nodes.empty() ? nullptr : nodes[0];\n}",
    spec.returns === "ListNode" && "vector<int> listToVector(ListNode* head) {\n    vector<int> values;\n    for (ListNode* node = head; node; node = node->next) values.push_back(node->val);\n    return values;\n}",
  ].filter(Boolean).join("\n\n");
  const locals = argsOf(spec).map((arg) => `    ${types[arg.type]} ${arg.name} = ${literal(arg)};`).join("\n");
  const printed = spec.returns === "bool" ? '(result ? "true" : "false")'
    : spec.returns === "ListNode" ? "toJson(listToVector(result))"
    : needsJson ? "toJson(result)" : "result";
  const main = `int main() {\n${locals}\n    ${types[spec.returns]} result = Solution().${spec.fn}(${spec.params.map((p) => p.name).join(", ")});\n    cout << ${printed} << endl;\n    return 0;\n}`;

  return program(
    "#include <algorithm>\n#include <climits>\n#include <iostream>\n#include <queue>\n#include <stack>\n#include <string>\n#include <unordered_map>\n#include <unordered_set>\n#include <vector>\nusing namespace std;",
    structs,
    stub,
    `// ---- ${DRIVER_NOTE} ----`,
    helpers,
    main,
  );
}

// ---------------------------------------------------------------------------
// PHP

function php(spec: CodeSpec) {
  const docTypes: Record<ParamType, string> = {
    int: "Integer", bool: "Boolean", string: "String", "int[]": "Integer[]", "string[]": "String[]",
    "int[][]": "Integer[][]", "string[][]": "String[][]", ListNode: "ListNode", CycleList: "ListNode",
    TreeNode: "TreeNode", NaryNode: "Node",
  };

  const classes = [
    usesList(spec) && "class ListNode {\n    public $val = 0;\n    public $next = null;\n    function __construct($val = 0, $next = null) {\n        $this->val = $val;\n        $this->next = $next;\n    }\n}",
    uses(spec, "TreeNode") && "class TreeNode {\n    public $val = null;\n    public $left = null;\n    public $right = null;\n    function __construct($val = 0, $left = null, $right = null) {\n        $this->val = $val;\n        $this->left = $left;\n        $this->right = $right;\n    }\n}",
    uses(spec, "NaryNode") && "class Node {\n    public $val = null;\n    public $children = [];\n    function __construct($val = 0, $children = []) {\n        $this->val = $val;\n        $this->children = $children;\n    }\n}",
  ].filter(Boolean).join("\n\n");

  const doc = [...spec.params.map((p) => `     * @param ${docTypes[p.type]} $${p.name}`), `     * @return ${docTypes[spec.returns]}`].join("\n");
  const params = spec.params.map((p) => `$${p.name}`).join(", ");
  const stub = `class Solution {\n\n    /**\n${doc}\n     */\n    function ${spec.fn}(${params}) {\n        // Write your solution here\n    }\n}`;

  const literal = (arg: Arg): string => {
    if (arg.type === "ListNode" || arg.type === "CycleList") {
      const { list: values, pos } = listArgs(arg.type, arg.value);
      return `buildList(${jsonLiteral(values)}${pos >= 0 ? `, ${pos}` : ""})`;
    }
    if (arg.type === "TreeNode") {
      return treeLiteral(arg.value as TreeValue, (val, left, right, leaf) => leaf ? `new TreeNode(${val})` : `new TreeNode(${val}, ${left}, ${right})`, "null");
    }
    if (arg.type === "NaryNode") {
      return naryLiteral(arg.value as NaryValue, (val, children) => `new Node(${val}${children.length ? `, ${list(children, String)}` : ""})`);
    }
    return jsonLiteral(arg.value);
  };
  const helpers = [
    usesList(spec) && "function buildList($values, $pos = -1) {\n    $nodes = array_map(function ($val) { return new ListNode($val); }, $values);\n    for ($i = 1; $i < count($nodes); $i++) $nodes[$i - 1]->next = $nodes[$i];\n    if ($pos >= 0 && $nodes) $nodes[count($nodes) - 1]->next = $nodes[$pos];\n    return $nodes ? $nodes[0] : null;\n}",
    spec.returns === "ListNode" && "function listToArray($head) {\n    $values = [];\n    for ($node = $head; $node !== null; $node = $node->next) $values[] = $node->val;\n    return $values;\n}",
  ].filter(Boolean).join("\n\n");
  const printed = spec.returns === "bool" ? '($result ? "true" : "false")'
    : spec.returns === "ListNode" ? "json_encode(listToArray($result))"
    : isArray(spec.returns) ? "json_encode($result, JSON_UNESCAPED_SLASHES)" : "$result";
  const driver = [
    ...argsOf(spec).map((arg) => `$${arg.name} = ${literal(arg)};`),
    `$result = (new Solution())->${spec.fn}(${params});`,
    `echo ${printed} . PHP_EOL;`,
  ].join("\n");

  return program(`<?php`, classes, stub, `// ---- ${DRIVER_NOTE} ----`, helpers, driver);
}

// ---------------------------------------------------------------------------
// Ruby

function ruby(spec: CodeSpec) {
  const docTypes: Record<ParamType, string> = {
    int: "Integer", bool: "Boolean", string: "String", "int[]": "Integer[]", "string[]": "String[]",
    "int[][]": "Integer[][]", "string[][]": "String[][]", ListNode: "ListNode", CycleList: "ListNode",
    TreeNode: "TreeNode", NaryNode: "Node",
  };
  const needsJson = isArray(spec.returns) || spec.returns === "ListNode";

  const classes = [
    usesList(spec) && "class ListNode\n  attr_accessor :val, :next\n  def initialize(val = 0, _next = nil)\n    @val = val\n    @next = _next\n  end\nend",
    uses(spec, "TreeNode") && "class TreeNode\n  attr_accessor :val, :left, :right\n  def initialize(val = 0, left = nil, right = nil)\n    @val = val\n    @left = left\n    @right = right\n  end\nend",
    uses(spec, "NaryNode") && "class Node\n  attr_accessor :val, :children\n  def initialize(val = 0, children = [])\n    @val = val\n    @children = children\n  end\nend",
  ].filter(Boolean).join("\n\n");

  const fn = snake(spec.fn);
  const doc = [...spec.params.map((p) => `# @param {${docTypes[p.type]}} ${snake(p.name)}`), `# @return {${docTypes[spec.returns]}}`].join("\n");
  const params = spec.params.map((p) => snake(p.name)).join(", ");
  const stub = `${doc}\ndef ${fn}(${params})\n  # Write your solution here\nend`;

  const literal = (arg: Arg): string => {
    if (arg.type === "ListNode" || arg.type === "CycleList") {
      const { list: values, pos } = listArgs(arg.type, arg.value);
      return `build_list(${jsonLiteral(values)}${pos >= 0 ? `, ${pos}` : ""})`;
    }
    if (arg.type === "TreeNode") {
      return treeLiteral(arg.value as TreeValue, (val, left, right, leaf) => leaf ? `TreeNode.new(${val})` : `TreeNode.new(${val}, ${left}, ${right})`, "nil");
    }
    if (arg.type === "NaryNode") {
      return naryLiteral(arg.value as NaryValue, (val, children) => `Node.new(${val}${children.length ? `, ${list(children, String)}` : ""})`);
    }
    return jsonLiteral(arg.value);
  };
  const helpers = [
    usesList(spec) && "def build_list(values, pos = -1)\n  nodes = values.map { |val| ListNode.new(val) }\n  nodes.each_cons(2) { |current, following| current.next = following }\n  nodes.last.next = nodes[pos] if pos >= 0 && !nodes.empty?\n  nodes.first\nend",
    spec.returns === "ListNode" && "def list_to_array(head)\n  values = []\n  while head\n    values << head.val\n    head = head.next\n  end\n  values\nend",
  ].filter(Boolean).join("\n\n");
  const printed = spec.returns === "ListNode" ? "list_to_array(result).to_json" : needsJson ? "result.to_json" : "result";
  const driver = [
    ...argsOf(spec).map((arg) => `${snake(arg.name)} = ${literal(arg)}`),
    `result = ${fn}(${params})`,
    `puts ${printed}`,
  ].join("\n");

  return program(needsJson && 'require "json"', classes, stub, `# ---- ${DRIVER_NOTE} ----`, helpers, driver);
}

const renderers: Record<CodeLanguage, (spec: CodeSpec) => string> = {
  javascript: (spec) => jsFamily(spec, "js"),
  typescript: (spec) => jsFamily(spec, "ts"),
  react: (spec) => jsFamily(spec, "react"),
  python,
  java,
  csharp,
  kotlin,
  go,
  rust,
  c,
  cpp,
  php,
  ruby,
};
