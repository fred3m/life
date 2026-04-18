import type { Pattern } from './types';
import { BUILTIN_PATTERNS } from './patterns';

export type RegistryNode =
  | { kind: 'folder'; name: string; children: RegistryNode[] }
  | { kind: 'pattern'; name: string; data: Pattern };

export class PatternRegistry {
  root: RegistryNode = { kind: 'folder', name: '', children: [] };

  get(path: string[]): RegistryNode | null {
    let cur: RegistryNode = this.root;
    for (const seg of path) {
      if (cur.kind !== 'folder') return null;
      const next = cur.children.find((c) => c.name === seg);
      if (!next) return null;
      cur = next;
    }
    return cur;
  }

  list(path: string[]): RegistryNode[] {
    const node = this.get(path);
    return node && node.kind === 'folder' ? node.children : [];
  }

  put(path: string[], node: RegistryNode): void {
    if (path.length === 0) throw new Error('put requires non-empty path');
    const parentPath = path.slice(0, -1);
    const leaf = path[path.length - 1];
    let cur: RegistryNode = this.root;
    for (const seg of parentPath) {
      if (cur.kind !== 'folder') throw new Error(`path segment "${seg}" is not a folder`);
      let next = cur.children.find((c) => c.name === seg);
      if (!next) {
        next = { kind: 'folder', name: seg, children: [] };
        cur.children.push(next);
      }
      cur = next;
    }
    if (cur.kind !== 'folder') throw new Error('parent is not a folder');
    const idx = cur.children.findIndex((c) => c.name === leaf);
    const stored: RegistryNode = { ...node, name: leaf } as RegistryNode;
    if (idx >= 0) cur.children[idx] = stored;
    else cur.children.push(stored);
  }

  remove(path: string[]): void {
    if (path.length === 0) return;
    const parent = this.get(path.slice(0, -1));
    if (!parent || parent.kind !== 'folder') return;
    const leaf = path[path.length - 1];
    parent.children = parent.children.filter((c) => c.name !== leaf);
  }

  move(src: string[], dst: string[]): void {
    const node = this.get(src);
    if (!node) return;
    this.remove(src);
    this.put(dst, node);
  }
}

export const builtinRegistry: PatternRegistry = (() => {
  const reg = new PatternRegistry();
  for (const [category, patterns] of Object.entries(BUILTIN_PATTERNS)) {
    for (const [name, data] of Object.entries(patterns)) {
      reg.put([category, name], { kind: 'pattern', name, data });
    }
  }
  return reg;
})();
