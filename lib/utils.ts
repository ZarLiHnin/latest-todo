import type { Project, ProjectNode } from "@/types/project";

export function buildProjectTree(projects: Project[]): ProjectNode[] {
  const projectMap = new Map<string, ProjectNode>();

  // 初期化
  projects.forEach((proj) => {
    projectMap.set(proj.id, { ...proj, children: [] });
  });

  const tree: ProjectNode[] = [];

  projects.forEach((proj) => {
    const node = projectMap.get(proj.id)!;
    if (proj.parentId && projectMap.has(proj.parentId)) {
      projectMap.get(proj.parentId)!.children.push(node);
    } else {
      tree.push(node);
    }
  });

  return tree;
}
