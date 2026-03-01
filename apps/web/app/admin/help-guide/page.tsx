'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const SUPER_ADMIN_ROLES = ['Super Admin', 'super'];

type DocNode = {
  name: string;
  path: string;
  children?: DocNode[];
};

function DocTreeItem({
  node,
  selectedPath,
  onSelect,
  depth = 0,
}: {
  node: DocNode;
  selectedPath: string | null;
  onSelect: (path: string) => void;
  depth?: number;
}) {
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedPath === node.path;
  const isFile = node.name.endsWith('.md');

  if (hasChildren) {
    return (
      <div className="space-y-1">
        <div
          className="text-sm font-medium text-muted-foreground pl-2"
          style={{ paddingLeft: depth * 12 + 8 }}
        >
          {node.name}
        </div>
        {node.children!.map((child) => (
          <DocTreeItem
            key={child.path}
            node={child}
            selectedPath={selectedPath}
            onSelect={onSelect}
            depth={depth + 1}
          />
        ))}
      </div>
    );
  }

  if (!isFile) return null;

  return (
    <button
      type="button"
      onClick={() => onSelect(node.path)}
      className={cn(
        'w-full text-left text-sm py-1.5 px-2 rounded-md transition-colors truncate',
        isSelected
          ? 'bg-primary text-primary-foreground'
          : 'hover:bg-muted text-foreground',
      )}
      style={{ paddingLeft: depth * 12 + 8 }}
      title={node.name}
    >
      {node.name}
    </button>
  );
}

export default function HelpGuidePage() {
  const { hasRole, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileParam = searchParams.get('file');

  const [tree, setTree] = useState<DocNode[]>([]);
  const [content, setContent] = useState<string | null>(null);
  const [selectedPath, setSelectedPath] = useState<string | null>(fileParam);
  const [loadingContent, setLoadingContent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSuperAdmin = SUPER_ADMIN_ROLES.some((r) => hasRole(r));

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!isSuperAdmin) {
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, isLoading, isSuperAdmin, router]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    fetch('/api/docs')
      .then((res) => res.json())
      .then((data) => {
        if (data.tree) setTree(data.tree);
        if (data.error) setError(data.error);
      })
      .catch(() => setError('Failed to load docs'));
  }, [isSuperAdmin]);

  useEffect(() => {
    const path = selectedPath || fileParam;
    if (!path || !isSuperAdmin) return;
    setLoadingContent(true);
    fetch(`/api/docs?file=${encodeURIComponent(path)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => {
        setContent(data.content ?? '');
        setError(null);
      })
      .catch(() => {
        setContent(null);
        setError('File not found');
      })
      .finally(() => setLoadingContent(false));
  }, [selectedPath, fileParam, isSuperAdmin]);

  useEffect(() => {
    if (fileParam) setSelectedPath(fileParam);
  }, [fileParam]);

  const handleSelect = (path: string) => {
    setSelectedPath(path);
    router.replace(`/admin/help-guide?file=${encodeURIComponent(path)}`, { scroll: false });
  };

  if (!isAuthenticated || !isSuperAdmin) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Help Guide</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Documentation from the <code className="bg-muted px-1 rounded">docs</code> folder. Select a file to view.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base">Documents</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="h-[calc(100vh-16rem)]">
              <div className="space-y-1 pr-4">
                {tree.length === 0 && !error && (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                )}
                {tree.length === 0 && error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                {tree.map((node) => (
                  <DocTreeItem
                    key={node.path}
                    node={node}
                    selectedPath={selectedPath}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base truncate">
              {selectedPath ? selectedPath.replace(/^.*[/\\]/, '') : 'Select a document'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="h-[calc(100vh-16rem)]">
              {loadingContent && (
                <p className="text-sm text-muted-foreground">Loading...</p>
              )}
              {!loadingContent && content !== null && content !== undefined && (
                <pre className="text-sm whitespace-pre-wrap font-sans p-4 bg-muted/50 rounded-md overflow-x-auto">
                  {content}
                </pre>
              )}
              {!loadingContent && selectedPath && content === null && !error && (
                <p className="text-sm text-muted-foreground">No content</p>
              )}
              {!loadingContent && error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              {!loadingContent && !selectedPath && (
                <p className="text-sm text-muted-foreground">Select a file from the tree to view its content.</p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
